# AI Fanout to SEO Fanout handoff contract v1

Status: SEO Fanout consumer contract, 2026-08-22.

The inspected `ai-fanout.com` repository defines `fanout-planner/1.0.0`, `hypothetical-query-fanout/1.0`, and the strict planner response fields, but it does **not** currently publish a versioned Planner export or Planner fixture. SEO Fanout therefore does not claim a producer integration. Its browser-local importer accepts a manually supplied object shaped like the planner response and validates the handoff with an owner-authored synthetic fixture.

## Expected root

The root is an object with one `data` object. `data` contains:

- `question`: 4–120 Unicode code points;
- `summary`: 20–320 characters;
- `branches`: 4–8 objects;
- `modelId`: non-empty model label;
- `plannerVersion`: `fanout-planner/1.0.0`;
- `methodVersion`: `hypothetical-query-fanout/1.0`;
- `generatedAt`: ISO date-time;
- `notice`: explicit hypothesis/boundary notice.

Every branch contains `query`, `intent`, `rationale`, `sourceType`, and `assumption`. Allowed intent and source-role values are frozen in `ai-fanout-planner-handoff.schema.v1.json`.

## Consumer behavior

SEO Fanout reads the object only in browser memory. It maps `data.question` to the topic, branch `query` values to branches, `intent` values to intent context, and `sourceType` values to source roles. It does not call AI Fanout, upload the object, claim demand, verify sources, or retain provider output.

## Change rule

A future AI Fanout export is integrated only after that repository publishes a versioned producer schema or fixture. Any incompatible producer version requires a new SEO Fanout consumer contract and regression fixture; v1 is not silently widened.

## Evidence

- Producer code inspected: `C:\Users\matth\Documents\ai-fanout.com\src\server\fanout\contracts.mjs` and `service.mjs` at the current local checkout on 2026-08-22.
- Machine-readable consumer schema: `evidence/ai-fanout-planner-handoff.schema.v1.json`.
- Synthetic regression specimen: `evidence/ai-fanout-planner-handoff.synthetic.v1.json`.
- Static and interaction gates: `scripts/qa.mjs` and `scripts/browser-qa.mjs`.

