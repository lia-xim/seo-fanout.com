# SEO check-up evidence register

Reviewed: 2026-08-22  
Scope: repository plus public `https://seo-fanout.com`  
Accepted assignment: Contextter (unchanged)  
Method boundary: SEO Fanout converts a keyword or user-supplied fan-out into one page action. It does not reproduce AI Fanout, hidden queries, model reasoning, demand, rankings, or citations.

## Evidence register

| State | Observation | Evidence | Consequence |
| --- | --- | --- | --- |
| Verified | All 18 pre-change sitemap URLs returned 200, a self-canonical, `index, follow`, one H1, unique title/description, OG data, and at least one internal link. | `node scripts/seo-audit.mjs --live`, 2026-08-22T20:15:50Z | No technical recovery page was needed. Preserve the launch policy. |
| Verified | `/` returns 308 to `/tool/`; HTTP upgrades to HTTPS; `www` redirects path-preservingly to apex. | Direct HTTP checks on 2026-08-22 | Keep `/tool/` as the only canonical tool entry. |
| Verified | Unknown URLs return a real 404 with `noindex, follow, noarchive`; robots allows crawling and names the generated sitemap. | Direct HTTP checks and `scripts/qa.mjs` | No catch-all redirect or blanket disallow. |
| Verified | The public tool asks the user to declare page coverage, but the site had no operational page-inventory worksheet. | `/tool/`, pre-change route inventory | Build one bounded evidence asset before adding more editorial pages. |
| Verified | README, footer, case copy, workflow copy, and one field note retained parts of the earlier AI-output-comparator role. | Repository text search on 2026-08-22 | Rewrite and consolidate around SEO page decisions; do not add a second provider-comparison tool. |
| Supported | A page inventory should record canonical state, primary job, promise, evidence, and coverage before merge/new-URL decisions. | Published method v0.2, ten first-party validations, and Google Search Central canonical guidance | `/page-inventory/` has a distinct upstream job and a downloadable CSV. |
| Hypothesis | Practitioners who cannot confidently select a coverage state will use the worksheet and return to the tool with fewer `unknown` inputs. | Product-flow inference; no analytics or user study yet | Measure only after a privacy-compatible event plan or consented usability study exists. |
| Experiment | Test the worksheet with five real planning sessions and record completion, ambiguous fields, and changed coverage classifications. | Not yet run | Keep the fields stable until observed friction justifies a revision. |
| Rejected | One indexable page per fan-out branch, question, city, provider, or decision type. | Domain contract and page-role review | Do not generate a scaled URL inventory. |
| Rejected | Recreate AI Fanout provider retrieval or answer-comparison features on this domain. | Accepted complementary role | Link upstream only where it helps the import workflow and disclose common ownership. |

## Page-action matrix

Every indexable canonical URL has one primary user job. “No action” means the role remains useful and distinct; it is not a ranking claim.

| Canonical URL | Primary user job | Evidence state | Decision in this release |
| --- | --- | --- | --- |
| `/tool/` | Produce one bounded SEO page action | Verified implementation | Strengthen: link the missing inventory evidence step. |
| `/page-inventory/` | Build the site evidence required to classify coverage | Supported first-party method | Create one URL and a real CSV asset. |
| `/lab/` | Test which page-inventory assumption flips the action | Verified implementation | No content action; correct stale documentation around it. |
| `/methodik/` | Audit the exact v0.2 rule path and limits | Verified implementation and sources | No action. |
| `/quellenrollen/` | Choose the evidence role needed for a claim | Supported taxonomy | No action. |
| `/entscheidungen/` | Interpret the six possible page actions | Verified implementation | No action. |
| `/beispiele/` | Evaluate the method against documented inventories | Ten first-party validations | Update version and stale comparator wording. |
| `/learn/` | Choose a learning path | Verified hub | No action. |
| `/learn/what-seo-fan-out-means-here/` | Understand this site's definition and observation boundary | Supported by public primary context | No action. |
| `/learn/query-fan-out-is-not-a-content-plan/` | Prevent a branch list from becoming a URL list | Supported method argument | No action. |
| `/learn/when-a-topic-deserves-its-own-page/` | Apply the threshold for one distinct page | Supported method argument | No action; worksheet handles the operational inventory job. |
| `/blog/` | Browse accountable decision-layer field notes | Verified hub | Remove comparator language from hub description. |
| `/blog/why-more-content-is-not-always-the-answer/` | Understand the operating cost of unnecessary pages | Supported editorial argument | No action. |
| `/blog/how-to-compare-ai-answers-without-guessing/` | Understand why provider-output differences do not decide URL ownership | Supported boundary argument | Rewrite in place; preserve URL while changing the visible promise to the complementary role. |
| `/blog/what-a-no-page-decision-looks-like/` | Record a defensible no-action decision | Supported operating method | No action. |
| `/workflow/` | Move a local decision into the disclosed Contextter workflow | Verified manual handoff | Correct stale “comparison lab” copy. |
| `/impressum/` | Identify the legal operator | Verified operator data | No action. |
| `/datenschutz/` | Understand real processing and retention | Verified current implementation | No action. |
| `/korrekturen/` | Report an issue and understand the correction SLA | Verified route and owner | No action. |

Non-indexable system roles: `/` is a permanent redirect to `/tool/`; unknown routes use the noindex 404. Neither belongs in the sitemap.

## Hub and cluster map

```text
/tool/ — final page decision
├── /page-inventory/ — prepare coverage evidence
├── /lab/ — sensitivity test for inventory assumptions
├── /beispiele/ — validation cases
├── /methodik/ — rules, limits, sources
│   ├── /quellenrollen/ — evidence-role reference
│   └── /entscheidungen/ — decision reference
├── /learn/ — durable learning hub
│   ├── definition and observation boundary
│   ├── fan-out versus content plan
│   └── separate-page threshold
├── /blog/ — bounded field notes
│   ├── cost of unnecessary content
│   ├── AI-output difference versus page ownership
│   └── no-action record
└── /workflow/ — optional Contextter handoff, same operator
```

Trust pages (`/impressum/`, `/datenschutz/`, `/korrekturen/`) are global support routes, not topic clusters.

## Reproducible checks

- `corepack pnpm build`
- `corepack pnpm qa`
- `node scripts/seo-audit.mjs`
- `node scripts/seo-audit.mjs --live`

Primary technical context: [Google Search Central canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) and [crawlable link guidance](https://developers.google.com/search/docs/crawling-indexing/links-crawlable). These sources support technical practices, not the effectiveness of this site's decision framework.
