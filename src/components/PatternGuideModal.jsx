import React from "react";
import { EDUCATIONAL_PRESETS } from "../presets";

export default function PatternGuideModal({ isOpen, onClose, onLoadPattern }) {
	if (!isOpen) return null;

	const patterns = [
		{
			id: "higher_ed_retention",
			name: "1. Linearly Separable Relationship",
			tag: "Linear Boundary",
			tagColor: "#2563eb",
			description:
				"Points can be cleanly divided by a single straight line. If Feature X and Feature Y both positively correlate with success (e.g., Study Hours + Attendance), the boundary forms a diagonal fence.",
			recommended: "Perceptron, Logistic Regression, Linear SVM",
			challenges: "None. This is the ideal baseline for classical linear classifiers.",
			presetIndex: 0
		},
		{
			id: "k12_mastery",
			name: "2. Orthogonal / Rule-Based Relationship (L-Shape)",
			tag: "Hierarchical Rules",
			tagColor: "#059669",
			description:
				"Success can be reached via multiple independent pathways. For example: A student passes if Diagnostic Score is high OR Practice Problems are high. Only students low in BOTH need help. This creates an L-shaped boundary.",
			recommended: "Decision Tree, Association Rules (CBA), XGBoost (axis-aligned rule cuts)",
			challenges: "Linear Perceptron struggles because a single straight diagonal line cannot isolate a corner.",
			presetIndex: 1
		},
		{
			id: "gaming_the_system",
			name: "3. Non-Linear Enclosed Relationship (Bullseye / Island)",
			tag: "Non-Linear Pocket",
			tagColor: "#9333ea",
			description:
				"One group of students forms an isolated pocket surrounded by others. In educational research, students who game the system cluster in a specific fast-response zone, encircled by normal learners.",
			recommended: "K-Nearest Neighbors (KNN), RBF Kernel SVM, XGBoost, Artificial Neural Network",
			challenges: "Perceptron and Linear SVM perform near chance (~50% accuracy) because a straight line cannot enclose a circle.",
			presetIndex: 2
		}
	];

	return (
		<div className="modal-backdrop" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<div>
						<h2 className="modal-title">Data Patterns &amp; Classification Geometry</h2>
						<p className="modal-subtitle">
							How student data organizes in educational research, and how different algorithms partition them.
						</p>
					</div>
					<button className="modal-close-btn" onClick={onClose} title="Close guide">
						✕
					</button>
				</div>

				<div className="modal-body">
					<div className="guide-intro-banner">
						<strong>Usage Note:</strong> Students can use the blank canvas to plot data points from scratch, or load these three patterns to compare linear, orthogonal, and enclosed decision boundaries.
					</div>

					<div className="patterns-list">
						{patterns.map((item) => {
							const presetData = EDUCATIONAL_PRESETS[item.presetIndex];
							return (
								<div key={item.id} className="pattern-guide-card">
									<div className="pattern-card-header">
										<div className="pattern-title-group">
											<span className="pattern-name">{item.name}</span>
											<span className="pattern-tag" style={{ color: item.tagColor }}>
												{item.tag}
											</span>
										</div>
										<button
											className="pattern-load-btn"
											onClick={() => {
												onLoadPattern(item.id);
												onClose();
											}}
											title="Load this pattern onto the canvas"
										>
											Load Pattern →
										</button>
									</div>

									<p className="pattern-desc">{item.description}</p>

									<div className="pattern-meta-grid">
										<div className="meta-box rec">
											<strong>Recommended Models:</strong> {item.recommended}
										</div>
										<div className="meta-box chal">
											<strong>Known Difficulty:</strong> {item.challenges}
										</div>
									</div>

									{presetData && (
										<div className="pattern-axes-hint">
											<strong>Example Educational Variables:</strong> X: <em>{presetData.xAxis}</em> vs. Y: <em>{presetData.yAxis}</em>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>

				<div className="modal-footer">
					<button className="btn-modal-close" onClick={onClose}>
						Close Guide
					</button>
				</div>
			</div>
		</div>
	);
}
