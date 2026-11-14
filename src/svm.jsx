import S from "./s";
import React from "react";
import SVM from "./lib/svm";
import MLModel from "./mlmodel";
import { SVMDiagram } from "./components/AlgorithmDiagrams";

export default class SupportVectorMachine extends MLModel {
	constructor() {
		super();
		this.kernel = "linear"; // "linear" | "rbf" | "poly"
		this.C = 10;
		this.rbfSigma = 0.5;
		this.polyDegree = 2;
		this.svm = null;
		this.trained = false;
		this.fallbackClass = S.class1;
	}

	classif(x, y) {
		if (!this.trained || !this.svm) {
			return this.fallbackClass;
		}
		try {
			const m = this.svm.marginOne([x / 200, y / 200]);
			return m > 0 ? S.class1 : S.class2;
		} catch (e) {
			console.error("SVM classif error:", e);
			return this.fallbackClass;
		}
	}

	score(x, y) {
		if (!this.trained || !this.svm) {
			return this.fallbackClass === S.class2 ? 1 : 0;
		}
		try {
			const m = this.svm.marginOne([x / 200, y / 200]);
			// Margin > 0 is Class 1 (Teal, On-Track); Margin < 0 is Class 2 (Rose, At-Risk)
			// Sigmoid of -margin: when m < 0, 1 / (1 + exp(m)) > 0.5 (Class 2)
			return 1 / (1 + Math.exp(m));
		} catch (e) {
			return this.fallbackClass === S.class2 ? 1 : 0;
		}
	}

	train() {
		if (!this.xTr || this.xTr.length < 2) {
			this.trained = false;
			this.fallbackClass = this.yTr[0] || S.class1;
			return;
		}

		const hasClass1 = this.yTr.some((c) => Number(c) === S.class1);
		const hasClass2 = this.yTr.some((c) => Number(c) === S.class2);

		// If all points belong to only one class, SVM cannot separate
		if (!hasClass1 || !hasClass2) {
			this.trained = false;
			this.fallbackClass = hasClass1 ? S.class1 : S.class2;
			return;
		}

		const y = this.yTr.map((c) => this.cl2pr(c));
		const x = this.xTr.map((c) => [c[0] / 200, c[1] / 200]);

		try {
			this.svm = new SVM();
			const options = {
				C: this.C,
				kernel: this.kernel,
				rbfsigma: this.rbfSigma,
				degree: this.polyDegree,
				numpasses: 10
			};
			this.svm.train(x, y, options);
			this.trained = true;
		} catch (err) {
			console.error("SVM training error:", err);
			this.trained = false;
		}
	}

	setKernel(k) {
		if (k === "linear" || k === "rbf" || k === "poly") {
			this.kernel = k;
			return true;
		}
		return false;
	}

	setC(c) {
		const parsed = parseFloat(c);
		if (!isNaN(parsed) && parsed > 0) {
			this.C = parsed;
			return true;
		}
		return false;
	}

	setRbfSigma(s) {
		const parsed = parseFloat(s);
		if (!isNaN(parsed) && parsed > 0) {
			this.rbfSigma = parsed;
			return true;
		}
		return false;
	}

	uiInstance() {
		const self = this;
		return class SvmUI extends React.Component {
			constructor(props) {
				super(props);
				this.state = {
					kernel: self.kernel,
					C: self.C,
					rbfSigma: self.rbfSigma
				};
			}

			handleKernelChange(k) {
				if (self.setKernel(k)) {
					this.setState({ kernel: k });
				}
			}

			handleCChange(e) {
				const val = parseFloat(e.target.value);
				if (self.setC(val)) {
					this.setState({ C: e.target.value });
				}
			}

			handleSigmaChange(e) {
				const val = parseFloat(e.target.value);
				if (self.setRbfSigma(val)) {
					this.setState({ rbfSigma: val });
				}
			}

			render() {
				return (
					<div className="svm-controls">
						{/* Kernel Mode Selector */}
						<div className="control-group" style={{ marginBottom: "0.75rem" }}>
							<label style={{ display: "block", fontWeight: 600, fontSize: "0.82rem", color: "#1e293b", marginBottom: "0.3rem" }}>
								Kernel Trick:
							</label>
							<div style={{ display: "flex", gap: "0.35rem" }}>
								{[
									{ id: "linear", label: "Linear" },
									{ id: "poly", label: "Polynomial (d=2)" },
									{ id: "rbf", label: "RBF (Gaussian)" }
								].map((k) => (
									<button
										key={k.id}
										type="button"
										className={`btn-toggle-pill ${this.state.kernel === k.id ? "active" : ""}`}
										onClick={() => this.handleKernelChange(k.id)}
										style={{
											flex: 1,
											padding: "0.35rem 0.4rem",
											fontSize: "0.73rem",
											fontWeight: 600,
											borderRadius: "6px",
											border: "1px solid #cbd5e1",
											background: this.state.kernel === k.id ? "#0f172a" : "#ffffff",
											color: this.state.kernel === k.id ? "#ffffff" : "#334155",
											cursor: "pointer"
										}}
									>
										{k.label}
									</button>
								))}
							</div>
							<div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.25rem" }}>
								{this.state.kernel === "linear" && "Linear creates a straight hyperplane fence between classes."}
								{this.state.kernel === "poly" && "Polynomial computes (x·z + 1)² to draw parabolic, elliptical, and hyperbolic curves."}
								{this.state.kernel === "rbf" && "Radial Basis Function (Gaussian) creates localized spherical bubbles around clusters."}
							</div>
						</div>

						{/* Regularization C */}
						<div className="control-group" style={{ marginBottom: "0.5rem" }}>
							<label style={{ fontSize: "0.8rem", color: "#334155" }}>
								Regularization (C):{" "}
								<input
									type="text"
									value={this.state.C}
									onChange={(e) => this.handleCChange(e)}
									style={{ width: "50px", marginLeft: "0.3rem" }}
								/>
								<span style={{ fontSize: "0.72rem", color: "#64748b", marginLeft: "0.4rem" }}>
									(Higher C = tighter fit to points)
								</span>
							</label>
						</div>

						{/* RBF Bandwidth Sigma (if RBF selected) */}
						{this.state.kernel === "rbf" && (
							<div className="control-group">
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
									<label style={{ fontSize: "0.8rem", color: "#334155" }}>
										RBF Kernel Sigma (σ): <strong>{this.state.rbfSigma.toFixed(2)}</strong>
									</label>
								</div>
								<input
									type="range"
									min="0.1"
									max="1.5"
									step="0.05"
									value={this.state.rbfSigma}
									onChange={(e) => this.handleSigmaChange(e)}
									style={{ width: "100%", accentColor: "#475569", cursor: "pointer", marginTop: "0.2rem" }}
								/>
							</div>
						)}
					</div>
				);
			}
		};
	}

	info() {
		return this.generateInfo({
			name: "Support Vector Machine (SVM)",
			overview: (
				<p>
					A Support Vector Machine constructs the decision hyperplane (in input or kernel-mapped feature space) that maximizes the geometric separation margin between classes while penalizing margin violations.
				</p>
			),
			steps: [
				"Rescale the X and Y coordinates and assign the two classes to opposite sides (+1 and -1).",
				"Run up to 10 optimization passes to position a dividing boundary that leaves as wide an empty margin as possible between the two groups while limiting points inside the margin.",
				"Keep only the borderline points resting on or inside the margin edge (the support vectors), since only they control where the boundary sits.",
				"Score each new point by comparing it against those kept boundary points, assigning On-Track on one side and At-Risk on the other."
			],
			mathNote: (
				<p>
					With a Linear kernel, the boundary is a straight line. Switching to the Polynomial or RBF kernel measures point similarity in a way that bends the border into curves or closed loops around isolated groups.
				</p>
			),
			diagram: <SVMDiagram key="svm_diag" />,
			params: [
				"Kernel Trick: Linear (default) learns a straight hyperplane; Polynomial (d = 2) models curved conic boundaries; RBF (Gaussian) creates closed local boundaries around clusters.",
				"Regularization (C): Default 10 (must be > 0). Large C heavily penalizes training errors, tightening the fit and shrinking the margin; small C prioritizes a wider margin that tolerates overlapping points.",
				"RBF Kernel Sigma (sigma): Default 0.5 (slider 0.10 to 1.50). Controls kernel bandwidth under RBF; smaller sigma produces tight local islands, while larger sigma produces broader smooth regions."
			],
			pros: [
				"Boundary placement depends only on edge support vectors, leaving distant interior points without influence.",
				"Soft-margin regularization C trades off margin width against training error tolerance.",
				"RBF and polynomial kernels capture non-linear and enclosed cluster topologies."
			],
			cons: [
				"Kernel evaluation cost grows with the number of support vectors and training set size.",
				"Hyperplane coefficients are less straightforward to translate into rubric rules when non-linear kernels are active."
			],
			applied: [
				"Identifying borderline students (support vectors) who sit nearest the risk boundary and most directly shape classifier thresholds.",
				"Separating isolated gaming-the-system clusters from surrounding deliberate learners using the RBF kernel."
			],
			links: [
				["https://en.wikipedia.org/wiki/Support_vector_machine", "Wikipedia Support Vector Machine"],
				["http://scikit-learn.org/stable/modules/svm.html", "Scikit-Learn Support Vector Machines"]
			]
		});
	}
}
