# Precision Workspace design system

Visual references:

- `design/concepts/seo-fanout-modern-desktop.png` — desktop initial state
- `design/concepts/seo-fanout-modern-mobile.png` — mobile initial state
- `design/concepts/seo-fanout-modern-result-desktop.png` — desktop completed state
- `design/concepts/seo-fanout-modern-result-mobile.png` — mobile completed state
- `design/concepts/seo-fanout-learn-desktop.png` — desktop Knowledge Hub
- `design/concepts/seo-fanout-ai-lab-desktop.png` — desktop AI Lab completed comparison
- `design/concepts/seo-fanout-ai-lab-mobile.png` — mobile AI Lab initial state

The former Evidence Cartography concepts remain in version history only. They are not active specifications.

## Direction

A calm precision workspace for one conservative page decision. The interface reveals one question at a time, keeps the empty state quiet, and shows the decision before the reasoning. The result feels like a professional product surface rather than a research poster or a dashboard.

## Information hierarchy

1. Explain the outcome in one sentence.
2. Ask four disclosed inputs sequentially.
3. Show one decision and one next move.
4. Keep the full goal, entities, questions, source roles, and evidence gaps behind `View reasoning`.
5. Keep methodology, source taxonomy, decision rules, and cases on their dedicated routes.

## Tokens

- True white: `#ffffff`
- Workspace: `#f4f7fb`
- Ink: `#0b1324`
- Body text: `#334158`
- Muted: `#5f6e84`
- Border: `#d8e0ec`
- Strong border: `#bdc9da`
- Cobalt: `#155eef`
- Cobalt hover: `#0b4ed8`
- Cobalt tint: `#e9f0ff`
- Success: `#087f6f`
- UI and display type: Inter Variable, 400–720
- Metadata type: ui-monospace fallback
- Radius: 8, 10, 14, or 18px
- Motion: 150–180ms transform/opacity only; disabled under reduced motion

## Component model

- Header: branching line mark, wordmark, three essential links, one primary action. Full references remain in the footer and mobile menu.
- Hero: no eyebrow, badge, stat, or proof row. One H1, one sentence, one action.
- Tool: one framed two-column workspace on desktop; one focused column on mobile.
- Wizard: four steps with one field visible at a time. Previous inputs are summarized only after completion.
- Empty state: quiet document outline plus one sentence.
- Result: one decision, rationale, bounded next move, then optional reasoning and export actions.
- Supporting content: open rails and lists, not feature-card grids.

## Allowed first-viewport copy

SEO FAN-OUT; Tool; Method; Examples; Start a decision; One question. One clear page decision.; Decide whether to strengthen, consolidate, create, gather evidence—or stop before another URL adds noise.; See how it works; Page decision; Step 1 of 4; What are you deciding about?; Enter a topic, user question, or existing page promise.; How to choose a project management tool; Continue; Runs locally in your browser. Nothing is retained.; Your decision will appear here; Four inputs. One bounded next move.

## Interaction contract

- The topic is required before moving to step 2.
- Back never clears a prior answer.
- The deterministic result is generated only after step 4.
- `Edit inputs` returns to the wizard without retention outside the page.
- `View reasoning` controls the full evidence map; it is closed by default.
- Copy and export operate only on the completed local result.

## Deliberate implementation choices

- Native selects preserve accessibility and exact deterministic input values while the wizard prevents all options from competing at once.
- The branching mark and all controls are code-native SVG/HTML; no raster concept image is shipped as UI.
- Mobile hides the empty preview and the completed input summary to preserve one task per viewport.
## Expanded editorial and comparison surfaces

- Knowledge Hub: one large editorial heading, open guide rows, one full-width cobalt evidence band, then compact field-note rows. No blog-card grid.
- Article pages: a narrow sticky contents rail on desktop, a readable 780px copy column, and one explicit decision rule near the opening.
- AI Output Lab: one framed workspace, shared setup on the left, three visible-output editors on desktop, and one tabbed editor at a time on mobile.
- Lab results: a plain comparison table plus a short difference ledger. No winner badge, provider logo, aggregate score, or inferred quality.
- Workflow: an open numbered sequence and a strong shared-operator disclosure. The manual handoff is described before the external Contextter action.

## Expanded allowed first-viewport copy

Knowledge Hub: SEO FAN-OUT; Tool; Learn; AI Lab; Examples; Start a decision; Learn fan-out without the folklore.; A practical path from one user job to one defensible page decision.; Start with the decision.

AI Lab: SEO FAN-OUT; Tool; Learn; AI Lab; Examples; Start a decision; Compare what the tools actually returned.; Paste one prompt and the visible outputs. The lab measures structure, source links, and literal coverage—never hidden reasoning.; 1. Shared setup; Prompt (shared); 2. Visible outputs; ChatGPT; Claude; Gemini; Compare outputs.

## Comparison interaction contract

- The shared prompt is required.
- At least two visible outputs are required; the third column is optional.
- Tool names are editable labels and imply no current capability claim.
- All metrics are calculated in browser from pasted text.
- Literal criterion coverage is disclosed as a token-overlap heuristic, never a semantic or quality score.
- Mobile exposes one output editor at a time through keyboard-operable tabs.
- Reset clears all user input; export serializes only the current local comparison.
