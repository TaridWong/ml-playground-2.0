import React, { useMemo } from "react";
import KNN from "../knn";
import Logistic from "../logistic";
import NaiveBayes from "../naivebayes";
import Perceptron from "../perceptron";
import SVM from "../svm";
import Tree from "../tree";
import RandomForest from "../randomforest";
import XGBoost from "../xgboost";
import CBA from "../cba";
import Ann from "../ann";
import { calculateMetrics } from "../metrics";

export default function ModelComparisonModal({ isOpen, onClose, store, onSelectModel, activePreset }) {
	if (!isOpen) return null;

	const xTr = store ? store.xTr || [] : [];
	const yTr = store ? store.yTr || [] : [];

	// Evaluate all 10 models simultaneously in memory
	const benchmarkResults = useMemo(() => {
		if (xTr.length < 2 || yTr.length < 2) return null;

		const hasBothClasses = yTr.includes(1) && yTr.includes(2);
		if (!hasBothClasses) return null;

		const modelSpecs = [
			{
				id: "tree",
				name: "Decision Tree",
				paradigm: "Rule Cuts",
				pedagogicalStrength: "Partitions space with axis-aligned threshold cuts (L-shaped rules)",
				create: () => new Tree()
			},
			{
				id: "randomforest",
				name: "Random Forest",
				paradigm: "Bagging Ensemble",
				pedagogicalStrength: "Ensemble voting smooths boundaries and reduces variance",
				create: () => {
					const rf = new RandomForest();
					rf.numTrees = 15;
					return rf;
				}
			},
			{
				id: "logistic",
				name: "Logistic Regression",
				paradigm: "Linear Probabilistic",
				pedagogicalStrength: "Continuous probability estimates with an adjustable alert threshold",
				create: () => new Logistic()
			},
			{
				id: "knn",
				name: "K-Nearest Neighbors",
				paradigm: "Instance-Based",
				pedagogicalStrength: "Captures local non-linear clusters; sensitive to noisy points",
				create: () => new KNN()
			},
			{
				id: "svm",
				name: "Support Vector Machine",
				paradigm: "Maximum Margin",
				pedagogicalStrength: "Finds the maximum-margin boundary between student groups",
				create: () => new SVM()
			},
			{
				id: "naivebayes",
				name: "Gaussian Naive Bayes",
				paradigm: "Bayesian Prior",
				pedagogicalStrength: "Fast generative baseline incorporating class prior base rates",
				create: () => new NaiveBayes()
			},
			{
				id: "perceptron",
				name: "Perceptron",
				paradigm: "Linear Hyperplane",
				pedagogicalStrength: "Single linear threshold boundary; fast baseline",
				create: () => new Perceptron()
			},
			{
				id: "xgboost",
				name: "XGBoost",
				paradigm: "Boosting Ensemble",
				pedagogicalStrength: "Sequential residual tree updates fit stepped decision boundaries",
				create: () => new XGBoost()
			},
			{
				id: "cba",
				name: "Association Rules (CBA)",
				paradigm: "Rule Discretization",
				pedagogicalStrength: "Extracts discrete IF-THEN rules over binned intervals with confidence filtering",
				create: () => new CBA()
			},
			{
				id: "ann",
				name: "Neural Network (ANN)",
				paradigm: "Multi-Layer Perceptron",
				pedagogicalStrength: "Learns smooth non-linear boundaries; sensitive to epochs and learning rate",
				create: () => {
					const ann = new Ann();
					ann.maxEpochs = 40;
					return ann;
				}
			}
		];

		const results = [];

		for (const spec of modelSpecs) {
			try {
				const model = spec.create();
				model.setTraining(xTr, yTr);
				model.train(xTr, yTr);

				const preds = xTr.map((pt) => model.classif(pt[0], pt[1]));
				const scores = xTr.map((pt) =>
					typeof model.score === "function" ? model.score(pt[0], pt[1]) : (model.classif(pt[0], pt[1]) === 2 ? 1 : 0)
				);

				const m = calculateMetrics(yTr, preds, scores, 2);
				if (m) {
					results.push({
						id: spec.id,
						name: spec.name,
						paradigm: spec.paradigm,
						pedagogicalStrength: spec.pedagogicalStrength,
						accuracy: m.accuracy,
						sensitivity: m.sensitivity,
						specificity: m.specificity,
						f1: m.f1,
						tp: m.tp,
						fp: m.fp,
						fn: m.fn,
						tn: m.tn
					});
				}
			} catch (err) {
				console.warn(`Model ${spec.name} benchmark error:`, err);
			}
		}

		// Sort by F1 Score descending, then Accuracy descending
		results.sort((a, b) => b.f1 - a.f1 || b.accuracy - a.accuracy);
		return results;
	}, [xTr, yTr]);

	const topModel = benchmarkResults && benchmarkResults.length > 0 ? benchmarkResults[0] : null;

	return (
		<div className="modal-backdrop" onClick={onClose}>
			<div className="modal-content model-comparison-modal" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<div>
						<h2 className="modal-title">Model Comparison</h2>
						<p className="modal-subtitle">
							Evaluating all 10 classification models on the current cohort of {xTr.length} students.
						</p>
					</div>
					<button className="modal-close-btn" onClick={onClose} title="Close comparison">
						✕
					</button>
				</div>

				<div className="modal-body">
					{!benchmarkResults ? (
						<div className="comparison-empty">
							<div className="comparison-empty-title">Insufficient Training Points</div>
							<p className="comparison-empty-hint">
								Plot at least <strong>one On-Track student (Teal)</strong> and{" "}
								<strong>one At-Risk student (Rose)</strong> on the canvas to compare models.
							</p>
						</div>
					) : (
						<>
							{/* Highest-accuracy model summary */}
							{topModel && (
								<div className="top-model-banner">
									<div className="top-model-header">
										<span className="trophy-badge">Highest Accuracy</span>
										<strong className="top-model-name">{topModel.name} ({topModel.paradigm})</strong>
										<span className="top-model-acc">Accuracy: {(topModel.accuracy * 100).toFixed(1)}% | F1: {topModel.f1.toFixed(3)}</span>
									</div>
									<p className="top-model-desc">
										<strong>Summary:</strong> {topModel.pedagogicalStrength}. Model accuracy depends on how closely each decision boundary matches the distribution of the student data.
									</p>
								</div>
							)}

							{/* Benchmark Table */}
							<div className="comparison-table-wrapper">
								<table className="comparison-table">
									<thead>
										<tr>
											<th>Rank</th>
											<th>Algorithm</th>
											<th>Type</th>
											<th>Accuracy</th>
											<th>Sensitivity (Recall)</th>
											<th>Specificity</th>
											<th>F1 Score</th>
											<th>Action</th>
										</tr>
									</thead>
									<tbody>
										{benchmarkResults.map((res, index) => {
											const isTop = index === 0;
											return (
												<tr key={res.id} className={isTop ? "row-top" : ""}>
													<td className="cell-rank">
														<span className={`rank-badge ${index < 3 ? `rank-${index + 1}` : ""}`}>
															#{index + 1}
														</span>
													</td>
													<td className="cell-name">
														<strong>{res.name}</strong>
														<div className="cell-strength-hint">{res.pedagogicalStrength}</div>
													</td>
													<td className="cell-paradigm">{res.paradigm}</td>
													<td className="cell-stat">
														<strong>{(res.accuracy * 100).toFixed(1)}%</strong>
													</td>
													<td className="cell-stat" title="Proportion of actual at-risk students caught">
														{(res.sensitivity * 100).toFixed(1)}%
													</td>
													<td className="cell-stat" title="Proportion of on-track students kept unflagged">
														{(res.specificity * 100).toFixed(1)}%
													</td>
													<td className="cell-stat">
														<strong>{res.f1.toFixed(3)}</strong>
													</td>
													<td className="cell-action">
														<button
															type="button"
															className={`btn-select-model ${isTop ? "btn-top" : ""}`}
															onClick={() => {
																onSelectModel(res.id);
																onClose();
															}}
															title={`Switch active canvas model to ${res.name}`}
														>
															Apply to Canvas →
														</button>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</>
					)}
				</div>

				<div className="modal-footer">
					<button className="btn-modal-close" onClick={onClose}>
						Close Benchmark
					</button>
				</div>
			</div>
		</div>
	);
}
