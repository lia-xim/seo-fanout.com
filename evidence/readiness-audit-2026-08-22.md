# seo-fanout.com readiness audit — 2026-08-22

## Decision

The implemented release is technically ready to deploy. Indexing and Google Search Console state still require live verification after deployment; rankings, AI citations, and Search Console ownership are never inferred from DNS or local tests.

## Evidence states

| State | Finding | Evidence | Action |
| --- | --- | --- | --- |
| Verified | 21 canonical indexable pages build with unique metadata, one H1, internal links, automatic sitemap inclusion, and no local orphans. | `pnpm build`, `pnpm qa`, `node scripts/seo-audit.mjs` | Preserve registry and crawl gates. |
| Verified | Root is excluded from the sitemap and configured as a permanent redirect to `/tool/`; 404 is noindex and excluded. | Astro sitemap output, `vercel.json`, QA | Recheck live after deploy. |
| Verified | Security policy contains CSP, HSTS, frame denial, MIME sniffing denial, referrer policy, and permissions policy. | `vercel.json`, QA | Recheck response headers live. |
| Verified | All 21 routes pass desktop and 390px mobile checks with zero serious/critical Axe violations, zero horizontal overflow, and zero console errors. | `scripts/browser-qa.mjs` | Keep as release gate. |
| Verified | Central tool Lighthouse scores 100/100/100/100 locally; LCP 1.5 s, CLS 0.001, TBT 0 ms. | Lighthouse 12.8.2 local static preview | Field data remains unknown until enough real traffic exists. |
| Verified | The SEO Fanout importer accepts the real AI Fanout planner response shape through a synthetic regression fixture. | versioned consumer schema plus Playwright interaction | Do not call this a producer integration. |
| Supported | Two distinct pages serve separate jobs: operational SEO page decisions and GEO evidence readiness. | Page-job review and current Google Search Central guidance | Measure and consolidate if real query/page data later shows overlap. |
| Not proven | Search Console property ownership, sitemap submission, indexing, rankings, and AI-feature inclusion. | No authenticated GSC session in this run | Verify only in authenticated Search Console. |
| Rejected | A URL per branch, hidden-query claims, citation promises, or an AI Fanout clone. | Product boundary and Google guidance | Keep the six-action decision layer. |

## Page-action matrix

| URL | Primary job | Action |
| --- | --- | --- |
| `/tool/` | Decide how one topic changes a real page set. | Strengthen importer truthfulness and contract tests. |
| `/seo-query-fanout-workflow/` | Apply a fanout analysis to canonical SEO page ownership. | New distinct workflow page. |
| `/geo-evidence-workflow/` | Turn generative-search questions into inspectable claim/evidence ownership. | New distinct workflow page. |
| `/learn/what-seo-fan-out-means-here/` | Learn the bounded definition. | Keep; does not own the operational workflow. |
| `/methodik/` | Audit deterministic method and limits. | Keep; method contract rather than task procedure. |
| `/page-inventory/` | Build the upstream page evidence inventory. | Keep; worksheet/tool role. |

## Hub and cluster

- Decide: `/tool/` → `/page-inventory/`, `/entscheidungen/`, `/beispiele/`, `/lab/`.
- Learn: `/learn/` → definition, content-plan boundary, own-page threshold.
- Workflows: `/seo-query-fanout-workflow/` → page inventory → tool; `/geo-evidence-workflow/` → source roles → tool.
- Trust: `/methodik/`, `/korrekturen/`, `/impressum/`, `/datenschutz/`.

## Sources

- Google Search Central, [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features).
- Google Search Central, [Creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content).
- Google Search Central, [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

