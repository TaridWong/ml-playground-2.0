import React, { useState, useEffect } from "react";

const TOUR_STEPS = [
	{
		step: 1,
		badge: "Step 1 of 4: Canvas & Presets",
		title: "Plot Students or Load Classroom Scenarios",
		targetSelector: ".canvas-section",
		description:
			"Click anywhere on the 2D canvas to plot On-Track (Teal) and At-Risk (Rose) students, or open the Data Patterns Guide in the top bar to load Higher Ed and K-12 classroom datasets.",
		highlights: [
			"Toggle between Solid Boundary and Probability Heatmap above the canvas.",
			"Hover over any plotted student dot to inspect risk probability in the Cursor Probe.",
			"Use Share Link in the toolbar to copy a URL for your current dataset."
		]
	},
	{
		step: 2,
		badge: "Step 2 of 4: Classification Models",
		title: "Train & Compare 10 Classification Algorithms",
		targetSelector: ".options-section",
		description:
			"Switch between 10 algorithms spanning instance-based classification (KNN), linear boundaries (Logistic, Perceptron, SVM), rule systems (Decision Tree, CBA), ensembles (Random Forest, XGBoost), and Neural Networks.",
		highlights: [
			"Adjust model parameters to observe how the decision boundary responds.",
			"Click Compare All Models to evaluate all 10 algorithms side by side on your cohort."
		]
	},
	{
		step: 3,
		badge: "Step 3 of 4: Model Inspection & Counterfactuals",
		title: "Inspect Learned Parameters & Counterfactuals",
		targetSelector: ".tree-visualizer-section",
		description:
			"Every trained algorithm exposes its learned structure in the parameter inspector below the canvas alongside an interactive Counterfactual Boundary Analysis panel.",
		highlights: [
			"Examine discovered rules, feature log-odds weights, support vectors, and ensemble tree votes.",
			"Use the boundary simulator sliders to measure the minimum change needed to shift an At-Risk student to On-Track."
		]
	},
	{
		step: 4,
		badge: "Step 4 of 4: Evaluation Metrics & Export",
		title: "Evaluate Classification Metrics & Save Plot PNG",
		targetSelector: ".metrics-section",
		description:
			"Review standard classification metrics (Precision, Recall, F1, ROC AUC) alongside educational intervention cost trade-offs, and export a 2x resolution PNG of the plot.",
		highlights: [
			"Inspect the Confusion Matrix to balance false positives against missed At-Risk students.",
			"Click Save PNG in the toolbar to export a 2x resolution image of the active plot."
		]
	}
];

export default function QuickTourModal({
	isOpen,
	onClose,
	onLoadSampleAndTrain,
	onSavePng,
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
						<div className="tour-step-kicker">
							{stepObj.badge}
						</div>
						<h2 className="modal-title">{stepObj.title}</h2>
					</div>
					<button className="modal-close-btn" onClick={onClose} title="Close tour">
						✕
					</button>
				</div>

				<div className="modal-body">
					<p className="tour-desc">
						{stepObj.description}
					</p>

					<div className="tour-highlights-box">
						<div className="tour-highlights-heading">
							Try in this panel:
						</div>
						<ul className="tour-highlights-list">
							{stepObj.highlights.map((item, i) => (
								<li key={i}>
									{item}
								</li>
							))}
						</ul>
					</div>

					{/* Step-Specific Demo Action */}
					<div className="tour-action-row">
						{currentIdx === 0 && onLoadSampleAndTrain && (
							<button
								type="button"
								className="btn-io tour-action-primary"
								onClick={() => {
									onLoadSampleAndTrain();
								}}
							>
								Load Sample Cohort &amp; Train
							</button>
						)}
						{currentIdx === 1 && onOpenComparison && (
							<button
								type="button"
								className="btn-io tour-action-secondary"
								onClick={() => {
									onClose();
									onOpenComparison();
								}}
							>
								Open Model Comparison →
							</button>
						)}
						{currentIdx === 3 && onSavePng && (
							<button
								type="button"
								className="btn-io tour-action-primary"
								onClick={() => {
									onClose();
									onSavePng();
								}}
							>
								Save Plot PNG →
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
