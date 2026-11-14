import S from "./s";
import React from "react";
import MLModel from "./mlmodel";
import { TreeDiagram } from "./components/AlgorithmDiagrams";

class Node {
	// data: [[[x, y], [x, y]....], [1, 2, 2, 1, 1,...]]
	constructor(data, layer, criterion = "gini") {
		this.data = data;
		this.layer = layer;
		this.criterion = criterion;
		this.isLeaf = true;
		this.pred = S.class1;
		this.probClass2 = 0;
		this.feature = null;
		this.splitVal = null;
		this.children = [];
	}

	fire(xTr) {
		if (this.isLeaf || this.children.length < 2)
			return this.pred;
		if (xTr[this.feature] <= this.splitVal)
			return this.children[0].fire(xTr);
		return this.children[1].fire(xTr);
	}

	fireProb(xTr) {
		if (this.isLeaf || this.children.length < 2)
			return this.probClass2;
		if (xTr[this.feature] <= this.splitVal)
			return this.children[0].fireProb(xTr);
		return this.children[1].fireProb(xTr);
	}

	calcProb(arr) {
		if (!arr || arr.length === 0) return 0;
		let count2 = 0;
		for (let i = 0; i < arr.length; i++) {
			if (Number(arr[i]) === S.class2) count2++;
		}
		return count2 / arr.length;
	}

	train(layersLeft) {
		if (layersLeft <= 0 || !this.data || !this.data[0] || this.data[0].length < 2 || this.homogenous(this.data[1])) {
			this.pred = this.majorityLabel(this.data[1]);
			this.probClass2 = this.calcProb(this.data[1]);
			this.isLeaf = true;
			return;
		}

		const bestSplit = this.bestSplit(this.data);
		if (!bestSplit || bestSplit.splitIndex === undefined || bestSplit.splitIndex <= 0) {
			this.pred = this.majorityLabel(this.data[1]);
			this.probClass2 = this.calcProb(this.data[1]);
			this.isLeaf = true;
			return;
		}

		this.isLeaf = false;
		this.feature = bestSplit.feature;
		this.splitVal = bestSplit.value;

		this.children[0] = new Node(bestSplit.left, this.layer + 1, this.criterion);
		this.children[1] = new Node(bestSplit.right, this.layer + 1, this.criterion);

		this.children[0].train(layersLeft - 1);
		this.children[1].train(layersLeft - 1);
	}

	homogenous(arr) {
		if (!arr || arr.length <= 1) return true;
		const poten = arr[0];
		for (let i = 1; i < arr.length; i++) {
			if (arr[i] != poten)
				return false;
		}
		return true;
	}

	majorityLabel(arr) {
		if (!arr || arr.length === 0) return S.class1;
		let c1 = 0;
		let c2 = 0;
		arr.forEach((entry) => {
			if (Number(entry) === S.class1) c1++;
			else c2++;
		});
		return c1 >= c2 ? S.class1 : S.class2;
	}

	impurity(arr) {
		if (!arr || arr.length === 0) return 0;
		let c1 = 0;
		let c2 = 0;
		arr.forEach((entry) => {
			if (Number(entry) === S.class1) c1++;
			else c2++;
		});
		const total = c1 + c2;
		if (total === 0) return 0;
		const p1 = c1 / total;
		const p2 = c2 / total;

		if (this.criterion === "entropy") {
			const e1 = p1 > 0 ? -p1 * Math.log2(p1) : 0;
			const e2 = p2 > 0 ? -p2 * Math.log2(p2) : 0;
			return e1 + e2;
		}

		// Gini Impurity (default)
		return 1 - (p1 * p1 + p2 * p2);
	}

	impurityAtSplit(arr, split) {
		const arr1 = arr.slice(0, split);
		const arr2 = arr.slice(split);
		return arr1.length * this.impurity(arr1) + arr2.length * this.impurity(arr2);
	}

	bestSplit(data) {
		let xTr = data[0];
		let yTr = data[1];
		if (!xTr || xTr.length < 2) return null;

		let bestFeature = -1;
		let bestSplitIndex = -1;
		let bestImpurity = Infinity;

		for (let f = 0; f < 2; f++) {
			const sortedData = this.sortByX(data, f);
			for (let i = 1; i < sortedData[0].length; i++) {
				const imp = this.impurityAtSplit(sortedData[1], i);
				if (imp < bestImpurity) {
					bestImpurity = imp;
					bestSplitIndex = i;
					bestFeature = f;
				}
			}
		}

		if (bestFeature === -1 || bestSplitIndex <= 0) return null;

		const sortedDataFinal = this.sortByX(data, bestFeature);
		xTr = sortedDataFinal[0];
		yTr = sortedDataFinal[1];

		return {
			feature: bestFeature,
			splitIndex: bestSplitIndex,
			value: (xTr[bestSplitIndex - 1][bestFeature] + xTr[bestSplitIndex][bestFeature]) / 2,
			left: [xTr.slice(0, bestSplitIndex), yTr.slice(0, bestSplitIndex)],
			right: [xTr.slice(bestSplitIndex, xTr.length), yTr.slice(bestSplitIndex, yTr.length)]
		};
	}

	sortByX(data, feature) {
		const xTr = data[0];
		const yTr = data[1];
		const concatted = xTr.map((val, ind) => [...val, yTr[ind]]);
		concatted.sort((a, b) => a[feature] - b[feature]);
		const xTrNew = concatted.map((val) => [val[0], val[1]]);
		const yTrNew = concatted.map((val) => val[2]);
		return [xTrNew, yTrNew];
	}

	toHierarchy(xLabel = "Feature X", yLabel = "Feature Y") {
		const c1 = this.data && this.data[1] ? this.data[1].filter((y) => Number(y) === S.class1).length : 0;
		const c2 = this.data && this.data[1] ? this.data[1].filter((y) => Number(y) === S.class2).length : 0;
		const total = c1 + c2;
		const impVal = this.data && this.data[1] ? this.impurity(this.data[1]).toFixed(3) : "0.000";

		if (this.isLeaf || this.children.length < 2) {
			return {
				isLeaf: true,
				layer: this.layer,
				pred: this.pred,
				predLabel: this.pred === S.class2 ? "At-Risk" : "On-Track",
				total,
				c1,
				c2,
				probClass2: this.probClass2,
				impurity: impVal,
				criterion: this.criterion
			};
		}

		const featName = this.feature === 0 ? xLabel : yLabel;
		const splitFormatted = Math.round(this.splitVal);

		return {
			isLeaf: false,
			layer: this.layer,
			feature: this.feature,
			featureName: featName,
			splitVal: splitFormatted,
			ruleText: `${featName} ≤ ${splitFormatted}`,
			total,
			c1,
			c2,
			impurity: impVal,
			criterion: this.criterion,
			left: this.children[0].toHierarchy(xLabel, yLabel),
			right: this.children[1].toHierarchy(xLabel, yLabel)
		};
	}
}

export default class Tree extends MLModel {
	constructor() {
		super();
		this.root = null;
		this.maxDepth = 4;
		this.criterion = "gini"; // "gini" | "entropy"
	}

	getTreeHierarchy(xLabel = "Feature X", yLabel = "Feature Y") {
		if (!this.root) return null;
		return this.root.toHierarchy(xLabel, yLabel);
	}

	classif(x, y) {
		if (!this.root) return S.class1;
		return this.root.fire([x, y]);
	}

	score(x, y) {
		if (!this.root) return 0;
		return this.root.fireProb([x, y]);
	}

	dist(x1, y1, x2, y2) {
		return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
	}

	train() {
		if (!this.xTr || this.xTr.length === 0) {
			this.root = null;
			return;
		}
		this.root = new Node([this.xTr, this.yTr], 0, this.criterion);
		this.root.train(this.maxDepth);
	}

	setMaxDepth(val) {
		const parsed = parseInt(val, 10);
		if (!isNaN(parsed) && parsed >= 1 && parsed <= 10) {
			this.maxDepth = parsed;
			return true;
		}
		return false;
	}

	setCriterion(c) {
		if (c === "gini" || c === "entropy") {
			this.criterion = c;
			return true;
		}
		return false;
	}

	uiInstance() {
		const self = this;
		return class TreeUI extends React.Component {
			constructor(props) {
				super(props);
				this.state = {
					maxDepth: self.maxDepth,
					criterion: self.criterion
				};
			}

			handleDepth(e) {
				const val = parseInt(e.target.value, 10);
				if (self.setMaxDepth(val)) {
					this.setState({ maxDepth: val });
				}
			}

			handleCriterion(mode) {
				if (self.setCriterion(mode)) {
					this.setState({ criterion: mode });
				}
			}

			render() {
				return (
					<div className="tree-controls">
						{/* Max Depth Slider */}
						<div className="control-group" style={{ marginBottom: "0.75rem" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<label style={{ fontWeight: 600, fontSize: "0.82rem", color: "#1e293b" }}>
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
								style={{ width: "100%", accentColor: "#0f172a", cursor: "pointer", marginTop: "0.2rem" }}
							/>
							<div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.15rem" }}>
								{this.state.maxDepth === 1
									? "Depth 1 (Decision Stump): A single cut dividing students."
									: "Higher depth creates finer orthogonal grids to isolate subgroups."}
							</div>
						</div>

						{/* Split Criterion Toggle */}
						<div className="control-group">
							<label style={{ display: "block", fontWeight: 600, fontSize: "0.82rem", color: "#1e293b", marginBottom: "0.3rem" }}>
								Splitting Criterion:
							</label>
							<div style={{ display: "flex", gap: "0.4rem" }}>
								<button
									type="button"
									className={`btn-toggle-pill ${this.state.criterion === "gini" ? "active" : ""}`}
									onClick={() => this.handleCriterion("gini")}
									style={{
										flex: 1,
										padding: "0.35rem 0.5rem",
										fontSize: "0.75rem",
										fontWeight: 600,
										borderRadius: "6px",
										border: "1px solid #cbd5e1",
										background: this.state.criterion === "gini" ? "#0f172a" : "#ffffff",
										color: this.state.criterion === "gini" ? "#ffffff" : "#334155",
										cursor: "pointer"
									}}
								>
									Gini Impurity (CART)
								</button>
								<button
									type="button"
									className={`btn-toggle-pill ${this.state.criterion === "entropy" ? "active" : ""}`}
									onClick={() => this.handleCriterion("entropy")}
									style={{
										flex: 1,
										padding: "0.35rem 0.5rem",
										fontSize: "0.75rem",
										fontWeight: 600,
										borderRadius: "6px",
										border: "1px solid #cbd5e1",
										background: this.state.criterion === "entropy" ? "#0f172a" : "#ffffff",
										color: this.state.criterion === "entropy" ? "#ffffff" : "#334155",
										cursor: "pointer"
									}}
								>
									Shannon Entropy (C4.5)
								</button>
							</div>
						</div>
					</div>
				);
			}
		};
	}

	info() {
		return this.generateInfo({
			name: "Decision Tree",
			overview: (
				<p>
					A Decision Tree recursively partitions the two-dimensional feature space using axis-aligned threshold cuts (feature &le; split value), forming a hierarchical set of rectangular regions.
				</p>
			),
			steps: [
				"Sort the points along X and along Y to test every midpoint cut between neighboring values.",
				"Pick the single horizontal or vertical cut that best separates On-Track and At-Risk points according to Gini Impurity or Entropy.",
				"Divide the points into a left group (at or below the cut) and a right group (above the cut), and keep splitting each group until hitting Max Tree Depth, a pure group, or fewer than 2 points.",
				"Label each final box with its majority group and use the fraction of At-Risk points in that box as the risk score."
			],
			mathNote: (
				<p>
					Gini Impurity and Entropy both measure how mixed a group is: 0 means every point in the box belongs to one class, while higher values mean the box holds an even mix of both classes. Because cuts only depend on value order, changing the numeric scale of X or Y does not alter the splits.
				</p>
			),
			diagram: <TreeDiagram key="tree_diag" />,
			params: [
				"Max Tree Depth: Default 4 (slider 1 to 8; setter accepts 1 to 10). Depth 1 trains a single-split decision stump; deeper trees isolate smaller pockets at higher risk of overfitting noise.",
				"Splitting Criterion: Gini Impurity (CART default) or Shannon Entropy (C4.5); both penalize mixed nodes and usually produce similar partitions."
			],
			pros: [
				"Each root-to-leaf path translates directly into an explicit sequence of threshold rules shown in the tree viewer.",
				"Scale-invariant across features with different units.",
				"Models non-linear L-shaped or rectangular regions without manual feature transformations."
			],
			cons: [
				"High variance: small shifts in training coordinates can alter the root split and rearrange downstream branches.",
				"Axis-aligned cuts approximate diagonal boundaries with coarse stair-step segments."
			],
			applied: [
				"Institutional advising policies and early-warning rubrics where stakeholders require explicit, auditable cutoff thresholds.",
				"Formative assessment classification when mastery occurs via alternative pathways (high diagnostic score OR high practice volume)."
			],
			links: [
				["https://en.wikipedia.org/wiki/Decision_tree", "Wikipedia Decision Tree"],
				["https://en.wikipedia.org/wiki/Decision_tree_learning", "Decision Tree Learning"]
			]
		});
	}
}
