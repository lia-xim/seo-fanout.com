export const site = {
  domain: "seo-fanout.com",
  origin: "https://seo-fanout.com",
  language: "en",
  title: "SEO Fan-out Explorer",
  description: "A deterministic planning tool for mapping user jobs, fan-out subtopics, evidence needs, and defensible page priorities.",
  purpose: "Decide whether to strengthen, consolidate, create, support with evidence, or leave a page alone before adding another URL.",
  status: "Knowledge hub and browser-local tools implemented. The owned custom domain is connected for protected noindex review; public indexing launch is not approved.",
  boundary: "The tool must not claim access to hidden search or model queries and must not generate one indexable page per variation.",
  primaryProject: "Contextter (accepted)",
  githubUrl: "https://github.com/lia-xim/seo-fanout.com",
  issuesUrl: "https://github.com/lia-xim/seo-fanout.com/issues",
  indexable: false,
  analytics: {
    enabled: false,
    provider: null,
  },
  operator: {
    name: "Matthias Ramahi",
    disclosure: "SEO Fan-out and Contextter share an operator. Contextter is not an independent validator of this framework.",
  },
  navigation: [
    { href: "/tool/", label: "Tool" },
    { href: "/learn/", label: "Learn" },

    { href: "/beispiele/", label: "Examples" },
  ],
} as const;
