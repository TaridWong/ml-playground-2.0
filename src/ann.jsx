import S from "./s";
import React from "react";
import * as m from "mathjs";
import MLModel from "./mlmodel";
import { ANNDiagram } from "./components/AlgorithmDiagrams";

const norm = 100;
const MAX_PER_LAYER = 10;
const MAX_LAYERS = 8;

export default class Ann extends MLModel {
	constructor() {
		super();
		this.layers = [2, 4, 3, 1];
		this.shuffleWeights();
		this.classif = this.classif.bind(this);
		this.score = this.score.bind(this);
		this.alpha = 0.05;
		this.maxEpochs = 200;
		this.maxError = 0.02;
	}

	shuffleWeights() {
		this.A = [];
		this.b = [];
		for (var i = 0; i < this.layers.length - 1; i++) {
			this.A[i] = m.matrix(m.random([this.layers[i + 1], this.layers[i]], -0.5, 0.5));
			this.b[i] = m.matrix(m.random([1, this.layers[i + 1]], -0.2, 0.2).valueOf()[0]);
		}
	}

	relu(input) {
		if (m.isMatrix(input)) {
			return m.map(input, (x) => Math.max(0, x));
		}
		return Math.max(0, input);
	}

	tanh(input) {
		if (m.isMatrix(input)) {
			return m.map(input, (x) => Math.tanh(x));
		}
		if (Array.isArray(input)) {
			return input.map((x) => Math.tanh(x));
		}
		return Math.tanh(input);
	}

	square(input) {
		if (m.isMatrix(input)) {
			return m.map(input, (x) => x * x);
		}
		if (Array.isArray(input)) {
			return input.map((x) => x * x);
		}
		return input * input;
	}

	classif(x, y) {
		var z = [
			[x / norm, y / norm]
		];
		var ax = [];
		for (var i = 0; i < this.layers.length - 1; i++) {
			ax[i] = m.add(m.multiply(this.A[i], z[i]), this.b[i]);
			z[i + 1] = this.tanh(ax[i]);
		}
		let out = z[this.layers.length - 1];
		if (out && typeof out.valueOf === "function") out = out.valueOf();
		if (Array.isArray(out)) out = out[0];
		return this.pr2cl(out);
	}

	score(x, y) {
		var z = [
			[x / norm, y / norm]
		];
		var ax = [];
		for (var i = 0; i < this.layers.length - 1; i++) {
			ax[i] = m.add(m.multiply(this.A[i], z[i]), this.b[i]);
			z[i + 1] = this.tanh(ax[i]);
		}
		let out = z[this.layers.length - 1];
		if (out && typeof out.valueOf === "function") out = out.valueOf();
		if (Array.isArray(out)) out = out[0];
		// Map tanh output [-1, 1] to probability of Class 2 [0, 1]
		return Math.max(0, Math.min(1, (-out + 1) / 2));
	}

	vvMult(v1, v2) {
		v1 = m.transpose(m.matrix([v1]));
		v2 = m.matrix([v2]);
		var ret = m.multiply(v1, v2);
		if (typeof ret === "number")
			return m.matrix([[ret]]);
		if (ret.size().length === 1)
			return m.matrix([ret]);
		return ret;
	}

	shuffle(a, b) {
		for (let i = a.length; i; i--) {
			let j = Math.floor(Math.random() * i);
			[a[i - 1], a[j]] = [a[j], a[i - 1]];
			[b[i - 1], b[j]] = [b[j], b[i - 1]];
		}
	}

	train() {
		this.shuffleWeights();
		var self = this;
		var yTr = this.yTr.map((c) => self.cl2pr(c));
		var xTr = this.xTr.map((pt) => [pt[0] / norm, pt[1] / norm]);

		for (var i = 0; i < this.maxEpochs; i++) {
			let err = 0;
			this.shuffle(xTr, yTr);
			var _A = m.clone(this.A);
			var _b = m.clone(this.b);
			for (var ii = 0; ii < xTr.length; ii++) {
				var z = [[xTr[ii][0], xTr[ii][1]]];
				var ax = [];

				for (var j = 0; j < this.layers.length - 1; j++) {
					ax[j] = m.squeeze(m.add(m.squeeze(m.multiply(this.A[j], z[j])), this.b[j]));
					z[j + 1] = this.tanh(ax[j]);
				}

				var delta = [];
				var lmax = this.layers.length;
				var outVal = z[lmax - 1];
				if (outVal && typeof outVal.valueOf === "function") outVal = outVal.valueOf();
				if (Array.isArray(outVal)) outVal = outVal[0];
				var diff = outVal - yTr[ii];

				delta[lmax - 2] = m.multiply(diff, m.subtract(1, this.square(z[lmax - 1])));
				err += Math.abs(diff);

				for (var l = lmax - 2; l >= 0; l--) {
					_A[l] = m.subtract(_A[l], m.chain(this.alpha).multiply(this.vvMult(delta[l], z[l])).done());
					_b[l] = m.subtract(_b[l], m.squeeze(m.multiply(this.alpha, delta[l])));
					if (l !== 0) {
						var der = m.subtract(1, this.square(z[l]));
						var tpDelt = m.squeeze(m.multiply(m.transpose(this.A[l]), delta[l]));
						var d = m.dotMultiply(der, tpDelt);
						delta[l - 1] = d;
					}
				}
			}
			this.A = _A;
			this.b = _b;
			err /= xTr.length || 1;
			if (err < this.maxError) {
				break;
			}
		}
	}

	addNeuron(layer) {
		if (layer && layer > 0 && layer < this.layers.length - 1 && this.layers[layer] < MAX_PER_LAYER) {
			this.layers[layer] += 1;
		}
		return this.layers;
	}

	removeNeuron(layer) {
		if (layer && layer > 0 && layer < this.layers.length - 1 && this.layers[layer] > 1) {
			this.layers[layer] -= 1;
		}
		return this.layers;
	}

	addLayer() {
		if (this.layers.length < MAX_LAYERS) {
			this.layers.splice(this.layers.length - 1, 0, 2);
			this.shuffleWeights();
		}
		return this.layers;
	}

	removeLayer() {
		if (this.layers.length > 3) {
			this.layers.splice(this.layers.length - 2, 1);
			this.shuffleWeights();
		}
		return this.layers;
	}

	setAlpha(a) {
		var _a = parseFloat(a);
		if (isNaN(_a) && a !== "") return false;
		if (a !== "") this.alpha = _a;
		return this.alpha;
	}

	setEpochs(e) {
		var _e = parseInt(e, 10);
		if (isNaN(_e) && e !== "") return false;
		if (e !== "") this.maxEpochs = _e;
		return this.maxEpochs;
	}

	setError(e) {
		var _e = parseFloat(e);
		if (isNaN(_e) && e !== "") return false;
		if (e !== "") this.maxError = _e;
		return this.maxError;
	}

	uiInstance() {
		var self = this;
		return class AnnUI extends React.Component {
			constructor(props) {
				super(props);
				this.state = {
					alpha: self.alpha,
					maxEpochs: self.maxEpochs,
					maxError: self.maxError,
					layers: self.layers
				};
			}

			dispatch(type, n) {
				switch (type) {
					case "n+":
						this.setState({ layers: self.addNeuron(n) });
						break;
					case "n-":
						this.setState({ layers: self.removeNeuron(n) });
						break;
					case "l+":
						this.setState({ layers: self.addLayer() });
						break;
					case "l-":
						this.setState({ layers: self.removeLayer() });
						break;
					case "a":
						this.setState({ alpha: self.setAlpha(n) });
						break;
					case "epoch":
						this.setState({ maxEpochs: self.setEpochs(n) });
						break;
					case "error":
						this.setState({ maxError: self.setError(n) });
						break;
					default:
						break;
				}
			}

			createDispatch(type, n) {
				return () => {
					this.dispatch(type, n);
				};
			}

			render() {
				var layers = [];
				// first input layer
				layers.push(
					<div key={0} className="layer">
						<button title="Input Feature X">X</button>
						<button title="Input Feature Y">Y</button>
					</div>
				);
				// middle hidden layers
				for (var i = 1; i < self.layers.length - 1; i++) {
					var layer = [];
					var l = i;
					for (var ii = 0; ii < self.layers[i]; ii++) {
						layer.push(
							<button
								key={ii}
								onClick={this.createDispatch("n-", l)}
								title="Click neuron to remove"
							>
								•
							</button>
						);
					}
					layer.push(
						<button
							key="add"
							className="flipped"
							onClick={this.createDispatch("n+", l)}
							title="Add neuron to layer"
						>
							+
						</button>
					);
					layers.push(
						<div key={i} className="layer">
							{layer}
						</div>
					);
				}
				// last output layer
				layers.push(
					<div key={self.layers.length - 1} className="layer">
						<button title="Output Prediction">Out</button>
					</div>
				);
				layers.push(
					<div key={self.layers.length} className="layer">
						<span style={{ fontSize: "0.68rem" }}>Layers</span>
						<button className="flipped" onClick={this.createDispatch("l+")} title="Add hidden layer">+</button>
						<button className="flipped" onClick={this.createDispatch("l-")} title="Remove hidden layer">-</button>
					</div>
				);

				return (
					<div>
						<div style={{ marginBottom: "0.4rem" }}>
							Learning rate:{" "}
							<input
								type="text"
								value={this.state.alpha}
								onChange={(e) => this.dispatch("a", e.target.value)}
							/>
							Epochs:{" "}
							<input
								type="text"
								value={this.state.maxEpochs}
								onChange={(e) => this.dispatch("epoch", e.target.value)}
							/>
						</div>
						<div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "0.3rem" }}>
							Architecture (click + / - to add/remove neurons & layers):
						</div>
						<div id="ANN-panel">{layers}</div>
					</div>
				);
			}
		};
	}

	info() {
		return this.generateInfo({
			name: "Artificial Neural Network (ANN)",
			tldr: "Connecting layers of artificial neurons to learn complex shapes",
			expl1: "Connects multiple processing units in layers, passing signals forward and adjusting connection strengths through practice.",
			params: [
				"Learning Rate: The step size used to adjust connection weights when a mistake occurs. Larger steps learn quickly but may overshoot, while smaller steps take more practice cycles.",
				"Epochs: How many complete passes the network takes through the student training data.",
				"Hidden Layers and Neurons: The structure of internal processing nodes. Adding layers and neurons allows the network to learn more intricate shapes."
			],
			usecase: [
				"Complex non-linear patterns like concentric circles, interlocking curves, and multiple separate groups",
				"Large educational systems collecting rich, continuous data like moment by moment tutor interactions",
				"Problems where simple straight lines and rule boxes are too rigid to capture learner behaviors"
			],
			expl2: [
				"Stacks layers of artificial neurons where each unit combines inputs and passes the result through a smooth mathematical curve.",
				<ANNDiagram key="ann_diag" />,
				"When the network makes an incorrect prediction, error signals travel backward through the layers to nudge each connection weight in the right direction.",
				"Because it transforms data through multiple layers, it can bend around complex shapes. In education, it acts as a black box because teachers cannot easily trace a prediction back to a single human rule."
			],
			pros: [
				"Can bend and reshape boundaries to fit almost any complicated pattern.",
				"Capable of learning subtle combinations of features without manual rule creation."
			],
			cons: [
				"Functions as a black box where individual student decisions cannot easily be explained to families.",
				"Needs more practice iterations and careful adjustment to avoid learning noise."
			],
			links: [
				["https://en.wikipedia.org/wiki/Artificial_neural_network", "Wikipedia Artificial Neural Network"],
				["http://scikit-learn.org/stable/modules/neural_networks_supervised.html", "Scikit-Learn Neural Networks"]
			]
		});
	}
}
