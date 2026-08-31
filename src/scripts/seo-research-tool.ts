import {
  analyzeSeoHandoff,
  decodeSeoResearchHandoff,
  exampleSeoHandoff,
} from "../lib/seo-research.mjs";

const root = document.querySelector<HTMLElement>("[data-seo-research-tool]")!;

if (root) {
  const empty = root.querySelector<HTMLElement>("[data-empty-state]")!;
  const result = root.querySelector<HTMLElement>("[data-research-result]")!;
  const status = root.querySelector<HTMLOutputElement>("[data-handoff-status]")!;
  let currentPayload: ReturnType<typeof decodeSeoResearchHandoff> | null = null;

  const clear = (element: Element) => element.replaceChildren();
  const add = (parent: Element, tag: string, text: string, className = "") => {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    parent.append(element);
    return element;
  };
  const copy = (de: string, en: string, language: string) => language === "de" ? de : en;

  function render(payload: ReturnType<typeof decodeSeoResearchHandoff>) {
    currentPayload = payload;
    const analysis = analyzeSeoHandoff(payload);
    const language = analysis.language;
    empty.hidden = true;
    result.hidden = false;
    document.documentElement.lang = language;
    root.dataset.language = language;
    root.querySelector<HTMLElement>("[data-result-label]")!.textContent = copy("Browserlokale SEO-Auswertung", "Browser-local SEO analysis", language);
    root.querySelector<HTMLElement>("[data-result-question]")!.textContent = payload.run.question;
    root.querySelector<HTMLElement>("[data-provider]")!.textContent = payload.run.providerLabel || copy("Unbekannter Anbieter", "Unknown provider", language);
    root.querySelector<HTMLElement>("[data-market]")!.textContent = payload.run.market || copy("Locale nicht angegeben", "Locale not supplied", language);
    root.querySelector<HTMLElement>("[data-evidence]")!.textContent = payload.run.evidenceLabel;
    root.querySelector<HTMLElement>("[data-query-count]")!.textContent = String(analysis.queries.length);
    root.querySelector<HTMLElement>("[data-lens-count]")!.textContent = String(analysis.lenses.length);
    root.querySelector<HTMLElement>("[data-domain-count]")!.textContent = String(analysis.domains.length);
    root.querySelector<HTMLElement>("[data-mapped-count]")!.textContent = String(analysis.mappedQueryCount);
    root.querySelector<HTMLElement>("[data-result-summary]")!.textContent = analysis.evidenceState === "provider_exposed_native_search"
      ? copy(`${analysis.queries.length} vom Provider offengelegte Query-Strings ergeben ${analysis.lenses.length} transparente Rechercheperspektiven. ${analysis.mappedQueryCount} Queries besitzen eine sichtbare Quellenbeziehung auf dem vom Provider gelieferten Scope.`, `${analysis.queries.length} provider-exposed query strings form ${analysis.lenses.length} transparent research lenses. ${analysis.mappedQueryCount} queries have a visible source relationship at the scope supplied by the provider.`, language)
      : copy(`Dieses Set enthält ${analysis.queries.length} modellierte Suchideen. Die Perspektiven helfen bei der Recherche, sind aber keine beobachteten Provider-Suchen.`, `This set contains ${analysis.queries.length} modelled search ideas. The lenses can guide research but are not observed provider searches.`, language);

    const lensList = root.querySelector("[data-lens-list]")!;
    clear(lensList);
    for (const lens of analysis.lenses) {
      const item = add(lensList, "li", "");
      add(item, "strong", lens.label);
      add(item, "span", `· ${lens.count} ${copy("Queries", "queries", language)}`);
      add(item, "p", lens.queries.slice(0, 3).join(" · "));
    }

    const termList = root.querySelector("[data-term-list]")!;
    clear(termList);
    if (analysis.recurringTerms.length) {
      for (const item of analysis.recurringTerms) add(termList, "li", `${item.term} × ${item.count}`);
    } else add(termList, "li", copy("Keine wiederkehrenden Begriffe in diesem begrenzten Lauf.", "No recurring terms in this bounded run.", language));

    const domainList = root.querySelector("[data-domain-list]")!;
    clear(domainList);
    if (analysis.domains.length) {
      for (const item of analysis.domains.slice(0, 12)) add(domainList, "li", `${item.domain} × ${item.count}`);
    } else add(domainList, "li", copy("Keine Quellendomain wurde für die übertragenen Queries sichtbar zugeordnet.", "No source domain was visibly associated with the transferred queries.", language));

    const body = root.querySelector("[data-query-table-body]")!;
    clear(body);
    for (const query of analysis.queries) {
      const row = document.createElement("tr");
      add(row, "td", query.text);
      add(row, "td", query.lensLabel);
      add(row, "td", query.mapped ? copy("Quelle sichtbar", "Source visible", language) : copy("Keine Query-Zuordnung", "No query mapping", language));
      add(row, "td", query.sources.map((source: { url: string }) => {
        try { return new URL(source.url).hostname.replace(/^www\./u, ""); } catch { return ""; }
      }).filter(Boolean).join(", ") || "—");
      body.append(row);
    }

    root.querySelector<HTMLElement>("[data-next-research]")!.textContent = copy(
      `${analysis.unmappedQueryCount} Queries haben keine sichtbare Query-Quellen-Zuordnung. Prüfe für die größten Perspektiven zuerst Primärquellen, Aktualität und tatsächliche Nachfrage; leite daraus nicht automatisch neue URLs ab.`,
      `${analysis.unmappedQueryCount} queries have no visible query-level source mapping. For the largest lenses, verify primary sources, freshness and real demand first; do not turn them automatically into new URLs.`,
      language,
    );
    root.querySelector<HTMLElement>("[data-contextter-copy]")!.textContent = copy(
      "Contextter kann die sichtbaren Query-Gruppen anschließend mit Suchnachfrage, vorhandenen Seiten, Search Console und Site-Audit-Evidenz prüfen. Das ist ein separater, optionaler Workflow desselben Betreibers.",
      "Contextter can then test the visible query groups against search demand, existing pages, Search Console and Site Audit evidence. It is a separate, optional workflow from the same operator.",
      language,
    );
    status.textContent = copy("Übergebener Lauf lokal ausgewertet. Keine zweite AI-Anfrage.", "Transferred run analysed locally. No second AI request.", language);
    result.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  root.querySelector<HTMLButtonElement>("[data-load-example]")!.addEventListener("click", () => render(exampleSeoHandoff(document.documentElement.lang === "de" ? "de" : "en") as ReturnType<typeof decodeSeoResearchHandoff>));
  root.querySelector<HTMLButtonElement>("[data-copy-brief]")!.addEventListener("click", async () => {
    if (!currentPayload) return;
    const analysis = analyzeSeoHandoff(currentPayload);
    const lines = [currentPayload.run.question, "", ...analysis.lenses.map((lens) => `${lens.label}: ${lens.queries.join(" | ")}`), "", `Sources: ${analysis.domains.map((item) => item.domain).join(", ") || "none mapped"}`, "", "Limits: no search-volume, ranking, site-coverage or hidden-query claim."];
    await navigator.clipboard.writeText(lines.join("\n"));
    status.textContent = analysis.language === "de" ? "SEO Research Brief kopiert." : "SEO research brief copied.";
  });
  root.querySelector<HTMLButtonElement>("[data-download-brief]")!.addEventListener("click", () => {
    if (!currentPayload) return;
    const analysis = analyzeSeoHandoff(currentPayload);
    const blob = new Blob([JSON.stringify({ schemaVersion: "seo-fanout.research-brief/1.0", source: currentPayload, analysis }, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `seo-fanout-research-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  });

  const encoded = new URLSearchParams(window.location.hash.slice(1)).get("research");
  if (encoded) {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    try { render(decodeSeoResearchHandoff(encoded)); }
    catch { status.textContent = "The transferred result was invalid, unsupported or too large. Start a fresh run on AI Fanout."; }
  }
}
