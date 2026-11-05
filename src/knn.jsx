import S from "./s";
import React from "react";
import MLModel from "./mlmodel";

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
									Uniform (1 vote each)
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
									? "Closer peers have much greater influence than distant neighbors."
									: "All K neighbors cast an equal democratic vote regardless of distance."}
							</div>
						</div>
					</div>
				);
			}
		};
	}

	info() {
		return this.generateInfo({
			name: "K Nearest Neighbors (KNN)",
			tldr: "Looking at your closest peers to make a guess",
			expl1: (
				<div>
					When predicting a new student, the algorithm looks at the <b>K closest students on the chart</b> and takes a majority vote.
				</div>
			),
			params: [
				"Number of Neighbors (K): How many nearby students get a vote. Looking at only 1 neighbor reacts to every single fluke, while looking at 15 neighbors requires broad agreement.",
				"Voting Weight: Choose whether all neighbors get an equal vote or closer neighbors have a stronger voice."
			],
			usecase: [
				"Finding natural clusters where similar students group together",
				"Spotting isolated pockets of students without needing a straight boundary",
				"Simple classification tasks where you want to explain a decision by pointing to similar peer examples",
				"Quick baselines because it does not require an upfront training calculation"
			],
			expl2: [
				"The core intuition is that students with similar study habits and quiz scores tend to have similar academic outcomes.",
				"If a student sits close to several peers who passed, the model predicts they will pass too.",
				"When K is set to 1, the model creates tiny bubbles around every individual student. If one student guessed randomly on a quiz, that single point can warp the boundary. Increasing K smooths out these bubbles so isolated accidents do not mislead the overall prediction."
			],
			pros: [
				"Very intuitive to explain to teachers, parents, and students.",
				"Adapts to unusual shapes, curves, and separate groups without special math formulas."
			],
			cons: [
				"Predictions become slower as your dataset grows because it has to calculate distances to every past student.",
				"Can get confused if one feature uses large numbers like total minutes and another uses small numbers like quiz counts."
			],
			links: [
				["https://en.wikipedia.org/wiki/K-nearest_neighbors_algorithm", "Wikipedia: k-nearest neighbors algorithm"],
				["http://scikit-learn.org/stable/modules/generated/sklearn.neighbors.KNeighborsClassifier.html", "Scikit-Learn KNN classifier"]
			]
		});
	}
}
