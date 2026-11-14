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
			overview: (
				<p>
					The Perceptron (Rosenblatt, 1957) is an online binary linear classifier that separates points with a hyperplane updated sequentially on misclassified training examples.
				</p>
			),
			steps: [
				"Start with random weights for X and Y and a zero baseline offset.",
				"Multiply X and Y by those weights and add the offset: points on the positive side are predicted On-Track and points on the negative side are predicted At-Risk.",
				"Check each training point one at a time. Whenever a point falls on the wrong side of the line, shift the weights to move the line toward fixing that error.",
				"Repeat full passes over the points until every point is on the right side or the Max Iters pass limit is reached."
			],
			mathNote: (
				<p>
					When a straight line can separate the two groups without errors, the Perceptron is guaranteed to finish in a finite number of steps. When the two groups overlap, the line keeps shifting until Max Iters stops training.
				</p>
			),
			diagram: <PerceptronDiagram key="percep_diag" />,
			params: [
				"Max Iters: Default 20 (accepted range 1 to 500). Caps the maximum passes through the dataset when classes cannot be linearly separated."
			],
			pros: [
				"Minimal memory footprint (three scalar parameters) and fast per-epoch runtime.",
				"Demonstrates error-driven linear weight updates directly."
			],
			cons: [
				"Restricted strictly to straight decision boundaries; non-linear pockets or L-shaped rules cannot be separated.",
				"Terminates at the first separating line found rather than optimizing a maximum margin.",
				"Updates may fail to stabilize when points overlap across the boundary."
			],
			applied: [
				"Introductory screening models where two cumulative indicators (such as attendance and homework completion) separate On-Track from At-Risk students.",
				"Classroom baseline for illustrating why linear models break down on gaming-the-system or orthogonal mastery patterns."
			],
			links: [
				["https://en.wikipedia.org/wiki/Perceptron", "Wikipedia Perceptron"],
				["http://scikit-learn.org/stable/modules/generated/sklearn.linear_model.Perceptron.html", "Scikit-Learn Perceptron"]
			]
		});
	}
}
