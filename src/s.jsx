let S = {
	class1: 1,
	class2: 2,
	class3: 3,
	eraser: -1,
	colors: {
		1: "#0D9488", // Class 1: Deep Teal (On-Track / Mastered)
		2: "#E11D48", // Class 2: Warm Rose (At-Risk / Intervention)
		3: "#4F46E5"  // Class 3: Indigo (Multi-class extension)
	},
	bgColors: {
		1: "#CCFBF1", // Soft Mint/Teal tint (RGB: 204, 251, 241)
		2: "#FFE4E6", // Soft Rose tint (RGB: 255, 228, 230)
		3: "#E0E7FF"  // Soft Indigo tint
	},
	model: [
		"knn", "logistic", "naivebayes", "perceptron", "svm", "tree", "randomforest", "xgboost", "cba", "ann"
	],
	canvasW: 400,
	canvasH: 400,
	ptSize: 6,
	bgReso: 4
};

export default S;
