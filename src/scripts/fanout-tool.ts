import {
  chooseDecision,
  decisionLabels,
  type CoverageKey,
  type DecisionKey,
  type EvidenceKey,
} from "../lib/decision-engine";
type JobKey = "learn" | "compare" | "choose" | "act" | "troubleshoot";
interface NormalizedImport {
  topic: string;
  branches: string[];
  questions: string[];
  entities: string[];
  intents: string[];
  sourceRoles: string[];
  schemaVersion?: string;
}
interface JobProfile {
  goal: (topic: string) => string;
  actor: string;
  outcome: string;
  questions: (topic: string) => string[];
  roles: string[];
}
interface FanoutResult {
  methodVersion: "0.2.0";
  modeledOutput: true;
  retained: false;
  source: "manual" | "ai_fanout_import";
  input: {
    topic: string;
    primaryUserJob: JobKey;
    existingCoverage: CoverageKey;
    evidenceOnHand: EvidenceKey;
    importedPlan?: NormalizedImport;
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
    goal: (t) =>
      `Help someone understand ${t} well enough to explain its scope and limits.`,
    actor: "A reader building a reliable mental model",
    outcome: "A clear definition with boundaries and examples",
    questions: (t) => [
      `What does ${t} mean in this context?`,
      "Which components or terms must be understood first?",
      "Where does the concept stop?",
      "Which primary evidence supports the explanation?",
      "What example and counterexample make the boundary concrete?",
    ],
    roles: [
      "Official or primary definition",
      "Subject-matter explainer",
      "Firsthand example or documented case",
    ],
  },
  compare: {
    goal: (t) =>
      `Help someone compare ${t} using explicit criteria and equivalent evidence.`,
    actor: "A reader comparing viable options",
    outcome: "A defensible trade-off, not a universal winner",
    questions: (t) => [
      `Which options are genuinely comparable within ${t}?`,
      "Which criteria matter to this use case?",
      "Are prices, capabilities and limits measured on the same basis?",
      "Which option is better under each constraint?",
      "When is no listed option right?",
    ],
    roles: [
      "Current primary specifications",
      "Transparent comparison methodology",
      "Independent firsthand evaluation",
    ],
  },
  choose: {
    goal: (t) =>
      `Help someone choose within ${t} for their real constraints and intended outcome.`,
    actor: "A decision-maker with a specific use case",
    outcome: "One bounded recommendation with disqualifiers",
    questions: (t) => [
      `What outcome is the person choosing ${t} for?`,
      "Which constraints are non-negotiable?",
      "What evidence separates a plausible option from a suitable one?",
      "Which trade-offs change the recommendation?",
      "What would disqualify the leading option?",
    ],
    roles: [
      "Primary specifications or policy",
      "Decision framework with weighted criteria",
      "Firsthand test, review, or qualified expert evidence",
    ],
  },
  act: {
    goal: (t) => `Help someone complete ${t} safely and verify the result.`,
    actor: "A practitioner carrying out the task",
    outcome: "A completed task with a verification step",
    questions: (t) => [
      `What must be true before starting ${t}?`,
      "What is the smallest safe sequence?",
      "Where do permissions or dependencies change it?",
      "How is success verified?",
      "What recovery path is needed?",
    ],
    roles: [
      "Official procedure or standard",
      "Firsthand implementation notes",
      "Verification checklist or reproducible test",
    ],
  },
  troubleshoot: {
    goal: (t) =>
      `Help someone diagnose ${t} from observable evidence before changing the system.`,
    actor: "A practitioner diagnosing a reproducible failure",
    outcome: "A verified cause or the next discriminating test",
    questions: (t) => [
      `What exact symptom defines ${t}?`,
      "Which runtime or state path owns the failure?",
      "Which observations distinguish likely causes?",
      "What is the safest discriminating test?",
      "How is the fix verified?",
    ],
    roles: [
      "Primary technical documentation",
      "Reproducible diagnostic evidence",
      "Known-issue, change-log, or maintainer evidence",
    ],
  },
};
const decisionMeta: Record<DecisionKey, { code: string }> = {
  extend_page: { code: "D-01" },
  add_section: { code: "D-02" },
  merge_content: { code: "D-03" },
  evidence_asset: { code: "D-04" },
  create_url: { code: "D-05" },
  no_action: { code: "D-06" },
};
const requireElement = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing required element: #${id}`);
  return el as T;
};
const form = requireElement<HTMLFormElement>("fanout-form"),
  topicInput = requireElement<HTMLTextAreaElement>("topic"),
  topicCount = requireElement<HTMLOutputElement>("topic-count"),
  jobInput = requireElement<HTMLSelectElement>("job"),
  coverageInput = requireElement<HTMLSelectElement>("coverage"),
  evidenceInput = requireElement<HTMLSelectElement>("evidence"),
  stepStatus = requireElement<HTMLOutputElement>("step-status"),
  wizardFlow = requireElement<HTMLElement>("wizard-flow"),
  inputSummary = requireElement<HTMLElement>("input-summary"),
  decisionEmpty = requireElement<HTMLElement>("decision-empty"),
  decisionResult = requireElement<HTMLElement>("decision-result"),
  resultDetails = requireElement<HTMLElement>("result-details"),
  reasoningToggle = requireElement<HTMLButtonElement>("toggle-reasoning"),
  actionStatus = requireElement<HTMLOutputElement>("action-status"),
  explorer = requireElement<HTMLElement>("explorer");
const importText = requireElement<HTMLTextAreaElement>("fanout-json"),
  importFile = requireElement<HTMLInputElement>("fanout-file"),
  importStatus = requireElement<HTMLOutputElement>("import-status"),
  importPreview = requireElement<HTMLElement>("import-preview"),
  clearImport = requireElement<HTMLButtonElement>("clear-import");
const panels = Array.from(
    document.querySelectorAll<HTMLElement>("[data-wizard-step]"),
  ),
  progressItems = Array.from(
    document.querySelectorAll<HTMLElement>("[data-progress-step]"),
  );
let currentResult: FanoutResult | null = null,
  currentImport: NormalizedImport | null = null,
  currentStep = 1;
const clean = (v: unknown) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim() : "";
const unique = (values: string[], limit = 20) =>
  [...new Set(values.map(clean).filter(Boolean))].slice(0, limit);
const objectValue = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
const firstString = (root: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    let value: unknown = root;
    for (const part of key.split(".")) value = objectValue(value)?.[part];
    const found = clean(value);
    if (found) return found;
  }
  return "";
};
const collectKnown = (
  value: unknown,
  keys: Set<string>,
  depth = 0,
): string[] => {
  if (depth > 5 || value === null) return [];
  if (Array.isArray(value))
    return value.flatMap((item) => collectKnown(item, keys, depth + 1));
  const object = objectValue(value);
  if (!object) return typeof value === "string" ? [value] : [];
  const output: string[] = [];
  for (const [key, item] of Object.entries(object)) {
    const normalized = key.toLowerCase().replace(/[_-]/g, "");
    if (keys.has(normalized)) {
      if (Array.isArray(item))
        for (const entry of item) {
          const entryObject = objectValue(entry);
          output.push(
            clean(
              entryObject?.question ??
                entryObject?.query ??
                entryObject?.label ??
                entryObject?.title ??
                entryObject?.name ??
                entry,
            ),
          );
        }
      else output.push(clean(item));
    }
    if (depth < 5 && typeof item === "object")
      output.push(...collectKnown(item, keys, depth + 1));
  }
  return output;
};
const normalizeImport = (value: unknown): NormalizedImport => {
  const root = objectValue(value);
  if (!root) throw new Error("The JSON root must be an object.");
  const topic = firstString(root, [
    "topic",
    "keyword",
    "query",
    "prompt",
    "input.topic",
    "input.keyword",
    "input.query",
    "plan.topic",
    "plan.keyword",
    "plan.query",
  ]);
  const branches = unique(
      collectKnown(root, new Set(["branches", "subtopics", "clusters"])),
    ),
    questions = unique(
      collectKnown(
        root,
        new Set([
          "questions",
          "subquestions",
          "queries",
          "longtails",
          "longtailqueries",
        ]),
      ),
    ),
    entities = unique(collectKnown(root, new Set(["entities", "entity"]))),
    intents = unique(collectKnown(root, new Set(["intents", "intent"]))),
    sourceRoles = unique(
      collectKnown(root, new Set(["sourceroles", "sourceneeds", "sources"])),
    );
  if (!topic && !branches.length && !questions.length)
    throw new Error(
      "No recognizable topic, query, branches or questions were found.",
    );
  return {
    topic: topic || branches[0] || questions[0] || "Imported AI Fanout plan",
    branches,
    questions,
    entities,
    intents,
    sourceRoles,
    schemaVersion:
      firstString(root, ["schemaVersion", "schema_version", "version"]) ||
      undefined,
  };
};
const applyImport = (raw: string) => {
  if (raw.length > 200000)
    throw new Error("The JSON exceeds the 200 KB local import limit.");
  const plan = normalizeImport(JSON.parse(raw));
  currentImport = plan;
  topicInput.value = plan.topic.slice(0, 160);
  topicCount.textContent = `${topicInput.value.length} / 160`;
  requireElement("import-topic").textContent = plan.topic;
  requireElement("import-branches").textContent = String(plan.branches.length);
  requireElement("import-questions").textContent = String(
    plan.questions.length,
  );
  requireElement("import-entities").textContent = String(plan.entities.length);
  importPreview.hidden = false;
  clearImport.hidden = false;
  importStatus.textContent = `Imported locally${plan.schemaVersion ? ` · schema ${plan.schemaVersion}` : ""}. Review the page inventory below.`;
  explorer.scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "start",
  });
};
requireElement<HTMLButtonElement>("import-paste").addEventListener(
  "click",
  () => {
    try {
      applyImport(importText.value.trim());
    } catch (error) {
      importStatus.textContent =
        error instanceof Error ? error.message : "The JSON could not be read.";
      importText.focus();
    }
  },
);
importFile.addEventListener("change", async () => {
  const file = importFile.files?.[0];
  if (!file) return;
  if (file.size > 200000) {
    importStatus.textContent = "The selected file exceeds 200 KB.";
    importFile.value = "";
    return;
  }
  try {
    applyImport(await file.text());
  } catch (error) {
    importStatus.textContent =
      error instanceof Error
        ? error.message
        : "The JSON file could not be read.";
    importFile.value = "";
  }
});
clearImport.addEventListener("click", () => {
  currentImport = null;
  importText.value = "";
  importFile.value = "";
  importPreview.hidden = true;
  clearImport.hidden = true;
  importStatus.textContent = "Import removed. Nothing was retained.";
});
const evidenceGapsFor = (evidence: EvidenceKey, coverage: CoverageKey) => {
  const gaps: Record<EvidenceKey, string[]> = {
    none: [
      "No primary source or accountable evidence owner is recorded.",
      "No firsthand observation or reproducible test supports the action.",
      "Important boundaries and counterexamples are unknown.",
    ],
    secondary: [
      "The case depends on secondary synthesis.",
      "Claims need date, scope and original source.",
      "A counterexample or failure condition needs verification.",
    ],
    primary: [
      "Primary evidence needs a date, scope and applicability check.",
      "A counterexample should test the boundary.",
      "Decision criteria need an explicit order.",
    ],
    observed: [
      "Test conditions, sample limits and recency must remain visible.",
      "Observed behavior should be checked against primary documentation.",
      "A contrary case should show when the result does not apply.",
    ],
  };
  if (coverage === "unknown")
    return [
      "Review the existing page inventory before changing or creating a URL.",
      ...gaps[evidence].slice(0, 2),
    ];
  if (coverage === "overlap")
    return [
      "Select one canonical owner and identify only intent-equivalent merge targets.",
      ...gaps[evidence].slice(0, 2),
    ];
  return gaps[evidence];
};
const decisionCopy = (
  key: DecisionKey,
  topic: string,
  evidence: EvidenceKey,
): { rationale: string; nextMove: string } =>
  ({
    extend_page: {
      rationale:
        "The current URL owns the job, but its promise needs a material expansion supported by ready evidence.",
      nextMove:
        "Expand the existing page architecture and supporting proof. Keep the work on its canonical URL.",
    },
    add_section: {
      rationale:
        "The canonical page owns the job and only one bounded gap remains.",
      nextMove:
        "Add one focused section to the existing page and link its evidence. Do not create a sibling URL.",
    },
    merge_content: {
      rationale:
        "Several URLs compete for the same primary job. More content would deepen the overlap.",
      nextMove: `Choose the strongest canonical page for “${topic}”, merge unique value, and redirect only genuinely intent-equivalent URLs.`,
    },
    evidence_asset: {
      rationale:
        evidence === "none" || evidence === "secondary"
          ? "Publication work would outrun the available proof. Build or obtain evidence first."
          : "The inventory or decision basis is unresolved. Resolve it before changing a URL.",
      nextMove:
        "Create a test, dataset, interview, comparison sheet or source register. Re-run the decision when it is reviewable.",
    },
    create_url: {
      rationale:
        "No existing URL owns this distinct user job and decision-ready evidence is available.",
      nextMove: `Create one canonical URL for “${topic}”. Keep related branches within that page unless a later inventory proves a distinct job.`,
    },
    no_action: {
      rationale:
        "The existing page already covers the job and has decision-ready evidence.",
      nextMove:
        "Record the review and leave the page set unchanged until the user job, evidence or inventory changes.",
    },
  })[key];
const replaceList = (id: string, values: string[]) => {
  const list = requireElement<HTMLOListElement | HTMLUListElement>(id);
  list.replaceChildren(
    ...values.map((value) => {
      const li = document.createElement("li");
      li.textContent = value;
      return li;
    }),
  );
};
const buildResult = (): FanoutResult => {
  const topic = topicInput.value.replace(/\s+/g, " ").trim(),
    job = jobInput.value as JobKey,
    coverage = coverageInput.value as CoverageKey,
    evidence = evidenceInput.value as EvidenceKey,
    profile = jobProfiles[job],
    key = chooseDecision(coverage, evidence),
    copy = decisionCopy(key, topic, evidence);
  const importedQuestions = currentImport
      ? [...currentImport.branches, ...currentImport.questions]
      : [],
    importedRoles = currentImport?.sourceRoles ?? [],
    importedEntities = currentImport?.entities ?? [];
  return {
    methodVersion: "0.2.0",
    modeledOutput: true,
    retained: false,
    source: currentImport ? "ai_fanout_import" : "manual",
    input: {
      topic,
      primaryUserJob: job,
      existingCoverage: coverage,
      evidenceOnHand: evidence,
      ...(currentImport ? { importedPlan: currentImport } : {}),
    },
    map: {
      goal: profile.goal(topic),
      entities: unique(
        [
          ...importedEntities,
          `Subject: ${topic}`,
          `Actor: ${profile.actor}`,
          `Outcome: ${profile.outcome}`,
        ],
        12,
      ),
      questions: unique(
        [...importedQuestions, ...profile.questions(topic)],
        12,
      ),
      sourceRoles: unique([...importedRoles, ...profile.roles], 10),
      evidenceGaps: evidenceGapsFor(evidence, coverage),
    },
    decision: {
      code: decisionMeta[key].code,
      key,
      label: decisionLabels[key],
      rationale: copy.rationale,
      nextMove: copy.nextMove,
    },
  };
};
const selectedLabel = (select: HTMLSelectElement) =>
  select.selectedOptions[0]?.textContent?.trim() ?? "";
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
  requireElement("summary-source").textContent =
    result.source === "ai_fanout_import"
      ? "Imported AI Fanout plan"
      : "Manual keyword or question";
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
  reasoningToggle.querySelector("span")!.textContent = "View decision record";
  explorer.classList.add("is-complete");
};
const setStep = (step: number, focus = true) => {
  currentStep = Math.min(4, Math.max(1, step));
  panels.forEach(
    (p) => (p.hidden = Number(p.dataset.wizardStep) !== currentStep),
  );
  progressItems.forEach((item) => {
    const n = Number(item.dataset.progressStep);
    item.classList.toggle("is-active", n === currentStep);
    item.classList.toggle("is-complete", n < currentStep);
    n === currentStep
      ? item.setAttribute("aria-current", "step")
      : item.removeAttribute("aria-current");
  });
  stepStatus.textContent = `Step ${currentStep} of 4`;
  if (focus)
    panels
      .find((p) => Number(p.dataset.wizardStep) === currentStep)
      ?.querySelector<HTMLElement>("textarea, select")
      ?.focus({ preventScroll: true });
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
topicInput.addEventListener(
  "input",
  () => (topicCount.textContent = `${topicInput.value.length} / 160`),
);
document
  .querySelectorAll<HTMLButtonElement>("[data-next-step]")
  .forEach((button) =>
    button.addEventListener("click", () => {
      if (currentStep === 1 && !topicInput.reportValidity()) return;
      setStep(Number(button.dataset.nextStep));
    }),
  );
document
  .querySelectorAll<HTMLButtonElement>("[data-prev-step]")
  .forEach((button) =>
    button.addEventListener("click", () =>
      setStep(Number(button.dataset.prevStep)),
    ),
  );
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!topicInput.reportValidity()) {
    setStep(1);
    return;
  }
  currentResult = buildResult();
  renderResult(currentResult);
});
requireElement<HTMLButtonElement>("edit-inputs").addEventListener(
  "click",
  resetToInputs,
);
requireElement<HTMLButtonElement>("edit-inputs-mobile").addEventListener(
  "click",
  resetToInputs,
);
reasoningToggle.addEventListener("click", () => {
  const open = resultDetails.hidden;
  resultDetails.hidden = !open;
  reasoningToggle.setAttribute("aria-expanded", String(open));
  reasoningToggle.querySelector("span")!.textContent = open
    ? "Hide decision record"
    : "View decision record";
  if (open)
    resultDetails.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
});
requireElement<HTMLButtonElement>("copy-result").addEventListener(
  "click",
  async () => {
    if (!currentResult) return;
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(currentResult, null, 2),
      );
      actionStatus.textContent = "Result copied.";
    } catch {
      actionStatus.textContent = "Copy was blocked. Use Export JSON instead.";
    }
  },
);
requireElement<HTMLButtonElement>("export-result").addEventListener(
  "click",
  () => {
    if (!currentResult) return;
    const blob = new Blob([JSON.stringify(currentResult, null, 2)], {
        type: "application/json",
      }),
      url = URL.createObjectURL(blob),
      link = document.createElement("a"),
      slug = currentResult.input.topic
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 48);
    link.href = url;
    link.download = `seo-fanout-decision-${slug || "result"}.json`;
    link.click();
    URL.revokeObjectURL(url);
    actionStatus.textContent = "JSON exported.";
  },
);
topicCount.textContent = `${topicInput.value.length} / 160`;
setStep(1, false);
