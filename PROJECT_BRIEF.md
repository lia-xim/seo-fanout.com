# SEO Fan-out Explorer — project brief

## Accepted purpose

Build a standalone SEO research-plan view that reuses one completed AI Fanout result without triggering a second AI or provider request.

## Product contract

The tool is deterministic and browser-local. AI Fanout sends only the already visible, selected query strings, visible source relationships, run-level sources and run metadata through a versioned URL-fragment handoff. SEO Fanout reads the fragment, removes it from the address bar and consolidates related queries into concrete work packages, deliverables, proof requirements, a source-role mix and explicit validation gaps. Raw queries and source scope remain available as supporting evidence. It does not call a model, search provider, analytics service or paid API.

AI Fanout owns the provider request and the raw observed-result view. SEO Fanout owns the SEO-oriented reading of the same run. Contextter is the optional next workflow for search demand, current pages, Search Console, Site Audit and ongoing work. The three products share an operator and are not independent corroboration.

The result must not be presented as hidden queries, keyword demand, ranking evidence, a finished content plan, site coverage or citation probability. Wording-based work packages are transparent heuristics and remain user-reviewable.

The primary public example is a reviewed owner-run OpenAI observation published by AI Fanout. It is documented as provider-exposed search behaviour, not as an independent benchmark. A separately labelled synthetic fallback exists only to demonstrate the interface.

## Domain and identity

seo-fanout.com was newly registered by the current owner on 16 August 2026. Ordinary rights for third-party text, images, provider data, names, and user-provided material remain mandatory.

Operator and author: Matthias Ramahi. AI Fanout and Contextter are optional connected workflows from the same operator and are not independent corroboration.

## Launch state and gates

- The public site is indexable under the explicit launch approval recorded on 22 August 2026.
- The automatic sitemap contains canonical, indexable 200 pages only.
- Ten real page inventories are documented, including four published decision cases.
- Matthias Ramahi owns quarterly review and the published correction SLA.
- Recheck routes, status codes, canonicals, sitemap, links, keyboard path, mobile state, exports, apex and www after every production change.
