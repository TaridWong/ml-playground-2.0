import React from "react";
import S from "./s";

import Knn from "./knn";
import LogisticRegression from "./logistic";
import GaussianNaiveBayes from "./naivebayes";
import Perceptron from "./perceptron";
import SupportVectorMachine from "./svm";
import Tree from "./tree";
import RandomForest from "./randomforest";
import XGBoost from "./xgboost";
import CBA from "./cba";
import Ann from "./ann";

const modelList = [
	new Knn(),
	new LogisticRegression(),
	new GaussianNaiveBayes(),
	new Perceptron(),
	new SupportVectorMachine(),
	new Tree(),
	new RandomForest(),
	new XGBoost(),
	new CBA(),
	new Ann()
];

const modelUiList = modelList.map((model) => model.uiInstance());

export default class UI extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			brushSelected: S.class1,
			modelSelected: S.model[0],
			modelUi: modelUiList[0]
		};
		this.handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {
		this.changeModel(this.state.modelSelected);
	}

	componentDidUpdate(prevProps) {
		if (this.props.selectedModel && this.props.selectedModel !== prevProps.selectedModel && this.props.selectedModel !== this.state.modelSelected) {
			this.changeModel(this.props.selectedModel);
		}
	}

	handleChange(e) {
		const val = parseInt(e.target.value, 10);
		this.setState({ brushSelected: val });
		this.props.setClass(val);
	}

	changeModel(target) {
		const i = S.model.indexOf(target);
		if (i < 0) throw new Error("Invalid model: " + target);
		this.setState({
			modelSelected: target,
			modelUi: modelUiList[i]
		});
		this.props.store.linkClassif(modelList[i]);
		this.props.renderInfo(modelList[i].info());
		if (this.props.onModelChange) {
			this.props.onModelChange(target, modelList[i]);
		}
	}

	train() {
		this.props.train();
	}

	clearAll() {
		this.props.clearAll();
	}

	exportData() {
		const json = this.props.store.exportJSONString();
		const blob = new Blob([json], { type: "application/json;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = "edm_dataset.json";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}

	handleFileUpload(e) {
		const file = e.target.files && e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				this.props.store.importJSONString(event.target.result);
				this.props.repaint();
			} catch (err) {
				alert("Invalid dataset format. Please use a valid JSON file exported from this playground.");
			}
		};
		reader.readAsText(file);
		e.target.value = ""; // Reset file input
	}

	render() {
		const ModelUiComponent = this.state.modelUi;
		const isTraining = this.props.isTraining;

		const modelDefs = [
			{ id: "knn", name: "K Nearest Neighbors", icon: "./img/knn.svg" },
			{ id: "logistic", name: "Logistic Regression", icon: "./img/logistic.svg" },
			{ id: "naivebayes", name: "Gaussian Naive Bayes", icon: "./img/naivebayes.svg" },
			{ id: "perceptron", name: "Perceptron", icon: "./img/perceptron.svg" },
			{ id: "svm", name: "Support Vector Machine", icon: "./img/linear.svg" },
			{ id: "tree", name: "Decision Tree", icon: "./img/tree.svg" },
			{ id: "randomforest", name: "Random Forest", icon: "./img/randomforest.svg" },
			{ id: "xgboost", name: "XGBoost", icon: "./img/xgboost.svg" },
			{ id: "cba", name: "Association Rules (CBA)", icon: "./img/cba.svg" },
			{ id: "ann", name: "Neural Network (ANN)", icon: "./img/ann.svg" }
		];

		return (
			<div>
				<div id="io">
					<label className="btn-io" title="Load custom JSON dataset">
						Upload Data
						<input
							type="file"
							accept=".json"
							style={{ display: "none" }}
							onChange={(e) => this.handleFileUpload(e)}
						/>
					</label>
					<button type="button" className="btn-io" onClick={() => this.exportData()} title="Save current points to JSON">
						Save Data
					</button>
					<button
						type="button"
						className="btn-io"
						onClick={() => this.props.onShareLink && this.props.onShareLink()}
						title="Copy a shareable deep link to this exact cohort, model, and view"
					>
						{this.props.shareCopied ? "✓ Link Copied" : "Share Link"}
					</button>
					<button
						type="button"
						className="btn-io"
						onClick={() => this.props.onOpenAuditReport && this.props.onOpenAuditReport()}
						title="Open 1-page Educator Algorithmic Audit and Counterfactual Intervention Report"
					>
						Audit Report
					</button>
					<button
						type="button"
						className="btn-io"
						onClick={() => this.props.onStartTour && this.props.onStartTour()}
						title="Launch a quick 4-step interactive tour of ML Playground 2.0"
					>
						Quick Tour
					</button>
				</div>

				<div id="brushes">
					<span className="brush-label">Brush:</span>
					{[
						{ id: S.class1, title: "Class 1: Teal (On-Track / Pass)" },
						{ id: S.class2, title: "Class 2: Rose (At-Risk / Intervention)" },
						{ id: S.eraser, title: "Eraser: Click dot on canvas to remove" }
					].map((item) => (
						<div key={item.id} title={item.title}>
							<input
								id={"br-" + item.id}
								value={item.id}
								type="radio"
								name="brush-radio"
								checked={this.state.brushSelected === item.id}
								onChange={this.handleChange}
							/>
							<label htmlFor={"br-" + item.id}></label>
						</div>
					))}
					<button onClick={() => this.clearAll()} id="clearAll" title="Clear all points">
						Clear all
					</button>
				</div>

				<div id="model-selector">
					{modelDefs.map((m) => (
						<div
							key={m.id}
							className={`model-card ${this.state.modelSelected === m.id ? "active" : ""}`}
							onClick={() => this.changeModel(m.id)}
							title={`Switch to ${m.name}`}
						>
							<img src={m.icon} alt={m.name} />
							<h4>{m.name}</h4>
						</div>
					))}
				</div>

				<div id="parameters">
					<h3>Parameters</h3>
					<div className="parameters-body">
						{ModelUiComponent && <ModelUiComponent reclassify={this.props.reclassify} />}
					</div>
				</div>

				<div className="action-button-group">
					<button
						id="trainAndDisplay"
						className={isTraining ? "training" : ""}
						disabled={isTraining}
						onClick={() => this.train()}
					>
						{isTraining ? "Training..." : "Train Model"}
					</button>
					<button
						type="button"
						id="btnCompareModels"
						className="btn-compare-models"
						onClick={() => this.props.openComparison && this.props.openComparison()}
						title="Evaluate all 8 classification paradigms on this student cohort simultaneously"
					>
						Compare All Models
					</button>
				</div>
			</div>
		);
	}
}
