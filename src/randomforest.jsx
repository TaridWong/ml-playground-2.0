import S from "./s";
import React from "react";
import MLModel from "./mlmodel";
import { RandomForestDiagram } from "./components/AlgorithmDiagrams";

class RFNode {
	constructor(data, layer) {
		this.data = data;
		this.layer = layer;
		this.isLeaf = true;
		this.pred = S.class1;
		this.feature = null;
		this.splitVal = null;
		this.children = [];
	}

	fire(xTr) {
		if (this.isLeaf || this.children.length < 2) {
			return this.pred;
		}
		if (xTr[this.feature] <= this.splitVal) {
			return this.children[0].fire(xTr);
		}
		return this.children[1].fire(xTr);
	}

	train(maxDepth) {
		if (
			this.layer >= maxDepth ||
			!this.data ||
			!this.data[0] ||
			this.data[0].length < 2 ||
			this.homogenous(this.data[1])
		) {
			this.pred = this.majorityLabel(this.data[1]);
			this.isLeaf = true;
			return;
		}

		const bestSplit = this.bestSplit(this.data);
		if (!bestSplit || bestSplit.splitIndex <= 0) {
			this.pred = this.majorityLabel(this.data[1]);
			this.isLeaf = true;
			return;
		}

		this.isLeaf = false;
		this.feature = bestSplit.feature;
		this.splitVal = bestSplit.value;

		this.children[0] = new RFNode(bestSplit.left, this.layer + 1);
		this.children[1] = new RFNode(bestSplit.right, this.layer + 1);

		this.children[0].train(maxDepth);
		this.children[1].train(maxDepth);
	}

	homogenous(arr) {
		if (!arr || arr.length <= 1) return true;
		const poten = arr[0];
		for (let i = 1; i < arr.length; i++) {
			if (arr[i] !== poten) return false;
		}
		return true;
	}

	majorityLabel(arr) {
		if (!arr || arr.length === 0) return S.class1;
		let c1 = 0;
		let c2 = 0;
		for (let i = 0; i < arr.length; i++) {
			if (Number(arr[i]) === S.class1) c1++;
			else c2++;
		}
		return c1 >= c2 ? S.class1 : S.class2;
	}

	gini(arr) {
		if (!arr || arr.length === 0) return 0;
		let c1 = 0;
		let c2 = 0;
		for (let i = 0; i < arr.length; i++) {
			if (Number(arr[i]) === S.class1) c1++;
			else c2++;
		}
		const p1 = c1 / (c1 + c2);
		return p1 * (1 - p1);
	}

	entropyAtSplit(arr, split) {
		const arr1 = arr.slice(0, split);
		const arr2 = arr.slice(split);
		return arr1.length * this.gini(arr1) + arr2.length * this.gini(arr2);
	}

	bestSplit(data) {
		const xTr = data[0];
		const yTr = data[1];
		if (!xTr || xTr.length < 2) return null;

		let bestFeature = -1;
		let bestSplitIndex = -1;
		let bestEntropy = Infinity;

		// Evaluate both feature dimensions
		for (let f = 0; f < 2; f++) {
			const sorted = this.sortByX(data, f);
			for (let i = 1; i < sorted[0].length; i++) {
				const e = this.entropyAtSplit(sorted[1], i);
				if (e < bestEntropy) {
					bestEntropy = e;
					bestSplitIndex = i;
					bestFeature = f;
				}
			}
		}

		if (bestFeature === -1 || bestSplitIndex <= 0) return null;

		const sortedFinal = this.sortByX(data, bestFeature);
		const finalX = sortedFinal[0];
		const finalY = sortedFinal[1];

		return {
			feature: bestFeature,
			splitIndex: bestSplitIndex,
			value: (finalX[bestSplitIndex - 1][bestFeature] + finalX[bestSplitIndex][bestFeature]) / 2,
			left: [finalX.slice(0, bestSplitIndex), finalY.slice(0, bestSplitIndex)],
			right: [finalX.slice(bestSplitIndex), finalY.slice(bestSplitIndex)]
		};
	}

	sortByX(data, feature) {
		const xTr = data[0];
		const yTr = data[1];
		const concatted = xTr.map((val, idx) => [...val, yTr[idx]]);
		concatted.sort((a, b) => a[feature] - b[feature]);
		const xTrNew = concatted.map((val) => [val[0], val[1]]);
		const yTrNew = concatted.map((val) => val[2]);
		return [xTrNew, yTrNew];
	}
}

export default class RandomForest extends MLModel {
	constructor() {
		super();
		this.nTrees = 15;
		this.maxDepth = 4;
		this.sampleRatio = 0.8;
		this.trees = [];
		this.trained = false;
		this.fallbackClass = S.class1;
	}

	score(x, y) {
		if (!this.trained || !this.trees || this.trees.length === 0) {
			return this.fallbackClass === S.class2 ? 1 : 0;
		}

		let class2Votes = 0;
		for (let i = 0; i < this.trees.length; i++) {
			const vote = this.trees[i].fire([x, y]);
			if (Number(vote) === S.class2) {
				class2Votes++;
			}
		}
		// Continuous probability = fraction of trees voting Class 2
		return class2Votes / this.trees.length;
	}

	classif(x, y) {
		const prob = this.score(x, y);
		return prob >= 0.5 ? S.class2 : S.class1;
	}

	train() {
		if (!this.xTr || this.xTr.length < 2) {
			this.trained = false;
			this.fallbackClass = this.yTr[0] || S.class1;
			return;
		}

		const hasClass1 = this.yTr.some((c) => Number(c) === S.class1);
		const hasClass2 = this.yTr.some((c) => Number(c) === S.class2);

		if (!hasClass1 || !hasClass2) {
			this.trained = false;
			this.fallbackClass = hasClass1 ? S.class1 : S.class2;
			return;
		}

		this.trees = [];
		const N = this.xTr.length;
		const sampleSize = Math.max(2, Math.round(N * this.sampleRatio));

		for (let t = 0; t < this.nTrees; t++) {
			// Bootstrap sampling with replacement
			const bootX = [];
			const bootY = [];
			for (let i = 0; i < sampleSize; i++) {
				const randIdx = Math.floor(Math.random() * N);
				bootX.push(this.xTr[randIdx]);
				bootY.push(this.yTr[randIdx]);
			}

			const root = new RFNode([bootX, bootY], 0);
			root.train(this.maxDepth);
			this.trees.push(root);
		}

		this.trained = true;
	}

	setNTrees(n) {
		const parsed = parseInt(n, 10);
		if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
			this.nTrees = parsed;
			return true;
		}
		return false;
	}

	setMaxDepth(d) {
		const parsed = parseInt(d, 10);
		if (!isNaN(parsed) && parsed >= 1 && parsed <= 10) {
			this.maxDepth = parsed;
			return true;
		}
		return false;
	}

	setSampleRatio(r) {
		const parsed = parseFloat(r);
		if (!isNaN(parsed) && parsed >= 0.4 && parsed <= 1.0) {
			this.sampleRatio = parsed;
			return true;
		}
		return false;
	}

	uiInstance() {
		const self = this;
		return class RandomForestUI extends React.Component {
			constructor(props) {
				super(props);
				this.state = {
					nTrees: self.nTrees,
					maxDepth: self.maxDepth,
					sampleRatio: self.sampleRatio
				};
			}

			handleNTrees(e) {
				const val = parseInt(e.target.value, 10);
				if (self.setNTrees(val)) {
					this.setState({ nTrees: val });
				}
			}

			handleDepth(e) {
				const val = parseInt(e.target.value, 10);
				if (self.setMaxDepth(val)) {
					this.setState({ maxDepth: val });
				}
			}

			handleSampleRatio(e) {
				const val = parseFloat(e.target.value);
				if (self.setSampleRatio(val)) {
					this.setState({ sampleRatio: val });
				}
			}

			render() {
				return (
					<div className="rf-controls">
						{/* Number of Trees Slider */}
						<div className="control-group" style={{ marginBottom: "0.75rem" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<label style={{ fontWeight: 600, fontSize: "0.82rem", color: "#1e293b" }}>
									Number of Trees (N): <strong>{this.state.nTrees}</strong>
								</label>
							</div>
							<input
								type="range"
								min="1"
								max="40"
								step="1"
								value={this.state.nTrees}
								onChange={(e) => this.handleNTrees(e)}
								style={{ width: "100%", accentColor: "#0f172a", cursor: "pointer", marginTop: "0.2rem" }}
							/>
							<div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.15rem" }}>
								{this.state.nTrees === 1
									? "N=1: Acts like a single blocky decision tree."
									: "Higher N averages out individual tree variance, producing smooth consensus boundaries."}
							</div>
						</div>

						{/* Max Depth Slider */}
						<div className="control-group" style={{ marginBottom: "0.75rem" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<label style={{ fontSize: "0.8rem", color: "#334155" }}>
									Max Tree Depth: <strong>{this.state.maxDepth}</strong>
								</label>
							</div>
							<input
								type="range"
								min="1"
								max="8"
								step="1"
								value={this.state.maxDepth}
								onChange={(e) => this.handleDepth(e)}
								style={{ width: "100%", accentColor: "#475569", cursor: "pointer", marginTop: "0.2rem" }}
							/>
						</div>

						{/* Bootstrap Subsample Ratio Slider */}
						<div className="control-group">
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<label style={{ fontSize: "0.8rem", color: "#334155" }}>
									Bootstrap Subsample: <strong>{Math.round(this.state.sampleRatio * 100)}%</strong>
								</label>
							</div>
							<input
								type="range"
								min="0.5"
								max="1.0"
								step="0.05"
								value={this.state.sampleRatio}
								onChange={(e) => this.handleSampleRatio(e)}
								style={{ width: "100%", accentColor: "#475569", cursor: "pointer", marginTop: "0.2rem" }}
							/>
							<div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.15rem" }}>
								Percentage of student cohort sampled with replacement for each individual tree.
							</div>
						</div>
					</div>
				);
			}
		};
	}

	info() {
		return this.generateInfo({
			name: "Random Forest",
			tldr: "Combining many decision trees into a democratic committee",
			expl1: (
				<div>
					Builds an ensemble of diverse decision trees, has each one vote on every student, and chooses the majority prediction.
				</div>
			),
			params: [
				"Number of Trees: How many separate decision trees vote in the committee. More trees smooth out erratic predictions.",
				"Max Tree Depth: The maximum depth allowed for each individual tree in the committee.",
				"Bootstrap Subsample: The percentage of students randomly sampled to train each separate tree, making sure the voters do not all look identical."
			],
			usecase: [
				"Educational datasets with real classroom noise, missed assignments, and unusual student habits",
				"Complex student patterns that need high accuracy without overfitting",
				"Predicting student risk across many grade book columns and LMS activity metrics",
				"Balancing stability and flexibility when a single tree proves too fragile"
			],
			expl2: [
				"A single decision tree can be fragile because moving a single student dot can alter the whole tree. Random Forest solves this by training multiple trees on random samples of the data.",
				<RandomForestDiagram key="rf_diag" />,
				"Every tree votes on whether a student is On-Track or At-Risk, and the majority vote wins.",
				"Combining many trees blends sharp rectangular boxes into smooth gradual steps, creating much more dependable risk probabilities."
			],
			pros: [
				"Greatly reduces the risk of memorizing noise compared to a single decision tree.",
				"Provides smooth, reliable probability estimates across the whole class.",
				"Handles complex relationships without needing data features to be converted to the same scale."
			],
			cons: [
				"Harder to visualize on a single page because it combines votes from dozens of trees.",
				"Takes more processing power and memory than a single decision tree or linear equation."
			],
			links: [
				["https://en.wikipedia.org/wiki/Random_forest", "Wikipedia Random Forest"],
				["http://scikit-learn.org/stable/modules/ensemble.html#forests-of-randomized-trees", "Scikit-Learn Random Forest Guide"]
			]
		});
	}
}
