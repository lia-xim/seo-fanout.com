export const site = {
  domain: "seo-fanout.com",
  origin: "https://seo-fanout.com",
  language: "en",
  title: "SEO Fanout Research Plan",
  description:
    "Turn provider-exposed AI fanout queries into grouped SEO work packages, proof requirements and explicit validation gaps without another AI request.",
  purpose:
    "Translate one already completed AI Fanout run into a transparent SEO research plan without a second model or provider request.",
  status:
    "Indexable public SEO research view connected browser-locally to AI Fanout, with no second provider request.",
  boundary:
    "The tool analyses only the transferred visible result and must not claim hidden queries, search demand, rankings, site coverage or citation probability.",
  primaryProject: "Crawl Foundry (accepted)",
  githubUrl: "https://github.com/lia-xim/seo-fanout.com",
  issuesUrl: "https://github.com/lia-xim/seo-fanout.com/issues",
  indexable: true,
  analytics: {
    enabled: false,
    provider: null,
  },
  operator: {
    name: "Matthias Ramahi",
    disclosure:
      "SEO Fanout, AI Fanout and Crawl Foundry share an operator. They are connected workflows, not independent validation.",
  },
  navigation: [
    { href: "/tool/", label: "Research view" },
    { href: "/seo-query-fanout-workflow/", label: "How it connects" },
    { href: "/methodik/", label: "Method" },
    { href: "/beispiele/", label: "Examples" },
  ],
} as const;
