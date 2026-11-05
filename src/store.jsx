export default class Store {
	constructor() {
		this.xTr = [];
		this.yTr = [];
	}

	addPoint(xTr, yTr) {
		this.xTr.push(xTr);
		this.yTr.push(yTr);
		this.dispatchToClassif();
	}

	erase(xTr) {
		let bestInd = -1;
		let bestDist = Infinity;
		this.xTr.forEach((x, i) => {
			let dist = this.dist(xTr, x);
			if (dist < bestDist) {
				bestInd = i;
				bestDist = dist;
			}
		});
		if (bestInd > -1) {
			this.xTr.splice(bestInd, 1);
			this.yTr.splice(bestInd, 1);
			this.dispatchToClassif();
		}
	}

	clearAll() {
		this.xTr = [];
		this.yTr = [];
		this.dispatchToClassif();
	}

	loadPresetPoints(pointsList) {
		this.xTr = [];
		this.yTr = [];

		pointsList.forEach((pt) => {
			this.xTr.push(pt.x);
			this.yTr.push(pt.y);
		});

		this.dispatchToClassif();
	}

	dispatchToClassif() {
		if (!this.classif) return;
		this.classif.setTraining(this.xTr, this.yTr);
	}

	dist(X, Y) {
		const d1 = X[0] - Y[0];
		const d2 = X[1] - Y[1];
		return Math.sqrt(d1 * d1 + d2 * d2);
	}

	linkClassif(classif) {
		this.classif = classif;
		this.dispatchToClassif();
	}

	batchTrainAndClassif() {
		return new Promise((ok) => {
			this.dispatchToClassif();
			this.classif.train();
			ok(this.classif.getClassif());
		});
	}

	/**
	 * Evaluates current model performance across all plotted points
	 */
	evaluateCohort() {
		if (!this.classif || this.xTr.length === 0) return null;

		const actual = [];
		const predicted = [];
		const scores = [];

		for (let i = 0; i < this.xTr.length; i++) {
			const x = this.xTr[i][0];
			const y = this.xTr[i][1];
			const act = this.yTr[i];
			const pred = this.classif.classif(x, y);

			actual.push(act);
			predicted.push(pred);

			if (typeof this.classif.score === "function") {
				scores.push(this.classif.score(x, y));
			} else {
				scores.push(pred === 2 ? 1 : 0);
			}
		}

		return { actual, predicted, scores };
	}

	exportJSONString() {
		return JSON.stringify([this.xTr, this.yTr]);
	}

	importJSONString(str) {
		let obj = JSON.parse(str);
		this.xTr = obj[0] || [];
		this.yTr = obj[1] || [];
		this.dispatchToClassif();
	}
}
