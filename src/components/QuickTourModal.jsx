import React, { useState, useEffect } from "react";

const TOUR_STEPS = [
	{
		step: 1,
		badge: "Step 1 of 4: Cohort Sandbox & Real-World Patterns",
		title: "Plot Students or Load Classroom Scenarios",
		targetSelector: ".canvas-section",
		description:
			"Click anywhere on the interactive 2D canvas to plot On-Track (Teal) and At-Risk (Rose) students, or open the Data Patterns Guide in the top bar to load realistic Higher Ed and K-12 classroom datasets.",
		highlights: [
			"Toggle between Solid Boundary and Probability Heatmap above the canvas.",
			"Hover over any plotted student dot to see live risk probability in the HUD.",
			"Use Share Link in the toolbar to copy a deep link to your exact cohort."
		]
	},
	{
		step: 2,
		badge: "Step 2 of 4: 10 Pedagogical ML Paradigms",
		title: "Train & Benchmark 10 Classification Algorithms",
		targetSelector: ".options-section",
		description:
			"Switch between 10 algorithms spanning instance-based voting (KNN), linear boundaries (Logistic, Perceptron, SVM), rule systems (Decision Tree, CBA), ensembles (Random Forest, XGBoost), and Neural Networks.",
		highlights: [
			"Tune hyperparameters with instant visual reclassification.",
			"Click Compare All Models to benchmark all 10 paradigms side by side on your cohort."
		]
	},
	{
		step: 3,
		badge: "Step 3 of 4: Explainable AI & Counterfactuals",
		title: "Audit White-Box Logic & What-If Interventions",
		targetSelector: ".tree-visualizer-section",
		description:
			"Every algorithm includes a live Explainable AI (XAI) Inspector below the canvas alongside an interactive What-If Counterfactual Explorer.",
		highlights: [
			"Inspect mined rubric rules, feature weight tug-of-war bars, support vectors, and tree committee ballots.",
			"Use the What-If Counterfactual sliders to find the smallest score boost needed to flip an At-Risk student to On-Track."
		]
	},
	{
		step: 4,
		badge: "Step 4 of 4: Psychometric Metrics & Educator Audit Report",
		title: "Evaluate Intervention Impact & Export Reports",
		targetSelector: ".metrics-section",
		description:
			"Bridge machine learning metrics (Precision, Recall, F1, ROC AUC) with real educational intervention costs, and export a 1-page Audit Report.",
		highlights: [
			"Inspect the Confusion Matrix to balance False Alarms against Missed At-Risk students.",
			"Click Audit Report in the toolbar to view or download a complete Markdown / PDF executive summary."
		]
	}
];

export default function QuickTourModal({
	isOpen,
	onClose,
	onLoadSampleAndTrain,
	onOpenAuditReport,
	onOpenComparison
}) {
	const [currentIdx, setCurrentIdx] = useState(0);

	useEffect(() => {
		if (isOpen) {
			setCurrentIdx(0);
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;
		const stepObj = TOUR_STEPS[currentIdx];
		if (stepObj && stepObj.targetSelector) {
			const el = document.querySelector(stepObj.targetSelector);
			if (el && typeof el.scrollIntoView === "function") {
				el.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}
	}, [isOpen, currentIdx]);

	if (!isOpen) return null;

	const stepObj = TOUR_STEPS[currentIdx];

	return (
		<div className="modal-backdrop" onClick={onClose}>
			<div
				className="modal-content"
				style={{ maxWidth: "580px" }}
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-header">
					<div>
						<div
							style={{
								display: "inline-block",
								fontSize: "0.72rem",
								fontWeight: 700,
								background: "#ccfbf1",
								color: "#0f766e",
								padding: "0.18rem 0.6rem",
								borderRadius: "999px",
								marginBottom: "0.35rem"
							}}
						>
							{stepObj.badge}
						</div>
						<h2 className="modal-title">{stepObj.title}</h2>
					</div>
					<button className="modal-close-btn" onClick={onClose} title="Close tour">
						✕
					</button>
				</div>

				<div className="modal-body">
					<p
						style={{
							fontSize: "0.9rem",
							color: "#1e293b",
							lineHeight: 1.6,
							marginBottom: "0.9rem"
						}}
					>
						{stepObj.description}
					</p>

					<div
						style={{
							background: "#f8fafc",
							border: "1px solid #e2e8f0",
							borderRadius: "8px",
							padding: "0.85rem 1rem",
							marginBottom: "1rem"
						}}
					>
						<div
							style={{
								fontSize: "0.78rem",
								fontWeight: 700,
								color: "#0f172a",
								marginBottom: "0.45rem"
							}}
						>
							Key Capabilities to Try:
						</div>
						<ul
							style={{
								margin: 0,
								paddingLeft: "1.15rem",
								fontSize: "0.82rem",
								color: "#334155",
								lineHeight: 1.6
							}}
						>
							{stepObj.highlights.map((item, i) => (
								<li key={i} style={{ marginBottom: "0.25rem" }}>
									{item}
								</li>
							))}
						</ul>
					</div>

					{/* Step-Specific 1-Click Demo Action */}
					<div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
						{currentIdx === 0 && onLoadSampleAndTrain && (
							<button
								type="button"
								className="btn-io"
								onClick={() => {
									onLoadSampleAndTrain();
								}}
								style={{
									cursor: "pointer",
									background: "#0f766e",
									color: "#ffffff",
									border: "1px solid #0f766e",
									borderRadius: "6px",
									padding: "0.4rem 0.85rem",
									fontSize: "0.8rem",
									fontWeight: 600
								}}
							>
								⚡ Load Sample Cohort & Train Now
							</button>
						)}
						{currentIdx === 1 && onOpenComparison && (
							<button
								type="button"
								className="btn-io"
								onClick={() => {
									onClose();
									onOpenComparison();
								}}
								style={{
									cursor: "pointer",
									background: "#0f172a",
									color: "#ffffff",
									border: "1px solid #0f172a",
									borderRadius: "6px",
									padding: "0.4rem 0.85rem",
									fontSize: "0.8rem",
									fontWeight: 600
								}}
							>
								Open 10-Model Benchmark Matrix →
							</button>
						)}
						{currentIdx === 3 && onOpenAuditReport && (
							<button
								type="button"
								className="btn-io"
								onClick={() => {
									onClose();
									onOpenAuditReport();
								}}
								style={{
									cursor: "pointer",
									background: "#0f766e",
									color: "#ffffff",
									border: "1px solid #0f766e",
									borderRadius: "6px",
									padding: "0.4rem 0.85rem",
									fontSize: "0.8rem",
									fontWeight: 600
								}}
							>
								Preview Educator Audit Report →
							</button>
						)}
					</div>

					{/* Progress Dots */}
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							gap: "0.4rem",
							marginTop: "1.1rem"
						}}
					>
						{TOUR_STEPS.map((s, idx) => (
							<button
								key={s.step}
								type="button"
								onClick={() => setCurrentIdx(idx)}
								style={{
									width: idx === currentIdx ? "24px" : "8px",
									height: "8px",
									borderRadius: "999px",
									border: "none",
									background: idx === currentIdx ? "#0f766e" : "#cbd5e1",
									cursor: "pointer",
									transition: "all 0.2s ease",
									padding: 0
								}}
								title={`Go to Step ${s.step}`}
							/>
						))}
					</div>
				</div>

				<div
					className="modal-footer"
					style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
				>
					<button
						type="button"
						className="btn-io"
						disabled={currentIdx === 0}
						onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
						style={{
							cursor: currentIdx === 0 ? "not-allowed" : "pointer",
							opacity: currentIdx === 0 ? 0.5 : 1,
							background: "#f1f5f9",
							color: "#1e293b",
							border: "1px solid #cbd5e1",
							borderRadius: "6px",
							padding: "0.4rem 0.85rem",
							fontSize: "0.82rem",
							fontWeight: 500
						}}
					>
						← Previous
					</button>

					<div style={{ display: "flex", gap: "0.5rem" }}>
						<button
							type="button"
							className="btn-io"
							onClick={onClose}
							style={{
								cursor: "pointer",
								background: "#f1f5f9",
								color: "#475569",
								border: "1px solid #cbd5e1",
								borderRadius: "6px",
								padding: "0.4rem 0.85rem",
								fontSize: "0.82rem",
								fontWeight: 500
							}}
						>
							Skip Tour
						</button>
						{currentIdx < TOUR_STEPS.length - 1 ? (
							<button
								type="button"
								className="btn-modal-close"
								onClick={() => setCurrentIdx((i) => i + 1)}
							>
								Next Step →
							</button>
						) : (
							<button type="button" className="btn-modal-close" onClick={onClose}>
								Finish Tour
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
