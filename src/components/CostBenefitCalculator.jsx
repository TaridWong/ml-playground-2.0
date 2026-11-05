import React, { useState } from "react";

export default function CostBenefitCalculator({ metrics }) {
	const [costUnit, setCostUnit] = useState("time"); // "time" | "financial"
	const [falseAlarmCost, setFalseAlarmCost] = useState(15); // minutes (or $25)
	const [missedStudentCost, setMissedStudentCost] = useState(120); // minutes (or $250)
	const [dollarFP, setDollarFP] = useState(25);
	const [dollarFN, setDollarFN] = useState(250);

	if (!metrics || metrics.total === 0) return null;

	const { fp, fn, tp, tn, sensitivity, precision } = metrics;

	// Calculations
	const fpTotalTime = fp * falseAlarmCost;
	const fnTotalTime = fn * missedStudentCost;
	const totalMinutes = fpTotalTime + fnTotalTime;
	const totalHours = (totalMinutes / 60).toFixed(1);

	const fpTotalDollar = fp * dollarFP;
	const fnTotalDollar = fn * dollarFN;
	const totalDollars = fpTotalDollar + fnTotalDollar;

	// Plain-English Educational Policy Insight
	let verdictType = "success";
	let verdictTitle = "Balanced Intervention Policy";
	let verdictDesc = "Model maintains a solid balance between catching at-risk students and respecting teacher workload.";

	if (fn === 0 && fp === 0) {
		verdictType = "success";
		verdictTitle = "Ideal Intervention: 100% Precision & 100% Sensitivity";
		verdictDesc = "All struggling students are supported with zero false alarms or wasted staff hours.";
	} else if (fn === 0 && fp > 0) {
		verdictType = "safe";
		verdictTitle = "Maximum Safety Net Policy (Zero Missed Students)";
		verdictDesc = `All struggling students (${tp}) were caught for tutoring. However, ${fp} on-track student(s) received false alarms (${fpTotalTime} mins of extra teacher outreach).`;
	} else if (fn > 0 && fp === 0) {
		verdictType = "danger";
		verdictTitle = "Conservative Policy: Zero False Alarms, but High Student Risk";
		verdictDesc = `${fn} struggling student(s) slipped past detection without help. In education, missed students compound learning deficits over time.`;
	} else if (fn > 2) {
		verdictType = "danger";
		verdictTitle = "High-Stakes Deficit: Severe Remediation Burden Ahead";
		verdictDesc = `${fn} struggling students were overlooked by this algorithm. Consider lowering the decision threshold or choosing a non-linear model.`;
	} else if (fp > 4) {
		verdictType = "warning";
		verdictTitle = "Staff Fatigue: Too Many False Alarms";
		verdictDesc = `${fp} thriving students were flagged, wasting ${fpTotalTime} minutes of counselor time. Teachers may experience alert fatigue.`;
	}

	return (
		<div className="cost-benefit-card">
			<div className="cb-header">
				<div className="cb-title-group">
					<h4 className="cb-title">Educational Resource & Policy Impact Planner</h4>
					<span className="cb-subtitle">
						Connect Sensitivity & Precision directly to teacher time, counseling capacity, and student remediation costs.
					</span>
				</div>
				<div className="cb-unit-toggle">
					<button
						type="button"
						className={`cb-unit-btn ${costUnit === "time" ? "active" : ""}`}
						onClick={() => setCostUnit("time")}
					>
						Teacher Time (Hours)
					</button>
					<button
						type="button"
						className={`cb-unit-btn ${costUnit === "financial" ? "active" : ""}`}
						onClick={() => setCostUnit("financial")}
					>
						Remediation Budget ($)
					</button>
				</div>
			</div>

			<div className="cb-body-grid">
				{/* Column 1: Configurable School Assumptions */}
				<div className="cb-inputs-col">
					<div className="cb-input-group">
						<label className="cb-label">
							<strong>Cost per False Alarm (FP):</strong>
							<span className="cb-label-val">
								{costUnit === "time" ? `${falseAlarmCost} mins` : `$${dollarFP}`}
							</span>
						</label>
						<p className="cb-input-hint">
							Teacher time to draft outreach email and review LMS history for a student who was actually on-track.
						</p>
						{costUnit === "time" ? (
							<input
								type="range"
								min="5"
								max="60"
								step="5"
								value={falseAlarmCost}
								onChange={(e) => setFalseAlarmCost(Number(e.target.value))}
								className="cb-slider"
							/>
						) : (
							<input
								type="range"
								min="10"
								max="100"
								step="5"
								value={dollarFP}
								onChange={(e) => setDollarFP(Number(e.target.value))}
								className="cb-slider"
							/>
						)}
					</div>

					<div className="cb-input-group">
						<label className="cb-label">
							<strong>Cost per Missed Student (FN):</strong>
							<span className="cb-label-val">
								{costUnit === "time" ? `${missedStudentCost} mins (${(missedStudentCost / 60).toFixed(1)}h)` : `$${dollarFN}`}
							</span>
						</label>
						<p className="cb-input-hint">
							Intensive 1-on-1 tutoring, summer school, or credit recovery required when an at-risk student is overlooked.
						</p>
						{costUnit === "time" ? (
							<input
								type="range"
								min="30"
								max="300"
								step="15"
								value={missedStudentCost}
								onChange={(e) => setMissedStudentCost(Number(e.target.value))}
								className="cb-slider"
							/>
						) : (
							<input
								type="range"
								min="50"
								max="1000"
								step="50"
								value={dollarFN}
								onChange={(e) => setDollarFN(Number(e.target.value))}
								className="cb-slider"
							/>
						)}
					</div>
				</div>

				{/* Column 2: Total Resource Impact */}
				<div className="cb-impact-col">
					<div className="cb-summary-badges">
						<div className="cb-badge false-alarms">
							<span className="cb-badge-title">False Alarm Burden</span>
							<span className="cb-badge-value">
								{costUnit === "time" ? `${fpTotalTime} mins` : `$${fpTotalDollar}`}
							</span>
							<span className="cb-badge-sub">{fp} False Alarm(s)</span>
						</div>

						<div className="cb-badge missed-students">
							<span className="cb-badge-title">Unaddressed Deficit</span>
							<span className="cb-badge-value">
								{costUnit === "time" ? `${(fnTotalTime / 60).toFixed(1)} hrs` : `$${fnTotalDollar}`}
							</span>
							<span className="cb-badge-sub">{fn} Missed Student(s)</span>
						</div>

						<div className="cb-badge total-impact">
							<span className="cb-badge-title">Total Resource Deficit</span>
							<span className="cb-badge-value total">
								{costUnit === "time" ? `${totalHours} hrs` : `$${totalDollars}`}
							</span>
							<span className="cb-badge-sub">Net Intervention Cost</span>
						</div>
					</div>

					{/* Plain English Verdict Banner */}
					<div className={`cb-verdict-box ${verdictType}`}>
						<div className="verdict-title">{verdictTitle}</div>
						<div className="verdict-desc">{verdictDesc}</div>
					</div>
				</div>
			</div>
		</div>
	);
}
