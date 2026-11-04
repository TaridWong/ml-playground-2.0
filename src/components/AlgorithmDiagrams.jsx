import React from "react";

// Shared style constants
const FONT_FAMILY = "Inter, system-ui, -apple-system, sans-serif";
const COLOR_TEAL = "#0d9488";
const COLOR_ROSE = "#e11d48";
const COLOR_NAVY = "#0f172a";
const COLOR_SLATE = "#334155";
const COLOR_MUTED = "#64748b";
const COLOR_BORDER = "#cbd5e1";

export function KNNDiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "0.85rem 0" }}>
			<svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: "200px", display: "block", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
				{/* Canvas frame on left */}
				<rect x="25" y="20" width="180" height="140" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<line x1="25" y1="90" x2="205" y2="90" stroke="#f1f5f9" strokeWidth="1" />
				<line x1="115" y1="20" x2="115" y2="160" stroke="#f1f5f9" strokeWidth="1" />

				{/* Surrounding background dots */}
				<circle cx="50" cy="50" r="5" fill={COLOR_TEAL} />
				<circle cx="70" cy="40" r="5" fill={COLOR_TEAL} />
				<circle cx="170" cy="130" r="5" fill={COLOR_ROSE} />
				<circle cx="185" cy="145" r="5" fill={COLOR_ROSE} />

				{/* Neighborhood circle (K = 5) */}
				<circle cx="115" cy="85" r="45" fill="#f0fdfa" fillOpacity="0.6" stroke={COLOR_TEAL} strokeWidth="2" strokeDasharray="4 3" />

				{/* Points inside neighborhood */}
				<circle cx="95" cy="70" r="5" fill={COLOR_TEAL} />
				<circle cx="130" cy="65" r="5" fill={COLOR_TEAL} />
				<circle cx="105" cy="110" r="5" fill={COLOR_TEAL} />
				<circle cx="135" cy="100" r="5" fill={COLOR_TEAL} />
				<circle cx="145" cy="85" r="5" fill={COLOR_ROSE} />

				{/* Target student in center */}
				<circle cx="115" cy="85" r="8" fill="#ffffff" stroke={COLOR_NAVY} strokeWidth="2.5" />
				<text x="115" y="89" textAnchor="middle" fontSize="10" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>?</text>
				<text x="115" y="152" textAnchor="middle" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Dashed circle = 5 closest peers</text>

				{/* Right side voting ballot */}
				<rect x="235" y="25" width="240" height="130" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="250" y="50" fontSize="12" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Peer Voting Consensus (K = 5)</text>

				{/* Vote tally row */}
				<circle cx="260" cy="75" r="6" fill={COLOR_TEAL} />
				<text x="275" y="79" fontSize="11" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>4 On-Track peers</text>

				<circle cx="260" cy="100" r="6" fill={COLOR_ROSE} />
				<text x="275" y="104" fontSize="11" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>1 At-Risk peer</text>

				{/* Conclusion banner */}
				<rect x="250" y="118" width="210" height="26" rx="4" fill="#ccfbf1" />
				<text x="355" y="135" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>Majority Vote: Predicts On-Track</text>
			</svg>
		</div>
	);
}

export function LogisticDiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "0.85rem 0" }}>
			<svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: "200px", display: "block", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
				{/* Axes */}
				<line x1="50" y1="145" x2="310" y2="145" stroke={COLOR_SLATE} strokeWidth="1.5" />
				<line x1="50" y1="25" x2="50" y2="145" stroke={COLOR_SLATE} strokeWidth="1.5" />

				<text x="180" y="165" textAnchor="middle" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Student Score & Engagement Index →</text>
				<text x="40" y="32" textAnchor="end" fontSize="10" fontWeight="bold" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>100%</text>
				<text x="40" y="88" textAnchor="end" fontSize="10" fontWeight="bold" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>50%</text>
				<text x="40" y="148" textAnchor="end" fontSize="10" fontWeight="bold" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>0%</text>

				{/* Shaded Threshold Regions */}
				<rect x="50" y="25" width="260" height="60" fill="#ffe4e6" fillOpacity="0.4" />
				<rect x="50" y="85" width="260" height="60" fill="#ccfbf1" fillOpacity="0.3" />

				{/* 50% Threshold line */}
				<line x1="50" y1="85" x2="310" y2="85" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="4 3" />
				<text x="305" y="80" textAnchor="end" fontSize="10" fontWeight="bold" fill="#e11d48" fontFamily={FONT_FAMILY}>Alert Threshold (50%)</text>

				{/* Sigmoid S Curve (High scores = low risk probability, low scores = high risk) */}
				<path d="M 50 35 Q 130 35, 170 85 T 310 140" fill="none" stroke={COLOR_NAVY} strokeWidth="3" />

				{/* Dots along the curve */}
				<circle cx="85" cy="40" r="4.5" fill={COLOR_ROSE} />
				<circle cx="120" cy="50" r="4.5" fill={COLOR_ROSE} />
				<circle cx="230" cy="125" r="4.5" fill={COLOR_TEAL} />
				<circle cx="280" cy="138" r="4.5" fill={COLOR_TEAL} />

				{/* Right side explainer card */}
				<rect x="330" y="25" width="150" height="130" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="340" y="48" fontSize="11" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>S-Shaped Probability</text>

				<rect x="340" y="60" width="130" height="34" rx="4" fill="#fee2e2" />
				<text x="345" y="74" fontSize="9" fontWeight="bold" fill="#b91c1c" fontFamily={FONT_FAMILY}>Above Cutoff:</text>
				<text x="345" y="87" fontSize="9" fill="#b91c1c" fontFamily={FONT_FAMILY}>Flag At-Risk Intervention</text>

				<rect x="340" y="104" width="130" height="34" rx="4" fill="#dcfce7" />
				<text x="345" y="118" fontSize="9" fontWeight="bold" fill="#15803d" fontFamily={FONT_FAMILY}>Below Cutoff:</text>
				<text x="345" y="131" fontSize="9" fill="#15803d" fontFamily={FONT_FAMILY}>Keep Student On-Track</text>
			</svg>
		</div>
	);
}

export function NaiveBayesDiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "0.85rem 0" }}>
			<svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: "200px", display: "block", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
				{/* 2D coordinate box */}
				<rect x="30" y="20" width="250" height="140" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />

				{/* On-Track Gaussian Cloud (Teal) */}
				<ellipse cx="190" cy="65" rx="55" ry="32" fill="#ccfbf1" fillOpacity="0.4" stroke={COLOR_TEAL} strokeWidth="1.5" strokeDasharray="3 2" />
				<ellipse cx="190" cy="65" rx="35" ry="20" fill="#ccfbf1" fillOpacity="0.7" stroke={COLOR_TEAL} strokeWidth="1.5" />
				<circle cx="190" cy="65" r="4" fill={COLOR_TEAL} />
				<text x="190" y="55" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>On-Track Cloud</text>

				{/* At-Risk Gaussian Cloud (Rose) */}
				<ellipse cx="90" cy="115" rx="50" ry="30" fill="#ffe4e6" fillOpacity="0.4" stroke={COLOR_ROSE} strokeWidth="1.5" strokeDasharray="3 2" />
				<ellipse cx="90" cy="115" rx="30" ry="18" fill="#ffe4e6" fillOpacity="0.7" stroke={COLOR_ROSE} strokeWidth="1.5" />
				<circle cx="90" cy="115" r="4" fill={COLOR_ROSE} />
				<text x="90" y="135" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#be123c" fontFamily={FONT_FAMILY}>At-Risk Cloud</text>

				{/* Boundary curve where densities match */}
				<path d="M 110 20 Q 140 90, 165 160" fill="none" stroke={COLOR_NAVY} strokeWidth="2.5" />
				<text x="155" y="32" fontSize="9" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Equal Odds Boundary</text>

				{/* Right side explainer card */}
				<rect x="300" y="20" width="180" height="140" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="312" y="44" fontSize="11" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Bell Curve Clouds</text>
				<text x="312" y="65" fontSize="10" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>1. Computes group center</text>
				<text x="325" y="79" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>average and score spread.</text>
				<text x="312" y="99" fontSize="10" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>2. Incorporates base rate:</text>
				<text x="325" y="113" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>requires more evidence</text>
				<text x="325" y="127" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>when failures are rare.</text>
			</svg>
		</div>
	);
}

export function PerceptronDiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "0.85rem 0" }}>
			<svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: "200px", display: "block", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
				{/* 2D coordinate box */}
				<rect x="30" y="20" width="250" height="140" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />

				{/* Points */}
				<circle cx="180" cy="50" r="5" fill={COLOR_TEAL} />
				<circle cx="210" cy="65" r="5" fill={COLOR_TEAL} />
				<circle cx="230" cy="40" r="5" fill={COLOR_TEAL} />
				<circle cx="200" cy="90" r="5" fill={COLOR_TEAL} />

				<circle cx="60" cy="110" r="5" fill={COLOR_ROSE} />
				<circle cx="80" cy="130" r="5" fill={COLOR_ROSE} />
				<circle cx="105" cy="140" r="5" fill={COLOR_ROSE} />
				
				{/* Misclassified student causing tilt */}
				<circle cx="120" cy="75" r="6" fill={COLOR_ROSE} stroke="#000" strokeWidth="1" />
				<text x="128" y="70" fontSize="9" fontWeight="bold" fill="#b91c1c" fontFamily={FONT_FAMILY}>Mistake Point</text>

				{/* Old line */}
				<line x1="50" y1="60" x2="220" y2="135" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
				<text x="55" y="55" fontSize="8" fill="#94a3b8" fontFamily={FONT_FAMILY}>Old Fence</text>

				{/* Tilt adjustment arrow */}
				<path d="M 140 100 Q 155 105, 155 120" fill="none" stroke="#ea580c" strokeWidth="2" markerEnd="url(#arrow)" />

				{/* Corrected new line */}
				<line x1="60" y1="35" x2="190" y2="155" stroke={COLOR_NAVY} strokeWidth="2.5" />
				<text x="175" y="152" fontSize="9" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Corrected Line</text>

				{/* Right side explainer card */}
				<rect x="300" y="20" width="180" height="140" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="312" y="44" fontSize="11" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Incremental Tilting</text>
				<text x="312" y="66" fontSize="10" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>1. Begins with a random line.</text>
				<text x="312" y="86" fontSize="10" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>2. When a point lands on the</text>
				<text x="325" y="100" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>wrong side, weights adjust</text>
				<text x="325" y="114" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>to nudge the line over.</text>
				<text x="312" y="136" fontSize="10" fill="#0f766e" fontWeight="bold" fontFamily={FONT_FAMILY}>Stops when line is clean.</text>
			</svg>
		</div>
	);
}

export function SVMDiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "0.85rem 0" }}>
			<svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: "200px", display: "block", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
				{/* 2D coordinate box */}
				<rect x="25" y="20" width="270" height="140" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />

				{/* Road surface / Safety margin fill */}
				<polygon points="90,20 180,20 250,160 160,160" fill="#f1f5f9" />

				{/* Road edges (Gutters) */}
				<line x1="90" y1="20" x2="160" y2="160" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 3" />
				<line x1="180" y1="20" x2="250" y2="160" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 3" />

				{/* Center dividing boundary (Road divider) */}
				<line x1="135" y1="20" x2="205" y2="160" stroke={COLOR_NAVY} strokeWidth="2.5" />

				{/* Students far away (non-support vectors) */}
				<circle cx="50" cy="50" r="4.5" fill={COLOR_ROSE} />
				<circle cx="65" cy="110" r="4.5" fill={COLOR_ROSE} />
				<circle cx="260" cy="60" r="4.5" fill={COLOR_TEAL} />
				<circle cx="275" cy="120" r="4.5" fill={COLOR_TEAL} />

				{/* Support vectors (touching road edge with glow halo) */}
				<circle cx="118" cy="75" r="9" fill="none" stroke="#0284c7" strokeWidth="2" />
				<circle cx="118" cy="75" r="5" fill={COLOR_ROSE} />

				<circle cx="202" cy="65" r="9" fill="none" stroke="#0284c7" strokeWidth="2" />
				<circle cx="202" cy="65" r="5" fill={COLOR_TEAL} />

				<circle cx="225" cy="110" r="9" fill="none" stroke="#0284c7" strokeWidth="2" />
				<circle cx="225" cy="110" r="5" fill={COLOR_TEAL} />

				{/* Labels on chart */}
				<text x="65" y="80" fontSize="9" fontWeight="bold" fill="#0284c7" fontFamily={FONT_FAMILY}>Support Vector</text>
				<text x="175" y="152" textAnchor="middle" fontSize="9" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Decision Line</text>

				{/* Right side explainer card */}
				<rect x="310" y="20" width="170" height="140" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="322" y="44" fontSize="11" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>The Widest Street</text>
				<text x="322" y="66" fontSize="10" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>1. Pushes the street borders</text>
				<text x="335" y="80" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>until they touch the</text>
				<text x="335" y="94" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>closest student on each side.</text>
				<text x="322" y="115" fontSize="10" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>2. Other students far from</text>
				<text x="335" y="129" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>the street edge have zero</text>
				<text x="335" y="143" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>impact on the boundary.</text>
			</svg>
		</div>
	);
}

export function TreeDiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "0.85rem 0" }}>
			<svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: "200px", display: "block", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
				{/* Left Flowchart Tree */}
				<rect x="25" y="20" width="120" height="32" rx="4" fill="#f1f5f9" stroke={COLOR_NAVY} strokeWidth="1.5" />
				<text x="85" y="40" textAnchor="middle" fontSize="10" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Exam Score ≥ 60?</text>

				{/* Branches from Q1 */}
				<line x1="85" y1="52" x2="45" y2="75" stroke={COLOR_SLATE} strokeWidth="1.5" />
				<line x1="85" y1="52" x2="135" y2="75" stroke={COLOR_SLATE} strokeWidth="1.5" />
				<text x="50" y="66" fontSize="8" fontWeight="bold" fill="#b91c1c" fontFamily={FONT_FAMILY}>No</text>
				<text x="120" y="66" fontSize="8" fontWeight="bold" fill="#15803d" fontFamily={FONT_FAMILY}>Yes</text>

				{/* Right Leaf 1: Pass */}
				<rect x="105" y="75" width="70" height="24" rx="4" fill="#ccfbf1" stroke={COLOR_TEAL} strokeWidth="1.5" />
				<text x="140" y="91" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>On-Track</text>

				{/* Question 2 */}
				<rect x="15" y="75" width="80" height="30" rx="4" fill="#f1f5f9" stroke={COLOR_NAVY} strokeWidth="1.5" />
				<text x="55" y="94" textAnchor="middle" fontSize="9" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Practice ≥ 50?</text>

				{/* Branches from Q2 */}
				<line x1="55" y1="105" x2="30" y2="125" stroke={COLOR_SLATE} strokeWidth="1.5" />
				<line x1="55" y1="105" x2="80" y2="125" stroke={COLOR_SLATE} strokeWidth="1.5" />
				<text x="32" y="117" fontSize="8" fontWeight="bold" fill="#b91c1c" fontFamily={FONT_FAMILY}>No</text>
				<text x="75" y="117" fontSize="8" fontWeight="bold" fill="#15803d" fontFamily={FONT_FAMILY}>Yes</text>

				{/* Final Leaves */}
				<rect x="5" y="125" width="50" height="24" rx="4" fill="#ffe4e6" stroke={COLOR_ROSE} strokeWidth="1.5" />
				<text x="30" y="141" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#be123c" fontFamily={FONT_FAMILY}>At-Risk</text>

				<rect x="65" y="125" width="50" height="24" rx="4" fill="#ccfbf1" stroke={COLOR_TEAL} strokeWidth="1.5" />
				<text x="90" y="141" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>On-Track</text>

				{/* Center: Corresponding 2D Grid Cut */}
				<rect x="200" y="20" width="140" height="135" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				{/* Horizontal Cut (Exam = 60) */}
				<line x1="200" y1="75" x2="340" y2="75" stroke={COLOR_NAVY} strokeWidth="2" />
				<text x="210" y="65" fontSize="8" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Cut 1: Exam = 60</text>
				{/* Vertical Cut (Practice = 50) */}
				<line x1="270" y1="75" x2="270" y2="155" stroke={COLOR_NAVY} strokeWidth="2" />
				<text x="275" y="145" fontSize="8" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Cut 2</text>

				{/* Shaded Areas */}
				<rect x="200" y="20" width="140" height="55" fill="#ccfbf1" fillOpacity="0.5" />
				<rect x="270" y="75" width="70" height="80" fill="#ccfbf1" fillOpacity="0.5" />
				<rect x="200" y="75" width="70" height="80" fill="#ffe4e6" fillOpacity="0.5" />

				{/* Right side explainer card */}
				<rect x="355" y="20" width="130" height="135" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="365" y="44" fontSize="11" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Flowchart Rules</text>
				<text x="365" y="66" fontSize="10" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>Cuts are strictly</text>
				<text x="365" y="80" fontSize="10" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>horizontal & vertical</text>
				<text x="365" y="94" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>because each step</text>
				<text x="365" y="108" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>evaluates one metric</text>
				<text x="365" y="122" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>at a time.</text>
			</svg>
		</div>
	);
}

export function RandomForestDiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "0.85rem 0" }}>
			<svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: "200px", display: "block", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
				{/* 3 Trees in Ensemble */}
				{/* Tree 1 */}
				<g transform="translate(30, 25)">
					<rect x="0" y="0" width="75" height="70" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
					<text x="37" y="18" textAnchor="middle" fontSize="9" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Tree #1</text>
					<circle cx="37" cy="30" r="3.5" fill="#f97316" />
					<line x1="37" y1="33" x2="25" y2="46" stroke="#f97316" strokeWidth="1.5" />
					<line x1="37" y1="33" x2="49" y2="46" stroke="#f97316" strokeWidth="1.5" />
					<circle cx="25" cy="48" r="3" fill="#f97316" />
					<circle cx="49" cy="48" r="3" fill="#f97316" />
					<rect x="8" y="55" width="59" height="12" rx="3" fill="#ccfbf1" />
					<text x="37" y="64" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>Vote: On-Track</text>
				</g>

				{/* Tree 2 */}
				<g transform="translate(125, 25)">
					<rect x="0" y="0" width="75" height="70" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
					<text x="37" y="18" textAnchor="middle" fontSize="9" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Tree #2</text>
					<circle cx="37" cy="30" r="3.5" fill="#f97316" />
					<line x1="37" y1="33" x2="25" y2="46" stroke="#f97316" strokeWidth="1.5" />
					<line x1="37" y1="33" x2="49" y2="46" stroke="#f97316" strokeWidth="1.5" />
					<circle cx="25" cy="48" r="3" fill="#f97316" />
					<circle cx="49" cy="48" r="3" fill="#f97316" />
					<rect x="8" y="55" width="59" height="12" rx="3" fill="#ccfbf1" />
					<text x="37" y="64" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>Vote: On-Track</text>
				</g>

				{/* Tree 3 */}
				<g transform="translate(220, 25)">
					<rect x="0" y="0" width="75" height="70" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
					<text x="37" y="18" textAnchor="middle" fontSize="9" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Tree #3</text>
					<circle cx="37" cy="30" r="3.5" fill="#f97316" />
					<line x1="37" y1="33" x2="25" y2="46" stroke="#f97316" strokeWidth="1.5" />
					<line x1="37" y1="33" x2="49" y2="46" stroke="#f97316" strokeWidth="1.5" />
					<circle cx="25" cy="48" r="3" fill="#f97316" />
					<circle cx="49" cy="48" r="3" fill="#f97316" />
					<rect x="8" y="55" width="59" height="12" rx="3" fill="#ffe4e6" />
					<text x="37" y="64" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#be123c" fontFamily={FONT_FAMILY}>Vote: At-Risk</text>
				</g>

				{/* Voting Arrows converging to committee */}
				<line x1="67" y1="95" x2="135" y2="125" stroke={COLOR_MUTED} strokeWidth="1.5" />
				<line x1="162" y1="95" x2="162" y2="125" stroke={COLOR_MUTED} strokeWidth="1.5" />
				<line x1="257" y1="95" x2="190" y2="125" stroke={COLOR_MUTED} strokeWidth="1.5" />

				{/* Consensus Box */}
				<rect x="70" y="125" width="185" height="35" rx="6" fill="#0f172a" />
				<text x="162" y="141" textAnchor="middle" fontSize="10" fill="#cbd5e1" fontFamily={FONT_FAMILY}>Democratic Consensus (2 vs 1)</text>
				<text x="162" y="154" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2dd4bf" fontFamily={FONT_FAMILY}>Majority Prediction: On-Track</text>

				{/* Right side explainer card */}
				<rect x="320" y="20" width="160" height="140" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="332" y="44" fontSize="11" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Bagging Committee</text>
				<text x="332" y="66" fontSize="10" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>1. Trains 15 to 30 trees,</text>
				<text x="345" y="80" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>each on a random sample</text>
				<text x="345" y="94" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>of students.</text>
				<text x="332" y="115" fontSize="10" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>2. Voting smooths out</text>
				<text x="345" y="129" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>the erratic quirks of</text>
				<text x="345" y="143" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>any single tree.</text>
			</svg>
		</div>
	);
}

export function XGBoostDiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "0.85rem 0" }}>
			<svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: "200px", display: "block", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
				{/* Step 1 Tree */}
				<g transform="translate(25, 25)">
					<rect x="0" y="0" width="80" height="75" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
					<text x="40" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Stage 1 Tree</text>
					<text x="40" y="32" textAnchor="middle" fontSize="8" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Base estimate</text>
					<circle cx="40" cy="46" r="4" fill="#0d9488" />
					<rect x="8" y="56" width="64" height="14" rx="3" fill="#fee2e2" />
					<text x="40" y="66" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#b91c1c" fontFamily={FONT_FAMILY}>2 Mistakes Left</text>
				</g>

				{/* Forward arrow */}
				<path d="M 112 62 L 130 62" stroke="#ea580c" strokeWidth="2.5" markerEnd="url(#arrow)" />
				<text x="121" y="54" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ea580c" fontFamily={FONT_FAMILY}>Residual</text>

				{/* Step 2 Tree */}
				<g transform="translate(138, 25)">
					<rect x="0" y="0" width="80" height="75" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
					<text x="40" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Stage 2 Tree</text>
					<text x="40" y="32" textAnchor="middle" fontSize="8" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Targets errors</text>
					<circle cx="40" cy="46" r="4" fill="#ea580c" />
					<rect x="8" y="56" width="64" height="14" rx="3" fill="#fee2e2" />
					<text x="40" y="66" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#b91c1c" fontFamily={FONT_FAMILY}>1 Mistake Left</text>
				</g>

				{/* Forward arrow */}
				<path d="M 225 62 L 243 62" stroke="#ea580c" strokeWidth="2.5" markerEnd="url(#arrow)" />

				{/* Step 3 Tree */}
				<g transform="translate(250, 25)">
					<rect x="0" y="0" width="80" height="75" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
					<text x="40" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Stage 3 Tree</text>
					<text x="40" y="32" textAnchor="middle" fontSize="8" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Fine-tunes fit</text>
					<circle cx="40" cy="46" r="4" fill="#0d9488" />
					<rect x="8" y="56" width="64" height="14" rx="3" fill="#dcfce7" />
					<text x="40" y="66" textAnchor="middle" fontSize="7.5" fontWeight="bold" fill="#15803d" fontFamily={FONT_FAMILY}>0 Mistakes</text>
				</g>

				{/* Bottom Formula Banner */}
				<rect x="25" y="115" width="305" height="45" rx="6" fill="#0f172a" />
				<text x="177" y="132" textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily={FONT_FAMILY}>Sequential Additive Model:</text>
				<text x="177" y="148" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#38bdf8" fontFamily={FONT_FAMILY}>Prediction = Tree 1 + (η × Tree 2) + (η × Tree 3)</text>

				{/* Right side explainer card */}
				<rect x="345" y="20" width="135" height="140" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="355" y="44" fontSize="11" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Relay Correction</text>
				<text x="355" y="66" fontSize="10" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>Trees train in a</text>
				<text x="355" y="80" fontSize="10" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>chain. Each new tree</text>
				<text x="355" y="94" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>specifically fixes the</text>
				<text x="355" y="108" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>residual errors left</text>
				<text x="355" y="122" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>by previous trees.</text>
			</svg>
		</div>
	);
}

export function CBADiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "0.85rem 0" }}>
			<svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: "200px", display: "block", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
				{/* 3x3 Rubric Grid on left */}
				<g transform="translate(30, 20)">
					{/* Grid background */}
					<rect x="0" y="0" width="150" height="135" rx="4" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />

					{/* Grid lines */}
					<line x1="50" y1="0" x2="50" y2="135" stroke="#e2e8f0" strokeWidth="1.5" />
					<line x1="100" y1="0" x2="100" y2="135" stroke="#e2e8f0" strokeWidth="1.5" />
					<line x1="0" y1="45" x2="150" y2="45" stroke="#e2e8f0" strokeWidth="1.5" />
					<line x1="0" y1="90" x2="150" y2="90" stroke="#e2e8f0" strokeWidth="1.5" />

					{/* High Exam + High Practice tile (Top Right) */}
					<rect x="100" y="0" width="50" height="45" fill="#ccfbf1" fillOpacity="0.7" />
					<circle cx="115" cy="15" r="3.5" fill={COLOR_TEAL} />
					<circle cx="130" cy="22" r="3.5" fill={COLOR_TEAL} />
					<circle cx="120" cy="35" r="3.5" fill={COLOR_TEAL} />
					<text x="125" y="42" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>Pass Rule</text>

					{/* Low Exam + Low Practice tile (Bottom Left) */}
					<rect x="0" y="90" width="50" height="45" fill="#ffe4e6" fillOpacity="0.7" />
					<circle cx="15" cy="105" r="3.5" fill={COLOR_ROSE} />
					<circle cx="30" cy="115" r="3.5" fill={COLOR_ROSE} />
					<circle cx="20" cy="125" r="3.5" fill={COLOR_ROSE} />
					<text x="25" y="132" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#be123c" fontFamily={FONT_FAMILY}>Risk Rule</text>

					{/* Other dots */}
					<circle cx="75" cy="25" r="3" fill={COLOR_TEAL} />
					<circle cx="75" cy="110" r="3" fill={COLOR_ROSE} />

					{/* Axis labels */}
					<text x="75" y="150" textAnchor="middle" fontSize="9" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Practice Bands (Low / Med / High)</text>
				</g>

				{/* Center: Mined Association Rules Card */}
				<rect x="200" y="20" width="145" height="135" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="210" y="42" fontSize="10" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Mined Association Rules</text>

				<rect x="208" y="52" width="130" height="34" rx="4" fill="#f0fdfa" stroke="#99f6e4" />
				<text x="214" y="65" fontSize="8" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>IF High Practice & High Exam</text>
				<text x="214" y="78" fontSize="8" fill="#0f766e" fontFamily={FONT_FAMILY}>THEN On-Track (100% Conf)</text>

				<rect x="208" y="94" width="130" height="34" rx="4" fill="#fff1f2" stroke="#fecdd3" />
				<text x="214" y="107" fontSize="8" fontWeight="bold" fill="#be123c" fontFamily={FONT_FAMILY}>IF Low Practice & Low Exam</text>
				<text x="214" y="120" fontSize="8" fill="#be123c" fontFamily={FONT_FAMILY}>THEN At-Risk (92% Conf)</text>

				{/* Right side explainer card */}
				<rect x="355" y="20" width="130" height="135" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="365" y="44" fontSize="11" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Rubric Tiles</text>
				<text x="365" y="66" fontSize="10" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>Discretizes continuous</text>
				<text x="365" y="80" fontSize="10" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>scores into rubric boxes.</text>
				<text x="365" y="100" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Extracts auditable</text>
				<text x="365" y="114" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>if-then rules matching</text>
				<text x="365" y="128" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>school grading rubrics.</text>
			</svg>
		</div>
	);
}

export function ANNDiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "0.85rem 0" }}>
			<svg viewBox="0 0 500 180" width="100%" style={{ maxHeight: "200px", display: "block", background: "#f8fafc", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
				{/* Neural Network Architecture on left */}
				<g transform="translate(40, 25)">
					{/* Input Layer */}
					<circle cx="30" cy="40" r="14" fill="#ffffff" stroke={COLOR_NAVY} strokeWidth="2" />
					<text x="30" y="44" textAnchor="middle" fontSize="9" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>X</text>

					<circle cx="30" cy="95" r="14" fill="#ffffff" stroke={COLOR_NAVY} strokeWidth="2" />
					<text x="30" y="99" textAnchor="middle" fontSize="9" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Y</text>

					<text x="30" y="125" textAnchor="middle" fontSize="9" fontWeight="bold" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Inputs</text>

					{/* Hidden Layer */}
					<circle cx="120" cy="25" r="13" fill="#f0fdfa" stroke={COLOR_TEAL} strokeWidth="2" />
					<circle cx="120" cy="68" r="13" fill="#f0fdfa" stroke={COLOR_TEAL} strokeWidth="2" />
					<circle cx="120" cy="110" r="13" fill="#f0fdfa" stroke={COLOR_TEAL} strokeWidth="2" />
					<text x="120" y="135" textAnchor="middle" fontSize="9" fontWeight="bold" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Hidden</text>

					{/* Output Layer */}
					<circle cx="210" cy="68" r="14" fill="#fff1f2" stroke={COLOR_ROSE} strokeWidth="2" />
					<text x="210" y="72" textAnchor="middle" fontSize="8" fontWeight="bold" fill={COLOR_ROSE} fontFamily={FONT_FAMILY}>Risk</text>
					<text x="210" y="98" textAnchor="middle" fontSize="9" fontWeight="bold" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Output</text>

					{/* Connecting Synapse Lines (Input to Hidden) */}
					<line x1="44" y1="40" x2="107" y2="25" stroke="#94a3b8" strokeWidth="1.5" />
					<line x1="44" y1="40" x2="107" y2="68" stroke="#94a3b8" strokeWidth="2" />
					<line x1="44" y1="40" x2="107" y2="110" stroke="#94a3b8" strokeWidth="1" />

					<line x1="44" y1="95" x2="107" y2="25" stroke="#94a3b8" strokeWidth="1" />
					<line x1="44" y1="95" x2="107" y2="68" stroke="#94a3b8" strokeWidth="1.5" />
					<line x1="44" y1="95" x2="107" y2="110" stroke="#94a3b8" strokeWidth="2" />

					{/* Connecting Synapse Lines (Hidden to Output) */}
					<line x1="133" y1="25" x2="196" y2="68" stroke="#94a3b8" strokeWidth="2" />
					<line x1="133" y1="68" x2="196" y2="68" stroke="#94a3b8" strokeWidth="1.5" />
					<line x1="133" y1="110" x2="196" y2="68" stroke="#94a3b8" strokeWidth="2" />
				</g>

				{/* Right side explainer card */}
				<rect x="290" y="20" width="190" height="140" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="302" y="44" fontSize="11" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Connected Artificial Neurons</text>

				<rect x="302" y="55" width="168" height="36" rx="4" fill="#f0fdfa" />
				<text x="308" y="70" fontSize="9" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>Forward Pass (Signal):</text>
				<text x="308" y="83" fontSize="8.5" fill="#0f766e" fontFamily={FONT_FAMILY}>Passes features forward to predict risk</text>

				<rect x="302" y="100" width="168" height="36" rx="4" fill="#fff1f2" />
				<text x="308" y="115" fontSize="9" fontWeight="bold" fill="#be123c" fontFamily={FONT_FAMILY}>Backpropagation (Learning):</text>
				<text x="308" y="128" fontSize="8.5" fill="#be123c" fontFamily={FONT_FAMILY}>Nudges connection weights after mistakes</text>
			</svg>
		</div>
	);
}
