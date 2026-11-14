import React, { useState, useEffect, useMemo } from "react";
import S from "../s";
import { findCounterfactual, formatSigned } from "../utils/counterfactual";

export default function WhatIfCounterfactualPanel({
	model,
	xTr = [],
	yTr = [],
	xLabel = "Feature X",
	yLabel = "Feature Y",
	hoverProbe = null
}) {
	const [selectedStudentIdx, setSelectedStudentIdx] = useState(0);
	const [simX, setSimX] = useState(0);
	const [simY, setSimY] = useState(0);

	// Build cohort list with predictions
	const cohort = useMemo(() => {
		if (!model || typeof model.classif !== "function") return [];
		return xTr.map((pt, i) => {
			const x = Math.round(pt[0]);
			const y = Math.round(pt[1]);
			const actual = Number(yTr[i]);
			const pred = model.classif(x, y);
			const prob =
				typeof model.score === "function"
					? model.score(x, y)
					: pred === S.class2
					? 1
					: 0;
			return { index: i + 1, rawIdx: i, x, y, actual, pred, prob };
		});
	}, [model, xTr, yTr]);

	// Prioritize predicted At-Risk students first so educators immediately see actionable interventions
	const atRiskStudents = useMemo(
		() => cohort.filter((s) => s.pred === S.class2),
		[cohort]
	);

	// Default to the first predicted At-Risk student (or student #1 if none)
	useEffect(() => {
		if (cohort.length === 0) return;
		const firstRisk = cohort.find((s) => s.pred === S.class2);
		const target = firstRisk || cohort[0];
		setSelectedStudentIdx(target.rawIdx);
		setSimX(target.x);
		setSimY(target.y);
	}, [cohort.length, model]);

	// If user hovers directly over a plotted student on the canvas, sync selection
	useEffect(() => {
		if (hoverProbe && hoverProbe.targetStudent) {
			const idx = hoverProbe.targetStudent.index - 1;
			if (idx >= 0 && idx < cohort.length && idx !== selectedStudentIdx) {
				setSelectedStudentIdx(idx);
				setSimX(cohort[idx].x);
				setSimY(cohort[idx].y);
			}
		}
	}, [hoverProbe]);

	if (!model || cohort.length === 0) return null;

	const activeStudent = cohort[selectedStudentIdx] || cohort[0];
	const targetClass = activeStudent.pred === S.class2 ? S.class1 : S.class2;
	const cf = findCounterfactual(model, activeStudent.x, activeStudent.y, targetClass);

	// Live simulation prediction at (simX, simY)
	const simPred = model.classif(simX, simY);
	const simProb =
		typeof model.score === "function"
			? model.score(simX, simY)
			: simPred === S.class2
			? 1
			: 0;
	const flipped = simPred !== activeStudent.pred;

	const handleSelectStudent = (rawIdx) => {
		const st = cohort[rawIdx];
		if (!st) return;
		setSelectedStudentIdx(rawIdx);
		setSimX(st.x);
		setSimY(st.y);
	};

	const applyPath = (pathObj) => {
		if (!pathObj) return;
		setSimX(pathObj.nx);
		setSimY(pathObj.ny);
	};

	// Quick selector pills: show up to 8 At-Risk students + up to 4 On-Track students
	const pillStudents = [
		...atRiskStudents.slice(0, 8),
		...cohort.filter((s) => s.pred === S.class1).slice(0, 4)
	].slice(0, 10);

	return (
		<div className="cf-section">
			<div className="cf-header">
				<div>
					<div className="cf-title">Counterfactual Boundary Analysis</div>
					<div className="cf-subtitle">
						Calculates the minimum feature change required to shift a student across the decision boundary (hover any point on the plot or select a student below).
					</div>
				</div>
				<div className="cf-student-list">
					{pillStudents.map((st) => {
						const isSel = st.rawIdx === activeStudent.rawIdx;
						const isRisk = st.pred === S.class2;
						return (
							<button
								key={st.rawIdx}
								type="button"
								onClick={() => handleSelectStudent(st.rawIdx)}
								className={`cf-student-btn ${isSel ? "is-selected" : isRisk ? "is-risk" : "is-ontrack"}`}
								title={`Inspect Student #${st.index} (${isRisk ? "Predicted At-Risk" : "Predicted On-Track"})`}
							>
								#{st.index} {isRisk ? "At-Risk" : "On-Track"}
							</button>
						);
					})}
				</div>
			</div>

			<div className="cf-grid">
				{/* Left Panel: Minimum Counterfactual Paths */}
				<div className="cf-card">
					<div className="cf-card-head">
						<span className="cf-card-title">
							Student #{activeStudent.index} ({formatSigned(activeStudent.x)}, {formatSigned(activeStudent.y)})
						</span>
						<span className={`inspector-tag ${activeStudent.pred === S.class2 ? "is-risk" : "is-ontrack"}`}>
							Current: {activeStudent.pred === S.class2 ? "At-Risk" : "On-Track"} ({Math.round(activeStudent.prob * 100)}% Risk)
						</span>
					</div>

					<div className="cf-paths-caption">
						{activeStudent.pred === S.class2
							? "Minimum counterfactual paths to reach On-Track classification:"
							: "Distance from the decision boundary before At-Risk classification:"}
					</div>

					<div className="cf-paths-list">
						{/* Shortest Combined Path */}
						<div className="cf-path-row">
							<div>
								<strong>Shortest Combined Path:</strong>{" "}
								{cf && cf.combined ? (
									<span>
										{xLabel} <strong>{formatSigned(cf.combined.dx)}</strong>, {yLabel}{" "}
										<strong>{formatSigned(cf.combined.dy)}</strong>
									</span>
								) : (
									<span className="cf-muted">No boundary crossing in range</span>
								)}
							</div>
							{cf && cf.combined && (
								<button
									type="button"
									className="cf-test-btn is-primary"
									onClick={() => applyPath(cf.combined)}
								>
									Apply
								</button>
							)}
						</div>

						{/* X-Axis Only Path */}
						<div className="cf-path-row">
							<div>
								<strong>{xLabel} Only:</strong>{" "}
								{cf && cf.xOnly ? (
									<span>
										Change by <strong>{formatSigned(cf.xOnly.dx)}</strong> (to {formatSigned(cf.xOnly.nx)})
									</span>
								) : (
									<span className="cf-muted">Not reachable along X alone</span>
								)}
							</div>
							{cf && cf.xOnly && (
								<button
									type="button"
									className="cf-test-btn"
									onClick={() => applyPath(cf.xOnly)}
								>
									Apply
								</button>
							)}
						</div>

						{/* Y-Axis Only Path */}
						<div className="cf-path-row">
							<div>
								<strong>{yLabel} Only:</strong>{" "}
								{cf && cf.yOnly ? (
									<span>
										Change by <strong>{formatSigned(cf.yOnly.dy)}</strong> (to {formatSigned(cf.yOnly.ny)})
									</span>
								) : (
									<span className="cf-muted">Not reachable along Y alone</span>
								)}
							</div>
							{cf && cf.yOnly && (
								<button
									type="button"
									className="cf-test-btn"
									onClick={() => applyPath(cf.yOnly)}
								>
									Apply
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Right Panel: Boundary Threshold Simulator */}
				<div className="cf-card cf-sim-card">
					<div>
						<div className="cf-card-head">
							<span className="cf-card-title">
								Boundary Threshold Simulator
							</span>
							<button
								type="button"
								className="cf-test-btn"
								onClick={() => {
									setSimX(activeStudent.x);
									setSimY(activeStudent.y);
								}}
							>
								Reset Sliders
							</button>
						</div>

						{/* X Slider */}
						<div className="cf-slider-group">
							<div className="cf-slider-row">
								<span className="cf-slider-label">Adjusted {xLabel}</span>
								<span className="cf-slider-val">
									{formatSigned(simX)} ({formatSigned(simX - activeStudent.x)} from original)
								</span>
							</div>
							<input
								type="range"
								min="-195"
								max="195"
								step="1"
								value={simX}
								onChange={(e) => setSimX(Number(e.target.value))}
								className="cf-slider"
							/>
						</div>

						{/* Y Slider */}
						<div className="cf-slider-group">
							<div className="cf-slider-row">
								<span className="cf-slider-label">Adjusted {yLabel}</span>
								<span className="cf-slider-val">
									{formatSigned(simY)} ({formatSigned(simY - activeStudent.y)} from original)
								</span>
							</div>
							<input
								type="range"
								min="-195"
								max="195"
								step="1"
								value={simY}
								onChange={(e) => setSimY(Number(e.target.value))}
								className="cf-slider"
							/>
						</div>
					</div>

					<div className="cf-sim-result">
						<div>
							<strong>Projected Outcome:</strong>{" "}
							<span className={simPred === S.class1 ? "is-ontrack-text" : "is-risk-text"}>
								{simPred === S.class1 ? "On-Track" : "At-Risk"} ({Math.round(simProb * 100)}% Risk)
							</span>
						</div>
						{flipped && (
							<span className={`inspector-tag ${simPred === S.class1 ? "is-ontrack" : "is-risk"}`}>
								Prediction Flipped
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
