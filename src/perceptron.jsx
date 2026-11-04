import S from "./s";
import React from "react";
import MLModel from "./mlmodel";
import { PerceptronDiagram } from "./components/AlgorithmDiagrams";

export default class Perceptron extends MLModel {
	constructor() {
		super();
		this.w = [0, 0, 0];
		this.maxIters = 20;
	}

	classif(x, y) {
		var result = this.w[0] * x + this.w[1] * y + this.w[2] * 100;
		return this.pr2cl(result);
	}

	score(x, y) {
		var result = this.w[0] * x + this.w[1] * y + this.w[2] * 100;
		// Sigmoid transformation:
		// Result > 0 predicts Class 1 (Teal, On-Track); Result <= 0 predicts Class 2 (Rose, At-Risk)
		// Sigmoid of -result gives continuous probability of Class 2:
		const scaled = result / 100;
		return 1 / (1 + Math.exp(scaled));
	}

	maxIndex(arr) {
		var bestIndex = -1;
		var bestVar = -Infinity;
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] > bestVar) {
				bestVar = arr[i];
				bestIndex = i;
			}
		}
		return bestIndex;
	}

	dist(x1, y1, x2, y2) {
		return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
	}

	train() {
		if (!this.xTr || this.xTr.length === 0) return;
		this.w = [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, 0];
		var allGood = false;
		var iters = this.maxIters;
		while (!allGood && iters > 0) {
			var misClassed = 0;
			for (var i = 0; i < this.xTr.length; i++) {
				var pred = this.classif(this.xTr[i][0], this.xTr[i][1]);
				if (this.yTr[i] != pred) {
					misClassed += 1;
					let y = this.cl2pr(this.yTr[i]);
					this.w[0] += y * this.xTr[i][0];
					this.w[1] += y * this.xTr[i][1];
					this.w[2] += y * 100;
				}
			}
			if (misClassed === 0) allGood = true;
			iters--;
		}
	}

	setMaxIters(iters) {
		const parsed = parseInt(iters, 10);
		if (!isNaN(parsed) && parsed > 0 && parsed <= 500) {
			this.maxIters = parsed;
			return true;
		}
		return false;
	}

	uiInstance() {
		var self = this;
		return class PerceptronUI extends React.Component {
			constructor(props) {
				super(props);
				this.state = {
					maxIters: self.maxIters
				};
				this.onChange = this.onChange.bind(this);
			}

			onChange(e) {
				if (self.setMaxIters(e.target.value)) {
					this.setState({
						maxIters: e.target.value
					});
				}
			}

			render() {
				return (
					<div>
						Max Iters:{" "}
						<input
							type="text"
							value={this.state.maxIters}
							onChange={this.onChange}
							style={{ width: "50px" }}
						/>
						<span style={{ fontSize: "0.74rem", color: "#64748b", marginLeft: "0.4rem" }}>
							(Maximum update steps on misclassified points)
						</span>
					</div>
				);
			}
		};
	}

	info() {
		return this.generateInfo({
			name: "Perceptron",
			tldr: "Finding a straight dividing line between two groups",
			expl1: (
				<div>
					Draws a single straight fence across the canvas by nudging the line every time it makes a mistake.
				</div>
			),
			params: ["Max Iterations: The maximum number of update steps allowed to adjust the dividing line."],
			usecase: [
				"Simple screening problems where one clean cutoff separates successful and struggling students",
				"Classroom demonstrations showing how basic artificial intelligence adjusts weights step by step",
				"Situations where two clear factors add up directly toward a passing score"
			],
			expl2: [
				"Invented in 1957, it assigns weights to each axis, adds them together, and checks whether the total crosses zero.",
				<PerceptronDiagram key="percep_diag" />,
				"In two dimensions, this boundary is always a single straight line.",
				"If groups can be separated by a straight ruler, it finds a boundary. If groups overlap, curve, or form separate islands, a single straight line cannot divide them."
			],
			pros: [
				"Extremely fast and lightweight to compute.",
				"Easy to understand as a basic weighted scoring system."
			],
			cons: [
				"Only works when groups can be divided by a straight line.",
				"Stops at the first line it finds rather than searching for the safest gap between groups."
			],
			links: [
				["https://en.wikipedia.org/wiki/Perceptron", "Wikipedia Perceptron"],
				["http://scikit-learn.org/stable/modules/generated/sklearn.linear_model.Perceptron.html", "Scikit-Learn Perceptron"]
			]
		});
	}
}
