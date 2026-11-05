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

	generateInfo({ name, tldr, expl1, params, usecase, expl2, pros, cons, links }) {
		return (
			<div>
				<h1>{name}</h1>
				<h2>Overview: {tldr}</h2>
				<div style={{ margin: "0.5rem 0 1rem 0", lineHeight: 1.55 }}>{expl1}</div>
				<h2>Parameters</h2>
				{this.liGen(params)}
				<h2>What this model excels at:</h2>
				{this.liGen(usecase)}
				<h2>How it works in plain words:</h2>
				<div className="para">
					{expl2.map((i, j) => (
						<div className="col-xs-12" key={j} style={{ marginBottom: "0.6rem", lineHeight: 1.6 }}>
							{i}
						</div>
					))}
				</div>
				<div className="good col-xs-12 col-md-6">
					<h2>The Good</h2>
					{this.liGen(pros)}
				</div>
				<div className="bad col-xs-12 col-md-6">
					<h2>The Bad</h2>
					{this.liGen(cons)}
				</div>
				<div className="col-xs-12">
					<h2>Learn more:</h2>
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
