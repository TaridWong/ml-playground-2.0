import S from "./s";
import React from "react";
import MLModel from "./mlmodel";

export default class LogisticRegression extends MLModel {
	constructor() {
		super();
		this.degree = 1; // 1 = Linear, 2 = Polynomial (Quadratic)
		this.threshold = 0.5; // Decision threshold for Class 2 (At-Risk)
		this.C = 10.0; // L2 Regularization parameter
		this.weights = null;
		this.trained = false;
		this.fallbackClass = S.class1;
	}

	getFeatures(x, y) {
		const xn = x / 200;
		const yn = y / 200;
		if (this.degree === 2) {
			// Degree 2 polynomial expansion: [bias, x, y, x^2, y^2, x*y]
			return [1, xn, yn, xn * xn, yn * yn, xn * yn];
		}
		// Degree 1 standard linear features: [bias, x, y]
		return [1, xn, yn];
	}

	sigmoid(z) {
		const clamped = Math.max(-25, Math.min(25, z));
		return 1 / (1 + Math.exp(-clamped));
	}

	score(x, y) {
		if (!this.trained || !this.weights) {
			return this.fallbackClass === S.class2 ? 1 : 0;
		}
		const f = this.getFeatures(x, y);
		let z = 0;
		for (let i = 0; i < f.length; i++) {
			z += f[i] * this.weights[i];
		}
		return this.sigmoid(z);
	}

	classif(x, y) {
		if (!this.trained || !this.weights) {
			return this.fallbackClass;
		}
		const prob = this.score(x, y);
		return prob >= this.threshold ? S.class2 : S.class1;
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

		// Binary target: Class 1 (On-track) = 0, Class 2 (At-Risk) = 1
		const yTargets = this.yTr.map((c) => (Number(c) === S.class2 ? 1 : 0));
		const featDim = this.degree === 2 ? 6 : 3;
		const X = this.xTr.map((pt) => this.getFeatures(pt[0], pt[1]));

		let w = new Array(featDim).fill(0);
		const nSamples = X.length;
		const epochs = 350;
		const lr = 0.8;

		for (let epoch = 0; epoch < epochs; epoch++) {
			const grad = new Array(featDim).fill(0);
			for (let i = 0; i < nSamples; i++) {
				let z = 0;
				for (let j = 0; j < featDim; j++) {
					z += X[i][j] * w[j];
				}
				const pred = this.sigmoid(z);
				const err = pred - yTargets[i];
				for (let j = 0; j < featDim; j++) {
					grad[j] += err * X[i][j];
				}
			}

			// Gradient update with L2 Regularization (do not regularize bias w[0])
			for (let j = 0; j < featDim; j++) {
				const reg = j === 0 ? 0 : w[j] / this.C;
				w[j] -= (lr / nSamples) * (grad[j] + reg);
			}
		}

		this.weights = w;
		this.trained = true;
	}

	setThreshold(t) {
		const val = parseFloat(t);
		if (!isNaN(val) && val >= 0.01 && val <= 0.99) {
			this.threshold = val;
			return true;
		}
		return false;
	}

	setDegree(d) {
		const parsed = parseInt(d, 10);
		if (parsed === 1 || parsed === 2) {
			this.degree = parsed;
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

	uiInstance() {
		const self = this;
		return class LogisticUI extends React.Component {
			constructor(props) {
				super(props);
				this.state = {
					threshold: self.threshold,
					degree: self.degree,
					C: self.C
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

			handleDegreeChange(d) {
				if (self.setDegree(d)) {
					this.setState({ degree: d });
				}
			}

			handleCChange(e) {
				const val = parseFloat(e.target.value);
				if (self.setC(val)) {
					this.setState({ C: e.target.value });
				}
			}

			render() {
				const threshPercent = Math.round(this.state.threshold * 100);
				return (
					<div className="logistic-controls">
						{/* Real-time Decision Threshold Slider */}
						<div className="control-group" style={{ marginBottom: "0.85rem" }}>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
								<label style={{ fontWeight: 600, fontSize: "0.82rem", color: "#1e293b" }}>
									Decision Threshold: <span style={{ color: "#7e22ce", fontWeight: 700 }}>{threshPercent}%</span>
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
							<div style={{ fontSize: "0.73rem", color: "#64748b", marginTop: "0.2rem", lineHeight: 1.35 }}>
								{this.state.threshold < 0.5 ? (
									<span style={{ color: "#b91c1c" }}>
										⚡ <strong>Aggressive Early Warning:</strong> Flags students at lower risk probability (High Sensitivity / Recall, catches struggling students, but triggers more false alarms).
									</span>
								) : this.state.threshold > 0.5 ? (
									<span style={{ color: "#c2410c" }}>
										🎯 <strong>Conservative Alerts:</strong> Only flags students when risk probability is very high (High Specificity, avoids false alarms, but may miss students).
									</span>
								) : (
									<span>Standard 50% balanced decision boundary.</span>
								)}
							</div>
						</div>

						{/* Feature Mode: Linear vs Polynomial */}
						<div className="control-group" style={{ marginBottom: "0.75rem" }}>
							<label style={{ display: "block", fontWeight: 600, fontSize: "0.82rem", color: "#1e293b", marginBottom: "0.3rem" }}>
								Feature Expansion (Geometry):
							</label>
							<div style={{ display: "flex", gap: "0.4rem" }}>
								<button
									type="button"
									className={`btn-toggle-pill ${this.state.degree === 1 ? "active" : ""}`}
									onClick={() => this.handleDegreeChange(1)}
									style={{
										flex: 1,
										padding: "0.35rem 0.6rem",
										fontSize: "0.76rem",
										fontWeight: 600,
										borderRadius: "6px",
										border: "1px solid #cbd5e1",
										background: this.state.degree === 1 ? "#0f172a" : "#ffffff",
										color: this.state.degree === 1 ? "#ffffff" : "#334155",
										cursor: "pointer"
									}}
								>
									Degree 1 (Linear Line)
								</button>
								<button
									type="button"
									className={`btn-toggle-pill ${this.state.degree === 2 ? "active" : ""}`}
									onClick={() => this.handleDegreeChange(2)}
									style={{
										flex: 1,
										padding: "0.35rem 0.6rem",
										fontSize: "0.76rem",
										fontWeight: 600,
										borderRadius: "6px",
										border: "1px solid #cbd5e1",
										background: this.state.degree === 2 ? "#0f172a" : "#ffffff",
										color: this.state.degree === 2 ? "#ffffff" : "#334155",
										cursor: "pointer"
									}}
								>
									Degree 2 (Polynomial Curve)
								</button>
							</div>
							<div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.25rem" }}>
								{this.state.degree === 2
									? "Degree 2 creates quadratic terms (x², y², xy) allowing parabolas, ellipses, and circular pockets!"
									: "Degree 1 creates a classic straight linear boundary fence."}
							</div>
						</div>

						{/* Regularization C */}
						<div className="control-group">
							<label style={{ fontSize: "0.8rem", color: "#334155" }}>
								Regularization (C):{" "}
								<input
									type="text"
									value={this.state.C}
									onChange={(e) => this.handleCChange(e)}
									style={{ width: "50px", marginLeft: "0.3rem" }}
								/>
								<span style={{ fontSize: "0.72rem", color: "#64748b", marginLeft: "0.4rem" }}>
									(Lower C = prevents overfitting)
								</span>
							</label>
						</div>
					</div>
				);
			}
		};
	}

	info() {
		return this.generateInfo({
			name: "Logistic Regression",
			tldr: "Estimating the probability of student risk",
			expl1: (
				<div>
					Draws a smooth boundary that outputs a <b>percentage probability between 0% and 100%</b> instead of just a flat yes or no.
				</div>
			),
			params: [
				"Decision Threshold: The probability cutoff used to send an alert. A 50% cutoff treats false alarms and missed students equally. Setting it lower, such as 30%, catches struggling students earlier at the cost of more check-in emails.",
				"Feature Expansion: Degree 1 fits a straight line. Degree 2 adds quadratic terms, allowing the model to bend into smooth curves, bowls, and circular fences.",
				"Regularization (C): Keeps the model grounded so small noisy samples do not pull the boundary too far in one direction."
			],
			usecase: [
				"Early warning systems where staff need probability percentages rather than hard labels",
				"Situations where administrators need to tune the alert cutoff based on advisor availability",
				"Predicting course completion when higher study time steadily increases success odds",
				"Explaining which student activity has the biggest positive or negative impact on passing"
			],
			expl2: [
				"Ordinary line models can predict values like negative 20% or positive 140%, which makes no sense for probabilities. Logistic regression wraps the calculation in an S-shaped curve so the result stays strictly between 0% and 100%.",
				"In schools, setting the alert cutoff is an educational decision. If guidance counselors only have time to meet 10 students, you raise the threshold to prioritize those with the highest risk. If free automated review materials are available, you lower the threshold so anyone with even a slight risk receives help.",
				"The Receiver Operating Characteristic curve in your dashboard is created by sweeping this exact threshold from 100% down to 0% and charting the balance between true alerts and false alarms."
			],
			pros: [
				"Provides clear probability scores that help educators prioritize intervention lists.",
				"Very fast, reliable, and mathematically stable.",
				"Easy to interpret because each metric receives a clear positive or negative weight."
			],
			cons: [
				"By default it draws a straight line, so it misses complex curved patterns unless polynomial terms are enabled.",
				"Struggles when students who pass form isolated islands surrounded by students who struggle."
			],
			links: [
				["https://en.wikipedia.org/wiki/Logistic_regression", "Wikipedia: Logistic regression"],
				["http://scikit-learn.org/stable/modules/linear_model.html#logistic-regression", "Scikit-Learn Logistic Regression Guide"]
			]
		});
	}
}
