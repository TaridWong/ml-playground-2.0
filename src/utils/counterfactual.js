import S from "../s";

/**
 * Finds the minimum counterfactual intervention needed to flip a student's
 * predicted outcome to targetClass (default: S.class1 = On-Track).
 *
 * Canvas coordinates run from -200 to +200 along both X and Y axes.
 */
export function findCounterfactual(model, x, y, targetClass = S.class1) {
	if (!model || typeof model.classif !== "function") return null;

	const currentPred = model.classif(x, y);
	const currentScore =
		typeof model.score === "function"
			? model.score(x, y)
			: currentPred === S.class2
			? 1
			: 0;

	if (currentPred === targetClass) {
		return {
			alreadyTarget: true,
			currentPred,
			currentScore,
			xOnly: null,
			yOnly: null,
			combined: null
		};
	}

	// 1. Search along X axis only (keep Y fixed)
	let bestXOnly = null;
	for (let step = 2; step <= 390; step += 2) {
		for (const dir of [1, -1]) {
			const nx = x + dir * step;
			if (nx >= -196 && nx <= 196) {
				if (model.classif(nx, y) === targetClass) {
					const score =
						typeof model.score === "function"
							? model.score(nx, y)
							: targetClass === S.class2
							? 1
							: 0;
					bestXOnly = {
						nx: Math.round(nx),
						ny: Math.round(y),
						dx: Math.round(nx - x),
						dy: 0,
						dist: Math.abs(Math.round(nx - x)),
						score
					};
					break;
				}
			}
		}
		if (bestXOnly) break;
	}

	// 2. Search along Y axis only (keep X fixed)
	let bestYOnly = null;
	for (let step = 2; step <= 390; step += 2) {
		for (const dir of [1, -1]) {
			const ny = y + dir * step;
			if (ny >= -196 && ny <= 196) {
				if (model.classif(x, ny) === targetClass) {
					const score =
						typeof model.score === "function"
							? model.score(x, ny)
							: targetClass === S.class2
							? 1
							: 0;
					bestYOnly = {
						nx: Math.round(x),
						ny: Math.round(ny),
						dx: 0,
						dy: Math.round(ny - y),
						dist: Math.abs(Math.round(ny - y)),
						score
					};
					break;
				}
			}
		}
		if (bestYOnly) break;
	}

	// 3. Search 2D grid for shortest Euclidean path across the decision boundary
	let bestCombined = null;
	let minDistSq = Infinity;

	for (let nx = -192; nx <= 192; nx += 4) {
		for (let ny = -192; ny <= 192; ny += 4) {
			const dx = nx - x;
			const dy = ny - y;
			const dSq = dx * dx + dy * dy;
			if (dSq >= minDistSq) continue;

			if (model.classif(nx, ny) === targetClass) {
				minDistSq = dSq;
				const score =
					typeof model.score === "function"
						? model.score(nx, ny)
						: targetClass === S.class2
						? 1
						: 0;
				bestCombined = {
					nx: Math.round(nx),
					ny: Math.round(ny),
					dx: Math.round(dx),
					dy: Math.round(dy),
					dist: Math.round(Math.sqrt(dSq)),
					score
				};
			}
		}
	}

	return {
		alreadyTarget: false,
		currentPred,
		currentScore,
		xOnly: bestXOnly,
		yOnly: bestYOnly,
		combined: bestCombined
	};
}

export function formatSigned(val) {
	const r = Math.round(val);
	return r > 0 ? `+${r}` : `${r}`;
}
