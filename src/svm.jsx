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
			tldr: "Building the widest possible road between two student groups",
			expl1: (
				<div>
					Finds the dividing line that leaves the largest possible safety gap between On-Track and At-Risk students.
				</div>
			),
			params: [
				"Regularization C: How strictly the model respects every single dot. High C tries to fit every student without mistakes, while low C allows a wider road that tolerates exceptions.",
				"Kernel Choice: Linear creates a straight fence. Polynomial allows gentle curves. RBF draws flexible circular regions around student clusters.",
				"RBF Sigma: Controls how far each student dot casts its influence when using the RBF kernel. Smaller values make tight bubbles, while larger values make broad smooth regions."
			],
			usecase: [
				"Finding clean, wide boundaries that stay reliable when new students join the class",
				"Clear separation problems where you want a comfortable safety margin between groups",
				"Separating complex curved or circular clusters when using the RBF kernel",
				"Small to medium datasets where accuracy and general stability matter most"
			],
			expl2: [
				"Instead of settling for any dividing line, this model mathematically searches for the widest street separating the two groups.",
				<SVMDiagram key="svm_diag" />,
				"The students standing right on the edge of the street are the support vectors. Students located further away have zero effect on where the road is drawn.",
				"When straight lines cannot separate groups, kernels bend the coordinate space so that curved patterns can be divided cleanly."
			],
			pros: [
				"Creates stable boundaries because students far from the street edge do not shift the line.",
				"The regularization parameter lets you balance between fitting dots exactly and tolerating noisy data.",
				"The kernel function allows it to fit circular or curved student clusters."
			],
			cons: [
				"Takes longer to compute as the number of students increases.",
				"Curved kernel boundaries are harder to explain to parents or school leaders than simple flowchart rules."
			],
			links: [
				["https://en.wikipedia.org/wiki/Support_vector_machine", "Wikipedia Support Vector Machine"],
				["http://scikit-learn.org/stable/modules/svm.html", "Scikit-Learn Support Vector Machines"]
			]
		});
	}
}
