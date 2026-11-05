import React from "react";

function TreeNodeView({ node }) {
	if (!node) return null;

	if (node.isLeaf) {
		const isAtRisk = node.pred === 2;
		return (
			<div className={`dt-node-card dt-leaf ${isAtRisk ? "at-risk" : "on-track"}`}>
				<div className="dt-leaf-badge">
					{isAtRisk ? "● Predict: At-Risk" : "● Predict: On-Track"}
				</div>
				<div className="dt-samples-line">
					Students: <strong>{node.total}</strong> ({node.c1} On-Track / {node.c2} At-Risk)
				</div>
				<div className="dt-meta-line">
					Confidence: <strong>{Math.round((isAtRisk ? node.probClass2 : 1 - node.probClass2) * 100)}%</strong>
					<span className="dt-impurity-pill">
						{node.criterion}: {node.impurity}
					</span>
				</div>
			</div>
		);
	}

	return (
		<div className="dt-subtree">
			{/* Current Node */}
			<div className="dt-node-card dt-internal">
				<div className="dt-rule-text">
					<strong>Rule:</strong> {node.ruleText}
				</div>
				<div className="dt-samples-line">
					Students: <strong>{node.total}</strong> ({node.c1} On-Track / {node.c2} At-Risk)
				</div>
				<div className="dt-meta-line">
					<span className="dt-impurity-pill">
						{node.criterion}: {node.impurity}
					</span>
				</div>
			</div>

			{/* Branches */}
			<div className="dt-children-row">
				<div className="dt-branch left-branch">
					<div className="dt-branch-label true-label">True (≤)</div>
					<TreeNodeView node={node.left} />
				</div>
				<div className="dt-branch right-branch">
					<div className="dt-branch-label false-label">False (&gt;)</div>
					<TreeNodeView node={node.right} />
				</div>
			</div>
		</div>
	);
}

export default function DecisionTreeVisualizer({ treeData }) {
	if (!treeData) {
		return (
			<div className="tree-visualizer-card empty">
				<div className="xai-title">Decision Tree Flowchart (Explainable AI)</div>
				<p className="xai-hint">
					Plot students on the canvas and click <strong>Train Model</strong> with Decision Tree selected to generate the transparent decision flowchart.
				</p>
			</div>
		);
	}

	return (
		<div className="tree-visualizer-card">
			<div className="xai-header">
				<div>
					<h3 className="xai-title">Decision Tree Flowchart (Explainable AI)</h3>
					<span className="xai-subtitle">
						Every prediction can be audited step-by-step from root to leaf by educators, parents, and students.
					</span>
				</div>
			</div>

			<div className="tree-flowchart-viewport">
				<div className="tree-flowchart-container">
					<TreeNodeView node={treeData} />
				</div>
			</div>
		</div>
	);
}
