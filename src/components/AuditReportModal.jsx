import React, { useMemo } from "react";
import S from "../s";
import { findCounterfactual, formatSigned } from "../utils/counterfactual";

const MODEL_NAMES = {
	knn: "K-Nearest Neighbors (KNN)",
	logistic: "Logistic Regression",
	naivebayes: "Gaussian Naive Bayes",
	perceptron: "Perceptron",
	svm: "Support Vector Machine (SVM)",
	tree: "Decision Tree",
	randomforest: "Random Forest Ensemble",
	xgboost: "XGBoost Gradient Boosting",
	cba: "Association Rules (CBA)",
	ann: "Artificial Neural Network (ANN)"
};

export default function AuditReportModal({
	isOpen,
	onClose,
	activeModel,
	store,
	metrics,
	activePreset
}) {
	if (!isOpen) return null;

	const model = store ? store.classif : null;
	const xTr = (store && store.xTr) || [];
	const yTr = (store && store.yTr) || [];
	const xLabel = activePreset ? activePreset.xAxis : "Feature X (Engagement / Practice)";
	const yLabel = activePreset ? activePreset.yAxis : "Feature Y (Exam / Quiz %)";
	const scenarioTitle = activePreset ? activePreset.title : "Custom Open Sandbox Cohort";
	const modelTitle = MODEL_NAMES[activeModel] || activeModel;

	const c1Count = yTr.filter((v) => Number(v) === S.class1).length;
	const c2Count = yTr.filter((v) => Number(v) === S.class2).length;

	// Build counterfactual roster for predicted At-Risk students
	const interventionRoster = useMemo(() => {
		if (!metrics || !model || typeof model.classif !== "function") return [];
		const list = [];
		for (let i = 0; i < xTr.length; i++) {
			const x = Math.round(xTr[i][0]);
			const y = Math.round(xTr[i][1]);
			const actual = Number(yTr[i]);
			const pred = model.classif(x, y);
			if (pred === S.class2) {
				const cf = findCounterfactual(model, x, y, S.class1);
				list.push({
					index: i + 1,
					x,
					y,
					actual,
					pred,
					prob: cf ? cf.currentScore : 1,
					cf
				});
			}
		}
		return list;
	}, [metrics, model, xTr, yTr]);

	const handleDownloadMarkdown = () => {
		const dateStr = new Date().toLocaleDateString();
		const lines = [
			`# Educator Algorithmic Audit & Intervention Report`,
			`Generated: ${dateStr} | Machine Learning Playground 2.0`,
			``,
			`## 1. Cohort & Model Summary`,
			`- **Scenario:** ${scenarioTitle}`,
			`- **Active Algorithm:** ${modelTitle}`,
			`- **Feature X:** ${xLabel}`,
			`- **Feature Y:** ${yLabel}`,
			`- **Total Plotted Students:** ${xTr.length} (${c1Count} On-Track / ${c2Count} At-Risk)`,
			``
		];

		if (metrics) {
			lines.push(
				`## 2. Classification & Fairness Audit`,
				`- **Overall Accuracy:** ${(metrics.accuracy * 100).toFixed(1)}%`,
				`- **Sensitivity (At-Risk Recall):** ${(metrics.sensitivity * 100).toFixed(1)}%`,
				`- **Specificity (On-Track Retention):** ${(metrics.specificity * 100).toFixed(1)}%`,
				`- **Precision:** ${(metrics.precision * 100).toFixed(1)}%`,
				`- **F1 Score:** ${metrics.f1.toFixed(3)}`,
				`- **ROC AUC:** ${metrics.auc.toFixed(3)} (${metrics.aucRating})`,
				``,
				`### Confusion Matrix Breakdown`,
				`- **True Positives (Correctly Flagged At-Risk):** ${metrics.tp} students`,
				`- **True Negatives (Confirmed On-Track):** ${metrics.tn} students`,
				`- **False Positives (False Intervention Alarms):** ${metrics.fp} students`,
				`- **False Negatives (Missed At-Risk Students):** ${metrics.fn} students`,
				``
			);
		} else {
			lines.push(
				`## 2. Classification & Fairness Audit`,
				`*Model has not been trained on the current cohort yet. Click Train Model to compute performance metrics.*`,
				``
			);
		}

		if (interventionRoster.length > 0) {
			lines.push(
				`## 3. Actionable Counterfactual Interventions (Flagged At-Risk Students)`,
				`| Student | Current Scores (X, Y) | Risk % | Shortest Combined Intervention | Single-Feature Alternative |`,
				`| :--- | :--- | :--- | :--- | :--- |`
			);
			interventionRoster.slice(0, 15).forEach((st) => {
				const combText =
					st.cf && st.cf.combined
						? `X ${formatSigned(st.cf.combined.dx)}, Y ${formatSigned(st.cf.combined.dy)}`
						: "Out of range";
				const singleText =
					st.cf && st.cf.xOnly
						? `X ${formatSigned(st.cf.xOnly.dx)} only`
						: st.cf && st.cf.yOnly
						? `Y ${formatSigned(st.cf.yOnly.dy)} only`
						: "Requires both X and Y";
				lines.push(
					`| Student #${st.index} | (${formatSigned(st.x)}, ${formatSigned(st.y)}) | ${Math.round(st.prob * 100)}% | ${combText} | ${singleText} |`
				);
			});
		}

		const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `edm_audit_report_${activeModel}.md`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	return (
		<div className="modal-backdrop" onClick={onClose}>
			<div
				className="modal-content model-comparison-modal"
				style={{ maxWidth: "880px" }}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-header">
					<div>
						<h2 className="modal-title">Educator Algorithmic Audit & Intervention Report</h2>
						<p className="modal-subtitle">
							Executive summary of model reliability, fairness trade-offs, and individualized student counterfactual plans.
						</p>
					</div>
					<button className="modal-close-btn" onClick={onClose} title="Close report">
						✕
					</button>
				</div>

				<div className="modal-body">
					{/* Section 1: Executive Cohort & Model Metadata */}
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
							gap: "0.75rem",
							marginBottom: "1.25rem"
						}}
					>
						<div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.75rem 0.9rem" }}>
							<div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Active Scenario</div>
							<div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a", marginTop: "0.15rem" }}>{scenarioTitle}</div>
						</div>
						<div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.75rem 0.9rem" }}>
							<div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Evaluated Algorithm</div>
							<div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f766e", marginTop: "0.15rem" }}>{modelTitle}</div>
						</div>
						<div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.75rem 0.9rem" }}>
							<div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 600 }}>Cohort Composition</div>
							<div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a", marginTop: "0.15rem" }}>
								{xTr.length} Students ({c1Count} On-Track / {c2Count} At-Risk)
							</div>
						</div>
					</div>

					{/* Section 2: Model Performance & Confusion Matrix Audit */}
					{!metrics ? (
						<div className="comparison-empty" style={{ marginBottom: "1rem" }}>
							<div className="comparison-empty-title">Model Not Yet Trained on Current Cohort</div>
							<p className="comparison-empty-hint">
								Plot students and click <strong>Train Model</strong> on the main workspace to generate the full diagnostic audit and counterfactual intervention roster.
							</p>
						</div>
					) : (
						<>
							<div
								style={{
									background: "#f0fdfa",
									border: "1px solid #99f6e4",
									borderRadius: "8px",
									padding: "0.9rem 1.1rem",
									marginBottom: "1.2rem"
								}}
							>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.6rem" }}>
									<strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>
										Diagnostic Reliability & Intervention Trade-Offs
									</strong>
									<span
										style={{
											fontSize: "0.75rem",
											fontWeight: 700,
											background: "#ccfbf1",
											color: "#0f766e",
											padding: "0.2rem 0.6rem",
											borderRadius: "999px"
										}}
									>
										Accuracy: {(metrics.accuracy * 100).toFixed(1)}% | F1: {metrics.f1.toFixed(3)} | AUC: {metrics.auc.toFixed(2)}
									</span>
								</div>

								<div
									style={{
										display: "grid",
										gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
										gap: "0.65rem",
										marginBottom: "0.65rem"
									}}
								>
									<div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "0.55rem 0.75rem" }}>
										<div style={{ fontSize: "0.72rem", color: "#64748b" }}>Correctly Flagged At-Risk</div>
										<div style={{ fontSize: "1rem", fontWeight: 700, color: "#0f766e" }}>
											{metrics.tp} Students ({(metrics.sensitivity * 100).toFixed(0)}% Recall)
										</div>
									</div>
									<div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "0.55rem 0.75rem" }}>
										<div style={{ fontSize: "0.72rem", color: "#64748b" }}>Missed At-Risk (Critical)</div>
										<div style={{ fontSize: "1rem", fontWeight: 700, color: metrics.fn > 0 ? "#be123c" : "#0f766e" }}>
											{metrics.fn} Students
										</div>
									</div>
									<div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "0.55rem 0.75rem" }}>
										<div style={{ fontSize: "0.72rem", color: "#64748b" }}>False Intervention Alarms</div>
										<div style={{ fontSize: "1rem", fontWeight: 700, color: "#d97706" }}>
											{metrics.fp} Students
										</div>
									</div>
									<div style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "0.55rem 0.75rem" }}>
										<div style={{ fontSize: "0.72rem", color: "#64748b" }}>Confirmed On-Track</div>
										<div style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
											{metrics.tn} Students ({(metrics.specificity * 100).toFixed(0)}% Spec.)
										</div>
									</div>
								</div>

								<div style={{ fontSize: "0.8rem", color: "#134e4a", lineHeight: 1.5 }}>
									<strong>Policy Guidance:</strong>{" "}
									{metrics.fn === 0
										? "This model successfully catches 100% of At-Risk students in the cohort with zero missed learners."
										: metrics.sensitivity >= 0.8
										? `This model captures ${(metrics.sensitivity * 100).toFixed(0)}% of struggling students, leaving ${metrics.fn} borderline student(s) unflagged.`
										: `Warning: ${metrics.fn} At-Risk student(s) currently fall on the On-Track side of the boundary. Consider lowering the Alert Threshold or testing a nonlinear paradigm.`}
								</div>
							</div>

							{/* Section 3: Counterfactual Action Plan Table */}
							<div>
								<h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.3rem" }}>
									Individualized Counterfactual Action Plan ({interventionRoster.length} Flagged Students)
								</h3>
								<p style={{ fontSize: "0.78rem", color: "#64748b", marginBottom: "0.65rem" }}>
									Minimum score adjustments needed for each flagged student to cross the trained decision boundary into On-Track status.
								</p>

								{interventionRoster.length === 0 ? (
									<div style={{ padding: "0.85rem", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "0.82rem", color: "#475569" }}>
										No students are currently predicted as At-Risk by this model.
									</div>
								) : (
									<div className="comparison-table-wrapper">
										<table className="comparison-table">
											<thead>
												<tr>
													<th>Student</th>
													<th>Current Scores (X, Y)</th>
													<th>Risk Score</th>
													<th>Shortest Combined Intervention</th>
													<th>Single-Metric Alternative</th>
												</tr>
											</thead>
											<tbody>
												{interventionRoster.slice(0, 12).map((st) => (
													<tr key={st.index}>
														<td>
															<strong>Student #{st.index}</strong>
														</td>
														<td>
															({formatSigned(st.x)}, {formatSigned(st.y)})
														</td>
														<td>
															<span style={{ color: "#be123c", fontWeight: 700 }}>
																{Math.round(st.prob * 100)}%
															</span>
														</td>
														<td>
															{st.cf && st.cf.combined ? (
																<span style={{ color: "#0f766e", fontWeight: 600 }}>
																	{xLabel}: {formatSigned(st.cf.combined.dx)}, {yLabel}: {formatSigned(st.cf.combined.dy)}
																</span>
															) : (
																<span style={{ color: "#94a3b8" }}>Outside canvas range</span>
															)}
														</td>
														<td>
															{st.cf && st.cf.xOnly ? (
																<span>
																	{xLabel} <strong>{formatSigned(st.cf.xOnly.dx)}</strong> only
																</span>
															) : st.cf && st.cf.yOnly ? (
																<span>
																	{yLabel} <strong>{formatSigned(st.cf.yOnly.dy)}</strong> only
																</span>
															) : (
																<span style={{ color: "#64748b" }}>Requires combined boost</span>
															)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								)}
							</div>
						</>
					)}
				</div>

				<div className="modal-footer" style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem", flexWrap: "wrap" }}>
					<div style={{ display: "flex", gap: "0.5rem" }}>
						<button
							type="button"
							className="btn-io"
							onClick={handleDownloadMarkdown}
							style={{
								cursor: "pointer",
								background: "#0f766e",
								color: "#ffffff",
								border: "1px solid #0f766e",
								borderRadius: "6px",
								padding: "0.45rem 0.9rem",
								fontSize: "0.82rem",
								fontWeight: 600
							}}
						>
							Download Report (.md)
						</button>
						<button
							type="button"
							className="btn-io"
							onClick={() => window.print()}
							style={{
								cursor: "pointer",
								background: "#f1f5f9",
								color: "#1e293b",
								border: "1px solid #cbd5e1",
								borderRadius: "6px",
								padding: "0.45rem 0.9rem",
								fontSize: "0.82rem",
								fontWeight: 600
							}}
						>
							Print / Save PDF
						</button>
					</div>
					<button className="btn-modal-close" onClick={onClose}>
						Close Report
					</button>
				</div>
			</div>
		</div>
	);
}
