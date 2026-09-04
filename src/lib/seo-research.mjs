export const SEO_HANDOFF_SCHEMA = "ai-fanout.seo-research-handoff/1.0";
export const SEO_HANDOFF_MAX_BYTES = 48_000;

const STOP_WORDS = new Set([
  "about",
  "after",
  "best",
  "eine",
  "einer",
  "eines",
  "einen",
  "einem",
  "fuer",
  "für",
  "from",
  "have",
  "how",
  "oder",
  "that",
  "the",
  "this",
  "und",
  "what",
  "when",
  "which",
  "with",
  "your",
  "was",
  "wie",
  "welche",
  "welcher",
  "welches",
  "warum",
  "2025",
  "2026",
]);

const LENSES = [
  {
    key: "evidence",
    de: "Evidenz & Genauigkeit",
    en: "Evidence & accuracy",
    pattern:
      /\b(studie[n]?|study|research|evidence|accuracy|genauigkeit|benchmark|messung|datenlage)\b/iu,
  },
  {
    key: "guidance",
    de: "Praxis & Leitfaden",
    en: "Practice & guidance",
    pattern:
      /\b(best practices?|best practice|leitfaden|richtlinien|empfehlungen|publisher(?:s)?|herausgeber)\b/iu,
  },
  {
    key: "compare",
    de: "Vergleich & Auswahl",
    en: "Comparison & choice",
    pattern:
      /\b(vs\.?|versus|compar(?:e|ison)|vergleich|vergleichen|alternative[n]?|best(?:e[nrms]?)?|which|welche[rsnm]?)\b/iu,
  },
  {
    key: "cost",
    de: "Preis & Transaktion",
    en: "Cost & transaction",
    pattern:
      /\b(preis(?:e|vergleich)?|kosten|pricing|price|cost|kaufen|buy|tarif|plan)\b/iu,
  },
  {
    key: "implementation",
    de: "Umsetzung",
    en: "Implementation",
    pattern:
      /\b(how to|anleitung|tutorial|einrichten|setup|implement(?:ation|ieren)?|install(?:ation|ieren)?|workflow|schritte?)\b/iu,
  },
  {
    key: "troubleshoot",
    de: "Problembehebung",
    en: "Troubleshooting",
    pattern:
      /\b(fehler|problem|funktioniert nicht|beheben|fix|error|issue|not working|troubleshoot)\b/iu,
  },
  {
    key: "definition",
    de: "Grundlage & Erklärung",
    en: "Definition & explanation",
    pattern:
      /\b(was ist|what is|how .{0,40} works?|wie .{0,40} funktioniert|definition|meaning|bedeutung|warum|why|erkl(?:a|ä)r)\b/iu,
  },
  {
    key: "trust",
    de: "Vertrauen & Regeln",
    en: "Trust & rules",
    pattern:
      /\b(datenschutz|dsgvo|gdpr|security|sicherheit|legal|recht|compliance|erfahrung|review|bewertung)\b/iu,
  },
];

const TASK_SPECS = {
  evidence: {
    de: {
      action: "Evidenz und Grenzen prüfen",
      evidence: "Belastbare Studien, Methodik, Stichprobe, Datum und widersprechende Befunde",
    },
    en: {
      action: "Test the evidence and limitations",
      evidence: "Substantive studies, methodology, sample, date and conflicting findings",
    },
  },
  guidance: {
    de: {
      action: "In praktische Empfehlungen übersetzen",
      evidence: "Offizielle Leitlinien, umsetzbare Beispiele und klar benannte Ausnahmen",
    },
    en: {
      action: "Turn it into practical guidance",
      evidence: "Official guidance, actionable examples and clearly stated exceptions",
    },
  },
  compare: {
    de: {
      action: "Bei der Auswahl helfen",
      evidence:
        "Vergleichskriterien, aktuelle Produktdaten und nachvollziehbare Unterschiede",
    },
    en: {
      action: "Help the reader choose",
      evidence:
        "Decision criteria, current product facts and verifiable differences",
    },
  },
  cost: {
    de: {
      action: "Kosten und Bedingungen klären",
      evidence: "Datierte Preise, Bedingungen, Ausnahmen und Originalquellen",
    },
    en: {
      action: "Clarify cost and conditions",
      evidence: "Dated prices, terms, exceptions and original sources",
    },
  },
  implementation: {
    de: {
      action: "Die Umsetzung zeigen",
      evidence:
        "Getestete Schritte, Voraussetzungen und ein reproduzierbares Beispiel",
    },
    en: {
      action: "Show how to do it",
      evidence: "Tested steps, prerequisites and a reproducible example",
    },
  },
  troubleshoot: {
    de: {
      action: "Ursache und Lösung belegen",
      evidence: "Reproduzierbarer Fehler, Diagnoseweg und verifizierter Fix",
    },
    en: {
      action: "Prove the cause and fix",
      evidence: "A reproducible failure, diagnostic path and verified fix",
    },
  },
  definition: {
    de: {
      action: "Begriff und Funktionsweise erklären",
      evidence:
        "Primärdokumentation, klare Abgrenzung und ein konkretes Beispiel",
    },
    en: {
      action: "Explain the concept and mechanism",
      evidence:
        "Primary documentation, clear boundaries and a concrete example",
    },
  },
  trust: {
    de: {
      action: "Vertrauen oder Regeln prüfen",
      evidence:
        "Offizielle Richtlinien, Sicherheits- oder Rechtsgrundlagen und Aktualitätsdatum",
    },
    en: {
      action: "Verify trust or rules",
      evidence:
        "Official policies, security or legal foundations and a freshness date",
    },
  },
  research: {
    de: {
      action: "Die offene Frage beantworten",
      evidence:
        "Mindestens eine Primärquelle und eine unabhängige belastbare Quelle",
    },
    en: {
      action: "Answer the open question",
      evidence:
        "At least one primary source and one independent substantive source",
    },
  },
};

const PACKAGE_SPECS = {
  comparison: {
    de: {
      title: "Vergleichsmatrix",
      deliverable:
        "Eine gemeinsame Vergleichsmatrix mit den Entscheidungskriterien aus diesen Queries.",
      proof:
        "Aktuelle Herstellerangaben, nachvollziehbare Kriterien und datierte Unterschiede",
    },
    en: {
      title: "Comparison matrix",
      deliverable:
        "One side-by-side matrix using the decision criteria exposed by these queries.",
      proof:
        "Current first-party facts, explicit criteria and dated differences",
    },
  },
  pricing: {
    de: {
      title: "Primärquellen-Preischeck",
      deliverable:
        "Ein datierter Preisstand mit Tarifnamen, Abrechnungszeitraum und wichtigen Bedingungen.",
      proof:
        "Offizielle Preisseiten, Test- und Erstattungsbedingungen sowie Prüfdatum",
    },
    en: {
      title: "First-party pricing check",
      deliverable:
        "A dated pricing snapshot with plan names, billing periods and material conditions.",
      proof:
        "Official pricing pages, trial and refund terms, and a checked date",
    },
  },
  fit: {
    de: {
      title: "Zielgruppen- und Eignungsprüfung",
      deliverable:
        "Eine begründete Einschätzung zu Einstieg, Bedienung, Support, Grenzen und Wachstum.",
      proof:
        "Herstellerpositionierung, Onboarding-Dokumentation und nachvollziehbare Praxiserfahrung",
    },
    en: {
      title: "Audience-fit review",
      deliverable:
        "A reasoned assessment of onboarding, ease of use, support, limits and scale.",
      proof:
        "First-party positioning, onboarding documentation and inspectable user evidence",
    },
  },
  trust: {
    de: {
      title: "Vertrauens- und Regelcheck",
      deliverable:
        "Ein überprüfbarer Abschnitt zu Datenschutz, Sicherheit, Recht oder Anbieteraussagen.",
      proof:
        "Offizielle Richtlinien, Verträge oder Sicherheitsdokumentation mit Prüfdatum",
    },
    en: {
      title: "Trust and policy check",
      deliverable:
        "A verifiable section covering privacy, security, legal or vendor claims.",
      proof:
        "Official policies, agreements or security documentation with a checked date",
    },
  },
  implementation: {
    de: {
      title: "Umsetzungscheckliste",
      deliverable:
        "Eine kurze, reproduzierbare Anleitung mit Voraussetzungen und Prüfschritten.",
      proof:
        "Getestete Schritte, konkrete Voraussetzungen und ein reproduzierbares Beispiel",
    },
    en: {
      title: "Implementation checklist",
      deliverable:
        "A concise reproducible procedure with prerequisites and verification steps.",
      proof:
        "Tested steps, concrete prerequisites and a reproducible example",
    },
  },
  evidence: {
    de: {
      title: "Evidenz- und Grenzenprüfung",
      deliverable:
        "Ein Prüfprotokoll für Methodik, Stichprobe, Aktualität und widersprechende Befunde.",
      proof:
        "Belastbare Studien, offengelegte Methodik, Stichprobe und Datum",
    },
    en: {
      title: "Evidence and limitations review",
      deliverable:
        "A review record for methodology, sample, freshness and conflicting findings.",
      proof:
        "Substantive research with disclosed methodology, sample and date",
    },
  },
  guidance: {
    de: {
      title: "Praxisleitfaden",
      deliverable:
        "Eine umsetzbare Anleitung mit klaren Ausnahmen und Stop-Bedingungen.",
      proof:
        "Offizielle Leitlinien, nachvollziehbare Beispiele und benannte Ausnahmen",
    },
    en: {
      title: "Practical guidance",
      deliverable:
        "Actionable guidance with explicit exceptions and stopping conditions.",
      proof:
        "Official guidance, inspectable examples and stated exceptions",
    },
  },
  explanation: {
    de: {
      title: "Begriffs- und Funktionsklärung",
      deliverable:
        "Eine klare Erklärung des Mechanismus mit Abgrenzung und Beispiel.",
      proof:
        "Primärdokumentation, eindeutige Definition und konkretes Beispiel",
    },
    en: {
      title: "Concept and mechanism explainer",
      deliverable:
        "A clear explanation of the mechanism, its boundaries and one concrete example.",
      proof:
        "Primary documentation, an explicit definition and a concrete example",
    },
  },
  troubleshooting: {
    de: {
      title: "Diagnose und verifizierter Fix",
      deliverable:
        "Ein reproduzierbarer Fehlerfall mit Diagnoseweg und geprüftem Lösungsweg.",
      proof:
        "Reproduzierbarer Fehler, isolierte Ursache und verifizierte Korrektur",
    },
    en: {
      title: "Diagnosis and verified fix",
      deliverable:
        "A reproducible failure with a diagnostic path and verified resolution.",
      proof:
        "Reproducible failure, isolated cause and verified correction",
    },
  },
  research: {
    de: {
      title: "Offene Recherche",
      deliverable:
        "Eine belastbare Antwort, die Primärbeleg und unabhängige Einordnung trennt.",
      proof:
        "Mindestens eine Primärquelle und eine unabhängige belastbare Quelle",
    },
    en: {
      title: "Open research",
      deliverable:
        "A substantive answer that separates primary evidence from independent context.",
      proof:
        "At least one primary source and one independent substantive source",
    },
  },
};

const classifyPackage = (query, lensKey) => {
  if (/\b(vs\.?|versus|gegenüber)\b/iu.test(query)) return "comparison";
  if (/\b(official.{0,20}(pricing|price|preise?)|(pricing|price|preise?).{0,20}(official|offiziell))\b/iu.test(query))
    return "pricing";
  if (/\b(small business|kleine[nrms]? unternehmen|beginner|einsteiger|review|bewertung|suit|fit|geeignet)\b/iu.test(query))
    return "fit";
  if (lensKey === "compare") return "comparison";
  if (lensKey === "cost") return "pricing";
  if (lensKey === "trust") return "trust";
  if (lensKey === "implementation") return "implementation";
  if (lensKey === "evidence") return "evidence";
  if (lensKey === "guidance") return "guidance";
  if (lensKey === "definition") return "explanation";
  if (lensKey === "troubleshoot") return "troubleshooting";
  return "research";
};

const SOURCE_ROLES = [
  {
    key: "research",
    de: "Forschung und Fachliteratur",
    en: "Research & scholarly evidence",
    pattern:
      /(^|\.)(arxiv|doi|sciencedirect|aclanthology|springer|cambridge|jstor|nature)\.|(^|\.)pmc\.ncbi\.nlm\.nih\.gov$/iu,
  },
  {
    key: "primary",
    de: "Primärquellen, Produktdokumentation und öffentliche Register",
    en: "Primary, product & public records",
    pattern:
      /(^|\.)(developers|docs|help|support)\.|(^|\.)(gov|eu)$|blog\.google$|openai\.com$|google\.com$/iu,
  },
  {
    key: "community",
    de: "Community und Diskussion",
    en: "Community & discussion",
    pattern: /(^|\.)(reddit|stackoverflow|stackexchange)\.com$/iu,
  },
];

const clean = (value, limit) =>
  String(value ?? "")
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, limit);

const decodeBase64Url = (value) => {
  const padded =
    value.replaceAll("-", "+").replaceAll("_", "/") +
    "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  if (bytes.length > SEO_HANDOFF_MAX_BYTES)
    throw new Error("HANDOFF_TOO_LARGE");
  return new TextDecoder().decode(bytes);
};

const safeSource = (source) => {
  const url = new URL(clean(source?.url, 2_048));
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("INVALID_SOURCE_URL");
  return {
    url: url.href,
    title: clean(source?.title, 180),
    scope: clean(source?.scope, 80),
  };
};

const safeDomain = (value) => {
  const domain = clean(value, 253).toLocaleLowerCase("en");
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/u.test(domain))
    throw new Error("INVALID_SOURCE_DOMAIN");
  return domain.replace(/^www\./u, "");
};

export function decodeSeoResearchHandoff(value) {
  const payload = JSON.parse(decodeBase64Url(value));
  if (
    payload?.schemaVersion !== SEO_HANDOFF_SCHEMA ||
    payload?.producer !== "ai-fanout.com"
  )
    throw new Error("UNSUPPORTED_HANDOFF");
  const run = payload.run;
  if (!run || !["en", "de"].includes(run.language))
    throw new Error("INVALID_HANDOFF");
  const question = clean(run.question, 160);
  if (
    question.length < 2 ||
    !Array.isArray(run.queries) ||
    run.queries.length < 1 ||
    run.queries.length > 20
  )
    throw new Error("INVALID_HANDOFF");
  const queries = run.queries.map((query) => ({
    text: clean(query?.text, 200),
    intent: clean(query?.intent, 80),
    reason: clean(query?.reason, 240),
    sourceRelation: clean(query?.sourceRelation, 180),
    sources: Array.isArray(query?.sources)
      ? query.sources.slice(0, 20).map(safeSource)
      : [],
  }));
  if (queries.some((query) => query.text.length < 2))
    throw new Error("INVALID_HANDOFF");
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
      evidenceState:
        run.evidenceState === "provider_exposed_native_search"
          ? "provider_exposed_native_search"
          : "modelled_search_ideas",
      displayedRunTime: clean(run.displayedRunTime, 120),
      queries,
      runSources: Array.isArray(run.runSources)
        ? run.runSources.slice(0, 40).map(safeSource)
        : [],
      sourceDomains: Array.isArray(run.sourceDomains)
        ? [...new Set(run.sourceDomains.slice(0, 40).map(safeDomain))]
        : [],
      methodLabel: clean(run.methodLabel, 120),
      sourceDocumentUrl: run.sourceDocumentUrl
        ? safeSource({ url: run.sourceDocumentUrl }).url
        : "",
    },
  };
}

export function classifyQuery(query) {
  return LENSES.find((lens) => lens.pattern.test(query))?.key ?? "research";
}

const sourceDomain = (source) => {
  try {
    return new URL(source.url).hostname.replace(/^www\./u, "");
  } catch {
    return "";
  }
};

export function classifySourceRole(domain, firstPartyTokens = []) {
  const domainLabels = String(domain).toLocaleLowerCase("en").split(".");
  if (firstPartyTokens.some((token) => domainLabels.includes(token)))
    return "primary";
  return (
    SOURCE_ROLES.find((role) => role.pattern.test(domain))?.key ?? "editorial"
  );
}

const firstPartyTokensFrom = (payload) => {
  const questionCandidates =
    payload.run.question.match(/\b[A-Z][A-Za-z0-9-]{3,}\b/gu) ?? [];
  const queryText = payload.run.queries
    .map((query) => query.text.toLocaleLowerCase("en"))
    .join(" ");
  return [
    ...new Set(
      questionCandidates
        .filter((token) => token !== token.toLocaleUpperCase("en"))
        .map((token) => token.toLocaleLowerCase("en"))
        .filter((token) => !STOP_WORDS.has(token))
        .filter(
          (token) =>
            (queryText.match(new RegExp(`\\b${token}\\b`, "gu")) ?? [])
              .length >= 2,
        ),
    ),
  ];
};

const sourceRoleLabel = (key, language) => {
  const role = SOURCE_ROLES.find((candidate) => candidate.key === key);
  if (role) return role[language];
  return language === "de"
    ? "Redaktion und Praxis"
    : "Editorial & practitioner sources";
};

export function analyzeSeoHandoff(payload) {
  const language = payload.run.language;
  const firstPartyTokens = firstPartyTokensFrom(payload);
  const categories = new Map();
  const termCounts = new Map();
  const domainCounts = new Map();
  const analysedQueries = payload.run.queries.map((query) => {
    const key = classifyQuery(query.text);
    const lens = LENSES.find((candidate) => candidate.key === key);
    const label = lens
      ? lens[language]
      : language === "de"
        ? "Offene Recherche"
        : "Open research";
    const entry = categories.get(key) ?? { key, label, count: 0, queries: [] };
    entry.count += 1;
    entry.queries.push(query.text);
    categories.set(key, entry);
    for (const token of query.text
      .toLocaleLowerCase(language)
      .match(/[\p{L}\p{N}][\p{L}\p{N}-]{2,}/gu) ?? []) {
      if (!STOP_WORDS.has(token) && !/^\d+$/u.test(token))
        termCounts.set(token, (termCounts.get(token) ?? 0) + 1);
    }
    for (const source of query.sources) {
      const domain = sourceDomain(source);
      if (domain) domainCounts.set(domain, (domainCounts.get(domain) ?? 0) + 1);
    }
    const task = TASK_SPECS[key]?.[language] ?? TASK_SPECS.research[language];
    return {
      ...query,
      lensKey: key,
      lensLabel: label,
      mapped: query.sources.length > 0,
      action: task.action,
      evidenceNeed: task.evidence,
    };
  });
  for (const source of payload.run.runSources) {
    const domain = sourceDomain(source);
    if (domain) domainCounts.set(domain, (domainCounts.get(domain) ?? 0) + 1);
  }
  for (const domain of payload.run.sourceDomains ?? []) {
    if (domain) domainCounts.set(domain, (domainCounts.get(domain) ?? 0) + 1);
  }
  const recurringTerms = [...termCounts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([term, count]) => ({ term, count }));
  const domains = [...domainCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([domain, count]) => ({ domain, count }));
  const lenses = [...categories.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );
  const mappedQueryCount = analysedQueries.filter(
    (query) => query.mapped,
  ).length;
  const allSources = [
    ...analysedQueries.flatMap((query) => query.sources),
    ...payload.run.runSources,
  ];
  const allSourceDomains = [
    ...allSources.map(sourceDomain).filter(Boolean),
    ...(payload.run.sourceDomains ?? []),
  ];
  const sourceRoles = new Map();
  for (const source of allSources) {
    const domain = sourceDomain(source);
    if (!domain) continue;
    const key = classifySourceRole(domain, firstPartyTokens);
    const entry = sourceRoles.get(key) ?? {
      key,
      label: sourceRoleLabel(key, language),
      count: 0,
      domains: new Set(),
    };
    entry.count += 1;
    entry.domains.add(domain);
    sourceRoles.set(key, entry);
  }
  const evidenceMix = [...sourceRoles.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .map((entry) => ({ ...entry, domains: [...entry.domains].slice(0, 4) }));
  for (const domain of payload.run.sourceDomains ?? []) {
    const key = classifySourceRole(domain, firstPartyTokens);
    const existing = evidenceMix.find((entry) => entry.key === key);
    if (existing) {
      if (!existing.domains.includes(domain) && existing.domains.length < 4)
        existing.domains.push(domain);
      existing.count += 1;
    } else {
      evidenceMix.push({
        key,
        label: sourceRoleLabel(key, language),
        count: 1,
        domains: [domain],
      });
    }
  }
  evidenceMix.sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label),
  );
  const packageMap = new Map();
  for (const query of analysedQueries) {
    const key = classifyPackage(query.text, query.lensKey);
    const spec = PACKAGE_SPECS[key]?.[language] ?? PACKAGE_SPECS.research[language];
    const entry = packageMap.get(key) ?? {
      key,
      title: spec.title,
      deliverable: spec.deliverable,
      proof: spec.proof,
      status: language === "de" ? "Muss geprüft werden" : "Needs verification",
      queries: [],
    };
    entry.queries.push(query.text);
    packageMap.set(key, entry);
  }
  const workPackages = [...packageMap.values()];
  const comparisonQuestion = /\b(vs\.?|versus|vergleich|compare|comparison)\b/iu.test(
    payload.run.question,
  );
  const workingDirection =
    analysedQueries.length === 1
      ? {
          key: "single_task",
          title:
            language === "de"
              ? "Behandle das als eine Rechercheaufgabe – nicht automatisch als neue Seite."
              : "Treat this as one research task—not automatically as a new page.",
          rationale:
            language === "de"
              ? "Der Lauf zeigt nur eine konkrete Frage. Prüfe zuerst, ob eine bestehende Seite sie bereits beantworten sollte."
              : "The run exposes one concrete question. First check whether an existing page should already answer it.",
        }
      : comparisonQuestion && analysedQueries.length <= 8
        ? {
            key: "one_comparison_guide",
            title:
              language === "de"
                ? `Recherchiere einen Vergleichsleitfaden. Erstelle keine ${analysedQueries.length} Query-Seiten.`
                : `Research one comparison guide. Do not create ${analysedQueries.length} query pages.`,
            rationale:
              language === "de"
                ? "Die Queries gehören zu einer Kaufentscheidung. Prüfe aktuelle Preise, Zielgruppen-Eignung und Herstellerangaben, bevor du veröffentlichst."
                : "The queries belong to one buying decision. Verify current pricing, audience fit and first-party product claims before publishing.",
          }
      : lenses.length <= 3 && analysedQueries.length <= 8
        ? {
            key: "one_brief",
            title:
              language === "de"
                ? `Erstelle einen Rechercheplan mit ${workPackages.length} Arbeitspaketen – keine ${analysedQueries.length} Query-Seiten.`
                : `Build one research plan with ${workPackages.length} work packages—not ${analysedQueries.length} query pages.`,
            rationale:
              language === "de"
                ? "Die Queries bleiben beim selben Ausgangsthema. Bearbeite die unterschiedlichen Beleganforderungen gemeinsam und validiere erst danach eine mögliche Aufteilung."
                : "The queries stay within one topic. Complete the different evidence jobs together and validate any later split separately.",
          }
        : {
            key: "review_groups",
            title:
              language === "de"
                ? `Beginne mit einem Rechercheplan aus ${workPackages.length} Arbeitspaketen.`
                : `Start with one research plan made of ${workPackages.length} work packages.`,
            rationale:
              language === "de"
                ? "Der Lauf ist breit genug, dass einzelne Gruppen später eigene Seiten verdienen könnten. Nachfrage und bestehende Seiten müssen das zuerst belegen."
                : "The run is broad enough that some groups may later deserve separate pages. Demand and existing-page evidence must prove that first.",
          };
  const unknowns = [
    language === "de"
      ? "Suchnachfrage: Der Lauf enthält kein Suchvolumen und keine Nachfrageentwicklung."
      : "Search demand: this run contains no search volume or demand trend.",
    language === "de"
      ? "Seitenabdeckung: Ohne deine bestehende Website ist unklar, ob eine Seite ergänzt oder etwas Neues gebaut werden sollte."
      : "Existing-page fit: without your site inventory, it is unknown whether to improve a page or create anything new.",
  ];
  if (analysedQueries.length - mappedQueryCount > 0)
    unknowns.push(
      language === "de"
        ? "Quellenbezug: Einige Quellen sind nur dem gesamten Lauf, nicht einer einzelnen Query zugeordnet."
        : "Source fit: some sources belong to the run, not to an individual query.",
    );
  const nextAction = allSourceDomains.length
    ? language === "de"
      ? "Ordne die stärksten Primär- oder Forschungsquellen den einzelnen Fragen zu. Prüfe danach Nachfrage und bestehende Seitenabdeckung."
      : "Map the strongest primary or research sources to the individual questions. Then check demand and existing-page coverage."
    : language === "de"
      ? "Sammle für jede Frage mindestens eine Primärquelle. Prüfe danach Nachfrage und bestehende Seitenabdeckung."
      : "Collect at least one primary source for each question. Then check demand and existing-page coverage.";
  return {
    language,
    evidenceState: payload.run.evidenceState,
    queries: analysedQueries,
    workPackages,
    lenses,
    recurringTerms,
    domains,
    evidenceMix,
    workingDirection,
    unknowns,
    nextAction,
    mappedQueryCount,
    unmappedQueryCount: analysedQueries.length - mappedQueryCount,
    sourceCount: analysedQueries.reduce(
      (total, query) => total + query.sources.length,
      payload.run.runSources.length,
    ),
    sourceDomainCount: domains.length,
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
      question: de
        ? "Welche SEO-Tools passen zu kleinen Unternehmen?"
        : "Which SEO tools suit a small business?",
      language,
      market: de ? "Deutschland · Deutsch" : "All countries · English",
      providerLabel: "Synthetic interface example",
      evidenceLabel: de ? "Synthetisches Beispiel" : "Synthetic example",
      evidenceState: "modelled_search_ideas",
      displayedRunTime: "31 August 2026",
      queries: (de
        ? [
            "SEO Tools für kleine Unternehmen",
            "SEO Tool Preise vergleichen",
            "einfache SEO Tools für Einsteiger",
            "SEO Tools Datenschutz DSGVO",
            "SEO Tool einrichten Anleitung",
          ]
        : [
            "SEO tools for small businesses",
            "compare SEO tool pricing",
            "easy SEO tools for beginners",
            "GDPR compliant SEO tools",
            "how to set up an SEO tool",
          ]
      ).map((text) => ({
        text,
        intent: "",
        reason: "",
        sourceRelation: "",
        sources: [],
      })),
      runSources: [],
      sourceDomains: [],
      methodLabel: "synthetic-interface/1.0",
      sourceDocumentUrl: "",
    },
  };
}

export function documentedSeoHandoff(language = "en") {
  const de = language === "de";
  return {
    schemaVersion: SEO_HANDOFF_SCHEMA,
    producer: "ai-fanout.com",
    transferredAt: "2026-08-27T13:13:59.201Z",
    notice:
      "Owner-run OpenAI API observation published by AI Fanout under its reviewed output-rights record.",
    run: {
      question: "Ahrefs vs Semrush for small business",
      language,
      market: de ? "Vereinigte Staaten · Englisch" : "United States · English",
      providerLabel: "OpenAI API · GPT-5.6 Luna",
      evidenceLabel: de
        ? "Owner-run Beobachtung · Scope der Suchaktion"
        : "Owner-run observation · search-action scope",
      evidenceState: "provider_exposed_native_search",
      displayedRunTime: de ? "27. August 2026" : "27 August 2026",
      queries: [
        "Ahrefs vs Semrush small business pricing features 2026",
        "Ahrefs pricing official",
        "Semrush pricing official",
        "Ahrefs Semrush review small business SEO comparison",
      ].map((text) => ({
        text,
        intent: "",
        reason: "",
        sourceRelation: de
          ? "Quellen wurden von der Suchaktion, nicht von einer einzelnen Query offengelegt."
          : "Sources were exposed for the search action, not one individual query.",
        sources: [],
      })),
      runSources: [],
      sourceDomains: [
        "ahrefs.com",
        "semrush.com",
        "help.ahrefs.com",
        "stackcompare.net",
        "formativedigital.com",
        "insidepro360.com",
        "softoraguide.com",
        "angletutoring.com",
        "static.semrush.com",
        "sec.gov",
        "youtube.com",
        "reddit.com",
        "cdnc.heyzine.com",
      ],
      methodLabel: "provider-native-search/1.0",
      sourceDocumentUrl:
        "https://ai-fanout.com/examples/openai-observations-2026-08-27.json",
    },
  };
}
