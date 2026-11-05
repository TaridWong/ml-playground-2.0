import React, { useState } from "react";
import S from "../s";
import DecisionTreeVisualizer from "./DecisionTreeVisualizer";
import WhatIfCounterfactualPanel from "./WhatIfCounterfactualPanel";

// Helper to recursively count feature splits in a decision tree or XGBoost tree
function countTreeSplits(node, counts) {
	if (!node || node.isLeaf) return;
	if (node.feature === 0) counts.x += 1;
	else if (node.feature === 1) counts.y += 1;

	if (node.children && node.children.length === 2) {
		countTreeSplits(node.children[0], counts);
		countTreeSplits(node.children[1], counts);
	} else {
		countTreeSplits(node.left, counts);
		countTreeSplits(node.right, counts);
	}
}

function getBandLabels(gridSize) {
	if (gridSize === 3) return ["Low", "Medium", "High"];
	if (gridSize === 4) return ["Tier 1 (Low)", "Tier 2 (Mod-Low)", "Tier 3 (Mod-High)", "Tier 4 (High)"];
	if (gridSize === 5) return ["Band 1 (Lowest)", "Band 2 (Low)", "Band 3 (Middle)", "Band 4 (High)", "Band 5 (Highest)"];
	return Array.from({ length: gridSize }, (_, i) => `Band ${i + 1}`);
}

export default function ModelInspector({
	activeModel,
	store,
	treeHierarchy,
	isTrained,
	xLabel = "Feature X",
	yLabel = "Feature Y",
	hoverProbe = null
}) {
	const [isCollapsed, setIsCollapsed] = useState(false);

	const model = store ? store.classif : null;
	const xTr = (store && store.xTr) || [];
	const yTr = (store && store.yTr) || [];

	// Keep Decision Tree using its dedicated flowchart visualizer, plus the What-If Counterfactual panel when trained
	if (activeModel === "tree") {
		return (
			<div>
				<DecisionTreeVisualizer treeData={treeHierarchy} />
				{isTrained && model && xTr.length >= 2 && (
					<div className="tree-visualizer-card" style={{ marginTop: "0.85rem" }}>
						<WhatIfCounterfactualPanel
							model={model}
							xTr={xTr}
							yTr={yTr}
							xLabel={xLabel}
							yLabel={yLabel}
							hoverProbe={hoverProbe}
						/>
					</div>
				)}
			</div>
		);
	}

	const MODEL_META = {
		knn: {
			title: "KNN Peer Neighborhood Inspector (Explainable AI)",
			subtitle: "Explains predictions by showing the closest peer neighbors and how their majority vote is tallied."
		},
		logistic: {
			title: "Logistic Regression Feature Weights (Explainable AI)",
			subtitle: "Shows how each student metric pushes the probability score toward On-Track or At-Risk."
		},
		naivebayes: {
			title: "Naive Bayes Bell Curve Inspector (Explainable AI)",
			subtitle: "Displays the learned group averages, score spreads, and base rates for both student groups."
		},
		perceptron: {
			title: "Perceptron Boundary Weights (Explainable AI)",
			subtitle: "Shows the learned line weights and how each feature tilts a student across the decision fence."
		},
		svm: {
			title: "SVM Support Vector Roster (Explainable AI)",
			subtitle: "Highlights the critical boundary students holding the safety street in place versus outer students."
		},
		randomforest: {
			title: "Random Forest Committee Breakdown (Explainable AI)",
			subtitle: "Reveals which features the tree committee relies on most and how individual trees cast their votes."
		},
		xgboost: {
			title: "XGBoost Relay & Split Inspector (Explainable AI)",
			subtitle: "Shows the baseline starting risk, sequential error-fixing stages, and feature split balance."
		},
		cba: {
			title: "CBA Mined Rubric Rules (Explainable AI)",
			subtitle: "Lists the exact if-then rubric rules discovered from your students along with confidence and support."
		},
		ann: {
			title: "Neural Network Signal & Sensitivity Inspector (Explainable AI)",
			subtitle: "Summarizes the hidden layer architecture and how strongly each input feature activates the network."
		}
	};

	const meta = MODEL_META[activeModel] || {
		title: "Model Explainability Inspector (Explainable AI)",
		subtitle: "Inspect the internal rules and weights learned by the active algorithm."
	};

	if (!isTrained || !model || xTr.length < 2) {
		return (
			<div className="tree-visualizer-card empty">
				<div className="xai-title">{meta.title}</div>
				<p className="xai-hint">
					Plot students on the canvas and click <strong>Train Model</strong> to inspect the transparent inner workings of this algorithm.
				</p>
			</div>
		);
	}

	const renderWeightBar = (label, weight, maxAbs) => {
		const pct = maxAbs > 0 ? Math.min(100, Math.round((Math.abs(weight) / maxAbs) * 100)) : 0;
		const isAtRiskPull = weight > 0;
		return (
			<div key={label} style={{ marginBottom: "0.65rem" }}>
				<div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "0.2rem" }}>
					<span style={{ fontWeight: 600, color: "#1e293b" }}>{label}</span>
					<span style={{ fontWeight: 700, color: Math.abs(weight) < 0.001 ? "#64748b" : isAtRiskPull ? "#e11d48" : "#0d9488" }}>
						{weight >= 0 ? `+${weight.toFixed(2)}` : weight.toFixed(2)}{" "}
						<span style={{ fontWeight: 500, fontSize: "0.75rem", color: "#64748b" }}>
							({Math.abs(weight) < 0.001 ? "Neutral" : isAtRiskPull ? "Pulls toward At-Risk" : "Pulls toward On-Track"})
						</span>
					</span>
				</div>
				<div style={{ height: "8px", background: "#f1f5f9", borderRadius: "4px", overflow: "hidden" }}>
					<div
						style={{
							width: `${ Math.max(4, pct) }%`,
							height: "100%",
							background: Math.abs(weight) < 0.001 ? "#94a3b8" : isAtRiskPull ? "#e11d48" : "#0d9488",
							borderRadius: "4px",
							transition: "width 0.25s ease"
						}}
					/>
				</div>
			</div>
		);
	};

	const renderContent = () => {
		// 1. CBA: Mined Rubric Association Rules
		if (activeModel === "cba") {
			const k = model.gridSize || 3;
			const bands = getBandLabels(k);
			const rulesObj = model.rules || {};
			const binCounts = model.binCounts || {};

			const ruleList = [];
			for (let ix = 0; ix < k; ix++) {
				for (let iy = 0; iy < k; iy++) {
					const key = `${ix}_${iy}`;
					if (rulesObj[key]) {
						const r = rulesObj[key];
						const bin = binCounts[key] || { total: r.supp };
						ruleList.push({
							key,
							xBand: bands[ix],
							yBand: bands[iy],
							pred: r.pred,
							conf: Math.round(r.conf * 100),
							supp: r.supp,
							totalInBin: bin.total
						});
					}
				}
			}

			ruleList.sort((a, b) => b.conf - a.conf || b.supp - a.supp);
			const totalTiles = k * k;
			const uncoveredTiles = totalTiles - ruleList.length;
			const fallbackLabel =
				model.fallbackMode === "ontrack"
					? "Assume On-Track"
					: model.majorityClass === S.class2
					? "Cohort Majority (At-Risk)"
					: "Cohort Majority (On-Track)";

			return (
				<div>
					<div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1rem" }}>
						<div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.6rem 0.9rem", flex: "1 1 160px" }}>
							<div style={{ fontSize: "0.74rem", color: "#64748b" }}>Rubric Grid Resolution</div>
							<div style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
								{k} x {k} ({totalTiles} Rubric Tiles)
							</div>
						</div>
						<div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.6rem 0.9rem", flex: "1 1 160px" }}>
							<div style={{ fontSize: "0.74rem", color: "#64748b" }}>Active Mined Rules</div>
							<div style={{ fontSize: "1rem", fontWeight: 700, color: "#0f766e" }}>
								{ruleList.length} Qualified Rules
							</div>
						</div>
						<div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.6rem 0.9rem", flex: "1 1 200px" }}>
							<div style={{ fontSize: "0.74rem", color: "#64748b" }}>Uncovered Tile Policy ({uncoveredTiles} tiles)</div>
							<div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#334155" }}>{fallbackLabel}</div>
						</div>
					</div>

					{ruleList.length === 0 ? (
						<div style={{ padding: "1rem", background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "8px", color: "#be123c", fontSize: "0.85rem" }}>
							No rubric tile met the current minimum confidence ({Math.round((model.minConfidence || 0.65) * 100)}%) and support ({model.minSupport || 1} students) thresholds. Try lowering Min Confidence or Min Support.
						</div>
					) : (
						<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "0.65rem" }}>
							{ruleList.map((r, idx) => {
								const isRisk = r.pred === S.class2;
								return (
									<div
										key={r.key}
										style={{
											padding: "0.75rem 0.9rem",
											borderRadius: "8px",
											border: `1px solid ${isRisk ? "#fecdd3" : "#99f6e4"}`,
											background: isRisk ? "#fff1f2" : "#f0fdfa"
										}}
									>
										<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
											<span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569" }}>Rule #{idx + 1}</span>
											<span
												style={{
													fontSize: "0.74rem",
													fontWeight: 700,
													padding: "0.15rem 0.5rem",
													borderRadius: "999px",
													background: isRisk ? "#ffe4e6" : "#ccfbf1",
													color: isRisk ? "#be123c" : "#0f766e"
												}}
											>
												THEN {isRisk ? "At-Risk" : "On-Track"}
											</span>
										</div>
										<div style={{ fontSize: "0.83rem", color: "#0f172a", fontWeight: 600, marginBottom: "0.35rem" }}>
											IF {xLabel} is <span style={{ textDecoration: "underline" }}>{r.xBand}</span> AND {yLabel} is{" "}
											<span style={{ textDecoration: "underline" }}>{r.yBand}</span>
										</div>
										<div style={{ fontSize: "0.75rem", color: "#475569" }}>
											Confidence: <strong>{r.conf}%</strong> ({r.supp} of {r.totalInBin} students in tile)
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			);
		}

		// 2. Logistic Regression: Feature Weights & Cutoff
		if (activeModel === "logistic") {
			const w = model.weights || [0, 0, 0];
			const isQuad = model.degree === 2 && w.length >= 6;
			const items = [
				{ label: `${xLabel} (Linear)`, val: w[1] || 0 },
				{ label: `${yLabel} (Linear)`, val: w[2] || 0 }
			];
			if (isQuad) {
				items.push(
					{ label: `${xLabel} Squared (Curve)`, val: w[3] || 0 },
					{ label: `${yLabel} Squared (Curve)`, val: w[4] || 0 },
					{ label: `${xLabel} x ${yLabel} (Interaction)`, val: w[5] || 0 }
				);
			}
			const maxAbs = Math.max(0.1, ...items.map((i) => Math.abs(i.val)));

			return (
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
					<div>
						<div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.65rem" }}>
							Learned Feature Influence (Log-Odds Weights)
						</div>
						{items.map((it) => renderWeightBar(it.label, it.val, maxAbs))}
					</div>
					<div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.9rem 1rem" }}>
						<div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
							How Prediction Probability Is Calculated
						</div>
						<div style={{ fontSize: "0.8rem", color: "#334155", lineHeight: 1.55, marginBottom: "0.65rem" }}>
							The model multiplies each student score by its weight above, adds the baseline intercept (<strong>{(w[0] || 0).toFixed(2)}</strong>), and passes the total through an S-shaped sigmoid curve to get a risk percentage from 0% to 100%.
						</div>
						<div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
							<span style={{ fontSize: "0.76rem", background: "#ffe4e6", color: "#be123c", padding: "0.25rem 0.6rem", borderRadius: "6px", fontWeight: 600 }}>
								Alert Cutoff: {Math.round((model.threshold || 0.5) * 100)}%
							</span>
							<span style={{ fontSize: "0.76rem", background: "#e2e8f0", color: "#334155", padding: "0.25rem 0.6rem", borderRadius: "6px", fontWeight: 600 }}>
								Boundary Mode: {isQuad ? "Degree 2 Curve" : "Degree 1 Straight Line"}
							</span>
						</div>
					</div>
				</div>
			);
		}

		// 3. Perceptron: Linear Fence Weights
		if (activeModel === "perceptron") {
			const w = model.w || [0, 0, 0];
			// In Perceptron: result = w[0]*x + w[1]*y + w[2]*100.
			// Positive result -> Class 1 (On-Track), Negative -> Class 2 (At-Risk).
			// Flip sign so positive bar consistently means pulls toward At-Risk.
			const wxRisk = -w[0];
			const wyRisk = -w[1];
			const biasRisk = -w[2];
			const maxAbs = Math.max(0.1, Math.abs(wxRisk), Math.abs(wyRisk));

			return (
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
					<div>
						<div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.65rem" }}>
							Decision Fence Weight Balance
						</div>
						{renderWeightBar(xLabel, wxRisk, maxAbs)}
						{renderWeightBar(yLabel, wyRisk, maxAbs)}
					</div>
					<div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.9rem 1rem" }}>
						<div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.45rem" }}>
							Step-Rule Boundary Equation
						</div>
						<div style={{ fontSize: "0.8rem", color: "#334155", lineHeight: 1.55, marginBottom: "0.5rem" }}>
							After tilting for <strong>{model.maxIters}</strong> maximum passes, the perceptron settled on a straight fence with bias offset <strong>{biasRisk.toFixed(1)}</strong>.
						</div>
						<div style={{ fontSize: "0.78rem", color: "#64748b" }}>
							Students whose weighted total crosses zero are immediately flagged as At-Risk.
						</div>
					</div>
				</div>
			);
		}

		// 4. KNN: Peer Voting Consensus
		if (activeModel === "knn") {
			const k = model.k || 3;
			const mode = model.weighting === "distance" ? "Distance-Weighted" : "Uniform Equal Vote";

			// Compute cohort neighborhood unanimity
			let unanimousCount = 0;
			let splitCount = 0;
			for (let i = 0; i < xTr.length; i++) {
				const { labels } = model.getNeighbors(xTr[i][0], xTr[i][1]);
				const first = labels[0];
				const allSame = labels.every((l) => l === first);
				if (allSame) unanimousCount++;
				else splitCount++;
			}

			// If user is hovering on canvas, show live neighbor vote for that point
			let probeNeighbors = null;
			if (hoverProbe) {
				const { dists, labels } = model.getNeighbors(hoverProbe.x, hoverProbe.y);
				const c1Peers = labels.filter((l) => Number(l) === S.class1).length;
				const c2Peers = labels.filter((l) => Number(l) === S.class2).length;
				probeNeighbors = {
					c1Peers,
					c2Peers,
					avgDist: dists.length > 0 ? Math.round(dists.reduce((a, b) => a + b, 0) / dists.length) : 0
				};
			}

			return (
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.9rem" }}>
					<div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.8rem 1rem" }}>
						<div style={{ fontSize: "0.75rem", color: "#64748b" }}>Active Peer Committee</div>
						<div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", margin: "0.2rem 0" }}>
							K = {k} Nearest Peers ({mode})
						</div>
						<div style={{ fontSize: "0.78rem", color: "#475569" }}>
							Every prediction is decided directly by the {k} closest students on the chart.
						</div>
					</div>

					<div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.8rem 1rem" }}>
						<div style={{ fontSize: "0.75rem", color: "#64748b" }}>Cohort Neighborhood Agreement</div>
						<div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f766e", margin: "0.2rem 0" }}>
							{unanimousCount} Unanimous / {splitCount} Contested
						</div>
						<div style={{ fontSize: "0.78rem", color: "#475569" }}>
							{unanimousCount} students sit in pure neighborhoods where all {k} peers share the same outcome.
						</div>
					</div>

					<div style={{ background: probeNeighbors ? "#f0fdfa" : "#f8fafc", border: `1px solid ${probeNeighbors ? "#99f6e4" : "#e2e8f0"}`, borderRadius: "8px", padding: "0.8rem 1rem" }}>
						<div style={{ fontSize: "0.75rem", color: "#64748b" }}>Live Cursor Peer Ballot</div>
						{probeNeighbors ? (
							<div>
								<div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", margin: "0.2rem 0" }}>
									{probeNeighbors.c1Peers} On-Track vs {probeNeighbors.c2Peers} At-Risk
								</div>
								<div style={{ fontSize: "0.76rem", color: "#475569" }}>
									Average peer distance: {probeNeighbors.avgDist} units from cursor.
								</div>
							</div>
						) : (
							<div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>
								Hover your mouse over the canvas to see the exact {k}-peer vote at any coordinate.
							</div>
						)}
					</div>
				</div>
			);
		}

		// 5. Naive Bayes: Gaussian Cloud Centers & Spreads
		if (activeModel === "naivebayes" && model.stats) {
			const s1 = model.stats[S.class1];
			const s2 = model.stats[S.class2];
			if (!s1 || !s2) return null;

			return (
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
					<div style={{ background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: "8px", padding: "0.85rem 1rem" }}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
							<span style={{ fontWeight: 700, color: "#0f766e", fontSize: "0.9rem" }}>On-Track Bell Curve Cloud</span>
							<span style={{ fontSize: "0.75rem", fontWeight: 700, background: "#ccfbf1", color: "#0f766e", padding: "0.15rem 0.5rem", borderRadius: "999px" }}>
								Base Rate: {Math.round(s1.prior * 100)}%
							</span>
						</div>
						<div style={{ fontSize: "0.8rem", color: "#1e293b", marginBottom: "0.25rem" }}>
							<strong>{xLabel} Center:</strong> {Math.round(s1.meanX)} (Spread: ±{Math.round(Math.sqrt(s1.varX))})
						</div>
						<div style={{ fontSize: "0.8rem", color: "#1e293b" }}>
							<strong>{yLabel} Center:</strong> {Math.round(s1.meanY)} (Spread: ±{Math.round(Math.sqrt(s1.varY))})
						</div>
					</div>

					<div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "8px", padding: "0.85rem 1rem" }}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
							<span style={{ fontWeight: 700, color: "#be123c", fontSize: "0.9rem" }}>At-Risk Bell Curve Cloud</span>
							<span style={{ fontSize: "0.75rem", fontWeight: 700, background: "#ffe4e6", color: "#be123c", padding: "0.15rem 0.5rem", borderRadius: "999px" }}>
								Base Rate: {Math.round(s2.prior * 100)}%
							</span>
						</div>
						<div style={{ fontSize: "0.8rem", color: "#1e293b", marginBottom: "0.25rem" }}>
							<strong>{xLabel} Center:</strong> {Math.round(s2.meanX)} (Spread: ±{Math.round(Math.sqrt(s2.varX))})
						</div>
						<div style={{ fontSize: "0.8rem", color: "#1e293b" }}>
							<strong>{yLabel} Center:</strong> {Math.round(s2.meanY)} (Spread: ±{Math.round(Math.sqrt(s2.varY))})
						</div>
					</div>
				</div>
			);
		}

		// 6. SVM: Support Vector Roster
		if (activeModel === "svm" && model.svm) {
			const alphas = model.svm.alpha || [];
			let svCount = 0;
			let svOnTrack = 0;
			let svAtRisk = 0;

			for (let i = 0; i < alphas.length; i++) {
				if (alphas[i] > 1e-4) {
					svCount++;
					if (Number(yTr[i]) === S.class1) svOnTrack++;
					else svAtRisk++;
				}
			}
			const ignoredCount = Math.max(0, xTr.length - svCount);
			const kernelName =
				model.kernel === "rbf"
					? `Radial Basis Curve (Sigma: ${model.rbfSigma})`
					: model.kernel === "poly"
					? `Polynomial Curve (Degree: ${model.polyDegree})`
					: "Straight Linear Street";

			return (
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "0.9rem" }}>
					<div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px", padding: "0.8rem 1rem" }}>
						<div style={{ fontSize: "0.75rem", color: "#0369a1", fontWeight: 600 }}>Active Support Vectors</div>
						<div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: "0.2rem 0" }}>
							{svCount} Boundary Students ({svOnTrack} On-Track / {svAtRisk} At-Risk)
						</div>
						<div style={{ fontSize: "0.78rem", color: "#334155" }}>
							These {svCount} edge students physically anchor the position and angle of the street.
						</div>
					</div>

					<div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.8rem 1rem" }}>
						<div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Zero-Impact Outer Students</div>
						<div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#475569", margin: "0.2rem 0" }}>
							{ignoredCount} Non-Support Students
						</div>
						<div style={{ fontSize: "0.78rem", color: "#64748b" }}>
							Students far from the border have zero mathematical pull on the boundary.
						</div>
					</div>

					<div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.8rem 1rem" }}>
						<div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600 }}>Street Geometry & Stiffness</div>
						<div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", margin: "0.2rem 0" }}>
							{kernelName}
						</div>
						<div style={{ fontSize: "0.78rem", color: "#475569" }}>
							Strictness Penalty C = <strong>{model.C}</strong>
						</div>
					</div>
				</div>
			);
		}

		// 7. Random Forest: Committee Votes & Feature Split Importance
		if (activeModel === "randomforest") {
			const trees = model.trees || [];
			const counts = { x: 0, y: 0 };
			trees.forEach((t) => countTreeSplits(t, counts));
			const totalSplits = Math.max(1, counts.x + counts.y);
			const xPct = Math.round((counts.x / totalSplits) * 100);
			const yPct = 100 - xPct;

			let probeVotes = null;
			if (hoverProbe && trees.length > 0) {
				let c2Votes = 0;
				for (let i = 0; i < trees.length; i++) {
					if (trees[i].fire([hoverProbe.x, hoverProbe.y]) === S.class2) c2Votes++;
				}
				probeVotes = {
					c1: trees.length - c2Votes,
					c2: c2Votes,
					total: trees.length
				};
			}

			return (
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.1rem" }}>
					<div>
						<div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
							Feature Split Importance Across {trees.length} Trees
						</div>
						<div style={{ marginBottom: "0.55rem" }}>
							<div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.2rem" }}>
								<span style={{ fontWeight: 600 }}>{xLabel}</span>
								<span style={{ fontWeight: 700, color: "#0f172a" }}>{xPct}% ({counts.x} splits)</span>
							</div>
							<div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
								<div style={{ width: `${xPct}%`, height: "100%", background: "#0284c7" }} />
							</div>
						</div>
						<div>
							<div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.2rem" }}>
								<span style={{ fontWeight: 600 }}>{yLabel}</span>
								<span style={{ fontWeight: 700, color: "#0f172a" }}>{yPct}% ({counts.y} splits)</span>
							</div>
							<div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
								<div style={{ width: `${yPct}%`, height: "100%", background: "#0d9488" }} />
							</div>
						</div>
					</div>

					<div style={{ background: probeVotes ? "#f0fdfa" : "#f8fafc", border: `1px solid ${probeVotes ? "#99f6e4" : "#e2e8f0"}`, borderRadius: "8px", padding: "0.85rem 1rem" }}>
						<div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.35rem" }}>
							Democratic Tree Committee Ballot
						</div>
						{probeVotes ? (
							<div>
								<div style={{ fontSize: "1rem", fontWeight: 700, color: probeVotes.c2 >= probeVotes.c1 ? "#be123c" : "#0f766e", marginBottom: "0.25rem" }}>
									{probeVotes.c1} Trees Vote On-Track vs {probeVotes.c2} Trees Vote At-Risk
								</div>
								<div style={{ fontSize: "0.78rem", color: "#475569" }}>
									Committee consensus at cursor: <strong>{Math.round((Math.max(probeVotes.c1, probeVotes.c2) / probeVotes.total) * 100)}%</strong> agreement.
								</div>
							</div>
						) : (
							<div style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.5 }}>
								Each of the <strong>{trees.length}</strong> trees trained on a random 80% student sample up to depth <strong>{model.maxDepth}</strong>. Hover over the canvas to see the live tree vote tally.
							</div>
						)}
					</div>
				</div>
			);
		}

		// 8. XGBoost: Sequential Boosting Relay & Split Usage
		if (activeModel === "xgboost") {
			const trees = model.trees || [];
			const counts = { x: 0, y: 0 };
			trees.forEach((t) => countTreeSplits(t, counts));
			const totalSplits = Math.max(1, counts.x + counts.y);
			const xPct = Math.round((counts.x / totalSplits) * 100);
			const yPct = 100 - xPct;
			const baseProb = Math.round(model.sigmoid(model.baseLogOdds || 0) * 100);

			return (
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.1rem" }}>
					<div>
						<div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
							Feature Usage Across {trees.length} Boosting Stages
						</div>
						<div style={{ marginBottom: "0.55rem" }}>
							<div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.2rem" }}>
								<span style={{ fontWeight: 600 }}>{xLabel}</span>
								<span style={{ fontWeight: 700, color: "#0f172a" }}>{xPct}% ({counts.x} splits)</span>
							</div>
							<div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
								<div style={{ width: `${xPct}%`, height: "100%", background: "#0284c7" }} />
							</div>
						</div>
						<div>
							<div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.2rem" }}>
								<span style={{ fontWeight: 600 }}>{yLabel}</span>
								<span style={{ fontWeight: 700, color: "#0f172a" }}>{yPct}% ({counts.y} splits)</span>
							</div>
							<div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
								<div style={{ width: `${yPct}%`, height: "100%", background: "#0d9488" }} />
							</div>
						</div>
					</div>

					<div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.85rem 1rem" }}>
						<div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.35rem" }}>
							Sequential Additive Relay Summary
						</div>
						<div style={{ fontSize: "0.8rem", color: "#334155", lineHeight: 1.55 }}>
							Stage 0 begins with a baseline cohort risk of <strong>{baseProb}%</strong>. Each of the <strong>{trees.length}</strong> shallow trees (Depth {model.maxDepth}) targets remaining errors, scaled by learning rate <strong>η = {model.learningRate}</strong> and regularized by <strong>λ = {model.l2Reg}</strong>.
						</div>
					</div>
				</div>
			);
		}

		// 9. ANN: Neural Network Architecture & Input Sensitivity
		if (activeModel === "ann") {
			const layers = model.layers || [2, 4, 3, 1];
			let xStrength = 0;
			let yStrength = 0;
			let totalWeights = 0;

			if (model.A && model.A.length > 0) {
				const firstMat = model.A[0].valueOf ? model.A[0].valueOf() : model.A[0];
				if (Array.isArray(firstMat)) {
					for (let r = 0; r < firstMat.length; r++) {
						if (Array.isArray(firstMat[r])) {
							xStrength += Math.abs(firstMat[r][0] || 0);
							yStrength += Math.abs(firstMat[r][1] || 0);
						}
					}
				}
				for (let l = 0; l < layers.length - 1; l++) {
					totalWeights += layers[l] * layers[l + 1] + layers[l + 1];
				}
			}

			const sumStrength = Math.max(0.001, xStrength + yStrength);
			const xPct = Math.round((xStrength / sumStrength) * 100);
			const yPct = 100 - xPct;

			return (
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.1rem" }}>
					<div>
						<div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
							First-Layer Input Synapse Sensitivity
						</div>
						<div style={{ marginBottom: "0.55rem" }}>
							<div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.2rem" }}>
								<span style={{ fontWeight: 600 }}>{xLabel} Signal Strength</span>
								<span style={{ fontWeight: 700, color: "#0f172a" }}>{xPct}%</span>
							</div>
							<div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
								<div style={{ width: `${xPct}%`, height: "100%", background: "#0284c7" }} />
							</div>
						</div>
						<div>
							<div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.2rem" }}>
								<span style={{ fontWeight: 600 }}>{yLabel} Signal Strength</span>
								<span style={{ fontWeight: 700, color: "#0f172a" }}>{yPct}%</span>
							</div>
							<div style={{ height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
								<div style={{ width: `${yPct}%`, height: "100%", background: "#0d9488" }} />
							</div>
						</div>
					</div>

					<div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.85rem 1rem" }}>
						<div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.35rem" }}>
							Active Neural Architecture
						</div>
						<div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f766e", marginBottom: "0.3rem" }}>
							Layers: {layers.join(" → ")} Neurons ({totalWeights} Trainable Parameters)
						</div>
						<div style={{ fontSize: "0.78rem", color: "#475569", lineHeight: 1.5 }}>
							Signals pass through hyperbolic tangent (tanh) hidden activations to bend nonlinear decision boundaries.
						</div>
					</div>
				</div>
			);
		}

		return null;
	};

	return (
		<div className="tree-visualizer-card">
			<div className="xai-header" style={{ marginBottom: isCollapsed ? 0 : "1.1rem", borderBottom: isCollapsed ? "none" : undefined, paddingBottom: isCollapsed ? 0 : undefined }}>
				<div>
					<h3 className="xai-title">{meta.title}</h3>
					<span className="xai-subtitle">{meta.subtitle}</span>
				</div>
				<button
					type="button"
					onClick={() => setIsCollapsed(!isCollapsed)}
					style={{
						background: "#f1f5f9",
						border: "1px solid #cbd5e1",
						borderRadius: "6px",
						padding: "0.3rem 0.7rem",
						fontSize: "0.76rem",
						fontWeight: 600,
						color: "#334155",
						cursor: "pointer",
						whiteSpace: "nowrap"
					}}
				>
					{isCollapsed ? "Show Inspector" : "Hide Inspector"}
				</button>
			</div>

			{!isCollapsed && (
				<div>
					{renderContent()}
					<WhatIfCounterfactualPanel
						model={model}
						xTr={xTr}
						yTr={yTr}
						xLabel={xLabel}
						yLabel={yLabel}
						hoverProbe={hoverProbe}
					/>
				</div>
			)}
		</div>
	);
}
