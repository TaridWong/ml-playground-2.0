import S from "./s";
import React from "react";
import MLModel from "./mlmodel";
import { KNNDiagram } from "./components/AlgorithmDiagrams";

export default class Knn extends MLModel {
	constructor() {
		super();
		this.k = 3;
		this.weighting = "uniform"; // "uniform" | "distance"
	}

	getNeighbors(x, y) {
		const knnDist = [];
		const knnLabels = [];
		for (let i = 0; i < this.xTr.length; i++) {
			const dist = this.dist(x, y, this.xTr[i][0], this.xTr[i][1]);
			let inserted = false;
			for (let j = 0; j < Math.min(this.k, knnDist.length); j++) {
				if (dist < knnDist[j]) {
					knnDist.splice(j, 0, dist);
					knnLabels.splice(j, 0, this.yTr[i]);
					inserted = true;
					break;
				}
			}
			if (!inserted && knnDist.length < this.k) {
				knnDist.push(dist);
				knnLabels.push(this.yTr[i]);
			}
			if (knnDist.length > this.k) {
				knnDist.length = this.k;
				knnLabels.length = this.k;
			}
		}
		return { dists: knnDist, labels: knnLabels };
	}

	score(x, y) {
		if (!this.xTr || this.xTr.length === 0) return 0;
		const { dists, labels } = this.getNeighbors(x, y);
		if (labels.length === 0) return 0;

		if (this.weighting === "distance") {
			let weightClass2 = 0;
			let totalWeight = 0;
			for (let i = 0; i < labels.length; i++) {
				const w = 1 / (dists[i] + 1.0);
				totalWeight += w;
				if (Number(labels[i]) === S.class2) {
					weightClass2 += w;
				}
			}
			return totalWeight > 0 ? weightClass2 / totalWeight : 0;
		}

		// Uniform majority fraction
		let countClass2 = 0;
		for (let i = 0; i < labels.length; i++) {
			if (Number(labels[i]) === S.class2) countClass2++;
		}
		return countClass2 / labels.length;
	}

	classif(x, y) {
		const prob = this.score(x, y);
		return prob >= 0.5 ? S.class2 : S.class1;
	}

	dist(x1, y1, x2, y2) {
		const dx = x1 - x2;
		const dy = y1 - y2;
		return Math.sqrt(dx * dx + dy * dy);
	}

	setK(k) {
		const parsed = parseInt(k, 10);
		if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
			this.k = parsed;
			return true;
		}
		return false;
	}

	setWeighting(mode) {
		if (mode === "uniform" || mode === "distance") {
			this.weighting = mode;
			return true;
		}
		return false;
	}

	uiInstance() {
		const self = this;
		return class KnnUi extends React.Component {
			constructor(props) {
				super(props);
				this.state = {
					k: self.k,
					weighting: self.weighting
				};
			}

			handleK(e) {
				const val = parseInt(e.target.value, 10);
				if (self.setK(val)) {
					this.setState({ k: val });
					if (typeof this.props.reclassify === "function") {
						this.props.reclassify();
					}
				}
			}

			handleWeighting(mode) {
				if (self.setWeighting(mode)) {
					this.setState({ weighting: mode });
					if (typeof this.props.reclassify === "function") {
						this.props.reclassify();
					}
				}
			}

			render() {
				return (
					<div className="knn-controls">
						{/* K Neighbors Slider */}
						<div className="control-group" style={{ marginBottom: "0.75rem" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<label style={{ fontWeight: 600, fontSize: "0.82rem", color: "#1e293b" }}>
									K (Nearest Neighbors): <strong>{this.state.k}</strong>
								</label>
								<span style={{ fontSize: "0.72rem", color: "#64748b" }}>Live update</span>
							</div>
							<input
								type="range"
								min="1"
								max="25"
								step="1"
								value={this.state.k}
								onChange={(e) => this.handleK(e)}
								style={{ width: "100%", accentColor: "#0f172a", cursor: "pointer", marginTop: "0.2rem" }}
							/>
							<div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.15rem" }}>
								{this.state.k === 1
									? "K=1 creates sharp, fragmented boundaries around single outlier dots."
									: "Higher K requires broader local peer consensus, producing smoother boundaries."}
							</div>
						</div>

						{/* Distance Weighting Mode */}
						<div className="control-group">
							<label style={{ display: "block", fontWeight: 600, fontSize: "0.82rem", color: "#1e293b", marginBottom: "0.3rem" }}>
								Neighbor Voting Weight:
							</label>
							<div style={{ display: "flex", gap: "0.4rem" }}>
								<button
									type="button"
									className={`btn-toggle-pill ${this.state.weighting === "uniform" ? "active" : ""}`}
									onClick={() => this.handleWeighting("uniform")}
									style={{
										flex: 1,
										padding: "0.35rem 0.5rem",
										fontSize: "0.75rem",
										fontWeight: 600,
										borderRadius: "6px",
										border: "1px solid #cbd5e1",
										background: this.state.weighting === "uniform" ? "#0f172a" : "#ffffff",
										color: this.state.weighting === "uniform" ? "#ffffff" : "#334155",
										cursor: "pointer"
									}}
								>
									Uniform Weight
								</button>
								<button
									type="button"
									className={`btn-toggle-pill ${this.state.weighting === "distance" ? "active" : ""}`}
									onClick={() => this.handleWeighting("distance")}
									style={{
										flex: 1,
										padding: "0.35rem 0.5rem",
										fontSize: "0.75rem",
										fontWeight: 600,
										borderRadius: "6px",
										border: "1px solid #cbd5e1",
										background: this.state.weighting === "distance" ? "#0f172a" : "#ffffff",
										color: this.state.weighting === "distance" ? "#ffffff" : "#334155",
										cursor: "pointer"
									}}
								>
									Inverse Distance (1/d)
								</button>
							</div>
							<div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.25rem" }}>
								{this.state.weighting === "distance"
									? "Closer neighbors receive higher weight than more distant neighbors."
									: "All K neighbors receive equal weight regardless of distance."}
							</div>
						</div>
					</div>
				);
			}
		};
	}

	info() {
		return this.generateInfo({
			name: "K-Nearest Neighbors (KNN)",
			overview: (
				<p>
					K-Nearest Neighbors is a non-parametric, instance-based classifier that estimates class membership directly from the closest labeled points in the feature space rather than fitting global parameters.
				</p>
			),
			steps: [
				"Keep all plotted points and their labels in memory without fitting a separate line or curve.",
				"When classifying a new point, measure the straight-line distance from that point to every stored point on the chart.",
				"Pick the K closest points (neighbors) to the new point.",
				"Count the neighbor votes (either equal votes or weighted so closer points count more) and assign At-Risk if at least half of the vote score points to At-Risk."
			],
			mathNote: (
				<p>
					KNN does its work at prediction time rather than during training. Small values of K follow local clusters closely, while larger values of K average across more neighbors and produce smoother borders.
				</p>
			),
			diagram: <KNNDiagram key="knn_diag" />,
			params: [
				"K (Nearest Neighbors): Default 3 (slider 1 to 25; setter accepts 1 to 50). Setting K = 1 assigns each point to its single nearest neighbor and reacts to isolated outliers. Odd values such as 3, 5, or 7 break unweighted binary ties.",
				"Neighbor Voting Weight: Uniform (default) weights all K neighbors equally, while Inverse Distance weights each neighbor by 1 / (d + 1), reducing the impact of distant points inside sparse neighborhoods."
			],
			pros: [
				"Requires no assumptions about functional form and captures curved, disjoint, or enclosed decision regions.",
				"New observations can be added to the reference set without retraining parameters.",
				"Predictions can be audited by inspecting the exact K neighboring cases."
			],
			cons: [
				"Prediction cost scales linearly with dataset size n because every query scans all stored points.",
				"Sensitive to differences in feature scale when one variable spans a wider numerical range than another."
			],
			applied: [
				"Case-based advising where educators explain an At-Risk classification by referencing students with comparable attendance and assessment records.",
				"Detecting localized behavioral subgroups, such as gaming-the-system clusters embedded inside broader student cohorts."
			],
			links: [
				["https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm", "Wikipedia: k-nearest neighbors algorithm"],
				["http://scikit-learn.org/stable/modules/generated/sklearn.neighbors.KNeighborsClassifier.html", "Scikit-Learn KNeighborsClassifier"]
			]
		});
	}
}
