import {
  analyzeSeoHandoff,
  decodeSeoResearchHandoff,
  documentedSeoHandoff,
  exampleSeoHandoff,
} from "../lib/seo-research.mjs";

const root = document.querySelector<HTMLElement>("[data-seo-research-tool]") as HTMLElement;

if (root) {
  const empty = root.querySelector<HTMLElement>("[data-empty-state]")!;
  const result = root.querySelector<HTMLElement>("[data-research-result]")!;
  const status = root.querySelector<HTMLOutputElement>("[data-handoff-status]")!;
  let currentPayload: ReturnType<typeof decodeSeoResearchHandoff> | null = null;

  const clear = (element: Element) => element.replaceChildren();
  const add = (parent: Element, tag: string, text = "", className = "") => {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    parent.append(element);
    return element;
  };
  const copy = (de: string, en: string, language: string) =>
    language === "de" ? de : en;
  const setText = (selector: string, de: string, en: string, language: string) => {
    const element = root.querySelector<HTMLElement>(selector);
    if (element) element.textContent = copy(de, en, language);
  };
  const setLinkText = (selector: string, de: string, en: string, language: string) => {
    const link = root.querySelector<HTMLAnchorElement>(selector);
    if (!link) return;
    const svg = link.querySelector("svg")?.cloneNode(true);
    link.textContent = copy(de, en, language);
    if (svg) link.append(svg);
  };

  function localiseResult(language: string) {
    setText("[data-result-label]", "AI-Frage", "AI question", language);
    setText("[data-takeaway-label]", "Dein praktisches Ergebnis", "Your practical takeaway", language);
    setText("[data-plan-label]", "Rechercheplan", "research plan", language);
    setText("[data-plan-detail]", "Ein begrenztes Thema", "One bounded topic", language);
    setText("[data-package-label]", "Arbeitspakete", "work packages", language);
    setText("[data-package-detail]", "Konkrete Ergebnisse", "Actionable deliverables", language);
    setText("[data-domain-label]", "Quellendomains", "source domains", language);
    setText("[data-domain-detail]", "Aus diesem Lauf", "From this run", language);
    setText("[data-gap-label]", "Evidenzlücken", "evidence gaps", language);
    setText("[data-gap-detail]", "Müssen geprüft werden", "Require verification", language);
    setText("[data-packages-label]", "Arbeitspakete", "Work packages", language);
    setText("[data-packages-title]", "Mach aus der Query-Liste konkrete Ergebnisse.", "Turn the query list into deliverables.", language);
    setText("[data-packages-copy]", "Jedes Paket verbindet Queries mit demselben Recherchejob.", "Each package combines queries that belong to the same research job.", language);
    setText("[data-source-label]", "Quellenpool", "Source pool", language);
    setText("[data-source-title]", "Nutze den Lauf als Startpunkt – nicht als Beweis.", "Use the run as a lead list—not as proof.", language);
    setText("[data-gaps-label]", "Noch fehlende Evidenz", "Evidence still missing", language);
    setText("[data-gaps-title]", "Prüfe das vor der Veröffentlichung.", "Verify these before publishing.", language);
    setText("[data-export-label]", "Nimm den Plan mit", "Take the plan with you", language);
    setText("[data-export-title]", "Setze die Recherche überall fort.", "Continue the research anywhere.", language);
    setText("[data-export-copy]", "Kopiere den Plan oder lade den vollständigen lokalen Datensatz.", "Copy the plan or download the complete local record.", language);
    setText("[data-next-label]", "Optionale tiefere Evidenz", "Optional deeper evidence", language);
    setText("[data-next-title]", "Prüfe Nachfrage und bestehende Seiten.", "Check demand and existing pages.", language);
    setText("[data-raw-summary]", "Übertragene Queries und Quellen-Scope anzeigen", "View the raw transferred queries and source scope", language);
    setText("[data-copy-brief]", "Rechercheplan kopieren", "Copy research plan", language);
    setText("[data-download-brief]", "JSON herunterladen", "Download JSON", language);
    setLinkText("[data-contextter-cta]", "In Crawl Foundry fortsetzen", "Continue in Crawl Foundry", language);
  }

  function render(payload: ReturnType<typeof decodeSeoResearchHandoff>) {
    currentPayload = payload;
    const analysis = analyzeSeoHandoff(payload);
    const language = analysis.language;
    empty.hidden = true;
    result.hidden = false;
    root.classList.add("has-result");
    document.documentElement.lang = language;
    root.dataset.language = language;
    localiseResult(language);

    root.querySelector<HTMLElement>("[data-result-question]")!.textContent = payload.run.question;
    root.querySelector<HTMLElement>("[data-provider]")!.textContent =
      payload.run.providerLabel || copy("Unbekannter Anbieter", "Unknown provider", language);
    root.querySelector<HTMLElement>("[data-market]")!.textContent =
      payload.run.market || copy("Locale nicht angegeben", "Locale not supplied", language);
    root.querySelector<HTMLElement>("[data-observed]")!.textContent =
      payload.run.displayedRunTime || copy("Nicht angegeben", "Not supplied", language);
    root.querySelector<HTMLElement>("[data-evidence]")!.textContent = payload.run.evidenceLabel;

    const fixtureLink = root.querySelector<HTMLAnchorElement>("[data-fixture-link]")!;
    if (payload.run.sourceDocumentUrl) {
      fixtureLink.href = payload.run.sourceDocumentUrl;
      fixtureLink.hidden = false;
      setLinkText("[data-fixture-link]", "Quellendatensatz prüfen", "Inspect source fixture", language);
    } else {
      fixtureLink.hidden = true;
    }

    root.querySelector<HTMLElement>("[data-package-count]")!.textContent = String(analysis.workPackages.length);
    root.querySelector<HTMLElement>("[data-domain-count]")!.textContent = String(analysis.sourceDomainCount);
    root.querySelector<HTMLElement>("[data-gap-count]")!.textContent = String(analysis.unknowns.length);
    root.querySelector<HTMLElement>("[data-working-title]")!.textContent = analysis.workingDirection.title;
    root.querySelector<HTMLElement>("[data-working-rationale]")!.textContent = analysis.workingDirection.rationale;
    root.querySelector<HTMLElement>("[data-result-summary]")!.textContent =
      analysis.evidenceState === "provider_exposed_native_search"
        ? copy(
            `Der Provider legte ${analysis.queries.length} Queries und ${analysis.sourceDomainCount} Quellendomains offen. Dieser Plan verdichtet sie ohne erneute Suche zu ${analysis.workPackages.length} Arbeitspaketen.`,
            `The provider exposed ${analysis.queries.length} queries and ${analysis.sourceDomainCount} source domains. This plan consolidates them into ${analysis.workPackages.length} work packages without searching again.`,
            language,
          )
        : copy(
            `Dieses synthetische Set enthält ${analysis.queries.length} modellierte Suchideen. Es zeigt die Oberfläche, ist aber keine Provider-Beobachtung.`,
            `This synthetic set contains ${analysis.queries.length} modelled search ideas. It demonstrates the interface but is not a provider observation.`,
            language,
          );

    const packageList = root.querySelector("[data-package-list]")!;
    clear(packageList);
    analysis.workPackages.forEach((workPackage: {
      title: string;
      deliverable: string;
      proof: string;
      status: string;
      queries: string[];
    }, index: number) => {
      const item = add(packageList, "li");
      add(item, "span", String(index + 1).padStart(2, "0"), "package-number");
      const name = add(item, "div", "", "package-name");
      add(name, "h4", workPackage.title);
      const queryList = add(name, "ul", "", "package-queries");
      workPackage.queries.forEach((query) => add(queryList, "li", query));
      const deliverable = add(item, "dl", "", "package-detail");
      add(deliverable, "dt", copy("Ergebnis", "Deliverable", language));
      add(deliverable, "dd", workPackage.deliverable);
      const proof = add(item, "dl", "", "package-detail");
      add(proof, "dt", copy("Benötigter Beleg", "Proof required", language));
      add(proof, "dd", workPackage.proof);
      add(item, "span", workPackage.status, "package-status");
    });

    const evidenceMix = root.querySelector("[data-evidence-mix]")!;
    clear(evidenceMix);
    if (analysis.evidenceMix.length) {
      for (const role of analysis.evidenceMix) {
        const item = add(evidenceMix, "li");
        const heading = add(item, "strong");
        add(heading, "span", role.label);
        add(heading, "b", String(role.count));
        add(item, "span", role.domains.join(" · "));
      }
    } else {
      const item = add(evidenceMix, "li");
      add(item, "strong", copy("Noch keine Quellen im Lauf", "No sources in this run yet", language));
      add(item, "span", copy("Jedes Arbeitspaket braucht noch belastbare Quellen.", "Every work package still needs substantive sources.", language));
    }

    root.querySelector<HTMLElement>("[data-source-scope-note]")!.textContent =
      analysis.mappedQueryCount === analysis.queries.length
        ? copy(
            "Jede Query besitzt eine sichtbare Quellenbeziehung. Die fachliche Eignung muss trotzdem geprüft werden.",
            "Every query has a visible source relationship. The substantive fit still needs review.",
            language,
          )
        : analysis.sourceDomainCount
          ? copy(
              `${analysis.sourceDomainCount} Domains wurden auf Lauf- oder Suchaktions-Ebene offengelegt. Keine davon wird automatisch einer einzelnen Query als Beleg zugeordnet.`,
              `${analysis.sourceDomainCount} domains were exposed at run or search-action scope. None is automatically presented as proof for an individual query.`,
              language,
            )
          : copy(
              "Der Lauf enthält keine sichtbaren Quellen. Die benötigten Belege bleiben vollständig offen.",
              "The run contains no visible sources. Every required source remains unresolved.",
              language,
            );

    const unknownList = root.querySelector("[data-unknown-list]")!;
    clear(unknownList);
    analysis.unknowns.forEach((unknown: string) => add(unknownList, "li", unknown));
    root.querySelector<HTMLElement>("[data-next-action]")!.textContent = analysis.nextAction;

    const body = root.querySelector("[data-query-table-body]")!;
    clear(body);
    for (const query of analysis.queries) {
      const row = document.createElement("tr");
      add(row, "td", query.text);
      add(row, "td", query.action);
      add(
        row,
        "td",
        query.mapped
          ? copy("Quelle sichtbar", "Source visible", language)
          : copy("Keine Query-Zuordnung", "No query mapping", language),
      );
      add(
        row,
        "td",
        query.sources
          .map((source: { url: string }) => {
            try {
              return new URL(source.url).hostname.replace(/^www\./u, "");
            } catch {
              return "";
            }
          })
          .filter(Boolean)
          .join(", ") || "—",
      );
      body.append(row);
    }

    status.textContent = copy(
      "SEO-Rechercheplan lokal erstellt. Keine zweite AI-Anfrage.",
      "SEO research plan created locally. No second AI request.",
      language,
    );
    result.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }

  root.querySelector<HTMLButtonElement>("[data-load-example]")!.addEventListener("click", () =>
    render(documentedSeoHandoff(document.documentElement.lang === "de" ? "de" : "en") as ReturnType<typeof decodeSeoResearchHandoff>),
  );

  root.querySelector<HTMLButtonElement>("[data-copy-brief]")!.addEventListener("click", async () => {
    if (!currentPayload) return;
    const analysis = analyzeSeoHandoff(currentPayload);
    const language = analysis.language;
    const lines = [
      currentPayload.run.question,
      "",
      analysis.workingDirection.title,
      analysis.workingDirection.rationale,
      "",
      copy("ARBEITSPAKETE", "WORK PACKAGES", language),
      ...analysis.workPackages.flatMap((workPackage: {
        title: string;
        queries: string[];
        deliverable: string;
        proof: string;
      }, index: number) => [
        `${index + 1}. ${workPackage.title}`,
        `   ${copy("Queries", "Queries", language)}: ${workPackage.queries.join(" · ")}`,
        `   ${copy("Ergebnis", "Deliverable", language)}: ${workPackage.deliverable}`,
        `   ${copy("Beleg", "Proof", language)}: ${workPackage.proof}`,
      ]),
      "",
      copy("NOCH ZU VALIDIEREN", "STILL TO VALIDATE", language),
      ...analysis.unknowns.map((unknown: string) => `- ${unknown}`),
      "",
      `${copy("Nächster Schritt", "Next action", language)}: ${analysis.nextAction}`,
      "",
      copy(
        "Grenzen: keine Aussage über Suchnachfrage, Rankings, Seitenabdeckung oder versteckte Queries.",
        "Limits: no claim about search demand, rankings, site coverage or hidden queries.",
        language,
      ),
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    status.textContent = copy("SEO-Rechercheplan kopiert.", "SEO research plan copied.", language);
  });

  root.querySelector<HTMLButtonElement>("[data-download-brief]")!.addEventListener("click", () => {
    if (!currentPayload) return;
    const analysis = analyzeSeoHandoff(currentPayload);
    const blob = new Blob([
      JSON.stringify(
        { schemaVersion: "seo-fanout.research-plan/1.2", source: currentPayload, analysis },
        null,
        2,
      ),
    ], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `seo-fanout-research-plan-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  const encoded = new URLSearchParams(window.location.hash.slice(1)).get("research");
  const exampleMode = new URLSearchParams(window.location.search).get("example");
  if (encoded) {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    try {
      render(decodeSeoResearchHandoff(encoded));
    } catch {
      status.textContent = "The transferred result was invalid, unsupported or too large. Start a fresh run on AI Fanout.";
    }
  } else if (exampleMode === "documented") {
    render(documentedSeoHandoff(document.documentElement.lang === "de" ? "de" : "en") as ReturnType<typeof decodeSeoResearchHandoff>);
  } else if (exampleMode === "synthetic") {
    render(exampleSeoHandoff(document.documentElement.lang === "de" ? "de" : "en") as ReturnType<typeof decodeSeoResearchHandoff>);
  }
}
