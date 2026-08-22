export type EvidenceKey = "none" | "secondary" | "primary" | "observed";
export type CoverageKey =
  | "none"
  | "section_gap"
  | "page_gap"
  | "substantial"
  | "overlap"
  | "unknown";
export type DecisionKey =
  | "extend_page"
  | "add_section"
  | "merge_content"
  | "evidence_asset"
  | "create_url"
  | "no_action";
export const hasDecisionReadyEvidence = (evidence: EvidenceKey) =>
  evidence === "primary" || evidence === "observed";
export const chooseDecision = (
  coverage: CoverageKey,
  evidence: EvidenceKey,
): DecisionKey => {
  if (coverage === "overlap") return "merge_content";
  if (coverage === "unknown") return "evidence_asset";
  if (coverage === "substantial")
    return hasDecisionReadyEvidence(evidence) ? "no_action" : "evidence_asset";
  if (coverage === "section_gap")
    return hasDecisionReadyEvidence(evidence)
      ? "add_section"
      : "evidence_asset";
  if (coverage === "page_gap")
    return hasDecisionReadyEvidence(evidence)
      ? "extend_page"
      : "evidence_asset";
  return hasDecisionReadyEvidence(evidence) ? "create_url" : "evidence_asset";
};
export const decisionLabels: Record<DecisionKey, string> = {
  extend_page: "Extend the existing page",
  add_section: "Add one section",
  merge_content: "Merge overlapping content",
  evidence_asset: "Build an evidence asset first",
  create_url: "Create one new URL",
  no_action: "Take no content action",
};
