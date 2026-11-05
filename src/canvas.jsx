import S from "./s";

let WIDTH = S.canvasW;
let HEIGHT = S.canvasH;
let PSIZE = S.ptSize;
let BGRESO = S.bgReso;
let H_INTERV = HEIGHT / BGRESO;
let W_INTERV = WIDTH / BGRESO;

export default class Canvas {
	constructor(canvas) {
		this.canvasElem = canvas;
		this.ctx = canvas.getContext("2d");
		this.ctx.imageSmoothingEnabled = false;
		this.rect = canvas.getBoundingClientRect();
		this.brush = S.class1;
		this.bgInput = [];
		for (var i = - W_INTERV * BGRESO / 2; i <= W_INTERV * BGRESO / 2; i += BGRESO) {
			for (var ii = - H_INTERV * BGRESO / 2; ii <= H_INTERV * BGRESO / 2; ii += BGRESO) {
				this.bgInput.push([i, ii]);
			}
		}
		this.viewMode = "boundary"; // "boundary" | "confidence"
		this.lastPixelData = null;
		this.batchEvalPixels = this.batchEvalPixels.bind(this);
		this.batchDrawPixels = this.batchDrawPixels.bind(this);
		this.drawStoreTr = this.drawStoreTr.bind(this);
	}

	setViewMode(mode) {
		this.viewMode = mode;
		if (this.lastPixelData) {
			this.clearCtx();
			this.batchDrawPixels(this.lastPixelData).then(this.drawStoreTr);
		}
	}

	getMousePos(evt) {
		this.rect = this.canvasElem.getBoundingClientRect();
		var clientX = evt.clientX;
		var clientY = evt.clientY;
		if (clientX === undefined && evt.touches && evt.touches[0]) {
			clientX = evt.touches[0].clientX;
			clientY = evt.touches[0].clientY;
		}
		var left = (clientX - this.rect.left) / this.canvasElem.scrollWidth * WIDTH;
		var top = (clientY - this.rect.top) / this.canvasElem.scrollHeight * HEIGHT;
		return [
			left - WIDTH / 2, 
			-(top - HEIGHT / 2)
		];
	}

	clearCtx() {
		this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
	}

	setBrush(brush) {
		this.brush = brush;
	}

	linkToStore(store) {
		this.store = store;
	}

	clearAll() {
		this.store.clearAll();
		this.clearCtx();
		this.drawStoreTr();
	}

	onPointAdded(evt) {
		let xTr = this.getMousePos(evt);
		if (this.brush === S.eraser) {
			this.store.erase(xTr);
		} else {
			let yTr = this.brush;
			this.store.addPoint(xTr, yTr);
		}
		this.clearCtx();
		this.drawStoreTr();
	}

	getConfidenceColor(score) {
		const p = Math.max(0, Math.min(1, score));
		if (p >= 0.5) {
			// Class 2: At-Risk (Warm Rose #E11D48 -> rgb(225, 29, 72))
			// At p = 0.5 (boundary): Neutral white rgb(255, 255, 255)
			// At p = 1.0 (certain): Rich rose rgb(225, 29, 72)
			const t = (p - 0.5) * 2; // 0 (boundary) -> 1 (certain)
			const r = Math.round(255 - t * (255 - 225));
			const g = Math.round(255 - t * (255 - 29));
			const b = Math.round(255 - t * (255 - 72));
			return `rgb(${r}, ${g}, ${b})`;
		} else {
			// Class 1: On-Track (Deep Teal #0D9488 -> rgb(13, 148, 136))
			// At p = 0.5 (boundary): Neutral white rgb(255, 255, 255)
			// At p = 0.0 (certain): Rich teal rgb(13, 148, 136)
			const t = (0.5 - p) * 2; // 0 (boundary) -> 1 (certain)
			const r = Math.round(255 - t * (255 - 13));
			const g = Math.round(255 - t * (255 - 148));
			const b = Math.round(255 - t * (255 - 136));
			return `rgb(${r}, ${g}, ${b})`;
		}
	}

	// synchronous drawing functions
	drawPixel(x, y, cl, score = null) {
		if (this.viewMode === "confidence" && score !== null && typeof score === "number") {
			this.ctx.fillStyle = this.getConfidenceColor(score);
		} else {
			this.ctx.fillStyle = S.bgColors[cl] || "#FFFFFF";
		}
		this.ctx.fillRect(
			x + WIDTH / 2, 
			- y + HEIGHT / 2, 
			BGRESO, 
			BGRESO
		);
	}

	drawPoint(x, y, cl) {
		const px = x - PSIZE / 2 + WIDTH / 2;
		const py = - y - PSIZE / 2 + HEIGHT / 2;
		this.ctx.fillStyle = S.colors[cl] || "#000000";
		this.ctx.fillRect(px, py, PSIZE, PSIZE);
	}

	drawStoreTr() {
		let xTr = this.store.xTr;
		let yTr = this.store.yTr;
		for (var i = 0; i < xTr.length; i++) {
			this.drawPoint(xTr[i][0], xTr[i][1], yTr[i]);
		}
	}

	batchEvalPixels(batchClassif) {
		return new Promise((ok) => {
			batchClassif(this.bgInput).then(ok);
		});
	}

	batchDrawPixels(input) {
		this.lastPixelData = input;
		var xTr = input[0];
		var yTr = input[1];
		var scoresTr = input[2];
		return new Promise((ok) => {
			for (var i = 0; i < xTr.length; i++) {
				this.drawPixel(xTr[i][0], xTr[i][1], yTr[i], scoresTr ? scoresTr[i] : null);
			}
			ok();
		});
	}

	trainAndClassif() {
		this.clearCtx();
		return this.store.batchTrainAndClassif()
			.then(this.batchEvalPixels)
			.then(this.batchDrawPixels)
			.then(this.drawStoreTr);
	}

	reclassifyAndDraw() {
		if (!this.store || !this.store.classif) return Promise.resolve();
		this.clearCtx();
		return this.batchEvalPixels(this.store.classif.getClassif())
			.then(this.batchDrawPixels)
			.then(this.drawStoreTr);
	}
}
