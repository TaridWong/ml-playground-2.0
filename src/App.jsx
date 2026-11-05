import React, { useState, useEffect, useRef, useMemo } from "react";
import S from "./s";
import Canvas from "./canvas";
import Store from "./store";
import UI from "./ui";
import { EDUCATIONAL_PRESETS } from "./presets";
import { calculateMetrics } from "./metrics";
import MetricsDashboard from "./components/MetricsDashboard";
import PatternGuideModal from "./components/PatternGuideModal";
import DecisionTreeVisualizer from "./components/DecisionTreeVisualizer";
import ModelComparisonModal from "./components/ModelComparisonModal";

export default function App() {
	const canvasRef = useRef(null);
	const canvasObjRef = useRef(null);

	// Create store once so UI is ready immediately on initial render
	const store = useMemo(() => new Store(), []);

	const [infoContent, setInfoContent] = useState(null);
	const [isTraining, setIsTraining] = useState(false);
	const [activeModel, setActiveModel] = useState(S.model[0]);
	const [pointCounts, setPointCounts] = useState({ class1: 0, class2: 0, total: 0 });

	// Default to Open Sandbox mode as preferred for student experimentation!
	const [activePresetId, setActivePresetId] = useState("custom");
	const [metrics, setMetrics] = useState(null);
	const [isGuideOpen, setIsGuideOpen] = useState(false);
	const [isComparisonOpen, setIsComparisonOpen] = useState(false);
	const [viewMode, setViewMode] = useState("boundary"); // "boundary" | "confidence"
	const [hoverProbe, setHoverProbe] = useState(null);
	const [treeHierarchy, setTreeHierarchy] = useState(null);

	const activePreset = useMemo(() => {
		if (activePresetId === "custom") return null;
		return EDUCATIONAL_PRESETS.find((p) => p.id === activePresetId) || null;
	}, [activePresetId]);

	const updateCounts = () => {
		const y = store.yTr || [];
		const c1 = y.filter((val) => val === S.class1).length;
		const c2 = y.filter((val) => val === S.class2).length;
		setPointCounts({ class1: c1, class2: c2, total: y.length });
	};

	const recomputeMetrics = () => {
		const evalData = store.evaluateCohort();
		if (evalData && evalData.actual.length > 0) {
			const calculated = calculateMetrics(evalData.actual, evalData.predicted, evalData.scores, 2);
			setMetrics(calculated);
		} else {
			setMetrics(null);
		}
	};

	// Initialize Canvas (Open Sandbox by default)
	useEffect(() => {
		const canvasElem = canvasRef.current;
		if (!canvasElem) return;

		const ctx = canvasElem.getContext("2d");
		ctx.canvas.width = S.canvasW;
		ctx.canvas.height = S.canvasH;

		const canvasObj = new Canvas(canvasElem);
		canvasObj.linkToStore(store);
		canvasObjRef.current = canvasObj;

		// Patch store point mutations
		const origAdd = store.addPoint.bind(store);
		store.addPoint = (xTr, yTr) => {
			origAdd(xTr, yTr);
			updateCounts();
			if (metrics) recomputeMetrics();
		};

		const origErase = store.erase.bind(store);
		store.erase = (xTr) => {
			origErase(xTr);
			updateCounts();
			if (metrics) recomputeMetrics();
		};

		const origClear = store.clearAll.bind(store);
		store.clearAll = () => {
			origClear();
			updateCounts();
			setMetrics(null);
		};

		// Start with clean open canvas
		canvasObj.clearCtx();
		canvasObj.drawStoreTr();
		updateCounts();

		const handleCanvasClick = (e) => {
			canvasObj.onPointAdded(e);
		};

		const handleCanvasTouch = (e) => {
			e.preventDefault();
			canvasObj.onPointAdded(e);
		};

		const handleCanvasMove = (e) => {
			if (!store.classif) return;
			const pos = canvasObj.getMousePos(e);
			const x = pos[0];
			const y = pos[1];

			const scoreVal = typeof store.classif.score === "function" ? store.classif.score(x, y) : (store.classif.classif(x, y) === S.class2 ? 1 : 0);
			const predVal = store.classif.classif(x, y);

			// Check proximity to student points (within 14px)
			let targetStudent = null;
			for (let i = 0; i < store.xTr.length; i++) {
				const pt = store.xTr[i];
				const dist = Math.sqrt(Math.pow(pt[0] - x, 2) + Math.pow(pt[1] - y, 2));
				if (dist <= 14) {
					targetStudent = {
						index: i + 1,
						x: pt[0],
						y: pt[1],
						actual: store.yTr[i],
						predicted: store.classif.classif(pt[0], pt[1]),
						prob: typeof store.classif.score === "function" ? store.classif.score(pt[0], pt[1]) : 0
					};
					break;
				}
			}

			setHoverProbe({
				x: Math.round(x),
				y: Math.round(y),
				prob: scoreVal,
				pred: predVal,
				targetStudent
			});
		};

		const handleCanvasLeave = () => {
			setHoverProbe(null);
		};

		canvasElem.addEventListener("click", handleCanvasClick);
		canvasElem.addEventListener("touchstart", handleCanvasTouch, { passive: false });
		canvasElem.addEventListener("mousemove", handleCanvasMove);
		canvasElem.addEventListener("mouseleave", handleCanvasLeave);

		return () => {
			canvasElem.removeEventListener("click", handleCanvasClick);
			canvasElem.removeEventListener("touchstart", handleCanvasTouch);
			canvasElem.removeEventListener("mousemove", handleCanvasMove);
			canvasElem.removeEventListener("mouseleave", handleCanvasLeave);
		};
	}, [store]);

	const handleTrain = async () => {
		if (!canvasObjRef.current || isTraining) return;
		setIsTraining(true);
		try {
			await canvasObjRef.current.trainAndClassif();
			recomputeMetrics();
			if (store.classif && typeof store.classif.getTreeHierarchy === "function") {
				const xLbl = activePreset ? activePreset.xAxis : "Feature X";
				const yLbl = activePreset ? activePreset.yAxis : "Feature Y";
				setTreeHierarchy(store.classif.getTreeHierarchy(xLbl, yLbl));
			} else {
				setTreeHierarchy(null);
			}
		} catch (err) {
			console.error("Training error:", err);
		} finally {
			setIsTraining(false);
		}
	};

	const handleViewModeToggle = (mode) => {
		setViewMode(mode);
		if (canvasObjRef.current) {
			canvasObjRef.current.setViewMode(mode);
		}
	};

	const handleReclassify = async () => {
		if (!canvasObjRef.current || isTraining) return;
		try {
			await canvasObjRef.current.reclassifyAndDraw();
			recomputeMetrics();
		} catch (err) {
			console.error("Reclassify error:", err);
		}
	};

	const handlePresetChange = (presetId) => {
		setActivePresetId(presetId);
		setMetrics(null);
		if (presetId === "custom") {
			store.clearAll();
			if (canvasObjRef.current) {
				canvasObjRef.current.clearCtx();
			}
			return;
		}

		const preset = EDUCATIONAL_PRESETS.find((p) => p.id === presetId);
		if (preset && canvasObjRef.current) {
			store.loadPresetPoints(preset.points);
			canvasObjRef.current.clearCtx();
			canvasObjRef.current.drawStoreTr();
			updateCounts();
		}
	};

	const handleSetClass = (brush) => {
		if (canvasObjRef.current) {
			canvasObjRef.current.setBrush(brush);
		}
	};

	const handleRepaint = () => {
		if (canvasObjRef.current) {
			canvasObjRef.current.clearCtx();
			canvasObjRef.current.drawStoreTr();
			updateCounts();
			if (metrics) recomputeMetrics();
		}
	};

	const handleClearAll = () => {
		if (canvasObjRef.current) {
			canvasObjRef.current.clearAll();
			setActivePresetId("custom");
			setPointCounts({ class1: 0, class2: 0, total: 0 });
			setMetrics(null);
		}
	};

	const handleSelectModelFromComparison = (modelId) => {
		setActiveModel(modelId);
		setMetrics(null);
		setHoverProbe(null);
		// Allow UI componentDidUpdate to propagate, then train
		setTimeout(() => {
			if (canvasObjRef.current && !isTraining) {
				handleTrain();
			}
		}, 100);
	};

	return (
		<div className="app-wrapper">
			{/* Topbar */}
			<header id="topbar">
				<div className="topbar-left">
					<img id="logo" src="./img/logo.svg" alt="ML Playground Logo" />
					<div className="title-group">
						<div className="main-title-line">
							<span className="main-title">Machine Learning Playground</span>
							<span className="version-badge">2.0</span>
						</div>
						<span className="subtitle">for Learning Analytics & Educational Data Mining</span>
						<span className="authorship-subtitle">Developed by Jo Chuang; Extended by Tarid Wongvorachan</span>
					</div>
				</div>
				<div className="topbar-right">
					<button
						className="btn-guide-trigger"
						onClick={() => setIsGuideOpen(true)}
						title="Open guide explaining how data organizes into linear, non-linear, and noisy patterns"
					>
						Data Patterns Guide
					</button>

					<span className="badge-count" title="Total plotted points">
						Points: {pointCounts.total} (
						<span style={{ color: "#0D9488" }}>● {pointCounts.class1}</span> /{" "}
						<span style={{ color: "#E11D48" }}>● {pointCounts.class2}</span>)
					</span>
					<a
						id="github-link"
						href="https://github.com/TaridWong/ML-Playground"
						target="_blank"
						rel="noreferrer"
						title="View repository on GitHub"
					>
						GitHub
					</a>
				</div>
			</header>

			{/* Main Workspace */}
			<main className="container-fluid">
				{/* Context Banner: Displays pedagogical notes only when a template is loaded from the Data Patterns Guide */}
				{activePreset && (
					<div className="scenario-context-banner">
						<div className="scenario-desc">
							<div className="scenario-title-line">
								<strong>Loaded Pattern: {activePreset.title}</strong>
								<span className="shape-badge">{activePreset.shape}</span>
							</div>
							<div className="scenario-lesson">
								<strong>Pedagogical Challenge:</strong> {activePreset.pedagogicalLesson}
							</div>
						</div>
						<div className="scenario-actions">
							<div className="scenario-tags">
								<span className="tag on-track">● Teal = {activePreset.negativeLabel}</span>
								<span className="tag at-risk">● Rose = {activePreset.positiveLabel}</span>
							</div>
							<button
								className="btn-reset-sandbox"
								onClick={() => handlePresetChange("custom")}
								title="Clear loaded template and return to blank sandbox"
							>
								Clear to Blank Sandbox
							</button>
						</div>
					</div>
				)}

				<div className="playground-grid">
					{/* Left: Canvas Area */}
					<section className="canvas-section">
						<div className="canvas-card">
							<div className="canvas-header">
								<span className="axis-title-y">
									▲ {activePreset ? activePreset.yAxis : "Feature Y (e.g. Exam / Quiz %)"}
								</span>
								<div className="view-mode-toggle-group">
									<button
										type="button"
										className={`btn-view-mode ${viewMode === "boundary" ? "active" : ""}`}
										onClick={() => handleViewModeToggle("boundary")}
										title="Solid decision regions separating classes"
									>
										Solid Boundary
									</button>
									<button
										type="button"
										className={`btn-view-mode ${viewMode === "confidence" ? "active" : ""}`}
										onClick={() => handleViewModeToggle("confidence")}
										title="Smooth continuous probability gradient indicating certainty and decision boundary uncertainty"
									>
										Probability Heatmap
									</button>
								</div>
							</div>

							{/* Live Model Inspector HUD */}
							<div className="canvas-hud">
								{hoverProbe ? (
									<div className="hud-content">
										<div className="hud-row hud-row-metrics">
											<span className="hud-item">
												<strong>Cursor:</strong> X: {hoverProbe.x > 0 ? `+${hoverProbe.x}` : hoverProbe.x}, Y: {hoverProbe.y > 0 ? `+${hoverProbe.y}` : hoverProbe.y}
											</span>
											<span className="hud-sep">•</span>
											<span className="hud-item">
												<strong>Risk Probability:</strong> <span style={{ color: "#BE123C", fontWeight: 700 }}>{Math.round(hoverProbe.prob * 100)}%</span>
											</span>
											<span className="hud-sep">•</span>
											<span className="hud-item">
												<strong>Predict:</strong>{" "}
												<span style={{ color: hoverProbe.pred === 2 ? "#E11D48" : "#0D9488", fontWeight: 700 }}>
													● {hoverProbe.pred === 2 ? "At-Risk" : "On-Track"}
												</span>
											</span>
										</div>
										<div className="hud-row hud-row-student">
											{hoverProbe.targetStudent ? (
												<span className={`hud-student-tag ${hoverProbe.targetStudent.actual === hoverProbe.targetStudent.predicted ? "match" : "mismatch"}`}>
													Student #{hoverProbe.targetStudent.index}: Actual {hoverProbe.targetStudent.actual === 2 ? "At-Risk" : "On-Track"} ({hoverProbe.targetStudent.actual === hoverProbe.targetStudent.predicted ? "✓ Correct" : "⚠ Misclassified"})
												</span>
											) : (
												<span className="hud-student-placeholder">
													Hover near any plotted student dot to inspect their outcome
												</span>
											)}
										</div>
									</div>
								) : (
									<div className="hud-content">
										<div className="hud-row hud-row-metrics">
											<span className="hud-idle-title">Real-Time Model Inspector</span>
										</div>
										<div className="hud-row hud-row-student">
											<span className="hud-student-placeholder">
												Move cursor across canvas to evaluate risk probabilities and student outcomes
											</span>
										</div>
									</div>
								)}
							</div>

							<div id="canvasDiv">
								<canvas id="canvas" ref={canvasRef}></canvas>
							</div>

							<div className="canvas-footer">
								<span className="axis-title-x">
									▶ {activePreset ? activePreset.xAxis : "Feature X (e.g. Engagement / Practice)"}
								</span>
							</div>
						</div>
					</section>

					{/* Right: Controls & Parameters */}
					<section className="options-section" id="options">
						<UI
							store={store}
							setClass={handleSetClass}
							train={handleTrain}
							reclassify={handleReclassify}
							isTraining={isTraining}
							repaint={handleRepaint}
							clearAll={handleClearAll}
							openComparison={() => setIsComparisonOpen(true)}
							selectedModel={activeModel}
							renderInfo={(info) => setInfoContent(info)}
							onModelChange={(modelId) => {
								setActiveModel(modelId);
								setMetrics(null);
								setHoverProbe(null);
								if (modelId !== "tree") {
									setTreeHierarchy(null);
								}
							}}
						/>
					</section>
				</div>

				{/* XAI: Transparent Decision Tree Visualizer (shown when Decision Tree is active) */}
				{activeModel === "tree" && (
					<section className="tree-visualizer-section">
						<DecisionTreeVisualizer treeData={treeHierarchy} />
					</section>
				)}

				{/* Middle: Educational Metrics Dashboard & Intervention Impact */}
				<section className="metrics-section">
					<MetricsDashboard metrics={metrics} />
				</section>

				{/* Bottom: Model Information & Analogies */}
				<section className="info-section">
					<div id="infoPanel" className="info-card">
						{infoContent || <div className="info-loading">Select a model to view pedagogical details.</div>}
					</div>
				</section>
			</main>

			{/* Pattern Guide Modal */}
			<PatternGuideModal
				isOpen={isGuideOpen}
				onClose={() => setIsGuideOpen(false)}
				onLoadPattern={handlePresetChange}
			/>

			{/* Model Comparison & Benchmark Modal ("Algorithm Showdown") */}
			<ModelComparisonModal
				isOpen={isComparisonOpen}
				onClose={() => setIsComparisonOpen(false)}
				store={store}
				onSelectModel={handleSelectModelFromComparison}
				activePreset={activePreset}
			/>
		</div>
	);
}
