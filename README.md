# seo-fanout.com

Public source repository for seo-fanout.com, a browser-local SEO research view for completed AI query fanout runs.

## Product

AI Fanout performs one bounded OpenAI or Gemini web-search run. From that visible result, a visitor can open SEO Fanout directly. A versioned, size-limited handoff travels only in the URL fragment, is read in the destination browser and is removed from the address bar immediately. SEO Fanout groups the already exposed query strings into transparent research lenses, preserves visible source scope and produces a local SEO research brief. It makes no second model or provider request.

The analysis does not prove hidden queries, search demand, rankings, site coverage, content requirements or citation probability. A synthetic example is available without an API request and is labelled as synthetic.

The site is a newly registered project of Matthias Ramahi. Contextter is an optional manually connected workflow from the same operator, not independent corroboration.

## Current launch state

The custom domain is live and indexable. Canonical HTML routes use `index, follow`; the real 404 remains `noindex`. An automatic Astro sitemap discovers static canonical pages and excludes the redirected root and 404. No analytics, cookies, remote fonts, contact forms, server-side tool storage, or paid APIs are enabled.

## Routes

- `/tool/` — canonical SEO research view and browser-local handoff receiver
- `/` — permanent redirect to `/tool/`
- `/methodik/`, `/quellenrollen/` — transparent method and source-scope reference
- `/beispiele/` — reviewed interface and research examples
- `/seo-query-fanout-workflow/` — exact AI Fanout to SEO Fanout connection
- `/workflow/` — optional Contextter evidence workflow
- `/impressum/`, `/datenschutz/`, `/korrekturen/` — operator, privacy, and correction SLA

Legacy page-decision routes remain available during the transition but are removed from the primary product journey. AI Fanout, SEO Fanout and Contextter share an operator and are not independent validation.

## Development

```bash
corepack pnpm install
corepack pnpm verify
```

Vercel project: `seo-fanout-com`.

## Rights

Site code and copy were created for this project. Third-party text, images, provider data, outputs, names, and other materials may be used only where an applicable right, license, quotation basis, or permission exists. User-pasted and exported tool data is not collected by this implementation. No open-source license is granted unless a later commit adds one.
