/**
 * Educational Data Mining & Machine Learning Evaluation Metrics
 * Bridges psychometric terminology (Sensitivity / Specificity)
 * and machine learning terminology (Precision / Recall / F1 / ROC AUC).
 */

export function calculateMetrics(actual = [], predicted = [], scores = [], positiveClass = 2) {
	if (!actual.length || !predicted.length || actual.length !== predicted.length) {
		return null;
	}

	let tp = 0; // True Positives: At-Risk correctly identified
	let fp = 0; // False Positives: False Alarms (On-track student flagged)
	let tn = 0; // True Negatives: On-Track correctly identified
	let fn = 0; // False Negatives: Missed at-risk student (critical risk)

	for (let i = 0; i < actual.length; i++) {
		const act = actual[i];
		const pred = predicted[i];

		if (act === positiveClass && pred === positiveClass) {
			tp++;
		} else if (act !== positiveClass && pred === positiveClass) {
			fp++;
		} else if (act !== positiveClass && pred !== positiveClass) {
			tn++;
		} else if (act === positiveClass && pred !== positiveClass) {
			fn++;
		}
	}

	const total = tp + fp + tn + fn;
	const actualPositives = tp + fn;
	const actualNegatives = tn + fp;
	const predictedPositives = tp + fp;

	// Core rates
	const accuracy = total > 0 ? (tp + tn) / total : 0;
	const sensitivity = actualPositives > 0 ? tp / actualPositives : 0; // Recall / TPR
	const specificity = actualNegatives > 0 ? tn / actualNegatives : 0; // TNR
	const precision = predictedPositives > 0 ? tp / predictedPositives : 0; // PPV
	const recall = sensitivity; // Exact alias for educational instruction

	// F1 Score (Harmonic mean of precision & recall)
	const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

	// Balanced Accuracy
	const balancedAccuracy = (sensitivity + specificity) / 2;

	// False Positive Rate (FPR = 1 - Specificity)
	const fpr = 1 - specificity;

	// ROC Curve Points and AUC computation
	let rocPoints = [];
	let auc = 0;

	// If continuous probability/decision scores exist, compute empirical ROC curve
	if (scores && scores.length === actual.length && scores.some((s) => s !== scores[0])) {
		// Pair each score with true binary indicator (1 = positiveClass, 0 = negativeClass)
		const paired = scores.map((score, idx) => ({
			score,
			actual: actual[idx] === positiveClass ? 1 : 0
		}));

		// Sort descending by score
		paired.sort((a, b) => b.score - a.score);

		rocPoints.push({ fpr: 0, tpr: 0 });

		let accumulatedTp = 0;
		let accumulatedFp = 0;

		for (let i = 0; i < paired.length; i++) {
			if (paired[i].actual === 1) {
				accumulatedTp++;
			} else {
				accumulatedFp++;
			}

			// Only add point when threshold changes or at the very end
			if (i === paired.length - 1 || paired[i].score !== paired[i + 1].score) {
				const curTpr = actualPositives > 0 ? accumulatedTp / actualPositives : 0;
				const curFpr = actualNegatives > 0 ? accumulatedFp / actualNegatives : 0;
				rocPoints.push({ fpr: curFpr, tpr: curTpr });
			}
		}

		// Ensure curve ends at (1, 1)
		if (rocPoints[rocPoints.length - 1].fpr !== 1 || rocPoints[rocPoints.length - 1].tpr !== 1) {
			rocPoints.push({ fpr: 1, tpr: 1 });
		}

		// Trapezoidal Rule for AUC
		for (let i = 1; i < rocPoints.length; i++) {
			const width = rocPoints[i].fpr - rocPoints[i - 1].fpr;
			const avgHeight = (rocPoints[i].tpr + rocPoints[i - 1].tpr) / 2;
			auc += width * avgHeight;
		}
	} else {
		// Discrete prediction ROC operating point: connects (0,0) -> (FPR, TPR) -> (1,1)
		rocPoints = [
			{ fpr: 0, tpr: 0 },
			{ fpr: Math.max(0, Math.min(1, fpr)), tpr: Math.max(0, Math.min(1, sensitivity)) },
			{ fpr: 1, tpr: 1 }
		];

		// Area of two trapezoids/triangles
		auc = balancedAccuracy;
	}

	auc = Math.max(0, Math.min(1, auc));

	// Qualitative rating
	let aucRating = "Failed (Random Chance)";
	let aucColor = "#ef4444";
	if (auc >= 0.9) {
		aucRating = "Excellent Discrimination";
		aucColor = "#16a34a";
	} else if (auc >= 0.8) {
		aucRating = "Good Discrimination";
		aucColor = "#22c55e";
	} else if (auc >= 0.7) {
		aucRating = "Acceptable / Fair";
		aucColor = "#eab308";
	} else if (auc >= 0.6) {
		aucRating = "Poor Discrimination";
		aucColor = "#f97316";
	}

	return {
		total,
		tp,
		fp,
		tn,
		fn,
		accuracy,
		sensitivity,
		specificity,
		precision,
		recall,
		f1,
		balancedAccuracy,
		fpr,
		rocPoints,
		auc,
		aucRating,
		aucColor
	};
}
