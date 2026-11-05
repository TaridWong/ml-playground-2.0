import React from "react";
import CostBenefitCalculator from "./CostBenefitCalculator";

export default function MetricsDashboard({ metrics }) {
	if (!metrics || metrics.total === 0) {
		return (
			<div className="metrics-card empty">
				<div className="empty-title">Educational Metrics & Intervention Impact</div>
				<p className="empty-hint">
					Plot data points on the canvas or select a template from the <strong>Data Patterns Guide</strong>, then click <strong>Train Model</strong> to calculate Sensitivity, Specificity, Precision, F1, Accuracy, and ROC AUC.
				</p>
			</div>
		);
	}

	const {
		total,
		tp,
		fp,
		tn,
		fn,
		accuracy,
		sensitivity,
		specificity,
		precision,
		recall,
		f1,
		auc,
		aucRating,
		aucColor,
		rocPoints
	} = metrics;

	// Scale ROC curve points to SVG viewBox (0, 0, 140, 140)
	const svgSize = 140;
	const padding = 15;
	const graphW = svgSize - padding * 2;
	const graphH = svgSize - padding * 2;

	const toSvgX = (fpr) => padding + fpr * graphW;
	const toSvgY = (tpr) => padding + (1 - tpr) * graphH;

	let pathD = "";
	if (rocPoints && rocPoints.length > 0) {
		pathD = rocPoints.reduce((acc, pt, idx) => {
			const x = toSvgX(pt.fpr).toFixed(1);
			const y = toSvgY(pt.tpr).toFixed(1);
			return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
		}, "");
	}

	const areaPathD = pathD
		? `${pathD} L ${toSvgX(1)} ${toSvgY(0)} L ${toSvgX(0)} ${toSvgY(0)} Z`
		: "";

	return (
		<div className="metrics-card">
			{/* Header */}
			<div className="metrics-header">
				<div className="metrics-title-group">
					<h3 className="metrics-title">Learning Analytics & Evaluation Metrics</h3>
					<span className="metrics-subtitle">
						Evaluating all {total} plotted students ({tp + fn} At-Risk / {tn + fp} On-Track)
					</span>
				</div>
			</div>

			{/* Primary Metric Badges Row */}
			<div className="metrics-badges-grid">
				<div className="metric-badge-box" title="True Positive Rate / Recall: Proportion of actual at-risk students correctly detected">
					<div className="metric-label">
						Sensitivity <span className="sub-term">(Recall)</span>
					</div>
					<div className="metric-value">{(sensitivity * 100).toFixed(1)}%</div>
					<div className="metric-formula">TP / (TP + FN)</div>
				</div>

				<div className="metric-badge-box" title="True Negative Rate: Proportion of on-track students correctly left unflagged">
					<div className="metric-label">
						Specificity <span className="sub-term">(TNR)</span>
					</div>
					<div className="metric-value">{(specificity * 100).toFixed(1)}%</div>
					<div className="metric-formula">TN / (TN + FP)</div>
				</div>

				<div className="metric-badge-box" title="Positive Predictive Value: When an alert fires, probability the student is truly at-risk">
					<div className="metric-label">
						Precision <span className="sub-term">(PPV)</span>
					</div>
					<div className="metric-value">{(precision * 100).toFixed(1)}%</div>
					<div className="metric-formula">TP / (TP + FP)</div>
				</div>

				<div className="metric-badge-box" title="Harmonic mean balancing Precision and Recall">
					<div className="metric-label">
						F1 Score <span className="sub-term">(Balance)</span>
					</div>
					<div className="metric-value">{f1.toFixed(3)}</div>
					<div className="metric-formula">2·(P·R) / (P + R)</div>
				</div>

				<div className="metric-badge-box" title="Overall percentage of correct predictions across all students">
					<div className="metric-label">
						Accuracy <span className="sub-term">(Overall)</span>
					</div>
					<div className="metric-value">{(accuracy * 100).toFixed(1)}%</div>
					<div className="metric-formula">(TP + TN) / Total</div>
				</div>
			</div>

			{/* Two Column Section: Confusion Matrix & ROC AUC Chart */}
			<div className="metrics-middle-grid">
				{/* Confusion Matrix */}
				<div className="cm-container">
					<div className="section-heading">Confusion Matrix (Intervention Outcomes)</div>
					<div className="cm-table-wrapper">
						<table className="cm-table">
							<thead>
								<tr>
									<th colSpan="2" rowSpan="2" className="cm-corner">
										Student Cohort (N={total})
									</th>
									<th colSpan="2" className="cm-pred-header">
										Predicted by Algorithm
									</th>
								</tr>
								<tr>
									<th className="cm-col-label">
										Predicted At-Risk (<span style={{ color: "#E11D48" }}>●</span>)
									</th>
									<th className="cm-col-label">
										Predicted On-Track (<span style={{ color: "#0D9488" }}>●</span>)
									</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<th rowSpan="2" className="cm-actual-header">
										<span>Actual</span>
									</th>
									<th className="cm-row-label">Actually At-Risk</th>
									<td className="cm-cell cm-tp" title="True Positive: Correctly flagged for intervention">
										<div className="cm-count">{tp}</div>
										<div className="cm-text">True Positive (TP)</div>
										<div className="cm-note">✓ Caught for help</div>
									</td>
									<td className="cm-cell cm-fn" title="False Negative: Missed student in need of support!">
										<div className="cm-count">{fn}</div>
										<div className="cm-text">False Negative (FN)</div>
										<div className="cm-note">⚠ Missed student!</div>
									</td>
								</tr>
								<tr>
									<th className="cm-row-label">Actually On-Track</th>
									<td className="cm-cell cm-fp" title="False Positive: Unnecessary intervention triggered">
										<div className="cm-count">{fp}</div>
										<div className="cm-text">False Positive (FP)</div>
										<div className="cm-note">⚡ False alarm</div>
									</td>
									<td className="cm-cell cm-tn" title="True Negative: Thriving independently">
										<div className="cm-count">{tn}</div>
										<div className="cm-text">True Negative (TN)</div>
										<div className="cm-note">✓ On-track kept</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>

				{/* ROC Curve & AUC Visualizer */}
				<div className="roc-container">
					<div className="section-heading">
						ROC Curve & Discrimination (AUC)
					</div>
					<div className="roc-body">
						<svg className="roc-svg" viewBox={`0 0 ${svgSize} ${svgSize}`}>
							{/* Background grid */}
							<rect
								x={padding}
								y={padding}
								width={graphW}
								height={graphH}
								fill="#f8fafc"
								stroke="#cbd5e1"
							/>
							{/* Diagonal random chance line */}
							<line
								x1={toSvgX(0)}
								y1={toSvgY(0)}
								x2={toSvgX(1)}
								y2={toSvgY(1)}
								stroke="#94a3b8"
								strokeDasharray="3 3"
								strokeWidth="1.5"
							/>
							{/* Shaded Area Under Curve */}
							{areaPathD && (
								<path
									d={areaPathD}
									fill={aucColor}
									fillOpacity="0.18"
								/>
							)}
							{/* Empirical ROC Curve */}
							{pathD && (
								<path
									d={pathD}
									fill="none"
									stroke={aucColor}
									strokeWidth="2.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							)}
							{/* Operating Point Circles */}
							{rocPoints &&
								rocPoints.map((pt, i) => (
									<circle
										key={i}
										cx={toSvgX(pt.fpr)}
										cy={toSvgY(pt.tpr)}
										r={i === 1 && rocPoints.length === 3 ? "4.5" : "2"}
										fill={aucColor}
										stroke="#ffffff"
										strokeWidth="1"
									/>
								))}
							{/* Axes labels */}
							<text x={toSvgX(0.5)} y={svgSize - 2} textAnchor="middle" fontSize="7" fill="#64748b">
								False Positive Rate (1 - Spec)
							</text>
							<text
								x={-toSvgY(0.5)}
								y={8}
								transform="rotate(-90)"
								textAnchor="middle"
								fontSize="7"
								fill="#64748b"
							>
								True Positive Rate (Sens)
							</text>
						</svg>

						<div className="roc-legend">
							<div className="auc-stat-line">
								<span className="auc-label">ROC AUC:</span>
								<span className="auc-score" style={{ color: aucColor }}>
									{auc.toFixed(3)}
								</span>
							</div>
							<div className="auc-grade-pill" style={{ backgroundColor: `${aucColor}20`, color: aucColor }}>
								{aucRating}
							</div>
							<div className="auc-help-text">
								{auc >= 0.8
									? "Strong separation between at-risk and on-track students."
									: "Struggles to separate borderline cases; high risk of misclassification."}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Educational Intervention Synthesis Card */}
			<div className="impact-summary-card">
				<div className="impact-title">Pedagogical Intervention Impact:</div>
				<p className="impact-text">
					If an advisor acts on this model today, they will successfully reach{" "}
					<strong>
						{tp} of {tp + fn} ({((tp / (tp + fn || 1)) * 100).toFixed(0)}%)
					</strong>{" "}
					struggling students. However,{" "}
					<strong style={{ color: "#b91c1c" }}>
						{fn} student{fn !== 1 ? "s" : ""} will slip through without assistance
					</strong>
					, and{" "}
					<strong style={{ color: "#c2410c" }}>
						{fp} false alarm{fp !== 1 ? "s" : ""}
					</strong>{" "}
					will trigger unnecessary outreach to students already on track.
				</p>
			</div>

			{/* Educational Resource & Policy Impact Planner (Cost-Benefit Calculator) */}
			<CostBenefitCalculator metrics={metrics} />
		</div>
	);
}
