export {};

interface OutputMetrics {
  words: number;
  headings: number;
  lists: number;
  links: number;
  criteriaCovered: number;
  criteriaTotal: number;
}

interface ComparedOutput {
  name: string;
  output: string;
  metrics: OutputMetrics | null;
}

interface LabResult {
  methodVersion: "0.1.0";
  retained: false;
  boundary: string;
  input: { prompt: string; criteria: string[] };
  outputs: ComparedOutput[];
}

const requireElement = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element: #${id}`);
  return element as T;
};

const form = requireElement<HTMLFormElement>("ai-lab-form");
const promptInput = requireElement<HTMLTextAreaElement>("lab-prompt");
const criteriaInput = requireElement<HTMLTextAreaElement>("lab-criteria");
const promptCount = requireElement<HTMLOutputElement>("lab-prompt-count");
const criteriaCount = requireElement<HTMLOutputElement>("lab-criteria-count");
const formStatus = requireElement<HTMLOutputElement>("lab-form-status");
const resultsSection = requireElement<HTMLElement>("lab-results");
const differencesList = requireElement<HTMLUListElement>("lab-differences");
const resetButton = requireElement<HTMLButtonElement>("lab-reset");
const exportButton = requireElement<HTMLButtonElement>("lab-export");
const nameInputs = Array.from(document.querySelectorAll<HTMLInputElement>("[data-lab-name]"));
const outputInputs = Array.from(document.querySelectorAll<HTMLTextAreaElement>("[data-lab-output]"));
const outputCounts = Array.from(document.querySelectorAll<HTMLOutputElement>("[data-lab-output-count]"));
const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-lab-tab]"));
const panels = Array.from(document.querySelectorAll<HTMLElement>("[data-lab-panel]"));

let currentResult: LabResult | null = null;

const normalizedWords = (value: string) => value.toLocaleLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}’'-]*/gu) ?? [];
const stopWords = new Set(["the", "and", "for", "with", "from", "into", "that", "this", "are", "was", "were", "one", "how", "what", "why", "your", "you", "its", "not"]);

const parseCriteria = () => criteriaInput.value
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean)
  .slice(0, 20);

const criterionCovered = (criterion: string, outputWords: Set<string>) => {
  const tokens = [...new Set(normalizedWords(criterion).filter((word) => word.length > 2 && !stopWords.has(word)))];
  if (tokens.length === 0) return false;
  const hits = tokens.filter((token) => outputWords.has(token)).length;
  return hits / tokens.length >= 0.5;
};

const analyze = (output: string, criteria: string[]): OutputMetrics => {
  const lines = output.split(/\r?\n/);
  const words = normalizedWords(output);
  const urls = output.match(/https?:\/\/[^\s<>()]+/gi) ?? [];
  const uniqueUrls = new Set(urls.map((url) => url.replace(/[.,;:!?\])}]+$/, "")));
  const wordSet = new Set(words);
  return {
    words: words.length,
    headings: lines.filter((line) => /^\s{0,3}#{1,6}\s+\S/.test(line)).length,
    lists: lines.filter((line) => /^\s*(?:[-*+]\s+|\d+[.)]\s+)/.test(line)).length,
    links: uniqueUrls.size,
    criteriaCovered: criteria.filter((criterion) => criterionCovered(criterion, wordSet)).length,
    criteriaTotal: criteria.length,
  };
};

const setActiveTab = (index: number) => {
  tabs.forEach((tab, tabIndex) => tab.setAttribute("aria-selected", String(tabIndex === index)));
  panels.forEach((panel, panelIndex) => panel.classList.toggle("is-active", panelIndex === index));
};

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => setActiveTab(index));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + tabs.length) % tabs.length;
    setActiveTab(nextIndex);
    tabs[nextIndex]?.focus();
  });
});

const updateCounts = () => {
  promptCount.textContent = `${promptInput.value.length} / 4000`;
  criteriaCount.textContent = `${criteriaInput.value.length} / 1200`;
  outputInputs.forEach((input, index) => {
    if (outputCounts[index]) outputCounts[index].textContent = `${input.value.length} / 24000`;
  });
};

[promptInput, criteriaInput, ...outputInputs].forEach((input) => input.addEventListener("input", updateCounts));
nameInputs.forEach((input, index) => input.addEventListener("input", () => {
  const name = input.value.trim() || `Tool ${index + 1}`;
  if (tabs[index]) tabs[index].textContent = name;
}));

const metricValue = (toolIndex: number, metric: string) => document.querySelector<HTMLElement>(`[data-metric="${metric}"][data-tool="${toolIndex}"]`);

const addDifference = (text: string) => {
  const item = document.createElement("li");
  item.textContent = text;
  differencesList.append(item);
};

const renderDifferences = (outputs: ComparedOutput[]) => {
  differencesList.replaceChildren();
  const available = outputs.filter((entry): entry is ComparedOutput & { metrics: OutputMetrics } => entry.metrics !== null);
  const wordCounts = available.map((entry) => entry.metrics.words);
  const minWords = Math.min(...wordCounts);
  const maxWords = Math.max(...wordCounts);
  if (minWords !== maxWords) {
    const shortest = available.filter((entry) => entry.metrics.words === minWords).map((entry) => entry.name).join(" and ");
    const longest = available.filter((entry) => entry.metrics.words === maxWords).map((entry) => entry.name).join(" and ");
    addDifference(`${longest} is longest at ${maxWords} words; ${shortest} is shortest at ${minWords}.`);
  } else addDifference(`All compared outputs contain ${maxWords} words.`);

  const linkSummary = available.map((entry) => `${entry.name}: ${entry.metrics.links}`).join(" · ");
  addDifference(`Unique explicit source links — ${linkSummary}.`);

  const maxStructure = Math.max(...available.map((entry) => entry.metrics.headings + entry.metrics.lists));
  const structured = available.filter((entry) => entry.metrics.headings + entry.metrics.lists === maxStructure).map((entry) => entry.name).join(" and ");
  addDifference(`${structured} has the highest counted Markdown structure (${maxStructure} headings and list items combined).`);

  const criteriaTotal = available[0]?.metrics.criteriaTotal ?? 0;
  if (criteriaTotal > 0) {
    const maxCriteria = Math.max(...available.map((entry) => entry.metrics.criteriaCovered));
    const covered = available.filter((entry) => entry.metrics.criteriaCovered === maxCriteria).map((entry) => entry.name).join(" and ");
    addDifference(`${covered} has the highest literal criterion coverage at ${maxCriteria} of ${criteriaTotal}.`);
  } else addDifference("No comparison criteria were supplied, so literal coverage was not measured.");

  addDifference("These measures describe visible text. They do not verify factual accuracy, source quality, or private reasoning.");
};

const renderResult = (result: LabResult) => {
  result.outputs.forEach((entry, index) => {
    const heading = document.querySelector<HTMLElement>(`[data-result-name="${index}"]`);
    if (heading) heading.textContent = entry.name;
    document.querySelectorAll<HTMLElement>(`[data-tool="${index}"]`).forEach((cell) => { cell.dataset.label = entry.name; });
    const values: Record<"words" | "headings" | "lists" | "links" | "criteria", string> = entry.metrics ? {
      words: String(entry.metrics.words),
      headings: String(entry.metrics.headings),
      lists: String(entry.metrics.lists),
      links: String(entry.metrics.links),
      criteria: entry.metrics.criteriaTotal > 0 ? `${entry.metrics.criteriaCovered} / ${entry.metrics.criteriaTotal}` : "Not set",
    } : { words: "—", headings: "—", lists: "—", links: "—", criteria: "—" };
    (Object.keys(values) as Array<keyof typeof values>).forEach((metric) => {
      const cell = metricValue(index, metric);
      if (cell) cell.textContent = values[metric];
    });
  });
  renderDifferences(result.outputs);
  resultsSection.hidden = false;
  resultsSection.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!promptInput.reportValidity()) return;
  const criteria = parseCriteria();
  const outputs: ComparedOutput[] = outputInputs.map((input, index) => {
    const output = input.value.trim();
    return { name: nameInputs[index]?.value.trim() || `Tool ${index + 1}`, output, metrics: output ? analyze(output, criteria) : null };
  });
  if (outputs.filter((entry) => entry.output).length < 2) {
    formStatus.textContent = "Paste at least two visible outputs to compare.";
    const firstEmpty = outputInputs.find((input) => !input.value.trim());
    firstEmpty?.focus();
    return;
  }
  formStatus.textContent = "";
  currentResult = {
    methodVersion: "0.1.0",
    retained: false,
    boundary: "Observable final-answer text only; no provider APIs, private queries, or hidden reasoning.",
    input: { prompt: promptInput.value.trim(), criteria },
    outputs,
  };
  renderResult(currentResult);
});

resetButton.addEventListener("click", () => {
  form.reset();
  nameInputs.forEach((input, index) => {
    const defaults = ["ChatGPT", "Claude", "Gemini"];
    input.value = defaults[index] ?? `Tool ${index + 1}`;
    if (tabs[index]) tabs[index].textContent = input.value;
  });
  resultsSection.hidden = true;
  currentResult = null;
  formStatus.textContent = "";
  setActiveTab(0);
  updateCounts();
  promptInput.focus();
  form.scrollIntoView({ behavior: "auto", block: "start" });
});

exportButton.addEventListener("click", () => {
  if (!currentResult) return;
  const blob = new Blob([JSON.stringify(currentResult, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "seo-fanout-ai-output-comparison.json";
  link.click();
  URL.revokeObjectURL(url);
});

updateCounts();
setActiveTab(0);