# Precision Workspace design system

Visual references:

- `design/concepts/seo-fanout-modern-desktop.png` — desktop initial state
- `design/concepts/seo-fanout-modern-mobile.png` — mobile initial state
- `design/concepts/seo-fanout-modern-result-desktop.png` — desktop completed state
- `design/concepts/seo-fanout-modern-result-mobile.png` — mobile completed state
- `design/concepts/seo-fanout-learn-desktop.png` — desktop Knowledge Hub

The former Evidence Cartography and AI-output-comparison concepts remain in version history only. They are not active specifications.

## Direction

A calm precision workspace for one conservative SEO page decision. The interface accepts a keyword or local AI Fanout JSON handoff, reveals one inventory question at a time, and shows the decision before the supporting record.

## Information hierarchy

1. Explain the page-decision outcome in one sentence.
2. Offer an optional local AI Fanout JSON handoff with explicit common ownership.
3. Ask four disclosed inputs sequentially.
4. Show exactly one of six decisions and one next move.
5. Keep goal, imported branches, entities, questions, source roles and evidence gaps behind `View decision record`.
6. Keep method, source taxonomy, decision rules and real cases on dedicated routes.

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

- Header: branching line mark, wordmark, essential links and one primary action.
- Hero: one H1, one outcome sentence and two direct actions.
- Import panel: local paste or file selection, normalized plan summary and no upload.
- Tool: one framed two-column workspace on desktop; one focused column on mobile.
- Wizard: four steps with one field visible at a time.
- Result: one decision, rationale, bounded next move, optional decision record and local export.
- Decision Stress Test: one evidence control and six page-inventory states; no AI-provider comparison.
- Supporting content: open rails and lists, not dense feature-card grids.

## Interaction contract

- The topic is required before moving to step 2.
- AI Fanout JSON paste and file import are local, bounded and optional.
- Back never clears a prior answer.
- The result is generated only after step 4.
- `Edit inputs` returns to the wizard without retention outside the page.
- `View decision record` controls the full evidence map and is closed by default.
- Copy and export operate only on the completed local result.
- The lab changes inventory assumptions only and never scores or compares AI providers.
- Mobile and keyboard flows expose the same inputs, decisions and export.
