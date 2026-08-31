export const SEO_HANDOFF_SCHEMA = "ai-fanout.seo-research-handoff/1.0";
export const SEO_HANDOFF_MAX_BYTES = 48_000;

const STOP_WORDS = new Set([
  "about", "after", "best", "eine", "einer", "eines", "einen", "einem",
  "fuer", "für", "from", "have", "how", "oder", "that", "the", "this",
  "und", "what", "when", "which", "with", "your", "was", "wie", "welche",
  "welcher", "welches", "warum", "2025", "2026",
]);

const LENSES = [
  { key: "compare", de: "Vergleich & Auswahl", en: "Comparison & choice", pattern: /\b(vs\.?|versus|compar(?:e|ison)|vergleich|vergleichen|alternative[n]?|best(?:e[nrms]?)?|which|welche[rsnm]?)\b/iu },
  { key: "cost", de: "Preis & Transaktion", en: "Cost & transaction", pattern: /\b(preis(?:e|vergleich)?|kosten|pricing|price|cost|kaufen|buy|tarif|plan)\b/iu },
  { key: "implementation", de: "Umsetzung", en: "Implementation", pattern: /\b(how to|anleitung|tutorial|einrichten|setup|implement(?:ation|ieren)?|install(?:ation|ieren)?|workflow|schritte?)\b/iu },
  { key: "troubleshoot", de: "Problembehebung", en: "Troubleshooting", pattern: /\b(fehler|problem|funktioniert nicht|beheben|fix|error|issue|not working|troubleshoot)\b/iu },
  { key: "definition", de: "Grundlage & Erklärung", en: "Definition & explanation", pattern: /\b(was ist|what is|definition|meaning|bedeutung|warum|why|erkl(?:a|ä)r)\b/iu },
  { key: "trust", de: "Vertrauen & Regeln", en: "Trust & rules", pattern: /\b(datenschutz|dsgvo|gdpr|security|sicherheit|legal|recht|compliance|erfahrung|review|bewertung)\b/iu },
];

const clean = (value, limit) => String(value ?? "").replace(/\s+/gu, " ").trim().slice(0, limit);

const decodeBase64Url = (value) => {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (bytes.length > SEO_HANDOFF_MAX_BYTES) throw new Error("HANDOFF_TOO_LARGE");
  return new TextDecoder().decode(bytes);
};

const safeSource = (source) => {
  const url = new URL(clean(source?.url, 2_048));
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error("INVALID_SOURCE_URL");
  return { url: url.href, title: clean(source?.title, 180), scope: clean(source?.scope, 80) };
};

export function decodeSeoResearchHandoff(value) {
  const payload = JSON.parse(decodeBase64Url(value));
  if (payload?.schemaVersion !== SEO_HANDOFF_SCHEMA || payload?.producer !== "ai-fanout.com") throw new Error("UNSUPPORTED_HANDOFF");
  const run = payload.run;
  if (!run || !["en", "de"].includes(run.language)) throw new Error("INVALID_HANDOFF");
  const question = clean(run.question, 160);
  if (question.length < 2 || !Array.isArray(run.queries) || run.queries.length < 1 || run.queries.length > 20) throw new Error("INVALID_HANDOFF");
  const queries = run.queries.map((query) => ({
    text: clean(query?.text, 200),
    intent: clean(query?.intent, 80),
    reason: clean(query?.reason, 240),
    sourceRelation: clean(query?.sourceRelation, 180),
    sources: Array.isArray(query?.sources) ? query.sources.slice(0, 20).map(safeSource) : [],
  }));
  if (queries.some((query) => query.text.length < 2)) throw new Error("INVALID_HANDOFF");
  return {
    schemaVersion: SEO_HANDOFF_SCHEMA,
    producer: "ai-fanout.com",
    transferredAt: clean(payload.transferredAt, 40),
    notice: clean(payload.notice, 400),
    run: {
      question,
      language: run.language,
      market: clean(run.market, 120),
      providerLabel: clean(run.providerLabel, 160),
      evidenceLabel: clean(run.evidenceLabel, 160),
      evidenceState: run.evidenceState === "provider_exposed_native_search" ? "provider_exposed_native_search" : "modelled_search_ideas",
      displayedRunTime: clean(run.displayedRunTime, 120),
      queries,
      runSources: Array.isArray(run.runSources) ? run.runSources.slice(0, 40).map(safeSource) : [],
    },
  };
}

export function classifyQuery(query) {
  return LENSES.find((lens) => lens.pattern.test(query))?.key ?? "research";
}

const sourceDomain = (source) => {
  try { return new URL(source.url).hostname.replace(/^www\./u, ""); } catch { return ""; }
};

export function analyzeSeoHandoff(payload) {
  const language = payload.run.language;
  const categories = new Map();
  const termCounts = new Map();
  const domainCounts = new Map();
  const analysedQueries = payload.run.queries.map((query) => {
    const key = classifyQuery(query.text);
    const lens = LENSES.find((candidate) => candidate.key === key);
    const label = lens ? lens[language] : language === "de" ? "Offene Recherche" : "Open research";
    const entry = categories.get(key) ?? { key, label, count: 0, queries: [] };
    entry.count += 1;
    entry.queries.push(query.text);
    categories.set(key, entry);
    for (const token of query.text.toLocaleLowerCase(language).match(/[\p{L}\p{N}][\p{L}\p{N}-]{2,}/gu) ?? []) {
      if (!STOP_WORDS.has(token) && !/^\d+$/u.test(token)) termCounts.set(token, (termCounts.get(token) ?? 0) + 1);
    }
    for (const source of query.sources) {
      const domain = sourceDomain(source);
      if (domain) domainCounts.set(domain, (domainCounts.get(domain) ?? 0) + 1);
    }
    return { ...query, lensKey: key, lensLabel: label, mapped: query.sources.length > 0 };
  });
  for (const source of payload.run.runSources) {
    const domain = sourceDomain(source);
    if (domain) domainCounts.set(domain, (domainCounts.get(domain) ?? 0) + 1);
  }
  const recurringTerms = [...termCounts.entries()].filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10).map(([term, count]) => ({ term, count }));
  const domains = [...domainCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([domain, count]) => ({ domain, count }));
  const lenses = [...categories.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  const mappedQueryCount = analysedQueries.filter((query) => query.mapped).length;
  return {
    language,
    evidenceState: payload.run.evidenceState,
    queries: analysedQueries,
    lenses,
    recurringTerms,
    domains,
    mappedQueryCount,
    unmappedQueryCount: analysedQueries.length - mappedQueryCount,
    sourceCount: analysedQueries.reduce((total, query) => total + query.sources.length, payload.run.runSources.length),
  };
}

export function exampleSeoHandoff(language = "en") {
  const de = language === "de";
  return {
    schemaVersion: SEO_HANDOFF_SCHEMA,
    producer: "ai-fanout.com",
    transferredAt: "2026-08-31T12:00:00.000Z",
    notice: "Synthetic interface example. It is not a provider observation.",
    run: {
      question: de ? "Welche SEO-Tools passen zu kleinen Unternehmen?" : "Which SEO tools suit a small business?",
      language,
      market: de ? "Deutschland · Deutsch" : "All countries · English",
      providerLabel: "Synthetic interface example",
      evidenceLabel: de ? "Synthetisches Beispiel" : "Synthetic example",
      evidenceState: "modelled_search_ideas",
      displayedRunTime: "31 August 2026",
      queries: (de ? ["SEO Tools für kleine Unternehmen", "SEO Tool Preise vergleichen", "einfache SEO Tools für Einsteiger", "SEO Tools Datenschutz DSGVO", "SEO Tool einrichten Anleitung"] : ["SEO tools for small businesses", "compare SEO tool pricing", "easy SEO tools for beginners", "GDPR compliant SEO tools", "how to set up an SEO tool"]).map((text) => ({ text, intent: "", reason: "", sourceRelation: "", sources: [] })),
      runSources: [],
    },
  };
}
