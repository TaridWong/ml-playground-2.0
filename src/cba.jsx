import S from "./s";
import React from "react";
import MLModel from "./mlmodel";

export default class CBA extends MLModel {
	constructor() {
		super();
		this.gridSize = 3; // 3x3, 4x4, or 5x5 rubric grid
		this.minConfidence = 0.65; // Confidence threshold (0.50 to 0.90)
		this.minSupport = 1; // Support count threshold (1 to 5)
		this.fallbackMode = "ontrack"; // "ontrack" | "majority"
		this.rules = {}; // Key: "ix_iy" -> { pred: Class, conf: Number, supp: Number }
		this.binCounts = {}; // Key: "ix_iy" -> { c1: Number, c2: Number, total: Number }
		this.globalPrior = 0.5;
		this.majorityClass = S.class1;
		this.trained = false;
		this.fallbackClass = S.class1;
	}

	getBinIndex(val, k) {
		// Canvas coordinates span from -180 to +180 (span = 360)
		const norm = (val + 180) / 360;
		const clamped = Math.max(0, Math.min(0.9999, norm));
		return Math.floor(clamped * k);
	}

	score(x, y) {
		if (!this.trained) {
			return this.fallbackClass === S.class2 ? 1 : 0;
		}

		const ix = this.getBinIndex(x, this.gridSize);
		const iy = this.getBinIndex(y, this.gridSize);
		const key = `${ix}_${iy}`;

		const bin = this.binCounts[key];
		if (bin && bin.total > 0) {
			// Laplace smoothed probability of Class 2 inside this rubric bin
			return (bin.c2 + 0.5) / (bin.total + 1.0);
		}

		// Fallback to global prior for empty rubric cells
		return this.globalPrior;
	}

	classif(x, y) {
		if (!this.trained) {
			return this.fallbackClass;
		}

		const ix = this.getBinIndex(x, this.gridSize);
		const iy = this.getBinIndex(y, this.gridSize);
		const key = `${ix}_${iy}`;

		// Check if a mined association rule applies to this rubric tile
		const rule = this.rules[key];
		if (rule) {
			return rule.pred;
		}

		// If no rule passed confidence and support thresholds, use fallback policy
		return this.fallbackMode === "ontrack" ? S.class1 : this.majorityClass;
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
		const k = this.gridSize;
		this.binCounts = {};
		this.rules = {};

		let totalC1 = 0;
		let totalC2 = 0;

		// Step 1: Accumulate counts into discrete rubric grid tiles
		for (let i = 0; i < N; i++) {
			const pt = this.xTr[i];
			const cls = Number(this.yTr[i]);
			const ix = this.getBinIndex(pt[0], k);
			const iy = this.getBinIndex(pt[1], k);
			const key = `${ix}_${iy}`;

			if (!this.binCounts[key]) {
				this.binCounts[key] = { c1: 0, c2: 0, total: 0 };
			}

			if (cls === S.class2) {
				this.binCounts[key].c2++;
				totalC2++;
			} else {
				this.binCounts[key].c1++;
				totalC1++;
			}
			this.binCounts[key].total++;
		}

		this.globalPrior = totalC2 / N;
		this.majorityClass = totalC2 > totalC1 ? S.class2 : S.class1;

		// Step 2: Mine classification association rules for bins satisfying support & confidence
		for (let ix = 0; ix < k; ix++) {
			for (let iy = 0; iy < k; iy++) {
				const key = `${ix}_${iy}`;
				const bin = this.binCounts[key];
				if (!bin || bin.total < this.minSupport) continue;

				const conf2 = bin.c2 / bin.total;
				const conf1 = bin.c1 / bin.total;

				if (conf2 >= this.minConfidence) {
					this.rules[key] = {
						pred: S.class2,
						conf: conf2,
						supp: bin.c2
					};
				} else if (conf1 >= this.minConfidence) {
					this.rules[key] = {
						pred: S.class1,
						conf: conf1,
						supp: bin.c1
					};
				}
			}
		}

		this.trained = true;
	}

	setGridSize(size) {
		const parsed = parseInt(size, 10);
		if (!isNaN(parsed) && (parsed === 3 || parsed === 4 || parsed === 5)) {
			this.gridSize = parsed;
			return true;
		}
		return false;
	}

	setMinConfidence(conf) {
		const parsed = parseFloat(conf);
		if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 0.95) {
			this.minConfidence = parsed;
			return true;
		}
		return false;
	}

	setMinSupport(supp) {
		const parsed = parseInt(supp, 10);
		if (!isNaN(parsed) && parsed >= 1 && parsed <= 5) {
			this.minSupport = parsed;
			return true;
		}
		return false;
	}

	setFallbackMode(mode) {
		if (mode === "ontrack" || mode === "majority") {
			this.fallbackMode = mode;
			return true;
		}
		return false;
	}

	uiInstance() {
		const self = this;
		return class CBAUI extends React.Component {
			constructor(props) {
				super(props);
				this.state = {
					gridSize: self.gridSize,
					minConfidence: self.minConfidence,
					minSupport: self.minSupport,
					fallbackMode: self.fallbackMode
				};
			}

			handleGrid(g) {
				if (self.setGridSize(g)) {
					this.setState({ gridSize: g });
				}
			}

			handleConfidence(e) {
				const val = parseFloat(e.target.value);
				if (self.setMinConfidence(val)) {
					this.setState({ minConfidence: val });
				}
			}

			handleSupport(e) {
				const val = parseInt(e.target.value, 10);
				if (self.setMinSupport(val)) {
					this.setState({ minSupport: val });
				}
			}

			handleFallback(mode) {
				if (self.setFallbackMode(mode)) {
					this.setState({ fallbackMode: mode });
					if (typeof this.props.reclassify === "function") {
						this.props.reclassify();
					}
				}
			}

			render() {
				return (
					<div className="cba-controls">
						{/* Grid Discretization Toggle */}
						<div className="control-group" style={{ marginBottom: "0.75rem" }}>
							<label style={{ display: "block", fontWeight: 600, fontSize: "0.82rem", color: "#1e293b", marginBottom: "0.3rem" }}>
								Score Rubric Discretization:
							</label>
							<div style={{ display: "flex", gap: "0.4rem" }}>
								{[
									{ k: 3, label: "3x3 (Low / Mid / High)" },
									{ k: 4, label: "4x4 (4 Bands)" },
									{ k: 5, label: "5x5 (5 Tiers)" }
								].map((item) => (
									<button
										key={item.k}
										type="button"
										className={`btn-toggle-pill ${this.state.gridSize === item.k ? "active" : ""}`}
										onClick={() => this.handleGrid(item.k)}
										style={{
											flex: 1,
											padding: "0.35rem 0.3rem",
											fontSize: "0.72rem",
											fontWeight: 600,
											borderRadius: "6px",
											border: "1px solid #cbd5e1",
											background: this.state.gridSize === item.k ? "#0f172a" : "#ffffff",
											color: this.state.gridSize === item.k ? "#ffffff" : "#334155",
											cursor: "pointer"
										}}
									>
										{item.label}
									</button>
								))}
							</div>
							<div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.25rem" }}>
								Slices continuous exam and activity axes into discrete rubric categories.
							</div>
						</div>

						{/* Minimum Confidence Slider */}
						<div className="control-group" style={{ marginBottom: "0.75rem" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<label style={{ fontSize: "0.8rem", color: "#334155" }}>
									Min Rule Confidence: <strong>{Math.round(this.state.minConfidence * 100)}%</strong>
								</label>
							</div>
							<input
								type="range"
								min="0.5"
								max="0.9"
								step="0.05"
								value={this.state.minConfidence}
								onChange={(e) => this.handleConfidence(e)}
								style={{ width: "100%", accentColor: "#0f172a", cursor: "pointer", marginTop: "0.2rem" }}
							/>
							<div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.15rem" }}>
								Higher confidence requires a rubric box to be overwhelmingly one class before creating an intervention rule.
							</div>
						</div>

						{/* Minimum Support Slider */}
						<div className="control-group" style={{ marginBottom: "0.75rem" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<label style={{ fontSize: "0.8rem", color: "#334155" }}>
									Min Support (Students): <strong>{this.state.minSupport}</strong>
								</label>
							</div>
							<input
								type="range"
								min="1"
								max="5"
								step="1"
								value={this.state.minSupport}
								onChange={(e) => this.handleSupport(e)}
								style={{ width: "100%", accentColor: "#475569", cursor: "pointer", marginTop: "0.2rem" }}
							/>
							<div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.15rem" }}>
								Ignores isolated fluke tiles containing fewer students than this support count.
							</div>
						</div>

						{/* Fallback Strategy Toggle */}
						<div className="control-group">
							<label style={{ display: "block", fontWeight: 600, fontSize: "0.82rem", color: "#1e293b", marginBottom: "0.3rem" }}>
								Uncovered Tile Policy (Fallback):
							</label>
							<div style={{ display: "flex", gap: "0.4rem" }}>
								<button
									type="button"
									className={`btn-toggle-pill ${this.state.fallbackMode === "ontrack" ? "active" : ""}`}
									onClick={() => this.handleFallback("ontrack")}
									style={{
										flex: 1,
										padding: "0.35rem 0.5rem",
										fontSize: "0.74rem",
										fontWeight: 600,
										borderRadius: "6px",
										border: "1px solid #cbd5e1",
										background: this.state.fallbackMode === "ontrack" ? "#0f172a" : "#ffffff",
										color: this.state.fallbackMode === "ontrack" ? "#ffffff" : "#334155",
										cursor: "pointer"
									}}
								>
									Assume On-Track
								</button>
								<button
									type="button"
									className={`btn-toggle-pill ${this.state.fallbackMode === "majority" ? "active" : ""}`}
									onClick={() => this.handleFallback("majority")}
									style={{
										flex: 1,
										padding: "0.35rem 0.5rem",
										fontSize: "0.74rem",
										fontWeight: 600,
										borderRadius: "6px",
										border: "1px solid #cbd5e1",
										background: this.state.fallbackMode === "majority" ? "#0f172a" : "#ffffff",
										color: this.state.fallbackMode === "majority" ? "#ffffff" : "#334155",
										cursor: "pointer"
									}}
								>
									Majority Class
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
			name: "Classification Based on Associations (CBA)",
			tldr: "Discretizing student scores into rubric tiles and mining if-then association rules",
			expl1: (
				<div>
					Divides the continuous chart into discrete rubric performance bands and discovers association rules that connect specific score combinations to student outcomes.
				</div>
			),
			params: [
				"Rubric Discretization: How many discrete bands are created along each axis, such as Low, Medium, and High.",
				"Min Rule Confidence: The percentage purity required inside a rubric tile before the system generates an intervention rule.",
				"Min Support: The minimum number of students needed in a tile to justify creating a rule, preventing flukes from warping policy.",
				"Uncovered Tile Policy: How the school handles empty or ambiguous score tiles where no strong rule was discovered."
			],
			usecase: [
				"Classroom policies based on letter grades, rubric tiers, and performance bands",
				"Creating clear if-then rules that read directly like school board intervention guidelines",
				"Filtering out rare fluke behaviors by setting minimum support thresholds",
				"Auditing decisions because each student falls into a clearly defined rubric box"
			],
			expl2: [
				"Educators often evaluate learners using performance bands rather than continuous algebraic equations.",
				"CBA groups continuous metrics into distinct boxes, counts the outcomes inside each box, and mines strong if-then association rules.",
				"Unlike recursive decision trees, CBA creates a direct patchwork of rubric tiles, making every single threshold immediately clear."
			],
			pros: [
				"Produces transparent rules that match school rubrics and letter grade boundaries.",
				"Support and confidence thresholds naturally filter out single accidental student scores.",
				"Easy to audit and communicate with students, parents, and administrators."
			],
			cons: [
				"Discretization can treat two students close to a boundary line very differently if they fall on opposite sides of a bin edge.",
				"Struggles with curved diagonal boundaries unless the grid is made very fine."
			],
			links: [
				["https://en.wikipedia.org/wiki/Association_rule_learning", "Wikipedia Association Rule Learning"],
				["https://dl.acm.org/doi/10.1145/276305.276313", "Integrating Classification and Association Rule Mining (Liu et al.)"]
			]
		});
	}
}
