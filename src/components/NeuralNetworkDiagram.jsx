import React from "react";

const FONT_FAMILY = "Inter, system-ui, -apple-system, sans-serif";
const COLOR_TEAL = "#0d9488";
const COLOR_ROSE = "#e11d48";
const COLOR_NAVY = "#0f172a";
const COLOR_SLATE = "#334155";
const COLOR_MUTED = "#64748b";
const COLOR_NEUTRAL_EDGE = "#94a3b8";

function normalizeLayerArray(layers) {
	if (!Array.isArray(layers) || layers.length < 2) {
		return [2, 4, 3, 1];
	}
	return layers.map((count) => {
		const n = parseInt(count, 10);
		return Number.isFinite(n) && n >= 1 ? n : 1;
	});
}

export function getNetworkStats(layers) {
	const safeLayers = normalizeLayerArray(layers);
	let weights = 0;
	let biases = 0;
	for (let i = 0; i < safeLayers.length - 1; i++) {
		weights += safeLayers[i] * safeLayers[i + 1];
		biases += safeLayers[i + 1];
	}
	const hiddenCount = Math.max(0, safeLayers.length - 2);
	return {
		layers: safeLayers,
		weights,
		biases,
		totalParams: weights + biases,
		hiddenCount
	};
}

export function extractWeightMatrices(weights, layers) {
	const safeLayers = normalizeLayerArray(layers);
	if (!Array.isArray(weights) || weights.length !== safeLayers.length - 1) {
		return null;
	}
	const matrices = [];
	for (let i = 0; i < safeLayers.length - 1; i++) {
		const expectedRows = safeLayers[i + 1];
		const expectedCols = safeLayers[i];
		const raw = weights[i] && typeof weights[i].valueOf === "function" ? weights[i].valueOf() : weights[i];

		let normalized = null;
		if (typeof raw === "number" && expectedRows === 1 && expectedCols === 1) {
			normalized = [[raw]];
		} else if (Array.isArray(raw)) {
			if (Array.isArray(raw[0])) {
				normalized = raw;
			} else if (expectedRows === 1 && raw.length === expectedCols) {
				normalized = [raw];
			}
		}

		if (!normalized || normalized.length !== expectedRows) {
			return null;
		}
		for (let r = 0; r < expectedRows; r++) {
			if (!Array.isArray(normalized[r]) || normalized[r].length !== expectedCols) {
				return null;
			}
			for (let c = 0; c < expectedCols; c++) {
				if (typeof normalized[r][c] !== "number" || !Number.isFinite(normalized[r][c])) {
					return null;
				}
			}
		}
		matrices.push(normalized);
	}
	return matrices;
}

export function extractBiasVectors(biases, layers) {
	const safeLayers = normalizeLayerArray(layers);
	if (!Array.isArray(biases) || biases.length !== safeLayers.length - 1) {
		return null;
	}
	const vectors = [];
	for (let i = 0; i < safeLayers.length - 1; i++) {
		const expectedLen = safeLayers[i + 1];
		const raw = biases[i] && typeof biases[i].valueOf === "function" ? biases[i].valueOf() : biases[i];

		let flat = null;
		if (typeof raw === "number" && expectedLen === 1) {
			flat = [raw];
		} else if (Array.isArray(raw)) {
			flat = Array.isArray(raw[0]) ? raw.flat() : raw;
		}

		if (!flat || flat.length !== expectedLen) {
			return null;
		}
		vectors.push(flat);
	}
	return vectors;
}

export function doWeightsMatchLayers(weights, layers) {
	return extractWeightMatrices(weights, layers) !== null;
}

function truncateText(str, maxLen) {
	if (!str) return "";
	if (str.length <= maxLen) return str;
	return str.slice(0, Math.max(1, maxLen - 3)) + "...";
}

function getColumnTitle(layerIndex, totalLayers, compact) {
	if (layerIndex === 0) return compact ? "In" : "Input";
	if (layerIndex === totalLayers - 1) return compact ? "Out" : "Output";
	return compact ? `H${layerIndex}` : `Hidden ${layerIndex}`;
}

function getNodeDescription(layerIndex, nodeIndex, totalLayers, xLabel, yLabel) {
	if (layerIndex === 0) {
		return nodeIndex === 0 ? `Input X (${xLabel})` : nodeIndex === 1 ? `Input Y (${yLabel})` : `Input ${nodeIndex + 1}`;
	}
	if (layerIndex === totalLayers - 1) {
		return "Output (Risk Prediction)";
	}
	return `Hidden ${layerIndex}, Unit ${nodeIndex + 1}`;
}

export function computeNetworkLayout({
	layers,
	originX = 0,
	originY = 0,
	width = 800,
	height = 260,
	padLeft = 128,
	padRight = 96,
	padTop = 44,
	padBottom = 34,
	minRadius = 6,
	maxRadius = 17
}) {
	const safeLayers = normalizeLayerArray(layers);
	const layerCount = safeLayers.length;
	const maxNeurons = Math.max(...safeLayers, 2);

	const plotW = Math.max(40, width - padLeft - padRight);
	const plotH = Math.max(40, height - padTop - padBottom);
	const colStep = layerCount > 1 ? plotW / (layerCount - 1) : 0;
	const rowStepForMax = maxNeurons > 1 ? plotH / (maxNeurons - 1) : plotH;

	const rawRadius = Math.min(colStep * 0.25, rowStepForMax * 0.36);
	const radius = Math.max(minRadius, Math.min(maxRadius, rawRadius));
	const centerY = originY + padTop + plotH / 2;

	const nodePositions = safeLayers.map((count, col) => {
		const x = originX + padLeft + (layerCount > 1 ? col * colStep : plotW / 2);
		const step = count > 1 ? Math.min(rowStepForMax, plotH / (count - 1)) : 0;
		const span = (count - 1) * step;
		const startY = centerY - span / 2;

		const nodes = [];
		for (let row = 0; row < count; row++) {
			nodes.push({
				x,
				y: count === 1 ? centerY : startY + row * step
			});
		}
		return nodes;
	});

	return {
		layers: safeLayers,
		radius,
		nodePositions,
		maxNeurons
	};
}

export function NetworkSvgCore({
	layers,
	weights = null,
	biases = null,
	showWeights = false,
	originX = 0,
	originY = 0,
	width = 800,
	height = 260,
	padLeft = 128,
	padRight = 96,
	padTop = 44,
	padBottom = 34,
	minRadius = 6,
	maxRadius = 17,
	compact = false,
	showInputAxisLabels = true,
	xLabel = "Feature X",
	yLabel = "Feature Y"
}) {
	const layout = computeNetworkLayout({
		layers,
		originX,
		originY,
		width,
		height,
		padLeft,
		padRight,
		padTop,
		padBottom,
		minRadius,
		maxRadius
	});

	const safeLayers = layout.layers;
	const weightMatrices = showWeights ? extractWeightMatrices(weights, safeLayers) : null;
	const biasVectors = showWeights && weightMatrices ? extractBiasVectors(biases, safeLayers) : null;
	const hasValidWeights = Boolean(weightMatrices);

	let maxAbsWeight = 0.1;
	let totalEdges = 0;
	for (let l = 0; l < safeLayers.length - 1; l++) {
		totalEdges += safeLayers[l] * safeLayers[l + 1];
		if (hasValidWeights) {
			const mat = weightMatrices[l];
			for (let r = 0; r < mat.length; r++) {
				for (let c = 0; c < mat[r].length; c++) {
					const absW = Math.abs(mat[r][c]);
					if (absW > maxAbsWeight) maxAbsWeight = absW;
				}
			}
		}
	}

	const neutralOpacity = totalEdges > 180 ? 0.22 : totalEdges > 75 ? 0.34 : 0.55;
	const r = layout.radius;
	const labelFitsInside = r >= 9.5;
	const headerFontSize = compact ? 9.5 : 11;
	const countFontSize = compact ? 8.5 : 9.5;
	const nodeFontSize = Math.max(7.5, Math.min(11.5, r * 0.72));

	const edges = [];
	for (let l = 0; l < safeLayers.length - 1; l++) {
		const fromNodes = layout.nodePositions[l];
		const toNodes = layout.nodePositions[l + 1];
		for (let j = 0; j < fromNodes.length; j++) {
			for (let k = 0; k < toNodes.length; k++) {
				const from = fromNodes[j];
				const to = toNodes[k];
				let stroke = COLOR_NEUTRAL_EDGE;
				let strokeWidth = compact ? 1.0 : 1.25;
				let strokeOpacity = neutralOpacity;
				let tooltip = null;

				if (hasValidWeights) {
					const w = weightMatrices[l][k][j];
					const normW = Math.min(1, Math.abs(w) / maxAbsWeight);
					stroke = w >= 0 ? COLOR_TEAL : COLOR_ROSE;
					strokeWidth = (compact ? 0.65 : 0.75) + normW * (compact ? 1.8 : 2.5);
					strokeOpacity = (totalEdges > 140 ? 0.15 : 0.22) + normW * 0.74;
					const srcName = getNodeDescription(l, j, safeLayers.length, xLabel, yLabel);
					const dstName = getNodeDescription(l + 1, k, safeLayers.length, xLabel, yLabel);
					tooltip = `${srcName} -> ${dstName}: weight = ${w >= 0 ? "+" : ""}${w.toFixed(3)}`;
				}

				edges.push(
					<line
						key={`e-${l}-${j}-${k}`}
						x1={from.x}
						y1={from.y}
						x2={to.x}
						y2={to.y}
						stroke={stroke}
						strokeWidth={strokeWidth}
						strokeOpacity={strokeOpacity}
						strokeLinecap="round"
					>
						{tooltip && <title>{tooltip}</title>}
					</line>
				);
			}
		}
	}

	const headerY = originY + (compact ? 12 : 17);
	const countY = originY + (compact ? 22 : 30);

	const nodesAndHeaders = [];
	for (let l = 0; l < safeLayers.length; l++) {
		const colNodes = layout.nodePositions[l];
		const colX = colNodes[0].x;
		const isInput = l === 0;
		const isOutput = l === safeLayers.length - 1;
		const count = safeLayers[l];

		nodesAndHeaders.push(
			<g key={`col-hdr-${l}`}>
				<text
					x={colX}
					y={headerY}
					textAnchor="middle"
					fontSize={headerFontSize}
					fontWeight="700"
					fill={COLOR_NAVY}
					fontFamily={FONT_FAMILY}
				>
					{getColumnTitle(l, safeLayers.length, compact)}
				</text>
				<text
					x={colX}
					y={countY}
					textAnchor="middle"
					fontSize={countFontSize}
					fontWeight="600"
					fill={isOutput ? COLOR_ROSE : isInput ? COLOR_SLATE : hasValidWeights ? COLOR_TEAL : COLOR_MUTED}
					fontFamily={FONT_FAMILY}
				>
					{compact ? `${count}` : `${count} ${count === 1 ? "unit" : "units"}`}
				</text>
			</g>
		);

		for (let idx = 0; idx < colNodes.length; idx++) {
			const pos = colNodes[idx];
			let fill = hasValidWeights ? "#f0fdfa" : "#f8fafc";
			let stroke = hasValidWeights ? COLOR_TEAL : COLOR_SLATE;
			let strokeWidth = compact ? 1.6 : 2.1;

			if (isInput) {
				fill = "#ffffff";
				stroke = COLOR_NAVY;
			} else if (isOutput) {
				fill = "#fff1f2";
				stroke = COLOR_ROSE;
			}

			const biasVal = !isInput && biasVectors && biasVectors[l - 1] ? biasVectors[l - 1][idx] : null;
			const nodeTitle =
				biasVal !== null && Number.isFinite(biasVal)
					? `${getNodeDescription(l, idx, safeLayers.length, xLabel, yLabel)} | bias = ${biasVal >= 0 ? "+" : ""}${biasVal.toFixed(3)}`
					: getNodeDescription(l, idx, safeLayers.length, xLabel, yLabel);

			nodesAndHeaders.push(
				<g key={`n-${l}-${idx}`}>
					<circle cx={pos.x} cy={pos.y} r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth}>
						<title>{nodeTitle}</title>
					</circle>

					{isInput && labelFitsInside && (
						<text
							x={pos.x}
							y={pos.y + nodeFontSize * 0.35}
							textAnchor="middle"
							fontSize={nodeFontSize}
							fontWeight="700"
							fill={COLOR_NAVY}
							fontFamily={FONT_FAMILY}
							pointerEvents="none"
						>
							{idx === 0 ? "X" : idx === 1 ? "Y" : `X${idx + 1}`}
						</text>
					)}

					{isInput && (!labelFitsInside || showInputAxisLabels) && (
						<text
							x={pos.x - r - (compact ? 4 : 9)}
							y={pos.y + (compact ? 3 : 3.5)}
							textAnchor="end"
							fontSize={compact ? 8.5 : 10.5}
							fontWeight="600"
							fill={COLOR_SLATE}
							fontFamily={FONT_FAMILY}
						>
							<title>{idx === 0 ? xLabel : yLabel}</title>
							{!labelFitsInside && compact
								? idx === 0
									? "X"
									: "Y"
								: truncateText(idx === 0 ? xLabel : yLabel, compact ? 9 : 18)}
						</text>
					)}

					{isOutput && labelFitsInside && (
						<text
							x={pos.x}
							y={pos.y + nodeFontSize * 0.35}
							textAnchor="middle"
							fontSize={Math.max(7.5, nodeFontSize * 0.88)}
							fontWeight="700"
							fill={COLOR_ROSE}
							fontFamily={FONT_FAMILY}
							pointerEvents="none"
						>
							Out
						</text>
					)}

					{isOutput && (!labelFitsInside || showInputAxisLabels) && (
						<text
							x={pos.x + r + (compact ? 4 : 9)}
							y={pos.y + (compact ? 3 : 3.5)}
							textAnchor="start"
							fontSize={compact ? 8.5 : 10.5}
							fontWeight="600"
							fill={COLOR_ROSE}
							fontFamily={FONT_FAMILY}
						>
							{compact ? (labelFitsInside ? "" : "Out") : "Risk Score"}
						</text>
					)}
				</g>
			);
		}
	}

	return (
		<g>
			<g>{edges}</g>
			<g>{nodesAndHeaders}</g>
		</g>
	);
}

export default function NeuralNetworkDiagram({
	layers = [2, 4, 3, 1],
	weights = null,
	biases = null,
	showWeights = false,
	xLabel = "Feature X",
	yLabel = "Feature Y"
}) {
	const stats = getNetworkStats(layers);
	const maxNeurons = Math.max(...stats.layers, 2);

	const width = 800;
	const height = maxNeurons <= 4 ? 252 : maxNeurons <= 7 ? 302 : 352;
	const hasValidWeights = Boolean(showWeights && extractWeightMatrices(weights, stats.layers));

	return (
		<div className="ann-diagram-card">
			<div className="ann-diagram-bar">
				<div className="ann-diagram-summary">
					<span className="ann-summary-label">Architecture:</span>{" "}
					<strong>{stats.layers.join(" \u2192 ")}</strong>{" "}
					<span className="ann-summary-meta">
						({stats.layers.length} layers, {stats.hiddenCount} hidden, {stats.totalParams} trainable parameters)
					</span>
				</div>
				<div className="ann-diagram-legend">
					{hasValidWeights ? (
						<>
							<span className="ann-legend-item">
								<span className="ann-legend-swatch is-pos" />
								Positive weight
							</span>
							<span className="ann-legend-item">
								<span className="ann-legend-swatch is-neg" />
								Negative weight
							</span>
							<span className="ann-legend-item">Thickness: |weight|</span>
						</>
					) : (
						<span className="ann-legend-item">Activation: tanh | Unweighted preview</span>
					)}
				</div>
			</div>

			<svg
				viewBox={`0 0 ${width} ${height}`}
				width="100%"
				className="ann-diagram-svg"
				role="img"
				aria-label={`Neural network diagram showing layers ${stats.layers.join(" to ")}`}
			>
				<NetworkSvgCore
					layers={stats.layers}
					weights={weights}
					biases={biases}
					showWeights={hasValidWeights}
					width={width}
					height={height}
					padLeft={132}
					padRight={96}
					padTop={60}
					padBottom={26}
					minRadius={6}
					maxRadius={16}
					compact={false}
					showInputAxisLabels={true}
					xLabel={xLabel}
					yLabel={yLabel}
				/>
			</svg>
		</div>
	);
}
