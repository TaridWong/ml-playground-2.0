import S from "./s";
import React from "react";
import MLModel from "./mlmodel";

class XGBTree {
	constructor(depth, maxDepth, l2Reg) {
		this.depth = depth;
		this.maxDepth = maxDepth;
		this.l2Reg = l2Reg;
		this.isLeaf = true;
		this.weight = 0;
		this.feature = 0;
		this.splitVal = 0;
		this.left = null;
		this.right = null;
	}

	predict(x) {
		if (this.isLeaf || !this.left || !this.right) {
			return this.weight;
		}
		if (x[this.feature] <= this.splitVal) {
			return this.left.predict(x);
		}
		return this.right.predict(x);
	}

	train(indices, xTr, g, h) {
		const G = indices.reduce((sum, idx) => sum + g[idx], 0);
		const H = indices.reduce((sum, idx) => sum + h[idx], 0);

		// Calculate optimal leaf weight using second-order Newton-Raphson step with L2 regularization
		this.weight = -G / (H + this.l2Reg);

		if (this.depth >= this.maxDepth || indices.length < 3) {
			this.isLeaf = true;
			return;
		}

		let bestGain = 0;
		let bestFeature = -1;
		let bestSplitVal = 0;
		let bestLeftIndices = null;
		let bestRightIndices = null;

		const baseScore = (G * G) / (H + this.l2Reg);

		for (let feat = 0; feat < 2; feat++) {
			// Sort unique values along this feature
			const vals = indices.map((idx) => xTr[idx][feat]);
			const sortedVals = Array.from(new Set(vals)).sort((a, b) => a - b);

			for (let i = 0; i < sortedVals.length - 1; i++) {
				const splitCandidate = (sortedVals[i] + sortedVals[i + 1]) / 2;

				let GL = 0;
				let HL = 0;
				let GR = 0;
				let HR = 0;
				const leftIdx = [];
				const rightIdx = [];

				for (let k = 0; k < indices.length; k++) {
					const idx = indices[k];
					if (xTr[idx][feat] <= splitCandidate) {
						GL += g[idx];
						HL += h[idx];
						leftIdx.push(idx);
					} else {
						GR += g[idx];
						HR += h[idx];
						rightIdx.push(idx);
					}
				}

				if (leftIdx.length === 0 || rightIdx.length === 0) continue;

				const leftScore = (GL * GL) / (HL + this.l2Reg);
				const rightScore = (GR * GR) / (HR + this.l2Reg);
				const gain = 0.5 * (leftScore + rightScore - baseScore);

				if (gain > bestGain) {
					bestGain = gain;
					bestFeature = feat;
					bestSplitVal = splitCandidate;
					bestLeftIndices = leftIdx;
					bestRightIndices = rightIdx;
				}
			}
		}

		if (bestGain > 0.001 && bestLeftIndices && bestRightIndices) {
			this.isLeaf = false;
			this.feature = bestFeature;
			this.splitVal = bestSplitVal;

			this.left = new XGBTree(this.depth + 1, this.maxDepth, this.l2Reg);
			this.left.train(bestLeftIndices, xTr, g, h);

			this.right = new XGBTree(this.depth + 1, this.maxDepth, this.l2Reg);
			this.right.train(bestRightIndices, xTr, g, h);
		} else {
			this.isLeaf = true;
		}
	}
}

export default class XGBoost extends MLModel {
	constructor() {
		super();
		this.nEstimators = 12; // Number of boosting rounds
		this.learningRate = 0.2; // Shrinkage eta
		this.maxDepth = 2; // Maximum tree depth (1 or 2)
		this.l2Reg = 1.0; // L2 leaf regularization lambda
		this.threshold = 0.5; // Decision cutoff for Class 2
		this.baseLogOdds = 0;
		this.trees = [];
		this.trained = false;
		this.fallbackClass = S.class1;
	}

	sigmoid(z) {
		const clamped = Math.max(-25, Math.min(25, z));
		return 1 / (1 + Math.exp(-clamped));
	}

	score(x, y) {
		if (!this.trained || !this.trees || this.trees.length === 0) {
			return this.fallbackClass === S.class2 ? 1 : 0;
		}

		let logOdds = this.baseLogOdds;
		for (let i = 0; i < this.trees.length; i++) {
			logOdds += this.learningRate * this.trees[i].predict([x, y]);
		}
		return this.sigmoid(logOdds);
	}

	classif(x, y) {
		const prob = this.score(x, y);
		return prob >= this.threshold ? S.class2 : S.class1;
	}

	train() {
		if (!this.xTr || this.xTr.length < 2) {
			this.trained = false;
			this.fallbackClass = this.yTr && this.yTr[0] ? this.yTr[0] : S.class1;
			return;
		}

		const hasClass1 = this.yTr.some((c) => Number(c) === S.class1);
		const hasClass2 = this.yTr.some((c) => Number(c) === S.class2);

		if (!hasClass1 || !hasClass2) {
			this.trained = false;
			this.fallbackClass = hasClass1 ? S.class1 : S.class2;
			return;
		}

		const N = this.xTr.length;
		// Map labels: Class 1 -> 0, Class 2 -> 1
		const targets = this.yTr.map((c) => (Number(c) === S.class2 ? 1 : 0));
		const posCount = targets.reduce((acc, t) => acc + t, 0);
		const p0 = Math.max(0.01, Math.min(0.99, posCount / N));
		this.baseLogOdds = Math.log(p0 / (1 - p0));

		const allIndices = Array.from({ length: N }, (_, i) => i);
		const currentLogOdds = new Array(N).fill(this.baseLogOdds);

		this.trees = [];

		for (let round = 0; round < this.nEstimators; round++) {
			// Calculate gradient g and hessian h for each student under binary cross-entropy
			const g = new Array(N);
			const h = new Array(N);

			for (let i = 0; i < N; i++) {
				const p = this.sigmoid(currentLogOdds[i]);
				g[i] = p - targets[i]; // gradient = p - y
				h[i] = Math.max(0.001, p * (1 - p)); // hessian = p * (1 - p)
			}

			const tree = new XGBTree(0, this.maxDepth, this.l2Reg);
			tree.train(allIndices, this.xTr, g, h);

			// Update running predictions
			for (let i = 0; i < N; i++) {
				currentLogOdds[i] += this.learningRate * tree.predict(this.xTr[i]);
			}

			this.trees.push(tree);
		}

		this.trained = true;
	}

	setNEstimators(n) {
		const parsed = parseInt(n, 10);
		if (!isNaN(parsed) && parsed >= 1 && parsed <= 35) {
			this.nEstimators = parsed;
			return true;
		}
		return false;
	}

	setLearningRate(lr) {
		const parsed = parseFloat(lr);
		if (!isNaN(parsed) && parsed >= 0.05 && parsed <= 0.6) {
			this.learningRate = parsed;
			return true;
		}
		return false;
	}

	setMaxDepth(d) {
		const parsed = parseInt(d, 10);
		if (!isNaN(parsed) && (parsed === 1 || parsed === 2)) {
			this.maxDepth = parsed;
			return true;
		}
		return false;
	}

	setThreshold(t) {
		const parsed = parseFloat(t);
		if (!isNaN(parsed) && parsed >= 0.1 && parsed <= 0.9) {
			this.threshold = parsed;
			return true;
		}
		return false;
	}

	uiInstance() {
		const self = this;
		return class XGBoostUI extends React.Component {
			constructor(props) {
				super(props);
				this.state = {
					nEstimators: self.nEstimators,
					learningRate: self.learningRate,
					maxDepth: self.maxDepth,
					threshold: self.threshold
				};
			}

			handleRounds(e) {
				const val = parseInt(e.target.value, 10);
				if (self.setNEstimators(val)) {
					this.setState({ nEstimators: val });
				}
			}

			handleLR(e) {
				const val = parseFloat(e.target.value);
				if (self.setLearningRate(val)) {
					this.setState({ learningRate: val });
				}
			}

			handleDepth(d) {
				if (self.setMaxDepth(d)) {
					this.setState({ maxDepth: d });
				}
			}

			handleThreshold(e) {
				const val = parseFloat(e.target.value);
				if (self.setThreshold(val)) {
					this.setState({ threshold: val });
					if (typeof this.props.reclassify === "function") {
						this.props.reclassify();
					}
				}
			}

			render() {
				return (
					<div className="xgboost-controls">
						{/* Number of Boosting Rounds */}
						<div className="control-group" style={{ marginBottom: "0.75rem" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<label style={{ fontSize: "0.8rem", color: "#334155" }}>
									Boosting Rounds (Trees): <strong>{this.state.nEstimators}</strong>
								</label>
							</div>
							<input
								type="range"
								min="1"
								max="30"
								step="1"
								value={this.state.nEstimators}
								onChange={(e) => this.handleRounds(e)}
								style={{ width: "100%", accentColor: "#0f172a", cursor: "pointer", marginTop: "0.2rem" }}
							/>
							<div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.15rem" }}>
								{this.state.nEstimators <= 3
									? "Few rounds: Coarse steps that underfit."
									: this.state.nEstimators >= 22
									? "Many rounds: Tightly wraps individual outlier dots (risk of overfitting)."
									: "Balanced boosting sequence correcting previous errors."}
							</div>
						</div>

						{/* Learning Rate (Shrinkage) */}
						<div className="control-group" style={{ marginBottom: "0.75rem" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<label style={{ fontSize: "0.8rem", color: "#334155" }}>
									Learning Rate (η): <strong>{this.state.learningRate.toFixed(2)}</strong>
								</label>
							</div>
							<input
								type="range"
								min="0.05"
								max="0.50"
								step="0.05"
								value={this.state.learningRate}
								onChange={(e) => this.handleLR(e)}
								style={{ width: "100%", accentColor: "#475569", cursor: "pointer", marginTop: "0.2rem" }}
							/>
							<div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.15rem" }}>
								Smaller rates take conservative steps; higher rates take aggressive leaps toward mistakes.
							</div>
						</div>

						{/* Tree Depth Toggle */}
						<div className="control-group" style={{ marginBottom: "0.75rem" }}>
							<label style={{ display: "block", fontWeight: 600, fontSize: "0.82rem", color: "#1e293b", marginBottom: "0.3rem" }}>
								Base Tree Depth:
							</label>
							<div style={{ display: "flex", gap: "0.4rem" }}>
								<button
									type="button"
									className={`btn-toggle-pill ${this.state.maxDepth === 1 ? "active" : ""}`}
									onClick={() => this.handleDepth(1)}
									style={{
										flex: 1,
										padding: "0.35rem 0.5rem",
										fontSize: "0.75rem",
										fontWeight: 600,
										borderRadius: "6px",
										border: "1px solid #cbd5e1",
										background: this.state.maxDepth === 1 ? "#0f172a" : "#ffffff",
										color: this.state.maxDepth === 1 ? "#ffffff" : "#334155",
										cursor: "pointer"
									}}
								>
									Depth 1 (Decision Stump)
								</button>
								<button
									type="button"
									className={`btn-toggle-pill ${this.state.maxDepth === 2 ? "active" : ""}`}
									onClick={() => this.handleDepth(2)}
									style={{
										flex: 1,
										padding: "0.35rem 0.5rem",
										fontSize: "0.75rem",
										fontWeight: 600,
										borderRadius: "6px",
										border: "1px solid #cbd5e1",
										background: this.state.maxDepth === 2 ? "#0f172a" : "#ffffff",
										color: this.state.maxDepth === 2 ? "#ffffff" : "#334155",
										cursor: "pointer"
									}}
								>
									Depth 2 (Pair Interaction)
								</button>
							</div>
						</div>

						{/* Decision Threshold */}
						<div className="control-group">
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<label style={{ fontSize: "0.8rem", color: "#334155" }}>
									Risk Threshold: <strong>{Math.round(this.state.threshold * 100)}%</strong>
								</label>
								<span style={{ fontSize: "0.72rem", color: "#64748b" }}>Live update</span>
							</div>
							<input
								type="range"
								min="0.1"
								max="0.9"
								step="0.05"
								value={this.state.threshold}
								onChange={(e) => this.handleThreshold(e)}
								style={{ width: "100%", accentColor: "#e11d48", cursor: "pointer", marginTop: "0.2rem" }}
							/>
						</div>
					</div>
				);
			}
		};
	}

	info() {
		return this.generateInfo({
			name: "Extreme Gradient Boosting (XGBoost)",
			tldr: "Sequential team of short decision trees that fix each other mistakes",
			expl1: (
				<div>
					Builds an ensemble where each new decision tree focuses specifically on the students misclassified by earlier trees, adding gradual corrections to the final score.
				</div>
			),
			params: [
				"Boosting Rounds: How many sequential trees are added. More rounds reduce errors on tricky students but can overfit if set too high.",
				"Learning Rate: How much influence each new tree adds to the running score. Smaller steps prevent overreacting to single outliers.",
				"Base Tree Depth: Depth 1 uses single-cut decision stumps, while Depth 2 allows the tree to capture combinations of two metrics.",
				"Decision Threshold: Probability cutoff required to trigger an intervention flag."
			],
			usecase: [
				"Educational datasets with complex non-linear trends and subtle patterns",
				"High-stakes prediction tasks that demand the highest possible competitive accuracy",
				"Finding subtle interactions across multiple activity columns without manual feature engineering",
				"Demonstrating how boosting differs from bagging by showing how learning rate controls overfitting"
			],
			expl2: [
				"Unlike Random Forest where trees train independently and vote at the end, XGBoost builds trees one by one in a chain.",
				"After each round, the algorithm calculates how far each student prediction was from reality (the residual error).",
				"The next tree is trained specifically to predict those residual errors. When added together with shrinkage, the steps combine into a finely calibrated risk surface."
			],
			pros: [
				"Consistently achieves top accuracy on complex tabular educational datasets.",
				"Enables fine-grained control over model complexity through learning rate and tree depth.",
				"Produces smooth, terraced probability boundaries that conform tightly to student clusters."
			],
			cons: [
				"More sensitive to noisy outlier points than Random Forest if trained for too many rounds.",
				"Sequential training requires slightly more steps than parallel bagging."
			],
			links: [
				["https://en.wikipedia.org/wiki/Gradient_boosting", "Wikipedia Gradient Boosting"],
				["https://xgboost.readthedocs.io/", "Official XGBoost Documentation"]
			]
		});
	}
}
