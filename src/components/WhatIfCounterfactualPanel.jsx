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
		<div
			style={{
				marginTop: "1.15rem",
				paddingTop: "1rem",
				borderTop: "1px dashed #cbd5e1"
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					flexWrap: "wrap",
					gap: "0.5rem",
					marginBottom: "0.75rem"
				}}
			>
				<div>
					<div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>
						What-If Counterfactual Intervention Explorer
					</div>
					<div style={{ fontSize: "0.77rem", color: "#64748b" }}>
						Calculates the minimum score change required to flip a student across the decision boundary (hover any dot on the canvas or click a student below).
					</div>
				</div>
				<div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
					{pillStudents.map((st) => {
						const isSel = st.rawIdx === activeStudent.rawIdx;
						const isRisk = st.pred === S.class2;
						return (
							<button
								key={st.rawIdx}
								type="button"
								onClick={() => handleSelectStudent(st.rawIdx)}
								style={{
									cursor: "pointer",
									fontSize: "0.72rem",
									fontWeight: 600,
									padding: "0.22rem 0.55rem",
									borderRadius: "999px",
									border: isSel
										? "2px solid #0f172a"
										: `1px solid ${isRisk ? "#fecdd3" : "#99f6e4"}`,
									background: isSel
										? "#0f172a"
										: isRisk
										? "#fff1f2"
										: "#f0fdfa",
									color: isSel ? "#ffffff" : isRisk ? "#be123c" : "#0f766e"
								}}
								title={`Inspect Student #${st.index} (${isRisk ? "Predicted At-Risk" : "Predicted On-Track"})`}
							>
								#{st.index} {isRisk ? "At-Risk" : "On-Track"}
							</button>
						);
					})}
				</div>
			</div>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
					gap: "1rem"
				}}
			>
				{/* Left Card: Minimum Counterfactual Paths */}
				<div
					style={{
						background: "#f8fafc",
						border: "1px solid #e2e8f0",
						borderRadius: "8px",
						padding: "0.85rem 1rem"
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "0.55rem"
						}}
					>
						<span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
							Student #{activeStudent.index} ({formatSigned(activeStudent.x)}, {formatSigned(activeStudent.y)})
						</span>
						<span
							style={{
								fontSize: "0.73rem",
								fontWeight: 700,
								padding: "0.15rem 0.55rem",
								borderRadius: "999px",
								background: activeStudent.pred === S.class2 ? "#ffe4e6" : "#ccfbf1",
								color: activeStudent.pred === S.class2 ? "#be123c" : "#0f766e"
							}}
						>
							Current: {activeStudent.pred === S.class2 ? "At-Risk" : "On-Track"} ({Math.round(activeStudent.prob * 100)}% Risk)
						</span>
					</div>

					<div style={{ fontSize: "0.76rem", color: "#475569", marginBottom: "0.55rem" }}>
						{activeStudent.pred === S.class2
							? "Minimum counterfactual paths to flip prediction to On-Track:"
							: "Safety buffer distance before slipping into At-Risk:"}
					</div>

					<div style={{ display: "flex", flexDirection: "column", gap: "0.45rem" }}>
						{/* Shortest Combined Path */}
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								background: "#ffffff",
								border: "1px solid #cbd5e1",
								borderRadius: "6px",
								padding: "0.45rem 0.65rem",
								fontSize: "0.76rem"
							}}
						>
							<div>
								<strong style={{ color: "#0f172a" }}>Shortest Combined Path:</strong>{" "}
								{cf && cf.combined ? (
									<span style={{ color: "#334155" }}>
										{xLabel} <strong>{formatSigned(cf.combined.dx)}</strong>, {yLabel}{" "}
										<strong>{formatSigned(cf.combined.dy)}</strong>
									</span>
								) : (
									<span style={{ color: "#94a3b8" }}>No boundary crossing in range</span>
								)}
							</div>
							{cf && cf.combined && (
								<button
									type="button"
									onClick={() => applyPath(cf.combined)}
									style={{
										cursor: "pointer",
										fontSize: "0.7rem",
										fontWeight: 600,
										background: "#0f766e",
										color: "#ffffff",
										border: "none",
										borderRadius: "4px",
										padding: "0.2rem 0.5rem"
									}}
								>
									Test
								</button>
							)}
						</div>

						{/* X-Axis Only Path */}
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								background: "#ffffff",
								border: "1px solid #e2e8f0",
								borderRadius: "6px",
								padding: "0.4rem 0.65rem",
								fontSize: "0.75rem"
							}}
						>
							<div>
								<strong style={{ color: "#334155" }}>{xLabel} Only:</strong>{" "}
								{cf && cf.xOnly ? (
									<span style={{ color: "#475569" }}>
										Change by <strong>{formatSigned(cf.xOnly.dx)}</strong> (to {formatSigned(cf.xOnly.nx)})
									</span>
								) : (
									<span style={{ color: "#94a3b8" }}>Not reachable by X alone</span>
								)}
							</div>
							{cf && cf.xOnly && (
								<button
									type="button"
									onClick={() => applyPath(cf.xOnly)}
									style={{
										cursor: "pointer",
										fontSize: "0.7rem",
										fontWeight: 600,
										background: "#f1f5f9",
										color: "#334155",
										border: "1px solid #cbd5e1",
										borderRadius: "4px",
										padding: "0.18rem 0.45rem"
									}}
								>
									Test
								</button>
							)}
						</div>

						{/* Y-Axis Only Path */}
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								background: "#ffffff",
								border: "1px solid #e2e8f0",
								borderRadius: "6px",
								padding: "0.4rem 0.65rem",
								fontSize: "0.75rem"
							}}
						>
							<div>
								<strong style={{ color: "#334155" }}>{yLabel} Only:</strong>{" "}
								{cf && cf.yOnly ? (
									<span style={{ color: "#475569" }}>
										Change by <strong>{formatSigned(cf.yOnly.dy)}</strong> (to {formatSigned(cf.yOnly.ny)})
									</span>
								) : (
									<span style={{ color: "#94a3b8" }}>Not reachable by Y alone</span>
								)}
							</div>
							{cf && cf.yOnly && (
								<button
									type="button"
									onClick={() => applyPath(cf.yOnly)}
									style={{
										cursor: "pointer",
										fontSize: "0.7rem",
										fontWeight: 600,
										background: "#f1f5f9",
										color: "#334155",
										border: "1px solid #cbd5e1",
										borderRadius: "4px",
										padding: "0.18rem 0.45rem"
									}}
								>
									Test
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Right Card: Interactive What-If Intervention Sandbox */}
				<div
					style={{
						background: simPred === S.class1 ? "#f0fdfa" : "#fff1f2",
						border: `1px solid ${simPred === S.class1 ? "#99f6e4" : "#fecdd3"}`,
						borderRadius: "8px",
						padding: "0.85rem 1rem",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between"
					}}
				>
					<div>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								marginBottom: "0.55rem"
							}}
						>
							<span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>
								Live What-If Intervention Simulator
							</span>
							<button
								type="button"
								onClick={() => {
									setSimX(activeStudent.x);
									setSimY(activeStudent.y);
								}}
								style={{
									cursor: "pointer",
									fontSize: "0.7rem",
									fontWeight: 600,
									background: "#ffffff",
									color: "#475569",
									border: "1px solid #cbd5e1",
									borderRadius: "4px",
									padding: "0.18rem 0.5rem"
								}}
							>
								Reset Sliders
							</button>
						</div>

						{/* X Slider */}
						<div style={{ marginBottom: "0.55rem" }}>
							<div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", marginBottom: "0.15rem" }}>
								<span style={{ fontWeight: 600, color: "#1e293b" }}>Simulated {xLabel}</span>
								<span style={{ fontWeight: 700, color: "#0f172a" }}>
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
								style={{ width: "100%", cursor: "pointer" }}
							/>
						</div>

						{/* Y Slider */}
						<div style={{ marginBottom: "0.65rem" }}>
							<div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", marginBottom: "0.15rem" }}>
								<span style={{ fontWeight: 600, color: "#1e293b" }}>Simulated {yLabel}</span>
								<span style={{ fontWeight: 700, color: "#0f172a" }}>
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
								style={{ width: "100%", cursor: "pointer" }}
							/>
						</div>
					</div>

					<div
						style={{
							background: "#ffffff",
							border: `1px solid ${simPred === S.class1 ? "#5eead4" : "#fda4af"}`,
							borderRadius: "6px",
							padding: "0.5rem 0.75rem",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							fontSize: "0.78rem"
						}}
					>
						<div>
							<strong>Simulated Outcome:</strong>{" "}
							<span style={{ fontWeight: 700, color: simPred === S.class1 ? "#0f766e" : "#be123c" }}>
								● {simPred === S.class1 ? "On-Track" : "At-Risk"} ({Math.round(simProb * 100)}% Risk)
							</span>
						</div>
						{flipped && (
							<span
								style={{
									fontSize: "0.7rem",
									fontWeight: 700,
									background: simPred === S.class1 ? "#ccfbf1" : "#ffe4e6",
									color: simPred === S.class1 ? "#0f766e" : "#be123c",
									padding: "0.15rem 0.45rem",
									borderRadius: "4px"
								}}
							>
								✓ Outcome Flipped!
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
