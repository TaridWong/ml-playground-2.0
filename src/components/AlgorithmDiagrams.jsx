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
		<div className="algo-diagram-container" style={{ margin: "1rem 0" }}>
			<svg viewBox="0 0 720 260" width="100%" style={{ maxHeight: "300px", display: "block", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
				{/* Canvas frame on left */}
				<rect x="25" y="20" width="310" height="220" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<line x1="25" y1="125" x2="335" y2="125" stroke="#f1f5f9" strokeWidth="1.5" />
				<line x1="170" y1="20" x2="170" y2="240" stroke="#f1f5f9" strokeWidth="1.5" />

				{/* Surrounding background dots located safely in outer corners */}
				<circle cx="55" cy="55" r="6" fill={COLOR_TEAL} />
				<circle cx="85" cy="45" r="6" fill={COLOR_TEAL} />
				<circle cx="290" cy="50" r="6" fill={COLOR_TEAL} />
				<circle cx="305" cy="75" r="6" fill={COLOR_TEAL} />
				<circle cx="55" cy="165" r="6" fill={COLOR_ROSE} />
				<circle cx="75" cy="195" r="6" fill={COLOR_ROSE} />
				<circle cx="295" cy="175" r="6" fill={COLOR_ROSE} />

				{/* Neighborhood circle (K = 5) */}
				<circle cx="170" cy="115" r="65" fill="#f0fdfa" fillOpacity="0.6" stroke={COLOR_TEAL} strokeWidth="2.5" strokeDasharray="5 4" />

				{/* Points inside neighborhood */}
				<circle cx="140" cy="85" r="6" fill={COLOR_TEAL} />
				<circle cx="205" cy="80" r="6" fill={COLOR_TEAL} />
				<circle cx="150" cy="150" r="6" fill={COLOR_TEAL} />
				<circle cx="200" cy="140" r="6" fill={COLOR_TEAL} />
				<circle cx="215" cy="115" r="6" fill={COLOR_ROSE} />

				{/* Target student in center */}
				<circle cx="170" cy="115" r="11" fill="#ffffff" stroke={COLOR_NAVY} strokeWidth="2.5" />
				<text x="170" y="120" textAnchor="middle" fontSize="13" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>?</text>

				{/* Clear label pill at bottom with zero dot overlap */}
				<rect x="65" y="202" width="210" height="24" rx="4" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
				<text x="170" y="218" textAnchor="middle" fontSize="11" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Dashed circle = 5 closest peers</text>

				{/* Right side voting ballot */}
				<rect x="360" y="20" width="335" height="220" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="380" y="52" fontSize="15" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Peer Voting Consensus (K = 5)</text>

				{/* Vote tally row */}
				<circle cx="395" cy="88" r="8" fill={COLOR_TEAL} />
				<text x="415" y="93" fontSize="13" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>4 On-Track peers</text>

				<circle cx="395" cy="122" r="8" fill={COLOR_ROSE} />
				<text x="415" y="127" fontSize="13" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>1 At-Risk peer</text>

				{/* Conclusion banner */}
				<rect x="380" y="148" width="295" height="38" rx="6" fill="#ccfbf1" stroke="#99f6e4" strokeWidth="1" />
				<text x="527" y="172" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>Majority Vote: Predicts On-Track</text>
				<text x="380" y="205" fontSize="11" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Classifies unseen students by finding their</text>
				<text x="380" y="221" fontSize="11" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>5 closest peer neighbors.</text>
			</svg>
		</div>
	);
}

export function LogisticDiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "1rem 0" }}>
			<svg viewBox="0 0 720 260" width="100%" style={{ maxHeight: "300px", display: "block", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
				{/* Plot frame on left */}
				<rect x="25" y="20" width="410" height="220" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />

				{/* Shaded Threshold Regions */}
				<rect x="75" y="35" width="330" height="85" fill="#ffe4e6" fillOpacity="0.4" />
				<rect x="75" y="120" width="330" height="85" fill="#ccfbf1" fillOpacity="0.35" />

				{/* 50% Threshold line */}
				<line x1="75" y1="120" x2="405" y2="120" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="5 4" />
				<rect x="290" y="105" width="112" height="18" rx="3" fill="#ffffff" stroke="#fecdd3" strokeWidth="1" />
				<text x="346" y="118" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#e11d48" fontFamily={FONT_FAMILY}>Alert Cutoff (50%)</text>

				{/* Axes */}
				<line x1="75" y1="205" x2="405" y2="205" stroke={COLOR_SLATE} strokeWidth="1.5" />
				<line x1="75" y1="35" x2="75" y2="205" stroke={COLOR_SLATE} strokeWidth="1.5" />

				<text x="240" y="225" textAnchor="middle" fontSize="11" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Student Risk Factor Index →</text>
				<text x="65" y="45" textAnchor="end" fontSize="11" fontWeight="bold" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>100%</text>
				<text x="65" y="124" textAnchor="end" fontSize="11" fontWeight="bold" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>50%</text>
				<text x="65" y="205" textAnchor="end" fontSize="11" fontWeight="bold" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>0%</text>

				{/* Standard Upward Sigmoid S Curve (0% to 100%) */}
				<path d="M 75 198 C 170 198, 195 120, 240 120 C 285 120, 310 42, 405 42" fill="none" stroke={COLOR_NAVY} strokeWidth="3.5" />

				{/* Dots along the curve */}
				<circle cx="120" cy="195" r="6" fill={COLOR_TEAL} stroke="#ffffff" strokeWidth="1.5" />
				<circle cx="170" cy="180" r="6" fill={COLOR_TEAL} stroke="#ffffff" strokeWidth="1.5" />
				<circle cx="310" cy="60" r="6" fill={COLOR_ROSE} stroke="#ffffff" strokeWidth="1.5" />
				<circle cx="360" cy="45" r="6" fill={COLOR_ROSE} stroke="#ffffff" strokeWidth="1.5" />

				{/* Right side explainer card */}
				<rect x="455" y="20" width="240" height="220" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="470" y="52" fontSize="15" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>S-Shaped Probability</text>

				<rect x="470" y="68" width="210" height="65" rx="6" fill="#fee2e2" stroke="#fca5a5" strokeWidth="1" />
				<text x="482" y="88" fontSize="12" fontWeight="bold" fill="#b91c1c" fontFamily={FONT_FAMILY}>Above Cutoff (≥ 50%):</text>
				<text x="482" y="105" fontSize="11" fill="#b91c1c" fontFamily={FONT_FAMILY}>High probability of struggle.</text>
				<text x="482" y="121" fontSize="11" fontWeight="600" fill="#991b1b" fontFamily={FONT_FAMILY}>Flag for proactive intervention.</text>

				<rect x="470" y="145" width="210" height="65" rx="6" fill="#dcfce7" stroke="#86efac" strokeWidth="1" />
				<text x="482" y="165" fontSize="12" fontWeight="bold" fill="#15803d" fontFamily={FONT_FAMILY}>Below Cutoff (&lt; 50%):</text>
				<text x="482" y="182" fontSize="11" fill="#15803d" fontFamily={FONT_FAMILY}>Low probability of struggle.</text>
				<text x="482" y="198" fontSize="11" fontWeight="600" fill="#166534" fontFamily={FONT_FAMILY}>Keep student on track.</text>
			</svg>
		</div>
	);
}

export function NaiveBayesDiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "1rem 0" }}>
			<svg viewBox="0 0 720 260" width="100%" style={{ maxHeight: "300px", display: "block", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
				{/* 2D coordinate box */}
				<rect x="25" y="20" width="370" height="220" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />

				{/* On-Track Gaussian Cloud (Teal - no box) */}
				<ellipse cx="275" cy="95" rx="80" ry="50" fill="#ccfbf1" fillOpacity="0.4" stroke={COLOR_TEAL} strokeWidth="1.5" strokeDasharray="4 3" />
				<ellipse cx="275" cy="95" rx="50" ry="30" fill="#ccfbf1" fillOpacity="0.75" stroke={COLOR_TEAL} strokeWidth="2" />
				<circle cx="275" cy="95" r="5" fill={COLOR_TEAL} />
				<text x="275" y="85" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>On-Track Cloud</text>

				{/* At-Risk Gaussian Cloud (Rose - no box) */}
				<ellipse cx="120" cy="160" rx="75" ry="45" fill="#ffe4e6" fillOpacity="0.4" stroke={COLOR_ROSE} strokeWidth="1.5" strokeDasharray="4 3" />
				<ellipse cx="120" cy="160" rx="45" ry="26" fill="#ffe4e6" fillOpacity="0.75" stroke={COLOR_ROSE} strokeWidth="2" />
				<circle cx="120" cy="160" r="5" fill={COLOR_ROSE} />
				<text x="120" y="150" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#be123c" fontFamily={FONT_FAMILY}>At-Risk Cloud</text>

				{/* Boundary curve where densities match */}
				<path d="M 170 20 Q 205 130, 230 240" fill="none" stroke={COLOR_NAVY} strokeWidth="3" />
				<text x="247" y="47" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Equal Odds Boundary</text>

				{/* Right side explainer card */}
				<rect x="415" y="20" width="280" height="220" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="432" y="52" fontSize="15" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Bell Curve Clouds</text>
				<text x="432" y="82" fontSize="12" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>1. Computes group averages:</text>
				<text x="448" y="100" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Finds center score and spread</text>
				<text x="448" y="116" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>for both student groups.</text>
				<text x="432" y="145" fontSize="12" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>2. Factors in school base rates:</text>
				<text x="448" y="163" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Requires stronger evidence</text>
				<text x="448" y="179" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>when failures are rare.</text>
				<text x="432" y="210" fontSize="11" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>Combines probabilities independently.</text>
			</svg>
		</div>
	);
}

export function PerceptronDiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "1rem 0" }}>
			<svg viewBox="0 0 720 260" width="100%" style={{ maxHeight: "300px", display: "block", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
				<defs>
					<marker id="arrow-percep" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
						<path d="M 0 1 L 10 5 L 0 9 z" fill="#ea580c" />
					</marker>
				</defs>

				{/* 2D coordinate box */}
				<rect x="25" y="20" width="370" height="220" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />

				{/* Points */}
				<circle cx="270" cy="60" r="6" fill={COLOR_TEAL} />
				<circle cx="310" cy="85" r="6" fill={COLOR_TEAL} />
				<circle cx="335" cy="50" r="6" fill={COLOR_TEAL} />
				<circle cx="290" cy="120" r="6" fill={COLOR_TEAL} />

				<circle cx="65" cy="140" r="6" fill={COLOR_ROSE} />
				<circle cx="95" cy="175" r="6" fill={COLOR_ROSE} />
				<circle cx="130" cy="195" r="6" fill={COLOR_ROSE} />

				{/* Misclassified student causing tilt */}
				<circle cx="160" cy="100" r="8" fill={COLOR_ROSE} stroke="#000000" strokeWidth="1.5" />
				<text x="175" y="104" textAnchor="start" fontSize="11" fontWeight="bold" fill="#b91c1c" fontFamily={FONT_FAMILY}>Mistake Point</text>

				{/* Old line */}
				<line x1="60" y1="80" x2="320" y2="180" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 4" />
				<text x="75" y="112" fontSize="11" fontWeight="bold" fill="#64748b" fontFamily={FONT_FAMILY}>Old Fence</text>

				{/* Tilt adjustment arrow */}
				<path d="M 180 125 A 40 40 0 0 1 205 160" fill="none" stroke="#ea580c" strokeWidth="2.5" markerEnd="url(#arrow-percep)" />
				<text x="220" y="145" fontSize="10.5" fontWeight="bold" fill="#ea580c" fontFamily={FONT_FAMILY}>Tilt</text>

				{/* Corrected new line */}
				<line x1="80" y1="35" x2="260" y2="225" stroke={COLOR_NAVY} strokeWidth="3" />
				<text x="268" y="224" fontSize="11" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Corrected Line</text>

				{/* Right side explainer card */}
				<rect x="415" y="20" width="280" height="220" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="432" y="52" fontSize="15" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Incremental Tilting</text>
				<text x="432" y="82" fontSize="12" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>1. Begins with a random line.</text>
				<text x="432" y="112" fontSize="12" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>2. Corrects on each mistake:</text>
				<text x="448" y="130" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>When a student lands on</text>
				<text x="448" y="146" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>the wrong side, weights tilt</text>
				<text x="448" y="162" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>the fence over to fix it.</text>
				<rect x="432" y="180" width="245" height="34" rx="4" fill="#ccfbf1" stroke="#99f6e4" />
				<text x="554" y="201" textAnchor="middle" fontSize="11.5" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>Stops once all students are clean.</text>
			</svg>
		</div>
	);
}

export function SVMDiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "1rem 0" }}>
			<svg viewBox="0 0 720 260" width="100%" style={{ maxHeight: "300px", display: "block", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
				{/* 2D coordinate box */}
				<rect x="25" y="20" width="390" height="220" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />

				{/* Road surface / Safety margin fill */}
				<polygon points="120,20 240,20 340,240 220,240" fill="#e0f2fe" fillOpacity="0.45" />

				{/* Road edges (Gutters) */}
				<line x1="120" y1="20" x2="220" y2="240" stroke="#0284c7" strokeWidth="2" strokeDasharray="5 4" />
				<line x1="240" y1="20" x2="340" y2="240" stroke="#0284c7" strokeWidth="2" strokeDasharray="5 4" />

				{/* Center dividing boundary (Road divider) */}
				<line x1="180" y1="20" x2="280" y2="240" stroke={COLOR_NAVY} strokeWidth="3" />

				{/* Clear Safety Margin Explanation Text inside street (30% smaller, moved right) */}
				<text x="265" y="42" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0284c7" fontFamily={FONT_FAMILY}>Safety Margin (Street)</text>
				<text x="265" y="55" textAnchor="middle" fontSize="6.8" fill="#64748b" fontFamily={FONT_FAMILY}>Empty buffer separating groups</text>

				{/* Students far away (non-support vectors) */}
				<circle cx="55" cy="60" r="5" fill={COLOR_ROSE} />
				<circle cx="70" cy="165" r="5" fill={COLOR_ROSE} />
				<circle cx="365" cy="65" r="5" fill={COLOR_TEAL} />
				<circle cx="375" cy="130" r="5" fill={COLOR_TEAL} />

				{/* Support vectors (touching road edge with glow halo - no boxes) */}
				<circle cx="165" cy="115" r="13" fill="none" stroke="#0284c7" strokeWidth="2" />
				<circle cx="165" cy="115" r="6" fill={COLOR_ROSE} />
				<text x="45" y="119" fontSize="11" fontWeight="bold" fill="#0284c7" fontFamily={FONT_FAMILY}>Support Vector</text>
				<line x1="135" y1="115" x2="152" y2="115" stroke="#0284c7" strokeWidth="1.5" />

				<circle cx="275" cy="95" r="13" fill="none" stroke="#0284c7" strokeWidth="2" />
				<circle cx="275" cy="95" r="6" fill={COLOR_TEAL} />

				<circle cx="305" cy="160" r="13" fill="none" stroke="#0284c7" strokeWidth="2" />
				<circle cx="305" cy="160" r="6" fill={COLOR_TEAL} />

				<text x="320" y="200" fontSize="11" fontWeight="bold" fill="#0284c7" fontFamily={FONT_FAMILY}>Support Vector</text>
				<line x1="315" y1="188" x2="308" y2="173" stroke="#0284c7" strokeWidth="1.5" />

				{/* Decision Line Text at bottom (no box) */}
				<text x="230" y="228" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Decision Line</text>

				{/* Right side explainer card */}
				<rect x="420" y="20" width="280" height="225" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="435" y="46" fontSize="14" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>The Widest Street</text>
				<text x="435" y="70" fontSize="11" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>1. Maximizes safety margin:</text>
				<text x="448" y="86" fontSize="10.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Widens the shaded street until it</text>
				<text x="448" y="100" fontSize="10.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>touches the closest students.</text>

				<text x="435" y="122" fontSize="11" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>2. Support Vectors matter most:</text>
				<text x="448" y="138" fontSize="10.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Only edge students hold the road.</text>
				<text x="448" y="152" fontSize="10.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Outer students have zero effect.</text>

				<text x="435" y="174" fontSize="11" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>3. Students inside the empty buffer:</text>
				<text x="448" y="190" fontSize="10.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Indicate noisy overlap. Soft margins</text>
				<text x="448" y="204" fontSize="10.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>tolerate intrusions, while kernels</text>
				<text x="448" y="218" fontSize="10.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>bend space to resolve boundaries.</text>
			</svg>
		</div>
	);
}

export function TreeDiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "1rem 0" }}>
			<svg viewBox="0 0 720 260" width="100%" style={{ maxHeight: "300px", display: "block", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
				{/* Left Flowchart Tree */}
				<rect x="20" y="25" width="170" height="42" rx="6" fill="#f1f5f9" stroke={COLOR_NAVY} strokeWidth="2" />
				<text x="105" y="51" textAnchor="middle" fontSize="13" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Exam Score ≥ 60?</text>

				{/* Branches from Q1 */}
				<line x1="65" y1="67" x2="45" y2="95" stroke={COLOR_SLATE} strokeWidth="1.5" />
				<line x1="145" y1="67" x2="165" y2="95" stroke={COLOR_SLATE} strokeWidth="1.5" />
				<text x="42" y="82" fontSize="10.5" fontWeight="bold" fill="#b91c1c" fontFamily={FONT_FAMILY}>No</text>
				<text x="168" y="82" fontSize="10.5" fontWeight="bold" fill="#15803d" fontFamily={FONT_FAMILY}>Yes</text>

				{/* Right Leaf 1: Pass */}
				<rect x="135" y="95" width="85" height="34" rx="6" fill="#ccfbf1" stroke={COLOR_TEAL} strokeWidth="2" />
				<text x="177" y="117" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>On-Track</text>

				{/* Question 2 */}
				<rect x="15" y="95" width="105" height="40" rx="6" fill="#f1f5f9" stroke={COLOR_NAVY} strokeWidth="1.5" />
				<text x="67" y="120" textAnchor="middle" fontSize="11.5" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Practice ≥ 50?</text>

				{/* Branches from Q2 */}
				<line x1="40" y1="135" x2="30" y2="165" stroke={COLOR_SLATE} strokeWidth="1.5" />
				<line x1="95" y1="135" x2="105" y2="165" stroke={COLOR_SLATE} strokeWidth="1.5" />
				<text x="22" y="152" fontSize="10" fontWeight="bold" fill="#b91c1c" fontFamily={FONT_FAMILY}>No</text>
				<text x="110" y="152" fontSize="10" fontWeight="bold" fill="#15803d" fontFamily={FONT_FAMILY}>Yes</text>

				{/* Final Leaves */}
				<rect x="5" y="165" width="68" height="34" rx="6" fill="#ffe4e6" stroke={COLOR_ROSE} strokeWidth="1.5" />
				<text x="39" y="187" textAnchor="middle" fontSize="11.5" fontWeight="bold" fill="#be123c" fontFamily={FONT_FAMILY}>At-Risk</text>

				<rect x="80" y="165" width="68" height="34" rx="6" fill="#ccfbf1" stroke={COLOR_TEAL} strokeWidth="1.5" />
				<text x="114" y="187" textAnchor="middle" fontSize="11.5" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>On-Track</text>

				{/* Center: Corresponding 2D Grid Cut */}
				<rect x="235" y="25" width="220" height="210" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				{/* Shaded Areas */}
				<rect x="235" y="25" width="220" height="85" fill="#ccfbf1" fillOpacity="0.45" rx="8" />
				<rect x="345" y="110" width="110" height="125" fill="#ccfbf1" fillOpacity="0.45" />
				<rect x="235" y="110" width="110" height="125" fill="#ffe4e6" fillOpacity="0.5" />

				{/* Horizontal Cut (Exam = 60 - no box, smaller font) */}
				<line x1="235" y1="110" x2="455" y2="110" stroke={COLOR_NAVY} strokeWidth="2.5" />
				<text x="315" y="100" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Cut 1: Exam = 60</text>

				{/* Vertical Cut (Practice = 50 - no box, smaller font) */}
				<line x1="345" y1="110" x2="345" y2="235" stroke={COLOR_NAVY} strokeWidth="2.5" />
				<text x="352" y="218" textAnchor="start" fontSize="8.5" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Cut 2: Practice = 50</text>

				{/* Right side explainer card */}
				<rect x="475" y="25" width="220" height="210" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="492" y="55" fontSize="15" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Flowchart Rules</text>
				<text x="492" y="85" fontSize="12" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>1. Axis-aligned cuts:</text>
				<text x="508" y="103" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Cuts are strictly horizontal</text>
				<text x="508" y="119" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>and vertical grid lines.</text>
				<text x="492" y="147" fontSize="12" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>2. Step-by-step logic:</text>
				<text x="508" y="165" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Evaluates one metric at a</text>
				<text x="508" y="181" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>time, just like a checklist.</text>
				<text x="492" y="212" fontSize="11" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>Highly auditable and readable.</text>
			</svg>
		</div>
	);
}

export function RandomForestDiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "1rem 0" }}>
			<svg viewBox="0 0 720 260" width="100%" style={{ maxHeight: "300px", display: "block", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
				{/* 3 Trees in Ensemble */}
				{/* Tree 1 */}
				<g transform="translate(25, 25)">
					<rect x="0" y="0" width="105" height="105" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
					<text x="52" y="22" textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Tree #1</text>
					<circle cx="52" cy="40" r="4.5" fill="#f97316" />
					<line x1="52" y1="44" x2="35" y2="60" stroke="#f97316" strokeWidth="2" />
					<line x1="52" y1="44" x2="69" y2="60" stroke="#f97316" strokeWidth="2" />
					<circle cx="35" cy="62" r="4" fill="#f97316" />
					<circle cx="69" cy="62" r="4" fill="#f97316" />
					<rect x="10" y="75" width="85" height="20" rx="4" fill="#ccfbf1" />
					<text x="52" y="89" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>Vote: On-Track</text>
				</g>

				{/* Tree 2 */}
				<g transform="translate(145, 25)">
					<rect x="0" y="0" width="105" height="105" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
					<text x="52" y="22" textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Tree #2</text>
					<circle cx="52" cy="40" r="4.5" fill="#f97316" />
					<line x1="52" y1="44" x2="35" y2="60" stroke="#f97316" strokeWidth="2" />
					<line x1="52" y1="44" x2="69" y2="60" stroke="#f97316" strokeWidth="2" />
					<circle cx="35" cy="62" r="4" fill="#f97316" />
					<circle cx="69" cy="62" r="4" fill="#f97316" />
					<rect x="10" y="75" width="85" height="20" rx="4" fill="#ccfbf1" />
					<text x="52" y="89" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>Vote: On-Track</text>
				</g>

				{/* Tree 3 */}
				<g transform="translate(265, 25)">
					<rect x="0" y="0" width="105" height="105" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
					<text x="52" y="22" textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Tree #3</text>
					<circle cx="52" cy="40" r="4.5" fill="#f97316" />
					<line x1="52" y1="44" x2="35" y2="60" stroke="#f97316" strokeWidth="2" />
					<line x1="52" y1="44" x2="69" y2="60" stroke="#f97316" strokeWidth="2" />
					<circle cx="35" cy="62" r="4" fill="#f97316" />
					<circle cx="69" cy="62" r="4" fill="#f97316" />
					<rect x="10" y="75" width="85" height="20" rx="4" fill="#fee2e2" />
					<text x="52" y="89" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#be123c" fontFamily={FONT_FAMILY}>Vote: At-Risk</text>
				</g>

				{/* Voting Arrows converging to committee */}
				<line x1="77" y1="130" x2="165" y2="160" stroke={COLOR_MUTED} strokeWidth="2" />
				<line x1="197" y1="130" x2="197" y2="160" stroke={COLOR_MUTED} strokeWidth="2" />
				<line x1="317" y1="130" x2="230" y2="160" stroke={COLOR_MUTED} strokeWidth="2" />

				{/* Consensus Box */}
				<rect x="65" y="160" width="265" height="58" rx="8" fill="#0f172a" />
				<text x="197" y="182" textAnchor="middle" fontSize="12" fill="#cbd5e1" fontFamily={FONT_FAMILY}>Democratic Consensus (2 vs 1)</text>
				<text x="197" y="203" textAnchor="middle" fontSize="13.5" fontWeight="bold" fill="#2dd4bf" fontFamily={FONT_FAMILY}>Majority Prediction: On-Track</text>

				{/* Right side explainer card */}
				<rect x="395" y="25" width="300" height="210" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="412" y="55" fontSize="15" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Bagging Committee</text>
				<text x="412" y="85" fontSize="12" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>1. Trains 15 to 30 diverse trees:</text>
				<text x="428" y="103" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Each tree trains on a random</text>
				<text x="428" y="119" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>subsample of students.</text>
				<text x="412" y="147" fontSize="12" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>2. Voting smooths out mistakes:</text>
				<text x="428" y="165" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Voting cancels out the erratic</text>
				<text x="428" y="181" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>mistakes of any single tree.</text>
				<text x="412" y="212" fontSize="11" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>Far more resilient and stable.</text>
			</svg>
		</div>
	);
}

export function XGBoostDiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "1rem 0" }}>
			<svg viewBox="0 0 720 260" width="100%" style={{ maxHeight: "300px", display: "block", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
				<defs>
					<marker id="arrow-xgb-1" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
						<path d="M 0 1 L 10 5 L 0 9 z" fill="#ea580c" />
					</marker>
					<marker id="arrow-xgb-2" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
						<path d="M 0 1 L 10 5 L 0 9 z" fill="#ea580c" />
					</marker>
				</defs>

				{/* Step 1 Tree */}
				<g transform="translate(20, 25)">
					<rect x="0" y="0" width="96" height="105" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
					<text x="48" y="22" textAnchor="middle" fontSize="11.5" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Stage 1 Tree</text>
					<text x="48" y="39" textAnchor="middle" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Base estimate</text>
					<circle cx="48" cy="56" r="5" fill="#0d9488" />
					<rect x="8" y="72" width="80" height="20" rx="4" fill="#fee2e2" />
					<text x="48" y="86" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#b91c1c" fontFamily={FONT_FAMILY}>2 Mistakes Left</text>
				</g>

				{/* Forward arrow with widened gap so Residual never gets squeezed */}
				<path d="M 124 77 L 164 77" stroke="#ea580c" strokeWidth="2.5" markerEnd="url(#arrow-xgb-1)" />
				<text x="144" y="60" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#ea580c" fontFamily={FONT_FAMILY}>Residual</text>

				{/* Step 2 Tree */}
				<g transform="translate(172, 25)">
					<rect x="0" y="0" width="96" height="105" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
					<text x="48" y="22" textAnchor="middle" fontSize="11.5" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Stage 2 Tree</text>
					<text x="48" y="39" textAnchor="middle" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Targets errors</text>
					<circle cx="48" cy="56" r="5" fill="#0d9488" />
					<rect x="8" y="72" width="80" height="20" rx="4" fill="#fee2e2" />
					<text x="48" y="86" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#b91c1c" fontFamily={FONT_FAMILY}>1 Mistake Left</text>
				</g>

				{/* Forward arrow */}
				<path d="M 276 77 L 316 77" stroke="#ea580c" strokeWidth="2.5" markerEnd="url(#arrow-xgb-2)" />

				{/* Step 3 Tree */}
				<g transform="translate(324, 25)">
					<rect x="0" y="0" width="96" height="105" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
					<text x="48" y="22" textAnchor="middle" fontSize="11.5" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Stage 3 Tree</text>
					<text x="48" y="39" textAnchor="middle" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Fine-tunes fit</text>
					<circle cx="48" cy="56" r="5" fill="#0d9488" />
					<rect x="8" y="72" width="80" height="20" rx="4" fill="#dcfce7" />
					<text x="48" y="86" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#15803d" fontFamily={FONT_FAMILY}>0 Mistakes</text>
				</g>

				{/* Bottom Formula Banner */}
				<rect x="20" y="155" width="400" height="65" rx="8" fill="#0f172a" />
				<text x="220" y="178" textAnchor="middle" fontSize="12" fill="#94a3b8" fontFamily={FONT_FAMILY}>Sequential Additive Model:</text>
				<text x="220" y="202" textAnchor="middle" fontSize="12.5" fontWeight="bold" fill="#38bdf8" fontFamily={FONT_FAMILY}>Prediction = Tree 1 + (η × Tree 2) + (η × Tree 3)</text>

				{/* Right side explainer card */}
				<rect x="435" y="25" width="265" height="210" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="447" y="55" fontSize="15" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Relay Correction</text>
				<text x="447" y="85" fontSize="12" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>1. Trains in a relay sequence:</text>
				<text x="463" y="103" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Each new tree specifically</text>
				<text x="463" y="119" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>fixes previous errors.</text>
				<text x="447" y="147" fontSize="12" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>2. Learning rate shrinkage (η):</text>
				<text x="463" y="165" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Scales down tree impact to</text>
				<text x="463" y="181" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>prevent memorizing noise.</text>
				<text x="447" y="212" fontSize="11" fontWeight="bold" fill="#0284c7" fontFamily={FONT_FAMILY}>High accuracy on complex data.</text>
			</svg>
		</div>
	);
}

export function CBADiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "1rem 0" }}>
			<svg viewBox="0 0 720 260" width="100%" style={{ maxHeight: "300px", display: "block", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
				{/* 3x3 Rubric Grid on left */}
				<g transform="translate(25, 25)">
					{/* Grid background */}
					<rect x="0" y="0" width="195" height="170" rx="6" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />

					{/* Grid lines */}
					<line x1="65" y1="0" x2="65" y2="170" stroke="#e2e8f0" strokeWidth="1.5" />
					<line x1="130" y1="0" x2="130" y2="170" stroke="#e2e8f0" strokeWidth="1.5" />
					<line x1="0" y1="56" x2="195" y2="56" stroke="#e2e8f0" strokeWidth="1.5" />
					<line x1="0" y1="113" x2="195" y2="113" stroke="#e2e8f0" strokeWidth="1.5" />

					{/* High Exam + High Practice tile (Top Right) */}
					<rect x="130" y="0" width="65" height="56" fill="#ccfbf1" fillOpacity="0.75" />
					<circle cx="150" cy="20" r="4.5" fill={COLOR_TEAL} />
					<circle cx="170" cy="28" r="4.5" fill={COLOR_TEAL} />
					<circle cx="160" cy="42" r="4.5" fill={COLOR_TEAL} />
					<text x="162" y="50" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>Pass Rule</text>

					{/* Low Exam + Low Practice tile (Bottom Left) */}
					<rect x="0" y="113" width="65" height="57" fill="#ffe4e6" fillOpacity="0.75" />
					<circle cx="20" cy="130" r="4.5" fill={COLOR_ROSE} />
					<circle cx="40" cy="140" r="4.5" fill={COLOR_ROSE} />
					<circle cx="30" cy="155" r="4.5" fill={COLOR_ROSE} />
					<text x="32" y="164" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#be123c" fontFamily={FONT_FAMILY}>Risk Rule</text>

					{/* Other dots */}
					<circle cx="97" cy="30" r="4" fill={COLOR_TEAL} />
					<circle cx="97" cy="140" r="4" fill={COLOR_ROSE} />

					{/* Axis label */}
					<text x="97" y="195" textAnchor="middle" fontSize="10.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Practice Bands (Low / Med / High)</text>
				</g>

				{/* Center: Mined Association Rules Card */}
				<rect x="245" y="25" width="210" height="205" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="255" y="52" fontSize="13.5" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Mined Association Rules</text>

				<rect x="255" y="68" width="190" height="48" rx="6" fill="#f0fdfa" stroke="#99f6e4" />
				<text x="265" y="86" fontSize="10" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>IF High Practice & High Exam</text>
				<text x="265" y="103" fontSize="10" fill="#0f766e" fontFamily={FONT_FAMILY}>THEN On-Track (100% Conf)</text>

				<rect x="255" y="126" width="190" height="48" rx="6" fill="#fff1f2" stroke="#fecdd3" />
				<text x="265" y="144" fontSize="10" fontWeight="bold" fill="#be123c" fontFamily={FONT_FAMILY}>IF Low Practice & Low Exam</text>
				<text x="265" y="161" fontSize="10" fill="#be123c" fontFamily={FONT_FAMILY}>THEN At-Risk (92% Conf)</text>

				<text x="350" y="202" textAnchor="middle" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Uncovered cases use default rule</text>

				{/* Right side explainer card */}
				<rect x="475" y="25" width="220" height="205" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="492" y="55" fontSize="15" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Rubric Tiles</text>
				<text x="492" y="85" fontSize="12" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>1. Discretizes into bands:</text>
				<text x="508" y="103" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Converts continuous scores</text>
				<text x="508" y="119" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>into familiar rubric boxes.</text>
				<text x="492" y="147" fontSize="12" fontWeight="600" fill={COLOR_SLATE} fontFamily={FONT_FAMILY}>2. Mines policy rules:</text>
				<text x="508" y="165" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Finds clear if-then rules</text>
				<text x="508" y="181" fontSize="11.5" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>matching grading rubrics.</text>
				<text x="492" y="210" fontSize="11" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>Auditable and explainable.</text>
			</svg>
		</div>
	);
}

export function ANNDiagram() {
	return (
		<div className="algo-diagram-container" style={{ margin: "1rem 0" }}>
			<svg viewBox="0 0 720 260" width="100%" style={{ maxHeight: "300px", display: "block", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
				{/* Neural Network Architecture on left */}
				<rect x="25" y="25" width="340" height="210" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />

				{/* Input Layer */}
				<circle cx="65" cy="85" r="18" fill="#ffffff" stroke={COLOR_NAVY} strokeWidth="2.5" />
				<text x="65" y="90" textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>X</text>
				<text x="65" y="60" textAnchor="middle" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Exam</text>

				<circle cx="65" cy="165" r="18" fill="#ffffff" stroke={COLOR_NAVY} strokeWidth="2.5" />
				<text x="65" y="170" textAnchor="middle" fontSize="12" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Y</text>
				<text x="65" y="195" textAnchor="middle" fontSize="10" fill={COLOR_MUTED} fontFamily={FONT_FAMILY}>Practice</text>

				<text x="65" y="42" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Inputs</text>

				{/* Hidden Layer */}
				<circle cx="185" cy="65" r="16" fill="#f0fdfa" stroke={COLOR_TEAL} strokeWidth="2.5" />
				<circle cx="185" cy="125" r="16" fill="#f0fdfa" stroke={COLOR_TEAL} strokeWidth="2.5" />
				<circle cx="185" cy="185" r="16" fill="#f0fdfa" stroke={COLOR_TEAL} strokeWidth="2.5" />
				<text x="185" y="42" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Hidden</text>

				{/* Output Layer */}
				<circle cx="305" cy="125" r="18" fill="#fff1f2" stroke={COLOR_ROSE} strokeWidth="2.5" />
				<text x="305" y="130" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLOR_ROSE} fontFamily={FONT_FAMILY}>Risk</text>
				<text x="305" y="42" textAnchor="middle" fontSize="11" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Output</text>

				{/* Connecting Synapse Lines (Input to Hidden) */}
				<line x1="83" y1="85" x2="169" y2="65" stroke="#94a3b8" strokeWidth="1.5" />
				<line x1="83" y1="85" x2="169" y2="125" stroke="#94a3b8" strokeWidth="2.5" />
				<line x1="83" y1="85" x2="169" y2="185" stroke="#94a3b8" strokeWidth="1.5" />

				<line x1="83" y1="165" x2="169" y2="65" stroke="#94a3b8" strokeWidth="1.5" />
				<line x1="83" y1="165" x2="169" y2="125" stroke="#94a3b8" strokeWidth="1.5" />
				<line x1="83" y1="165" x2="169" y2="185" stroke="#94a3b8" strokeWidth="2.5" />

				{/* Connecting Synapse Lines (Hidden to Output) */}
				<line x1="201" y1="65" x2="287" y2="125" stroke="#94a3b8" strokeWidth="2.5" />
				<line x1="201" y1="125" x2="287" y2="125" stroke="#94a3b8" strokeWidth="1.5" />
				<line x1="201" y1="185" x2="287" y2="125" stroke="#94a3b8" strokeWidth="2.5" />

				{/* Right side explainer card with generous width and padding */}
				<rect x="380" y="25" width="315" height="210" rx="8" fill="#ffffff" stroke={COLOR_BORDER} strokeWidth="1.5" />
				<text x="395" y="55" fontSize="15" fontWeight="bold" fill={COLOR_NAVY} fontFamily={FONT_FAMILY}>Connected Artificial Neurons</text>

				<rect x="395" y="70" width="285" height="60" rx="6" fill="#f0fdfa" stroke="#ccfbf1" strokeWidth="1" />
				<text x="408" y="92" fontSize="12" fontWeight="bold" fill="#0f766e" fontFamily={FONT_FAMILY}>Forward Pass (Signal):</text>
				<text x="408" y="112" fontSize="11" fill="#0f766e" fontFamily={FONT_FAMILY}>Passes features forward to predict risk</text>

				<rect x="395" y="142" width="285" height="65" rx="6" fill="#fff1f2" stroke="#fecdd3" strokeWidth="1" />
				<text x="408" y="164" fontSize="12" fontWeight="bold" fill="#be123c" fontFamily={FONT_FAMILY}>Backpropagation (Learning):</text>
				<text x="408" y="184" fontSize="11" fill="#be123c" fontFamily={FONT_FAMILY}>Nudges connection weights after mistakes</text>
			</svg>
		</div>
	);
}
