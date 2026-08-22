# seo-fanout.com

Public source repository for seo-fanout.com, a standalone deterministic Fan-out Explorer and learning resource.

## Product

The free browser-local tool turns one keyword, topic, or page question into a bounded user job, relevant subquestions, evidence needs, and exactly one priority: strengthen, consolidate, create a page, create evidence first, or take no action. It does not call a model or search provider, expose hidden queries, or create indexable pages for variations.

The site is a newly registered project of Matthias Ramahi. Contextter is an optional manually connected workflow from the same operator, not independent corroboration.

## Current launch state

The custom domain is live and indexable. Canonical HTML routes use `index, follow`; the real 404 remains `noindex`. An automatic Astro sitemap discovers static canonical pages and excludes the redirected root and 404. No analytics, cookies, remote fonts, contact forms, server-side tool storage, or paid APIs are enabled.

## Routes

- `/tool/` — canonical free decision tool
- `/` — permanent redirect to `/tool/`
- `/learn/`, `/blog/` — guides and field notes
- `/methodik/`, `/quellenrollen/`, `/entscheidungen/` — transparent method and reference
- `/beispiele/` — case-validation register
- `/workflow/` — optional manual Contextter handoff
- `/impressum/`, `/datenschutz/`, `/korrekturen/` — operator, privacy, and correction SLA

The optional `/lab/` surface compares only user-pasted visible answer structure in one browser session. It is not a copy of the separate AI-Fanout Evidence Lab: it performs no provider retrieval, monitoring, longitudinal evidence collection, factual scoring, or hidden-process inference.

## Development

```bash
corepack pnpm install
corepack pnpm verify
```

Vercel project: `seo-fanout-com`.

## Rights

Site code and copy were created for this project. Third-party text, images, provider data, outputs, names, and other materials may be used only where an applicable right, license, quotation basis, or permission exists. User-pasted and exported tool data is not collected by this implementation. No open-source license is granted unless a later commit adds one.
