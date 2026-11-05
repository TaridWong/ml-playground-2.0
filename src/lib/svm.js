// Pure ES Module Support Vector Machine (SMO Algorithm)
// Modernized from Andrej Karpathy's svmjs for strict ESM / Vite environments.

function makeRbfKernel(sigma) {
	const denom = 2.0 * sigma * sigma;
	return function (v1, v2) {
		let s = 0;
		for (let q = 0; q < v1.length; q++) {
			const diff = v1[q] - v2[q];
			s += diff * diff;
		}
		return Math.exp(-s / denom);
	};
}

function linearKernel(v1, v2) {
	let s = 0;
	for (let q = 0; q < v1.length; q++) {
		s += v1[q] * v2[q];
	}
	return s;
}

function makePolyKernel(degree = 2, coef0 = 1.0) {
	return function (v1, v2) {
		let s = 0;
		for (let q = 0; q < v1.length; q++) {
			s += v1[q] * v2[q];
		}
		return Math.pow(s + coef0, degree);
	};
}

function randi(a, b) {
	return Math.floor(Math.random() * (b - a) + a);
}

function zeros(n) {
	const arr = new Array(n);
	for (let i = 0; i < n; i++) arr[i] = 0;
	return arr;
}

export class SVM {
	constructor() {
		this.data = [];
		this.labels = [];
		this.alpha = [];
		this.b = 0.0;
		this.w = null;
		this.usew_ = false;
		this.kernelType = "linear";
		this.kernel = linearKernel;
		this.N = 0;
		this.D = 0;
	}

	train(data, labels, options = {}) {
		if (!data || data.length === 0 || !labels || labels.length === 0) {
			return { iters: 0 };
		}

		this.data = data;
		this.labels = labels;

		const C = options.C !== undefined ? options.C : 1.0;
		const tol = options.tol !== undefined ? options.tol : 1e-4;
		const alphatol = options.alphatol !== undefined ? options.alphatol : 1e-7;
		const maxiter = options.maxiter !== undefined ? options.maxiter : 10000;
		const numpasses = options.numpasses !== undefined ? options.numpasses : (options.max_passes || 10);

		let kernel = linearKernel;
		this.kernelType = "linear";
		if (options.kernel === "rbf") {
			const rbfSigma = options.rbfsigma || 0.5;
			this.rbfSigma = rbfSigma;
			this.kernelType = "rbf";
			kernel = makeRbfKernel(rbfSigma);
		} else if (options.kernel === "poly") {
			const polyDegree = options.degree || 2;
			this.polyDegree = polyDegree;
			this.kernelType = "poly";
			kernel = makePolyKernel(polyDegree, 1.0);
		} else if (typeof options.kernel === "function") {
			this.kernelType = "custom";
			kernel = options.kernel;
		}

		this.kernel = kernel;
		this.N = data.length;
		this.D = data[0].length;
		const N = this.N;
		this.alpha = zeros(N);
		this.b = 0.0;
		this.usew_ = false;

		// SMO Algorithm
		let iter = 0;
		let passes = 0;
		while (passes < numpasses && iter < maxiter) {
			let alphaChanged = 0;
			for (let i = 0; i < N; i++) {
				const Ei = this.marginOne(data[i]) - labels[i];
				if ((labels[i] * Ei < -tol && this.alpha[i] < C) || (labels[i] * Ei > tol && this.alpha[i] > 0)) {
					let j = i;
					while (j === i) j = randi(0, N);
					const Ej = this.marginOne(data[j]) - labels[j];

					const ai = this.alpha[i];
					const aj = this.alpha[j];
					let L = 0;
					let H = C;
					if (labels[i] === labels[j]) {
						L = Math.max(0, ai + aj - C);
						H = Math.min(C, ai + aj);
					} else {
						L = Math.max(0, aj - ai);
						H = Math.min(C, C + aj - ai);
					}

					if (Math.abs(L - H) < 1e-4) continue;

					const eta = 2 * kernel(data[i], data[j]) - kernel(data[i], data[i]) - kernel(data[j], data[j]);
					if (eta >= 0) continue;

					let newaj = aj - (labels[j] * (Ei - Ej)) / eta;
					if (newaj > H) newaj = H;
					if (newaj < L) newaj = L;
					if (Math.abs(aj - newaj) < 1e-4) continue;

					this.alpha[j] = newaj;
					const newai = ai + labels[i] * labels[j] * (aj - newaj);
					this.alpha[i] = newai;

					const b1 =
						this.b -
						Ei -
						labels[i] * (newai - ai) * kernel(data[i], data[i]) -
						labels[j] * (newaj - aj) * kernel(data[i], data[j]);
					const b2 =
						this.b -
						Ej -
						labels[i] * (newai - ai) * kernel(data[i], data[j]) -
						labels[j] * (newaj - aj) * kernel(data[j], data[j]);

					this.b = 0.5 * (b1 + b2);
					if (newai > 0 && newai < C) this.b = b1;
					if (newaj > 0 && newaj < C) this.b = b2;

					alphaChanged++;
				}
			}

			iter++;
			if (alphaChanged === 0) passes++;
			else passes = 0;
		}

		if (this.kernelType === "linear") {
			this.w = new Array(this.D);
			for (let j = 0; j < this.D; j++) {
				let s = 0.0;
				for (let i = 0; i < this.N; i++) {
					s += this.alpha[i] * labels[i] * data[i][j];
				}
				this.w[j] = s;
			}
			this.usew_ = true;
		} else {
			// Retain only support vectors for evaluation
			const newdata = [];
			const newlabels = [];
			const newalpha = [];
			for (let i = 0; i < this.N; i++) {
				if (this.alpha[i] > alphatol) {
					newdata.push(this.data[i]);
					newlabels.push(this.labels[i]);
					newalpha.push(this.alpha[i]);
				}
			}
			this.data = newdata;
			this.labels = newlabels;
			this.alpha = newalpha;
			this.N = this.data.length;
		}

		return { iters: iter };
	}

	marginOne(inst) {
		let f = this.b;
		if (this.usew_) {
			for (let j = 0; j < this.D; j++) {
				f += inst[j] * this.w[j];
			}
		} else {
			for (let i = 0; i < this.N; i++) {
				f += this.alpha[i] * this.labels[i] * this.kernel(inst, this.data[i]);
			}
		}
		return f;
	}

	predictOne(inst) {
		return this.marginOne(inst) > 0 ? 1 : -1;
	}

	margins(data) {
		const N = data.length;
		const margins = new Array(N);
		for (let i = 0; i < N; i++) {
			margins[i] = this.marginOne(data[i]);
		}
		return margins;
	}

	predict(data) {
		const margs = this.margins(data);
		for (let i = 0; i < margs.length; i++) {
			margs[i] = margs[i] > 0 ? 1 : -1;
		}
		return margs;
	}

	getWeights() {
		return { w: this.w, b: this.b };
	}
}

export default SVM;
