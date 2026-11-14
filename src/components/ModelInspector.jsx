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
			title: "KNN Neighborhood Inspector",
			subtitle: "Inspects the nearest training neighbors and how their class vote is tallied."
		},
		logistic: {
			title: "Logistic Regression Weights",
			subtitle: "Shows how each student metric shifts the log-odds toward On-Track or At-Risk."
		},
		naivebayes: {
			title: "Naive Bayes Gaussian Parameters",
			subtitle: "Displays the learned group means, standard deviations, and prior probabilities."
		},
		perceptron: {
			title: "Perceptron Linear Weights",
			subtitle: "Shows the learned linear weights and bias offset for the separating hyperplane."
		},
		svm: {
			title: "SVM Support Vector Roster",
			subtitle: "Reports how many boundary observations act as support vectors versus outer points."
		},
		randomforest: {
			title: "Random Forest Split & Vote Inspector",
			subtitle: "Reports feature split proportions across the ensemble and individual tree votes."
		},
		xgboost: {
			title: "XGBoost Boosting Stage Inspector",
			subtitle: "Shows baseline cohort risk, boosting hyperparameters, and feature split balance."
		},
		cba: {
			title: "CBA Discovered Rules",
			subtitle: "Lists the discretized IF-THEN classification rules ordered by confidence and support."
		},
		ann: {
			title: "Neural Network Architecture & Weights",
			subtitle: "Summarizes the hidden layer topology and input-layer connection weight magnitudes."
		}
	};

	const meta = MODEL_META[activeModel] || {
		title: "Model Parameter Inspector",
		subtitle: "Inspect the internal rules and weights learned by the active algorithm."
	};

	if (!isTrained || !model || xTr.length < 2) {
		return (
			<div className="tree-visualizer-card empty">
				<div className="xai-title">{meta.title}</div>
				<p className="xai-hint">
					Plot students on the canvas and click <strong>Train Model</strong> to inspect the learned parameters of this classifier.
				</p>
			</div>
		);
	}

	const renderWeightBar = (label, weight, maxAbs) => {
		const pct = maxAbs > 0 ? Math.min(100, Math.round((Math.abs(weight) / maxAbs) * 100)) : 0;
		const isAtRiskPull = weight > 0;
		const direction =
			Math.abs(weight) < 0.001
				? "Neutral"
				: isAtRiskPull
				? "Shifts toward At-Risk"
				: "Shifts toward On-Track";
		return (
			<div key={label} className="inspector-bar-item">
				<div className="inspector-bar-row">
					<span className="inspector-bar-label">{label}</span>
					<span className={`inspector-bar-val ${Math.abs(weight) < 0.001 ? "is-neutral" : isAtRiskPull ? "is-risk" : "is-ontrack"}`}>
						{weight >= 0 ? `+${weight.toFixed(2)}` : weight.toFixed(2)}{" "}
						<span className="inspector-bar-dir">({direction})</span>
					</span>
				</div>
				<div className="inspector-bar-track">
					<div
						className={`inspector-bar-fill ${Math.abs(weight) < 0.001 ? "is-neutral" : isAtRiskPull ? "is-risk" : "is-ontrack"}`}
						style={{ width: `${Math.max(4, pct)}%` }}
					/>
				</div>
			</div>
		);
	};

	const renderContent = () => {
		// 1. CBA: Discretized Association Rules
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
					? "Default On-Track"
					: model.majorityClass === S.class2
					? "Cohort Majority (At-Risk)"
					: "Cohort Majority (On-Track)";

			return (
				<div>
					<div className="inspector-stat-grid">
						<div className="inspector-stat">
							<div className="inspector-stat-kicker">Grid Resolution</div>
							<div className="inspector-stat-value">
								{k} x {k} ({totalTiles} cells)
							</div>
						</div>
						<div className="inspector-stat">
							<div className="inspector-stat-kicker">Qualified Rules</div>
							<div className="inspector-stat-value is-ontrack">
								{ruleList.length} rules
							</div>
						</div>
						<div className="inspector-stat">
							<div className="inspector-stat-kicker">Uncovered Cell Fallback ({uncoveredTiles} cells)</div>
							<div className="inspector-stat-value">{fallbackLabel}</div>
						</div>
					</div>

					{ruleList.length === 0 ? (
						<div className="inspector-empty-alert">
							No grid cell met the current minimum confidence ({Math.round((model.minConfidence || 0.65) * 100)}%) and support ({model.minSupport || 1} students) thresholds. Lower Min Confidence or Min Support to generate rules.
						</div>
					) : (
						<div className="inspector-rule-grid">
							{ruleList.map((r, idx) => {
								const isRisk = r.pred === S.class2;
								return (
									<div
										key={r.key}
										className={`inspector-rule-card ${isRisk ? "is-risk" : "is-ontrack"}`}
									>
										<div className="inspector-rule-head">
											<span className="inspector-rule-num">Rule #{idx + 1}</span>
											<span className={`inspector-tag ${isRisk ? "is-risk" : "is-ontrack"}`}>
												THEN {isRisk ? "At-Risk" : "On-Track"}
											</span>
										</div>
										<div className="inspector-rule-body">
											IF {xLabel} is <u>{r.xBand}</u> AND {yLabel} is <u>{r.yBand}</u>
										</div>
										<div className="inspector-rule-meta">
											Confidence: <strong>{r.conf}%</strong> ({r.supp} of {r.totalInBin} students in cell)
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
				<div className="inspector-two-col">
					<div>
						<div className="inspector-col-heading">
							Learned Feature Influence (Log-Odds Weights)
						</div>
						{items.map((it) => renderWeightBar(it.label, it.val, maxAbs))}
					</div>
					<div className="inspector-note">
						<div className="inspector-col-heading">
							Log-Odds &amp; Sigmoid Calculation
						</div>
						<p className="inspector-note-text">
							Each student metric is multiplied by its weight, summed with the intercept (<strong>{(w[0] || 0).toFixed(2)}</strong>), and mapped through the logistic sigmoid function to produce a risk probability between 0% and 100%.
						</p>
						<div className="inspector-tag-row">
							<span className="inspector-tag is-risk">
								Alert Cutoff: {Math.round((model.threshold || 0.5) * 100)}%
							</span>
							<span className="inspector-tag">
								Boundary Mode: {isQuad ? "Degree 2 Curve" : "Degree 1 Linear"}
							</span>
						</div>
					</div>
				</div>
			);
		}

		// 3. Perceptron: Linear Boundary Weights
		if (activeModel === "perceptron") {
			const w = model.w || [0, 0, 0];
			// In Perceptron: result = w[0]*x + w[1]*y + w[2]*100.
			// Positive result -> Class 1 (On-Track), Negative -> Class 2 (At-Risk).
			// Flip sign so positive bar consistently means shifts toward At-Risk.
			const wxRisk = -w[0];
			const wyRisk = -w[1];
			const biasRisk = -w[2];
			const maxAbs = Math.max(0.1, Math.abs(wxRisk), Math.abs(wyRisk));

			return (
				<div className="inspector-two-col">
					<div>
						<div className="inspector-col-heading">
							Linear Feature Weight Balance
						</div>
						{renderWeightBar(xLabel, wxRisk, maxAbs)}
						{renderWeightBar(yLabel, wyRisk, maxAbs)}
					</div>
					<div className="inspector-note">
						<div className="inspector-col-heading">
							Linear Boundary Equation
						</div>
						<p className="inspector-note-text">
							After <strong>{model.maxIters}</strong> maximum training passes, the perceptron weights stabilized with bias offset <strong>{biasRisk.toFixed(1)}</strong>.
						</p>
						<div className="inspector-subnote">
							Students whose weighted linear combination crosses zero are classified as At-Risk.
						</div>
					</div>
				</div>
			);
		}

		// 4. KNN: Neighborhood Consensus
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
				<div className="inspector-stat-grid">
					<div className="inspector-stat">
						<div className="inspector-stat-kicker">Neighborhood Configuration</div>
						<div className="inspector-stat-value">
							K = {k} Nearest Peers ({mode})
						</div>
						<div className="inspector-stat-desc">
							Each prediction is determined directly by the {k} closest students in feature space.
						</div>
					</div>

					<div className="inspector-stat">
						<div className="inspector-stat-kicker">Cohort Neighborhood Agreement</div>
						<div className="inspector-stat-value is-ontrack">
							{unanimousCount} Unanimous / {splitCount} Contested
						</div>
						<div className="inspector-stat-desc">
							{unanimousCount} students sit in uniform neighborhoods where all {k} neighbors share the same class.
						</div>
					</div>

					<div className={`inspector-stat ${probeNeighbors ? "is-active-probe" : ""}`}>
						<div className="inspector-stat-kicker">Cursor Neighbor Vote</div>
						{probeNeighbors ? (
							<div>
								<div className="inspector-stat-value">
									{probeNeighbors.c1Peers} On-Track vs {probeNeighbors.c2Peers} At-Risk
								</div>
								<div className="inspector-stat-desc">
									Mean neighbor distance: {probeNeighbors.avgDist} units from cursor.
								</div>
							</div>
						) : (
							<div className="inspector-stat-desc">
								Hover over the canvas to inspect the {k}-neighbor vote at any coordinate.
							</div>
						)}
					</div>
				</div>
			);
		}

		// 5. Naive Bayes: Gaussian Class Distributions
		if (activeModel === "naivebayes" && model.stats) {
			const s1 = model.stats[S.class1];
			const s2 = model.stats[S.class2];
			if (!s1 || !s2) return null;

			return (
				<div className="inspector-two-col">
					<div className="inspector-class-summary is-ontrack">
						<div className="inspector-rule-head">
							<span className="inspector-class-title is-ontrack">On-Track Gaussian Distribution</span>
							<span className="inspector-tag is-ontrack">
								Prior: {Math.round(s1.prior * 100)}%
							</span>
						</div>
						<div className="inspector-class-row">
							<strong>{xLabel} Mean:</strong> {Math.round(s1.meanX)} (SD: {Math.round(Math.sqrt(s1.varX))})
						</div>
						<div className="inspector-class-row">
							<strong>{yLabel} Mean:</strong> {Math.round(s1.meanY)} (SD: {Math.round(Math.sqrt(s1.varY))})
						</div>
					</div>

					<div className="inspector-class-summary is-risk">
						<div className="inspector-rule-head">
							<span className="inspector-class-title is-risk">At-Risk Gaussian Distribution</span>
							<span className="inspector-tag is-risk">
								Prior: {Math.round(s2.prior * 100)}%
							</span>
						</div>
						<div className="inspector-class-row">
							<strong>{xLabel} Mean:</strong> {Math.round(s2.meanX)} (SD: {Math.round(Math.sqrt(s2.varX))})
						</div>
						<div className="inspector-class-row">
							<strong>{yLabel} Mean:</strong> {Math.round(s2.meanY)} (SD: {Math.round(Math.sqrt(s2.varY))})
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
					? `Radial Basis Function (Sigma: ${model.rbfSigma})`
					: model.kernel === "poly"
					? `Polynomial Kernel (Degree: ${model.polyDegree})`
					: "Linear Kernel";

			return (
				<div className="inspector-stat-grid">
					<div className="inspector-stat">
						<div className="inspector-stat-kicker">Active Support Vectors</div>
						<div className="inspector-stat-value">
							{svCount} Boundary Points ({svOnTrack} On-Track / {svAtRisk} At-Risk)
						</div>
						<div className="inspector-stat-desc">
							These {svCount} boundary observations determine the orientation and margin width.
						</div>
					</div>

					<div className="inspector-stat">
						<div className="inspector-stat-kicker">Non-Support Observations</div>
						<div className="inspector-stat-value">
							{ignoredCount} Zero-Weight Points
						</div>
						<div className="inspector-stat-desc">
							Observations safely outside the margin receive zero dual weight.
						</div>
					</div>

					<div className="inspector-stat">
						<div className="inspector-stat-kicker">Kernel &amp; Regularization</div>
						<div className="inspector-stat-value">{kernelName}</div>
						<div className="inspector-stat-desc">
							Regularization parameter C = <strong>{model.C}</strong>
						</div>
					</div>
				</div>
			);
		}

		// 7. Random Forest: Ensemble Votes & Feature Split Importance
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
				<div className="inspector-two-col">
					<div>
						<div className="inspector-col-heading">
							Feature Split Proportions Across {trees.length} Trees
						</div>
						<div className="inspector-bar-item">
							<div className="inspector-bar-row">
								<span className="inspector-bar-label">{xLabel}</span>
								<span className="inspector-bar-val">{xPct}% ({counts.x} splits)</span>
							</div>
							<div className="inspector-bar-track">
								<div className="inspector-bar-fill is-x" style={{ width: `${xPct}%` }} />
							</div>
						</div>
						<div className="inspector-bar-item">
							<div className="inspector-bar-row">
								<span className="inspector-bar-label">{yLabel}</span>
								<span className="inspector-bar-val">{yPct}% ({counts.y} splits)</span>
							</div>
							<div className="inspector-bar-track">
								<div className="inspector-bar-fill is-y" style={{ width: `${yPct}%` }} />
							</div>
						</div>
					</div>

					<div className={`inspector-note ${probeVotes ? "is-active-probe" : ""}`}>
						<div className="inspector-col-heading">
							Ensemble Vote Summary
						</div>
						{probeVotes ? (
							<div>
								<div className={`inspector-vote-result ${probeVotes.c2 >= probeVotes.c1 ? "is-risk" : "is-ontrack"}`}>
									{probeVotes.c1} Trees Vote On-Track vs {probeVotes.c2} Trees Vote At-Risk
								</div>
								<div className="inspector-subnote">
									Ensemble agreement at cursor: <strong>{Math.round((Math.max(probeVotes.c1, probeVotes.c2) / probeVotes.total) * 100)}%</strong>.
								</div>
							</div>
						) : (
							<div className="inspector-note-text">
								Each of the <strong>{trees.length}</strong> trees trained on a bootstrap sample up to max depth <strong>{model.maxDepth}</strong>. Hover over the canvas to inspect tree votes at any point.
							</div>
						)}
					</div>
				</div>
			);
		}

		// 8. XGBoost: Sequential Boosting Stages & Split Usage
		if (activeModel === "xgboost") {
			const trees = model.trees || [];
			const counts = { x: 0, y: 0 };
			trees.forEach((t) => countTreeSplits(t, counts));
			const totalSplits = Math.max(1, counts.x + counts.y);
			const xPct = Math.round((counts.x / totalSplits) * 100);
			const yPct = 100 - xPct;
			const baseProb = Math.round(model.sigmoid(model.baseLogOdds || 0) * 100);

			return (
				<div className="inspector-two-col">
					<div>
						<div className="inspector-col-heading">
							Feature Split Counts Across {trees.length} Boosting Stages
						</div>
						<div className="inspector-bar-item">
							<div className="inspector-bar-row">
								<span className="inspector-bar-label">{xLabel}</span>
								<span className="inspector-bar-val">{xPct}% ({counts.x} splits)</span>
							</div>
							<div className="inspector-bar-track">
								<div className="inspector-bar-fill is-x" style={{ width: `${xPct}%` }} />
							</div>
						</div>
						<div className="inspector-bar-item">
							<div className="inspector-bar-row">
								<span className="inspector-bar-label">{yLabel}</span>
								<span className="inspector-bar-val">{yPct}% ({counts.y} splits)</span>
							</div>
							<div className="inspector-bar-track">
								<div className="inspector-bar-fill is-y" style={{ width: `${yPct}%` }} />
							</div>
						</div>
					</div>

					<div className="inspector-note">
						<div className="inspector-col-heading">
							Additive Boosting Summary
						</div>
						<div className="inspector-note-text">
							Stage 0 begins with a cohort base risk of <strong>{baseProb}%</strong>. Each of the <strong>{trees.length}</strong> shallow trees (max depth {model.maxDepth}) fits negative gradient residuals, scaled by learning rate <strong>η = {model.learningRate}</strong> and regularized by <strong>λ = {model.l2Reg}</strong>.
						</div>
					</div>
				</div>
			);
		}

		// 9. ANN: Neural Network Architecture & Input Weight Sensitivity
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
				<div className="inspector-two-col">
					<div>
						<div className="inspector-col-heading">
							Input-Layer Weight Magnitude
						</div>
						<div className="inspector-bar-item">
							<div className="inspector-bar-row">
								<span className="inspector-bar-label">{xLabel} Weight Share</span>
								<span className="inspector-bar-val">{xPct}%</span>
							</div>
							<div className="inspector-bar-track">
								<div className="inspector-bar-fill is-x" style={{ width: `${xPct}%` }} />
							</div>
						</div>
						<div className="inspector-bar-item">
							<div className="inspector-bar-row">
								<span className="inspector-bar-label">{yLabel} Weight Share</span>
								<span className="inspector-bar-val">{yPct}%</span>
							</div>
							<div className="inspector-bar-track">
								<div className="inspector-bar-fill is-y" style={{ width: `${yPct}%` }} />
							</div>
						</div>
					</div>

					<div className="inspector-note">
						<div className="inspector-col-heading">
							Network Topology
						</div>
						<div className="inspector-topology-line">
							Layers: {layers.join(" → ")} Neurons ({totalWeights} Trainable Parameters)
						</div>
						<div className="inspector-subnote">
							Hidden units apply the hyperbolic tangent (tanh) activation function to represent nonlinear decision boundaries.
						</div>
					</div>
				</div>
			);
		}

		return null;
	};

	return (
		<div className="tree-visualizer-card">
			<div className={`xai-header ${isCollapsed ? "is-collapsed" : ""}`}>
				<div>
					<h3 className="xai-title">{meta.title}</h3>
					<span className="xai-subtitle">{meta.subtitle}</span>
				</div>
				<button
					type="button"
					className="inspector-toggle-btn"
					onClick={() => setIsCollapsed(!isCollapsed)}
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
