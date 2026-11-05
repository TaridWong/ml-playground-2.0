import S from "./s";
import React from "react";
import MLModel from "./mlmodel";

export default class GaussianNaiveBayes extends MLModel {
	constructor() {
		super();
		this.priorMode = "empirical"; // "empirical" | "equal"
		this.varSmoothing = 0.05; // Added to variance for numerical stability & contour smoothing
		this.threshold = 0.5; // Decision threshold for Class 2
		this.stats = null;
		this.trained = false;
		this.fallbackClass = S.class1;
	}

	score(x, y) {
		if (!this.trained || !this.stats) {
			return this.fallbackClass === S.class2 ? 1 : 0;
		}

		const s1 = this.stats[S.class1];
		const s2 = this.stats[S.class2];

		if (!s1 || !s2) {
			return this.fallbackClass === S.class2 ? 1 : 0;
		}

		const lp1 = this.calcLogLikelihood(x, y, s1);
		const lp2 = this.calcLogLikelihood(x, y, s2);

		// Sigmoid of log-odds difference to obtain P(Class 2 | X, Y)
		const logDiff = lp1 - lp2;
		const clampedDiff = Math.max(-25, Math.min(25, logDiff));
		return 1 / (1 + Math.exp(clampedDiff));
	}

	classif(x, y) {
		if (!this.trained || !this.stats) {
			return this.fallbackClass;
		}
		const prob = this.score(x, y);
		return prob >= this.threshold ? S.class2 : S.class1;
	}

	calcLogLikelihood(x, y, stat) {
		const lpx =
			-0.5 * Math.log(2 * Math.PI * stat.varX) -
			Math.pow(x - stat.meanX, 2) / (2 * stat.varX);
		const lpy =
			-0.5 * Math.log(2 * Math.PI * stat.varY) -
			Math.pow(y - stat.meanY, 2) / (2 * stat.varY);
		return Math.log(stat.prior) + lpx + lpy;
	}

	train() {
		if (!this.xTr || this.xTr.length < 2) {
			this.trained = false;
			this.fallbackClass = this.yTr[0] || S.class1;
			return;
		}

		const c1Points = [];
		const c2Points = [];

		for (let i = 0; i < this.xTr.length; i++) {
			if (Number(this.yTr[i]) === S.class1) {
				c1Points.push(this.xTr[i]);
			} else if (Number(this.yTr[i]) === S.class2) {
				c2Points.push(this.xTr[i]);
			}
		}

		if (c1Points.length === 0 || c2Points.length === 0) {
			this.trained = false;
			this.fallbackClass = c1Points.length > 0 ? S.class1 : S.class2;
			return;
		}

		const totalN = this.xTr.length;
		const prior1 = this.priorMode === "equal" ? 0.5 : c1Points.length / totalN;
		const prior2 = this.priorMode === "equal" ? 0.5 : c2Points.length / totalN;

		// Calculate global variance to scale smoothing
		let globalVarX = 0;
		let globalVarY = 0;
		const meanAllX = this.xTr.reduce((acc, pt) => acc + pt[0], 0) / totalN;
		const meanAllY = this.xTr.reduce((acc, pt) => acc + pt[1], 0) / totalN;
		for (let i = 0; i < totalN; i++) {
			globalVarX += Math.pow(this.xTr[i][0] - meanAllX, 2);
			globalVarY += Math.pow(this.xTr[i][1] - meanAllY, 2);
		}
		globalVarX /= totalN;
		globalVarY /= totalN;

		const smoothingX = Math.max(10, globalVarX * this.varSmoothing);
		const smoothingY = Math.max(10, globalVarY * this.varSmoothing);

		const computeStats = (pts, prior) => {
			const n = pts.length;
			const meanX = pts.reduce((acc, pt) => acc + pt[0], 0) / n;
			const meanY = pts.reduce((acc, pt) => acc + pt[1], 0) / n;

			let varX = pts.reduce((acc, pt) => acc + Math.pow(pt[0] - meanX, 2), 0) / n;
			let varY = pts.reduce((acc, pt) => acc + Math.pow(pt[1] - meanY, 2), 0) / n;

			varX += smoothingX;
			varY += smoothingY;

			return { meanX, meanY, varX, varY, prior, count: n };
		};

		this.stats = {
			[S.class1]: computeStats(c1Points, prior1),
			[S.class2]: computeStats(c2Points, prior2)
		};

		this.trained = true;
	}

	setPriorMode(mode) {
		if (mode === "empirical" || mode === "equal") {
			this.priorMode = mode;
			return true;
		}
		return false;
	}

	setVarSmoothing(val) {
		const parsed = parseFloat(val);
		if (!isNaN(parsed) && parsed > 0) {
			this.varSmoothing = parsed;
			return true;
		}
		return false;
	}

	setThreshold(t) {
		const val = parseFloat(t);
		if (!isNaN(val) && val >= 0.01 && val <= 0.99) {
			this.threshold = val;
			return true;
		}
		return false;
	}

	uiInstance() {
		const self = this;
		return class NaiveBayesUI extends React.Component {
			constructor(props) {
				super(props);
				this.state = {
					priorMode: self.priorMode,
					varSmoothing: self.varSmoothing,
					threshold: self.threshold
				};
			}

			handleThresholdChange(e) {
				const val = parseFloat(e.target.value);
				if (self.setThreshold(val)) {
					this.setState({ threshold: val });
					if (typeof this.props.reclassify === "function") {
						this.props.reclassify();
					}
				}
			}

			handlePriorModeChange(mode) {
				if (self.setPriorMode(mode)) {
					this.setState({ priorMode: mode });
				}
			}

			handleSmoothingChange(e) {
				const val = parseFloat(e.target.value);
				if (self.setVarSmoothing(val)) {
					this.setState({ varSmoothing: val });
				}
			}

			render() {
				const threshPercent = Math.round(this.state.threshold * 100);
				return (
					<div className="nb-controls">
						{/* Decision Threshold Slider */}
						<div className="control-group" style={{ marginBottom: "0.85rem" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
								<label style={{ fontWeight: 600, fontSize: "0.82rem", color: "#1e293b" }}>
									Posterior Risk Threshold: <span style={{ color: "#7e22ce", fontWeight: 700 }}>{threshPercent}%</span>
								</label>
								<span style={{ fontSize: "0.72rem", color: "#64748b" }}>Live update</span>
							</div>
							<input
								type="range"
								min="0.05"
								max="0.95"
								step="0.01"
								value={this.state.threshold}
								onChange={(e) => this.handleThresholdChange(e)}
								style={{ width: "100%", accentColor: "#9333ea", cursor: "pointer" }}
							/>
							<div style={{ fontSize: "0.73rem", color: "#64748b", marginTop: "0.2rem" }}>
								Student classified as At-Risk when P(At-Risk | Features) &gt; {threshPercent}%.
							</div>
						</div>

						{/* Prior Probability Mode */}
						<div className="control-group" style={{ marginBottom: "0.75rem" }}>
							<label style={{ display: "block", fontWeight: 600, fontSize: "0.82rem", color: "#1e293b", marginBottom: "0.3rem" }}>
								Class Prior Base Rates (P(Y)):
							</label>
							<div style={{ display: "flex", gap: "0.4rem" }}>
								<button
									type="button"
									className={`btn-toggle-pill ${this.state.priorMode === "empirical" ? "active" : ""}`}
									onClick={() => this.handlePriorModeChange("empirical")}
									style={{
										flex: 1,
										padding: "0.35rem 0.6rem",
										fontSize: "0.76rem",
										fontWeight: 600,
										borderRadius: "6px",
										border: "1px solid #cbd5e1",
										background: this.state.priorMode === "empirical" ? "#0f172a" : "#ffffff",
										color: this.state.priorMode === "empirical" ? "#ffffff" : "#334155",
										cursor: "pointer"
									}}
								>
									Empirical Class Sizes
								</button>
								<button
									type="button"
									className={`btn-toggle-pill ${this.state.priorMode === "equal" ? "active" : ""}`}
									onClick={() => this.handlePriorModeChange("equal")}
									style={{
										flex: 1,
										padding: "0.35rem 0.6rem",
										fontSize: "0.76rem",
										fontWeight: 600,
										borderRadius: "6px",
										border: "1px solid #cbd5e1",
										background: this.state.priorMode === "equal" ? "#0f172a" : "#ffffff",
										color: this.state.priorMode === "equal" ? "#ffffff" : "#334155",
										cursor: "pointer"
									}}
								>
									Equal (50% / 50%)
								</button>
							</div>
							<div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.25rem" }}>
								{this.state.priorMode === "empirical"
									? "Accounts for course base rates: if 80% of students pass, the model requires more evidence to flag risk."
									: "Assumes both classes are equally likely before looking at student scores."}
							</div>
						</div>

						{/* Variance Smoothing */}
						<div className="control-group">
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<label style={{ fontSize: "0.8rem", color: "#334155" }}>
									Variance Smoothing (ε): <strong>{this.state.varSmoothing.toFixed(2)}</strong>
								</label>
							</div>
							<input
								type="range"
								min="0.01"
								max="0.5"
								step="0.01"
								value={this.state.varSmoothing}
								onChange={(e) => this.handleSmoothingChange(e)}
								style={{ width: "100%", accentColor: "#475569", cursor: "pointer", marginTop: "0.2rem" }}
							/>
							<div style={{ fontSize: "0.72rem", color: "#64748b" }}>
								Higher values widen bell curves to prevent overfitting small clusters.
							</div>
						</div>
					</div>
				);
			}
		};
	}

	info() {
		return this.generateInfo({
			name: "Gaussian Naive Bayes",
			tldr: "Weighing evidence using school base rates and bell curves",
			expl1: (
				<div>
					Estimates the likelihood of each student outcome by creating a bell curve cloud for each group and multiplying the odds.
				</div>
			),
			params: [
				"Decision Threshold: Cutoff probability for flagging student intervention.",
				"Class Prior Mode: Accounts for school base rates where passing and struggling groups have different sizes.",
				"Variance Smoothing: Spreads the bell curve slightly so single dots do not cause sharp spikes."
			],
			usecase: [
				"Classes where passing and struggling groups have very unequal sizes",
				"Rapid screening across student records with very little computer processing time",
				"Combining multiple independent indicators such as forum posts, attendance, and quiz completion",
				"Providing a quick probabilistic benchmark on small pilot programs"
			],
			expl2: [
				"Treats each student group as a cloud with an average center and spread.",
				"The name Naive means it assumes each study habit acts independently without influencing the others.",
				"It respects base rates, meaning if course failure is rare, it requires stronger evidence before raising an alarm."
			],
			pros: [
				"Extremely fast to train because it only calculates the average and spread for each group.",
				"Works well on small datasets without memorizing random noise.",
				"Naturally accounts for unequal class sizes through prior probabilities."
			],
			cons: [
				"Assumes data follows smooth bell curves and struggles with crescent or spiral shapes.",
				"Ignores interactions between features because it evaluates each feature on its own."
			],
			links: [
				["https://en.wikipedia.org/wiki/Naive_Bayes_classifier", "Wikipedia Naive Bayes Classifier"],
				["http://scikit-learn.org/stable/modules/naive_bayes.html#gaussian-naive-bayes", "Scikit-Learn Gaussian Naive Bayes"]
			]
		});
	}
}
