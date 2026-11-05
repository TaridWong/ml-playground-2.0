/**
 * Curated Educational Data Mining & Learning Analytics Presets
 * Designed for K-12 and Higher Education classroom demonstration.
 * Coordinates are mapped to the canvas range [-180, 180].
 * Each scenario has a distinct geometric topology and pedagogical lesson!
 */

// Helper to generate circular arc / cluster points
function generateCircle(centerX, centerY, radius, count, label, noise = 10) {
	const pts = [];
	for (let i = 0; i < count; i++) {
		const angle = (2 * Math.PI * i) / count;
		const r = radius + (Math.sin(i * 3.7) * noise);
		pts.push({
			x: [Math.round(centerX + r * Math.cos(angle)), Math.round(centerY + r * Math.sin(angle))],
			y: label
		});
	}
	return pts;
}

export const EDUCATIONAL_PRESETS = [
	{
		id: "higher_ed_retention",
		title: "Higher Ed: Early Warning Dropout",
		level: "Higher Education",
		shape: "Linear Corridor (Straight Fence)",
		xAxis: "LMS Engagement (Weekly Logins & Video %)",
		yAxis: "Assignment Completion Rate (%)",
		positiveLabel: "At-Risk (Needs Intervention)",
		negativeLabel: "On-Track (Passing)",
		pedagogicalLesson:
			"Linear Separable: A single straight line (Perceptron, Logistic Regression, Linear SVM) can separate these students. High interpretability: If engagement plus assignments exceeds the threshold, the student is on-track.",
		description:
			"Predicting whether undergraduate students in an online course are at risk of dropping out based on their LMS activity and homework completion.",
		points: [
			// On-Track Students (Class 1: Top-Right Diagonal Band)
			{ x: [30, 40], y: 1 },
			{ x: [45, 65], y: 1 },
			{ x: [60, 50], y: 1 },
			{ x: [75, 85], y: 1 },
			{ x: [90, 70], y: 1 },
			{ x: [105, 110], y: 1 },
			{ x: [120, 95], y: 1 },
			{ x: [135, 130], y: 1 },
			{ x: [50, 110], y: 1 },
			{ x: [70, 125], y: 1 },
			{ x: [95, 140], y: 1 },
			{ x: [115, 150], y: 1 },
			{ x: [140, 105], y: 1 },
			{ x: [155, 135], y: 1 },
			{ x: [80, 40], y: 1 },
			{ x: [110, 60], y: 1 },
			{ x: [130, 75], y: 1 },
			{ x: [150, 90], y: 1 },
			{ x: [35, 80], y: 1 },
			{ x: [65, 95], y: 1 },

			// At-Risk Students (Class 2: Bottom-Left Diagonal Band)
			{ x: [-30, -40], y: 2 },
			{ x: [-45, -65], y: 2 },
			{ x: [-60, -50], y: 2 },
			{ x: [-75, -85], y: 2 },
			{ x: [-90, -70], y: 2 },
			{ x: [-105, -110], y: 2 },
			{ x: [-120, -95], y: 2 },
			{ x: [-135, -130], y: 2 },
			{ x: [-50, -110], y: 2 },
			{ x: [-70, -125], y: 2 },
			{ x: [-95, -140], y: 2 },
			{ x: [-115, -150], y: 2 },
			{ x: [-140, -105], y: 2 },
			{ x: [-155, -135], y: 2 },
			{ x: [-80, -40], y: 2 },
			{ x: [-110, -60], y: 2 },
			{ x: [-130, -75], y: 2 },
			{ x: [-150, -90], y: 2 },
			{ x: [-35, -80], y: 2 },
			{ x: [-65, -95], y: 2 }
		]
	},
	{
		id: "k12_mastery",
		title: "K-12: Formative Assessment Mastery",
		level: "K-12 Education",
		shape: "L-Shaped (Orthogonal Rule Cuts)",
		xAxis: "Practice Exercises Completed (Volume)",
		yAxis: "Diagnostic Pre-Test Score (%)",
		positiveLabel: "Needs Remediation (Struggling)",
		negativeLabel: "Concept Mastered",
		pedagogicalLesson:
			"L-Shaped Rule Cut: A student masters the concept if Pre-Test is high OR Practice is high. Only students low in BOTH need remediation. Decision Trees excel here with 2 orthogonal cuts; single diagonal linear models struggle to fit the corner!",
		description:
			"Determining which middle school students need targeted small-group remediation. High pre-test students master immediately; average students master through practice.",
		points: [
			// Needs Remediation (Class 2: Box in Lower-Left Quadrant)
			{ x: [-130, -130], y: 2 },
			{ x: [-110, -100], y: 2 },
			{ x: [-85, -120], y: 2 },
			{ x: [-60, -95], y: 2 },
			{ x: [-40, -135], y: 2 },
			{ x: [-125, -70], y: 2 },
			{ x: [-95, -60], y: 2 },
			{ x: [-70, -75], y: 2 },
			{ x: [-45, -55], y: 2 },
			{ x: [-115, -35], y: 2 },
			{ x: [-80, -30], y: 2 },
			{ x: [-50, -25], y: 2 },
			{ x: [-30, -80], y: 2 },
			{ x: [-25, -115], y: 2 },
			{ x: [-20, -40], y: 2 },

			// Mastered via High Pre-Test (Class 1: Top Horizontal Bar across all X)
			{ x: [-130, 60], y: 1 },
			{ x: [-100, 85], y: 1 },
			{ x: [-70, 70], y: 1 },
			{ x: [-40, 95], y: 1 },
			{ x: [-10, 80], y: 1 },
			{ x: [20, 100], y: 1 },
			{ x: [50, 75], y: 1 },
			{ x: [80, 110], y: 1 },
			{ x: [110, 85], y: 1 },
			{ x: [140, 90], y: 1 },
			{ x: [-120, 120], y: 1 },
			{ x: [-80, 135], y: 1 },
			{ x: [-30, 140], y: 1 },
			{ x: [30, 130], y: 1 },
			{ x: [90, 145], y: 1 },
			{ x: [130, 130], y: 1 },

			// Mastered via High Practice (Class 1: Right Vertical Bar across low Y)
			{ x: [40, -120], y: 1 },
			{ x: [65, -95], y: 1 },
			{ x: [90, -130], y: 1 },
			{ x: [115, -100], y: 1 },
			{ x: [140, -115], y: 1 },
			{ x: [50, -60], y: 1 },
			{ x: [75, -40], y: 1 },
			{ x: [100, -70], y: 1 },
			{ x: [125, -50], y: 1 },
			{ x: [145, -30], y: 1 },
			{ x: [60, -10], y: 1 },
			{ x: [85, 10], y: 1 },
			{ x: [110, 5], y: 1 },
			{ x: [135, 20], y: 1 }
		]
	},
	{
		id: "gaming_the_system",
		title: "EDM Classic: Gaming the System",
		level: "Educational Data Mining",
		shape: "Bullseye / Isolated Pocket (Non-Linear)",
		xAxis: "Time Spent per Problem (Speed / Latency)",
		yAxis: "Hint Requests & Rapid Attempts",
		positiveLabel: "Gaming the System (Exploiting Hints)",
		negativeLabel: "Genuine Learning (Deliberate Practice)",
		pedagogicalLesson:
			"Non-Linear Island (Bullseye): Gamers form an isolated pocket in the center. A single straight line (Perceptron) FAILS completely (~50% accuracy). Non-linear models like KNN, RBF SVM, or Neural Networks carve a bubble around the gamers!",
		description:
			"A classic EDM pattern studied by Baker and colleagues: A distinct cluster of students game the software by rapid-guessing, surrounded on all sides by normal learners.",
		points: [
			// Gaming the System (Class 2: Tight Center Pocket, Radius < 50)
			{ x: [0, 0], y: 2 },
			{ x: [15, 20], y: 2 },
			{ x: [-20, 15], y: 2 },
			{ x: [25, -10], y: 2 },
			{ x: [-15, -25], y: 2 },
			{ x: [35, 15], y: 2 },
			{ x: [-30, -10], y: 2 },
			{ x: [5, -35], y: 2 },
			{ x: [-10, 35], y: 2 },
			{ x: [20, -20], y: 2 },
			{ x: [-25, 25], y: 2 },
			{ x: [0, 30], y: 2 },
			{ x: [30, 0], y: 2 },
			{ x: [-35, 0], y: 2 },
			{ x: [0, -30], y: 2 },

			// Genuine Learners (Class 1: Outer Ring Surrounding Gamers, Radius 90 - 150)
			{ x: [0, 130], y: 1 },
			{ x: [50, 120], y: 1 },
			{ x: [95, 95], y: 1 },
			{ x: [125, 50], y: 1 },
			{ x: [140, 0], y: 1 },
			{ x: [125, -50], y: 1 },
			{ x: [95, -95], y: 1 },
			{ x: [50, -125], y: 1 },
			{ x: [0, -135], y: 1 },
			{ x: [-50, -125], y: 1 },
			{ x: [-95, -95], y: 1 },
			{ x: [-125, -50], y: 1 },
			{ x: [-140, 0], y: 1 },
			{ x: [-125, 50], y: 1 },
			{ x: [-95, 95], y: 1 },
			{ x: [-50, 120], y: 1 },
			{ x: [30, 95], y: 1 },
			{ x: [85, 60], y: 1 },
			{ x: [100, -20], y: 1 },
			{ x: [75, -75], y: 1 },
			{ x: [-25, -100], y: 1 },
			{ x: [-80, -65], y: 1 },
			{ x: [-95, 15], y: 1 },
			{ x: [-70, 75], y: 1 }
		]
	}
];
