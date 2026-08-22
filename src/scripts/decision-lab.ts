import {
  chooseDecision,
  decisionLabels,
  type CoverageKey,
  type EvidenceKey,
} from "../lib/decision-engine";
const topic = document.getElementById("stress-topic") as HTMLInputElement,
  evidence = document.getElementById("stress-evidence") as HTMLSelectElement,
  grid = document.getElementById("stress-grid") as HTMLElement,
  button = document.getElementById("run-stress-test") as HTMLButtonElement;
const states: Array<{ key: CoverageKey; label: string; note: string }> = [
  { key: "none", label: "No owner", note: "No existing page owns the job." },
  {
    key: "section_gap",
    label: "Section gap",
    note: "A canonical page needs one bounded section.",
  },
  {
    key: "page_gap",
    label: "Page gap",
    note: "The canonical promise needs material expansion.",
  },
  {
    key: "substantial",
    label: "Covered",
    note: "One page already covers the job substantially.",
  },
  {
    key: "overlap",
    label: "Overlap",
    note: "Several URLs compete for the same job.",
  },
  {
    key: "unknown",
    label: "Unknown",
    note: "The inventory has not been reviewed.",
  },
];
const render = () => {
  const value = evidence.value as EvidenceKey;
  grid.replaceChildren(
    ...states.map((state, index) => {
      const decision = chooseDecision(state.key, value),
        article = document.createElement("article");
      article.innerHTML = `<span>D-${String(index + 1).padStart(2, "0")}</span><h3>${state.label}</h3><p>${state.note}</p><strong>${decisionLabels[decision]}</strong>`;
      return article;
    }),
  );
};
button.addEventListener("click", render);
evidence.addEventListener("change", render);
topic.addEventListener("input", () =>
  button.setAttribute(
    "aria-label",
    `Update matrix for ${topic.value || "current topic"}`,
  ),
);
render();
