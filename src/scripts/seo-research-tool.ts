import {
  analyzeSeoHandoff,
  decodeSeoResearchHandoff,
  exampleSeoHandoff,
} from "../lib/seo-research.mjs";

const root = document.querySelector<HTMLElement>("[data-seo-research-tool]")!;

if (root) {
  const empty = root.querySelector<HTMLElement>("[data-empty-state]")!;
  const result = root.querySelector<HTMLElement>("[data-research-result]")!;
  const status = root.querySelector<HTMLOutputElement>(
    "[data-handoff-status]",
  )!;
  let currentPayload: ReturnType<typeof decodeSeoResearchHandoff> | null = null;

  const clear = (element: Element) => element.replaceChildren();
  const add = (parent: Element, tag: string, text: string, className = "") => {
    const element = document.createElement(tag);
    element.textContent = text;
    if (className) element.className = className;
    parent.append(element);
    return element;
  };
  const copy = (de: string, en: string, language: string) =>
    language === "de" ? de : en;
  const setText = (
    selector: string,
    de: string,
    en: string,
    language: string,
  ) => {
    const element = root.querySelector<HTMLElement>(selector);
    if (element) element.textContent = copy(de, en, language);
  };
  const setLinkText = (
    selector: string,
    de: string,
    en: string,
    language: string,
  ) => {
    const link = root.querySelector<HTMLAnchorElement>(selector);
    if (!link) return;
    link.textContent = `${copy(de, en, language)} `;
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    link.append(arrow);
  };

  function localiseResult(language: string, unknownCount: number) {
    setText(
      "[data-result-label]",
      "Browserlokales SEO-Briefing",
      "Browser-local SEO brief",
      language,
    );
    setText(
      "[data-takeaway-label]",
      "Dein praktisches Ergebnis",
      "Your practical takeaway",
      language,
    );
    setText("[data-brief-label]", "Arbeitsbriefing", "Working brief", language);
    setText(
      "[data-brief-title]",
      "Beantworte diese Fragen und bringe die richtigen Belege mit.",
      "Answer these questions and bring the right proof.",
      language,
    );
    setText(
      "[data-evidence-mix-label]",
      "Bereits vorhandene Evidenz",
      "Evidence already in the run",
      language,
    );
    setText(
      "[data-evidence-mix-title]",
      "Welche Arten von Quellen sind verfügbar?",
      "What kind of sources are available?",
      language,
    );
    setText(
      "[data-gaps-label]",
      "Bevor du eine Seite änderst",
      "Before you change a page",
      language,
    );
    setText(
      "[data-gaps-title]",
      `${unknownCount} Dinge kann dieser Lauf noch nicht entscheiden.`,
      `${unknownCount} things this run still cannot decide.`,
      language,
    );
    setText(
      "[data-next-label]",
      "Empfohlener nächster Schritt",
      "Recommended next action",
      language,
    );
    setText(
      "[data-next-title]",
      "Mach aus dem Fanout überprüfte SEO-Eingaben.",
      "Turn the fanout into verified SEO inputs.",
      language,
    );
    setText(
      "[data-raw-summary]",
      "Übertragene Queries und exakten Quellen-Scope anzeigen",
      "Show the transferred queries and exact source scope",
      language,
    );
    setText(
      "[data-export-title]",
      "Nimm das Briefing mit",
      "Take the brief with you",
      language,
    );
    setText(
      "[data-export-copy]",
      "Kopiere ein lesbares Briefing oder lade den vollständigen lokalen Evidenzdatensatz.",
      "Copy a readable brief or download the complete local evidence record.",
      language,
    );
    setLinkText(
      "[data-contextter-cta]",
      "Nachfrage und bestehende Seiten in Crawl Foundry prüfen",
      "Check demand and existing pages in Crawl Foundry",
      language,
    );
    const metricLabels = root.querySelectorAll<HTMLElement>(
      ".research-metrics span",
    );
    const labels =
      language === "de"
        ? [
            "Queries im Briefing",
            "Rechercheaufgaben",
            "vorhandene Quellenlinks",
            "Publikationsentscheidung",
          ]
        : [
            "queries to cover",
            "research tasks",
            "source links available",
            "publication decision",
          ];
    metricLabels.forEach((element, index) => {
      element.textContent = labels[index] ?? "";
    });
  }

  function render(payload: ReturnType<typeof decodeSeoResearchHandoff>) {
    currentPayload = payload;
    const analysis = analyzeSeoHandoff(payload);
    const language = analysis.language;
    empty.hidden = true;
    result.hidden = false;
    document.documentElement.lang = language;
    root.dataset.language = language;
    localiseResult(language, analysis.unknowns.length);

    root.querySelector<HTMLElement>("[data-result-question]")!.textContent =
      payload.run.question;
    root.querySelector<HTMLElement>("[data-provider]")!.textContent =
      payload.run.providerLabel ||
      copy("Unbekannter Anbieter", "Unknown provider", language);
    root.querySelector<HTMLElement>("[data-market]")!.textContent =
      payload.run.market ||
      copy("Locale nicht angegeben", "Locale not supplied", language);
    root.querySelector<HTMLElement>("[data-evidence]")!.textContent =
      payload.run.evidenceLabel;
    root.querySelector<HTMLElement>("[data-query-count]")!.textContent = String(
      analysis.queries.length,
    );
    root.querySelector<HTMLElement>("[data-task-count]")!.textContent = String(
      analysis.queries.length,
    );
    root.querySelector<HTMLElement>("[data-source-count]")!.textContent =
      String(analysis.sourceCount);
    root.querySelector<HTMLElement>("[data-decision-state]")!.textContent =
      copy("Offen", "Open", language);
    root.querySelector<HTMLElement>("[data-working-title]")!.textContent =
      analysis.workingDirection.title;
    root.querySelector<HTMLElement>("[data-working-rationale]")!.textContent =
      analysis.workingDirection.rationale;
    root.querySelector<HTMLElement>("[data-result-summary]")!.textContent =
      analysis.evidenceState === "provider_exposed_native_search"
        ? copy(
            `Der Provider legte ${analysis.queries.length} Query-Strings und ${analysis.sourceCount} Quellenlinks offen. Dieses Briefing übersetzt sie in konkrete Rechercheaufgaben, ohne erneut zu suchen.`,
            `The provider exposed ${analysis.queries.length} query strings and ${analysis.sourceCount} source links. This brief turns them into concrete research tasks without searching again.`,
            language,
          )
        : copy(
            `Dieses synthetische Set enthält ${analysis.queries.length} modellierte Suchideen. Es zeigt die Oberfläche, ist aber keine Provider-Beobachtung.`,
            `This synthetic set contains ${analysis.queries.length} modelled search ideas. It demonstrates the interface but is not a provider observation.`,
            language,
          );

    const taskList = root.querySelector("[data-task-list]")!;
    clear(taskList);
    for (const query of analysis.queries) {
      const item = add(taskList, "li", "");
      const content = add(item, "div", "");
      add(content, "strong", query.action);
      add(content, "p", query.text, "task-query");
      const evidence = add(content, "p", "", "task-evidence");
      add(
        evidence,
        "b",
        copy("Benötigter Beleg: ", "Proof to bring: ", language),
      );
      evidence.append(document.createTextNode(query.evidenceNeed));
    }

    const evidenceMix = root.querySelector("[data-evidence-mix]")!;
    clear(evidenceMix);
    if (analysis.evidenceMix.length) {
      for (const role of analysis.evidenceMix) {
        const item = add(evidenceMix, "li", "");
        const heading = add(item, "strong", "");
        add(heading, "span", role.label);
        add(heading, "b", String(role.count));
        add(item, "span", role.domains.join(" · "));
      }
    } else {
      const item = add(evidenceMix, "li", "");
      add(
        item,
        "strong",
        copy(
          "Noch keine Quellen im Lauf",
          "No sources in this run yet",
          language,
        ),
      );
      add(
        item,
        "span",
        copy(
          "Für jede Frage fehlt noch mindestens eine belastbare Quelle.",
          "Each question still needs at least one substantive source.",
          language,
        ),
      );
    }
    root.querySelector<HTMLElement>("[data-source-scope-note]")!.textContent =
      analysis.mappedQueryCount === analysis.queries.length
        ? copy(
            "Alle übertragenen Queries besitzen eine sichtbare Quellenbeziehung. Die fachliche Eignung der Quellen muss trotzdem geprüft werden.",
            "Every transferred query has a visible source relationship. The substantive fit of each source still needs review.",
            language,
          )
        : copy(
            `${analysis.unmappedQueryCount} von ${analysis.queries.length} Queries haben keine exakte Quellen-Zuordnung. Die Quellenliste ist daher ein Recherchepool, kein Beleg pro Query.`,
            `${analysis.unmappedQueryCount} of ${analysis.queries.length} queries have no exact source mapping. Treat the source list as a research pool, not proof for each query.`,
            language,
          );

    const unknownList = root.querySelector("[data-unknown-list]")!;
    clear(unknownList);
    for (const unknown of analysis.unknowns) add(unknownList, "li", unknown);
    root.querySelector<HTMLElement>("[data-next-action]")!.textContent =
      analysis.nextAction;

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
      "SEO-Briefing lokal erstellt. Keine zweite AI-Anfrage.",
      "SEO brief created locally. No second AI request.",
      language,
    );
    result.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }

  root
    .querySelector<HTMLButtonElement>("[data-load-example]")!
    .addEventListener("click", () =>
      render(
        exampleSeoHandoff(
          document.documentElement.lang === "de" ? "de" : "en",
        ) as ReturnType<typeof decodeSeoResearchHandoff>,
      ),
    );
  root
    .querySelector<HTMLButtonElement>("[data-copy-brief]")!
    .addEventListener("click", async () => {
      if (!currentPayload) return;
      const analysis = analyzeSeoHandoff(currentPayload);
      const language = analysis.language;
      const lines = [
        currentPayload.run.question,
        "",
        analysis.workingDirection.title,
        analysis.workingDirection.rationale,
        "",
        copy("RECHERCHEAUFGABEN", "RESEARCH TASKS", language),
        ...analysis.queries.flatMap(
          (
            query: { action: string; text: string; evidenceNeed: string },
            index: number,
          ) => [
            `${index + 1}. ${query.action}: ${query.text}`,
            `   ${copy("Beleg", "Proof", language)}: ${query.evidenceNeed}`,
          ],
        ),
        "",
        copy("NOCH ZU VALIDIEREN", "STILL TO VALIDATE", language),
        ...analysis.unknowns.map((unknown) => `- ${unknown}`),
        "",
        `${copy("Nächster Schritt", "Next action", language)}: ${analysis.nextAction}`,
        "",
        copy(
          "Grenzen: keine Aussage über Suchvolumen, Rankings, Seitenabdeckung oder versteckte Queries.",
          "Limits: no claim about search volume, rankings, site coverage or hidden queries.",
          language,
        ),
      ];
      await navigator.clipboard.writeText(lines.join("\n"));
      status.textContent = copy(
        "SEO-Briefing kopiert.",
        "SEO brief copied.",
        language,
      );
    });
  root
    .querySelector<HTMLButtonElement>("[data-download-brief]")!
    .addEventListener("click", () => {
      if (!currentPayload) return;
      const analysis = analyzeSeoHandoff(currentPayload);
      const blob = new Blob(
        [
          JSON.stringify(
            {
              schemaVersion: "seo-fanout.research-brief/1.1",
              source: currentPayload,
              analysis,
            },
            null,
            2,
          ),
        ],
        { type: "application/json" },
      );
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `seo-fanout-research-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    });

  const encoded = new URLSearchParams(window.location.hash.slice(1)).get(
    "research",
  );
  if (encoded) {
    history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
    try {
      render(decodeSeoResearchHandoff(encoded));
    } catch {
      status.textContent =
        "The transferred result was invalid, unsupported or too large. Start a fresh run on AI Fanout.";
    }
  }
}
