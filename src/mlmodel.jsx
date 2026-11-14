import S from "./s";
import React from "react";

export default class MLModel {
	constructor() {
		this.xTr = [];
		this.yTr = [];
		this.isRegression = false;
	}

	setTraining(xTr, yTr) {
		this.xTr = xTr;
		this.yTr = yTr;
	}

	batchClassif(input) {
		return new Promise((ok) => {
			const output = input.map((i) => {
				return this.classif(i[0], i[1]);
			});
			const scores = input.map((i) => {
				return typeof this.score === "function" ? this.score(i[0], i[1]) : (this.classif(i[0], i[1]) === S.class2 ? 1 : 0);
			});
			ok([input, output, scores]);
		});
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

	classif(x, y) {
		return;
	}

	score(x, y) {
		// Continuous prediction score or probability of Class 2 (0.0 to 1.0)
		return this.classif(x, y) === S.class2 ? 1 : 0;
	}

	train() {
		return;
	}

	getClassif() {
		return this.batchClassif.bind(this);
	}

	uiInstance() {
		return <div>No options yet.</div>;
	}

	info() {
		return <div>No info yet.</div>;
	}

	pr2cl(pr) {
		if (pr > 0) return S.class1;
		return S.class2;
	}

	cl2pr(cl) {
		if (cl == S.class1) return 1;
		return -1;
	}

	generateInfo({
		name,
		overview,
		steps = [],
		mathNote = null,
		diagram = null,
		params = [],
		pros = [],
		cons = [],
		applied = [],
		links = []
	}) {
		return (
			<div className="info-prose">
				<h1>{name}</h1>
				{overview && <div className="info-lead">{overview}</div>}

				<div className="info-block">
					<h2>Algorithm Mechanics</h2>
					{steps.length > 0 && (
						<ol className="info-steps">
							{steps.map((step, j) => (
								<li key={j}>{step}</li>
							))}
						</ol>
					)}
					{mathNote && <div className="info-math-note">{mathNote}</div>}
					{diagram && <div className="info-diagram">{diagram}</div>}
				</div>

				<div className="info-block">
					<h2>Parameters</h2>
					{this.liGen(params)}
				</div>

				<div className="info-block info-columns">
					<div className="info-col">
						<h2>Strengths</h2>
						{this.liGen(pros)}
					</div>
					<div className="info-col">
						<h2>Limitations</h2>
						{this.liGen(cons)}
					</div>
				</div>

				{applied.length > 0 && (
					<div className="info-block">
						<h2>Applied Educational Data Mining Context</h2>
						{this.liGen(applied)}
					</div>
				)}

				<div className="info-block">
					<h2>References</h2>
					{this.linkGen(links)}
				</div>
			</div>
		);
	}

	liGen(arr) {
		return (
			<ul>
				{arr.map((i, j) => (
					<li key={j}>{i}</li>
				))}
			</ul>
		);
	}

	linkGen(arr) {
		return (
			<ul>
				{arr.map((i, j) => (
					<li key={j}>
						<a target="_blank" rel="noreferrer" href={i[0]}>
							{i[1]}
						</a>
					</li>
				))}
			</ul>
		);
	}
}
