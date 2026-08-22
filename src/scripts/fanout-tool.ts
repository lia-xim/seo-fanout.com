export {};

type JobKey = "learn" | "compare" | "choose" | "act" | "troubleshoot";
type CoverageKey = "none" | "partial" | "substantial" | "overlap" | "unknown";
type EvidenceKey = "none" | "secondary" | "primary" | "observed";
type DecisionKey = "strengthen" | "consolidate" | "create_page" | "evidence_asset" | "no_action";

interface JobProfile {
  goal: (topic: string) => string;
  actor: string;
  outcome: string;
  questions: (topic: string) => string[];
  roles: string[];
}

interface FanoutResult {
  methodVersion: string;
  modeledOutput: true;
  retained: false;
  input: {
    topic: string;
    primaryUserJob: JobKey;
    existingCoverage: CoverageKey;
    evidenceOnHand: EvidenceKey;
  };
  map: {
    goal: string;
    entities: string[];
    questions: string[];
    sourceRoles: string[];
    evidenceGaps: string[];
  };
  decision: {
    code: string;
    key: DecisionKey;
    label: string;
    rationale: string;
    nextMove: string;
  };
}

const jobProfiles: Record<JobKey, JobProfile> = {
  learn: {
    goal: (topic) => `Help someone understand ${topic} well enough to explain its scope and limits.`,
    actor: "A reader building a reliable mental model",
    outcome: "A clear definition with boundaries and examples",
    questions: (topic) => [
      `What does ${topic} mean in this specific context?`,
      "Which components, entities, or terms must be understood first?",
      "Where does the concept stop, and what is commonly confused with it?",
      "Which primary evidence supports the explanation?",
      "What example and counterexample make the boundary concrete?",
    ],
    roles: ["Official or primary definition", "Subject-matter explainer", "Firsthand example or documented case"],
  },
  compare: {
    goal: (topic) => `Help someone compare ${topic} using explicit criteria and equivalent evidence.`,
    actor: "A reader comparing viable options",
    outcome: "A defensible trade-off, not a universal winner",
    questions: (topic) => [
      `Which options are genuinely comparable within ${topic}?`,
      "Which criteria matter to this user and use case?",
      "Are prices, capabilities, and limitations measured on the same date and basis?",
      "Which option is better under each important constraint?",
      "When is no listed option the right recommendation?",
    ],
    roles: ["Current primary specifications", "Transparent comparison methodology", "Independent firsthand evaluation"],
  },
  choose: {
    goal: (topic) => `Help someone choose within ${topic} for their real constraints and intended outcome.`,
    actor: "A decision-maker with a specific use case",
    outcome: "One bounded recommendation with disqualifiers",
    questions: (topic) => [
      `What outcome is the person hiring or choosing ${topic} for?`,
      "Which constraints are non-negotiable?",
      "What evidence separates a plausible option from a suitable one?",
      "Which trade-offs change the recommendation?",
      "What would disqualify the leading option?",
    ],
    roles: ["Primary specifications or policy", "Decision framework with weighted criteria", "Firsthand test, review, or qualified expert evidence"],
  },
  act: {
    goal: (topic) => `Help someone complete ${topic} safely and verify the result.`,
    actor: "A practitioner carrying out the task",
    outcome: "A completed task with a verification step",
    questions: (topic) => [
      `What must be true before starting ${topic}?`,
      "What is the smallest safe sequence of actions?",
      "Where do permissions, tools, or dependencies change the procedure?",
      "How is success verified?",
      "What rollback or recovery path is needed?",
    ],
    roles: ["Official procedure or standard", "Firsthand implementation notes", "Verification checklist or reproducible test"],
  },
  troubleshoot: {
    goal: (topic) => `Help someone diagnose ${topic} from observable evidence before changing the system.`,
    actor: "A practitioner diagnosing a reproducible failure",
    outcome: "A verified cause or the next discriminating test",
    questions: (topic) => [
      `What exact symptom defines ${topic}?`,
      "Which runtime, request, or state path owns the failure?",
      "Which observations distinguish the likely causes?",
      "What is the safest discriminating test?",
      "How is the fix verified and regression prevented?",
    ],
    roles: ["Primary technical documentation", "Reproducible diagnostic evidence", "Known-issue, change-log, or maintainer evidence"],
  },
};

const decisionMeta: Record<DecisionKey, { code: string; label: string }> = {
  strengthen: { code: "D-01", label: "Strengthen this page" },
  consolidate: { code: "D-02", label: "Consolidate the overlap" },
  create_page: { code: "D-03", label: "Create one new page" },
  evidence_asset: { code: "D-04", label: "Build evidence first" },
  no_action: { code: "D-05", label: "Take no page action" },
};

const requireElement = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element: #${id}`);
  return element as T;
};

const form = requireElement<HTMLFormElement>("fanout-form");
const topicInput = requireElement<HTMLTextAreaElement>("topic");
const topicCount = requireElement<HTMLOutputElement>("topic-count");
const jobInput = requireElement<HTMLSelectElement>("job");
const coverageInput = requireElement<HTMLSelectElement>("coverage");
const evidenceInput = requireElement<HTMLSelectElement>("evidence");
const stepStatus = requireElement<HTMLOutputElement>("step-status");
const wizardFlow = requireElement<HTMLElement>("wizard-flow");
const inputSummary = requireElement<HTMLElement>("input-summary");
const decisionEmpty = requireElement<HTMLElement>("decision-empty");
const decisionResult = requireElement<HTMLElement>("decision-result");
const resultDetails = requireElement<HTMLElement>("result-details");
const reasoningToggle = requireElement<HTMLButtonElement>("toggle-reasoning");
const copyButton = requireElement<HTMLButtonElement>("copy-result");
const exportButton = requireElement<HTMLButtonElement>("export-result");
const actionStatus = requireElement<HTMLOutputElement>("action-status");
const explorer = requireElement<HTMLElement>("explorer");
const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-wizard-step]"));
const progressItems = Array.from(document.querySelectorAll<HTMLElement>("[data-progress-step]"));

let currentResult: FanoutResult | null = null;
let currentStep = 1;

const chooseDecision = (coverage: CoverageKey, evidence: EvidenceKey): DecisionKey => {
  if (coverage === "overlap") return "consolidate";
  if (coverage === "partial") return "strengthen";
  if (coverage === "substantial") {
    return evidence === "primary" || evidence === "observed" ? "no_action" : "evidence_asset";
  }
  if (coverage === "unknown") return "evidence_asset";
  return evidence === "primary" || evidence === "observed" ? "create_page" : "evidence_asset";
};

const evidenceGapsFor = (evidence: EvidenceKey, coverage: CoverageKey): string[] => {
  const gaps: Record<EvidenceKey, string[]> = {
    none: [
      "No primary source or accountable evidence owner is recorded.",
      "No firsthand observation or reproducible test supports the recommendation.",
      "Important boundaries and counterexamples are still unknown.",
    ],
    secondary: [
      "The current case depends on secondary synthesis rather than primary evidence.",
      "Claims need a date, scope, and link to their original source.",
      "At least one counterexample or failure condition needs verification.",
    ],
    primary: [
      "Primary evidence still needs an explicit date, scope, and applicability check.",
      "At least one counterexample should test the proposed boundary.",
      "Decision criteria need an explicit order of importance.",
    ],
    observed: [
      "Test conditions, sample limits, and recency need to remain visible.",
      "Observed behavior should be checked against the relevant primary documentation.",
      "A contrary case is needed to show when the result does not apply.",
    ],
  };

  const coverageGap =
    coverage === "unknown"
      ? "The existing page inventory must be reviewed before any URL is created."
      : coverage === "overlap"
        ? "A canonical owner and intent-equivalent merge target must be selected."
        : null;

  return coverageGap ? [coverageGap, ...gaps[evidence].slice(0, 2)] : gaps[evidence];
};

const decisionCopy = (decision: DecisionKey, topic: string, evidence: EvidenceKey) => {
  const copy: Record<DecisionKey, { rationale: string; nextMove: string }> = {
    strengthen: {
      rationale: "The user job already has a home. Close the evidence and question gaps there.",
      nextMove: "Update the existing page. Do not create a sibling URL for these branches.",
    },
    consolidate: {
      rationale: "Several pages compete for the same primary job. More content would deepen the overlap.",
      nextMove: `Choose the strongest intent-equivalent page for “${topic}”, merge unique evidence, and redirect only true equivalents.`,
    },
    create_page: {
      rationale: "No page owns this user job and credible evidence is already available. One bounded page is justified.",
      nextMove: `Create one page for “${topic}”. Keep the mapped branches inside its promise rather than creating separate URLs by default.`,
    },
    evidence_asset: {
      rationale:
        evidence === "none" || evidence === "secondary"
          ? "A page would outrun the available proof. Build or obtain the missing evidence first."
          : "The page inventory or decision basis is unresolved. Resolve that gap before choosing a URL.",
      nextMove: "Create a worksheet, inventory, test, dataset, interview, or source register. Re-run the decision afterward.",
    },
    no_action: {
      rationale: "The existing page substantially covers the job and has credible evidence. Another URL would add little value.",
      nextMove: "Record the review, maintain the evidence, and leave the page set unchanged unless the user job or source material changes.",
    },
  };

  return copy[decision];
};

const replaceList = (id: string, values: string[]) => {
  const list = requireElement<HTMLOListElement | HTMLUListElement>(id);
  list.replaceChildren(
    ...values.map((value) => {
      const item = document.createElement("li");
      item.textContent = value;
      return item;
    }),
  );
};

const buildResult = (): FanoutResult => {
  const topic = topicInput.value.replace(/\s+/g, " ").trim();
  const job = jobInput.value as JobKey;
  const coverage = coverageInput.value as CoverageKey;
  const evidence = evidenceInput.value as EvidenceKey;
  const profile = jobProfiles[job];
  const decisionKey = chooseDecision(coverage, evidence);
  const decision = decisionMeta[decisionKey];
  const decisionText = decisionCopy(decisionKey, topic, evidence);

  return {
    methodVersion: "0.1.0",
    modeledOutput: true,
    retained: false,
    input: { topic, primaryUserJob: job, existingCoverage: coverage, evidenceOnHand: evidence },
    map: {
      goal: profile.goal(topic),
      entities: [
        `Subject: ${topic}`,
        `Actor: ${profile.actor}`,
        `Outcome: ${profile.outcome}`,
        "Evidence owner: the person or organization accountable for each material claim",
      ],
      questions: profile.questions(topic),
      sourceRoles: profile.roles,
      evidenceGaps: evidenceGapsFor(evidence, coverage),
    },
    decision: { ...decision, key: decisionKey, rationale: decisionText.rationale, nextMove: decisionText.nextMove },
  };
};

const selectedLabel = (select: HTMLSelectElement) => select.selectedOptions[0]?.textContent?.trim() ?? "";

const renderResult = (result: FanoutResult) => {
  requireElement("decision-code").textContent = result.decision.code;
  requireElement("decision-title").textContent = result.decision.label;
  requireElement("decision-rationale").textContent = result.decision.rationale;
  requireElement("next-move-detail").textContent = result.decision.nextMove;
  requireElement("goal-detail").textContent = result.map.goal;
  replaceList("entities-detail", result.map.entities);
  replaceList("questions-detail", result.map.questions);
  replaceList("roles-detail", result.map.sourceRoles);
  replaceList("gaps-detail", result.map.evidenceGaps);

  requireElement("summary-topic").textContent = result.input.topic;
  requireElement("summary-job").textContent = selectedLabel(jobInput);
  requireElement("summary-coverage").textContent = selectedLabel(coverageInput);
  requireElement("summary-evidence").textContent = selectedLabel(evidenceInput);

  wizardFlow.hidden = true;
  inputSummary.hidden = false;
  decisionEmpty.hidden = true;
  decisionResult.hidden = false;
  decisionResult.dataset.decision = result.decision.key;
  resultDetails.hidden = true;
  reasoningToggle.setAttribute("aria-expanded", "false");
  reasoningToggle.querySelector("span")!.textContent = "View reasoning";
  explorer.classList.add("is-complete");
};

const setStep = (step: number, focus = true) => {
  currentStep = Math.min(4, Math.max(1, step));
  panels.forEach((panel) => {
    panel.hidden = Number(panel.dataset.wizardStep) !== currentStep;
  });
  progressItems.forEach((item) => {
    const itemStep = Number(item.dataset.progressStep);
    item.classList.toggle("is-active", itemStep === currentStep);
    item.classList.toggle("is-complete", itemStep < currentStep);
    if (itemStep === currentStep) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });
  stepStatus.textContent = `Step ${currentStep} of 4`;

  if (focus) {
    const field = panels.find((panel) => Number(panel.dataset.wizardStep) === currentStep)?.querySelector<HTMLElement>("textarea, select");
    field?.focus({ preventScroll: true });
  }
};

const resetToInputs = () => {
  inputSummary.hidden = true;
  wizardFlow.hidden = false;
  decisionResult.hidden = true;
  decisionEmpty.hidden = false;
  resultDetails.hidden = true;
  explorer.classList.remove("is-complete");
  actionStatus.textContent = "";
  setStep(1);
};

const updateCount = () => {
  topicCount.textContent = `${topicInput.value.length} / 160`;
};

topicInput.addEventListener("input", updateCount);

document.querySelectorAll<HTMLButtonElement>("[data-next-step]").forEach((button) => {
  button.addEventListener("click", () => {
    if (currentStep === 1 && !topicInput.reportValidity()) return;
    setStep(Number(button.dataset.nextStep));
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-prev-step]").forEach((button) => {
  button.addEventListener("click", () => setStep(Number(button.dataset.prevStep)));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!topicInput.reportValidity()) {
    setStep(1);
    return;
  }
  currentResult = buildResult();
  renderResult(currentResult);
});

requireElement<HTMLButtonElement>("edit-inputs").addEventListener("click", resetToInputs);
requireElement<HTMLButtonElement>("edit-inputs-mobile").addEventListener("click", resetToInputs);

reasoningToggle.addEventListener("click", () => {
  const willOpen = resultDetails.hidden;
  resultDetails.hidden = !willOpen;
  reasoningToggle.setAttribute("aria-expanded", String(willOpen));
  reasoningToggle.querySelector("span")!.textContent = willOpen ? "Hide reasoning" : "View reasoning";
  if (willOpen) resultDetails.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
});

copyButton.addEventListener("click", async () => {
  if (!currentResult) return;
  try {
    await navigator.clipboard.writeText(JSON.stringify(currentResult, null, 2));
    actionStatus.textContent = "Result copied.";
  } catch {
    actionStatus.textContent = "Copy was blocked. Use Export JSON instead.";
  }
});

exportButton.addEventListener("click", () => {
  if (!currentResult) return;
  const blob = new Blob([JSON.stringify(currentResult, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const slug = currentResult.input.topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
  link.href = url;
  link.download = `seo-fanout-${slug || "result"}.json`;
  link.click();
  URL.revokeObjectURL(url);
  actionStatus.textContent = "JSON exported.";
});

updateCount();
setStep(1, false);