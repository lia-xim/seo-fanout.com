export type ContentKind = "guide" | "field-note";

export interface ContentSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface ContentEntry {
  slug: string;
  kind: ContentKind;
  title: string;
  description: string;
  takeaway: string;
  published?: string;
  updated: string;
  sections: ContentSection[];
  next: { label: string; href: string };
}

export const guides: ContentEntry[] = [
  {
    slug: "what-seo-fan-out-means-here",
    kind: "guide",
    title: "What SEO fan-out means here",
    description: "A precise definition of the modeled planning framework, what it can reveal, and what it cannot.",
    takeaway: "SEO fan-out is a way to expose the jobs, questions, entities, and evidence around one topic before deciding what deserves a page.",
    updated: "2026-08-22",
    sections: [
      {
        heading: "A planning map, not a leak from a search system",
        paragraphs: [
          "On this site, fan-out means taking one declared user job and mapping the work needed to answer it responsibly. The branches are editorial prompts produced by a published rule set. They are not hidden Google searches, private model instructions, chain of thought, demand estimates, or ranking signals.",
          "That boundary matters. A useful planning model can be inspected and challenged. A claim about secret platform behavior cannot. The framework therefore shows its inputs, rules, assumptions, and missing evidence instead of pretending to reconstruct an internal system.",
        ],
      },
      {
        heading: "What the map contains",
        paragraphs: [
          "A bounded map starts with the outcome a person needs. It then names the entities that must be resolved, the questions that determine the decision, the source roles those questions require, and the gaps that prevent a confident recommendation.",
        ],
        bullets: [
          "Goal: the outcome the reader or practitioner must reach.",
          "Entities: the people, products, rules, pages, or systems that need an explicit identity.",
          "Questions: the smallest set of issues that could change the decision.",
          "Source roles: the kind of evidence needed, such as a current specification, firsthand test, or page inventory.",
          "Page decision: extend a page, add a section, merge content, build evidence first, create one URL, or take no action.",
        ],
      },
      {
        heading: "Why the page decision comes last",
        paragraphs: [
          "A list of related phrases is easy to produce. It is also a poor reason to create URLs. The framework checks whether an existing page already owns the job and whether the evidence is strong enough before a new page is allowed into the plan.",
          "This changes the default. A branch is usually a section, a research task, or an evidence requirement. It becomes a separate page only when it represents a distinct user job with a durable purpose, its own proof, and a useful place in the site architecture.",
        ],
      },
      {
        heading: "Where the model stops",
        paragraphs: [
          "The tool does not inspect a site, Search Console property, live search result, or AI answer unless the user supplies that evidence in a separate review. It does not estimate traffic, predict citations, or judge factual accuracy. Its output is a structured decision prompt, not a finished strategy.",
          "Use the map to decide what to verify next. Use real URLs, primary sources, firsthand material, and measured demand to decide whether the recommendation survives contact with the actual site.",
        ],
      },
    ],
    next: { label: "Audit the exact method", href: "/methodik/" },
  },
  {
    slug: "query-fan-out-is-not-a-content-plan",
    kind: "guide",
    title: "Query fan-out is not a content plan",
    description: "Why a long branch list should not become a long URL list, and how to turn it into a bounded publishing decision.",
    takeaway: "Related questions describe the work around an intent. They do not automatically describe separate pages.",
    updated: "2026-08-22",
    sections: [
      {
        heading: "The common category error",
        paragraphs: [
          "A fan-out can surface dozens of plausible questions. The mistake is treating the list as an information architecture. Questions can overlap, depend on the same evidence, or make sense only as parts of one decision. Publishing each variation creates repetition before it creates coverage.",
          "A content plan needs a second layer of judgment: which user jobs are genuinely distinct, which page already owns them, and which evidence can be maintained over time. Without that layer, fan-out becomes a scaled-content prompt.",
        ],
      },
      {
        heading: "Four tests before a branch gets a URL",
        paragraphs: [
          "A separate page is justified only when the separation helps the reader and the site. Use four tests together; passing one is not enough.",
        ],
        bullets: [
          "Different job: the reader is trying to reach a materially different outcome.",
          "Different proof: the answer needs its own dataset, test, expert evidence, or maintained reference.",
          "Different journey: the next action or conversion path is not the same as the parent page.",
          "Different lifecycle: the material changes on a different cadence or has a separate accountable owner.",
        ],
      },
      {
        heading: "What to do with the branches that remain",
        paragraphs: [
          "Keep supporting questions as sections on the strongest page when they serve the same promise. Turn unresolved proof into a research task. Merge wording variants into the clearest formulation. Reject branches that add no decision value or cannot be supported without speculation.",
          "The result is usually smaller than the original map. That is a feature. A planning process should remove unnecessary work before it creates a publishing backlog.",
        ],
      },
      {
        heading: "A conservative default",
        paragraphs: [
          "If an existing page has one bounded gap, add a section. If its promise needs material expansion, extend it. If several pages compete, merge content only after checking intent equivalence. If evidence is missing, build an evidence asset. Create one new URL only when no existing page owns a distinct job and credible source material is ready.",
          "That default does not guarantee a ranking outcome. It produces a cleaner, more reviewable reason for the page to exist.",
        ],
      },
    ],
    next: { label: "See the five page decisions", href: "/entscheidungen/" },
  },
  {
    slug: "when-a-topic-deserves-its-own-page",
    kind: "guide",
    title: "When a topic deserves its own page",
    description: "A practical threshold for separating a topic from an existing page without creating thin or competing URLs.",
    takeaway: "A topic deserves a page when it has an independent user job, sufficient evidence, and a durable role that cannot be served cleanly by an existing page.",
    updated: "2026-08-22",
    sections: [
      {
        heading: "Start with page ownership",
        paragraphs: [
          "Before writing, name the page that currently owns the user job. If the answer is unclear, the next task is an inventory, not a new draft. Record each relevant URL, its primary promise, the evidence it contains, and the action it asks the reader to take.",
          "This simple step exposes most collisions. Two pages with different titles can still compete when both help the same person make the same decision.",
        ],
      },
      {
        heading: "The page threshold",
        paragraphs: [
          "A strong candidate can answer yes to the following questions without relying on keyword wording alone.",
        ],
        bullets: [
          "Would a reader arrive with a different goal from the parent page?",
          "Can the page make a complete promise instead of repeating an introduction elsewhere?",
          "Is there primary, firsthand, or observed evidence available now?",
          "Does the page have a clear parent, proof link, and next step in the site journey?",
          "Can someone own its accuracy and maintenance cadence?",
        ],
      },
      {
        heading: "Reasons to keep the topic as a section",
        paragraphs: [
          "Keep the topic inside an existing page when it answers a supporting question, uses the same evidence, shares the same next action, or would be too thin without repeating its parent. A section can still be substantial. It simply remains accountable to one stronger page promise.",
          "A search phrase appearing to be specific is not enough. The useful distinction is the job, proof, and journey behind the phrase.",
        ],
      },
      {
        heading: "Reasons to stop altogether",
        paragraphs: [
          "Sometimes the current page already answers the job with credible evidence. Sometimes the branch is interesting but irrelevant to the site's audience. Sometimes no one can maintain the source material. In each case, no page action is a defensible outcome.",
          "Recording that decision prevents the same weak idea from returning to the backlog under a new title a month later.",
        ],
      },
    ],
    next: { label: "Run a page decision", href: "/tool/#explorer" },
  },
];

export const fieldNotes: ContentEntry[] = [
  {
    slug: "why-more-content-is-not-always-the-answer",
    kind: "field-note",
    title: "Why more content is not always the answer",
    description: "The output of research is often an edit, a merge, a test, or a deliberate decision to leave the page set alone.",
    takeaway: "A content process earns its value by removing weak work as well as identifying useful work.",
    published: "2026-08-22",
    updated: "2026-08-22",
    sections: [
      {
        heading: "Research creates possibilities, not obligations",
        paragraphs: [
          "Keyword exports, user questions, AI suggestions, and competitor pages can all produce a long list of plausible topics. None of those lists knows what your current pages already cover, what evidence you own, or which work matters to the business. Treating discovery as a publishing queue skips the decision that gives the research value.",
          "The useful output may be a stronger paragraph on an existing page. It may be a comparison table built from current primary sources. It may be a crawl that proves two pages overlap. Those are real outputs even though they do not increase the URL count.",
        ],
      },
      {
        heading: "The cost of saying yes too early",
        paragraphs: [
          "Every new page needs a distinct promise, internal links, evidence, maintenance, and later review. Weak pages also create ambiguity: people and search systems must decide which URL is the real owner of the topic. The operating burden accumulates quietly because publishing is visible while maintenance is not.",
          "A conservative decision rule makes that cost explicit before the draft exists. If the team cannot name the owner, evidence, and lifecycle of the page, the idea is not ready.",
        ],
      },
      {
        heading: "Count decisions, not drafts",
        paragraphs: [
          "A healthier review tracks how many pages were extended, given a new section, merged, held for evidence, created, or left unchanged. That record shows whether research is improving the site rather than merely expanding it.",
          "The goal is not less content as a doctrine. It is fewer pages that exist for no durable reason, and more attention on the pages and evidence that already carry a real job.",
        ],
      },
    ],
    next: { label: "Use the decision tool", href: "/tool/#explorer" },
  },
  {
    slug: "how-to-compare-ai-answers-without-guessing",
    kind: "field-note",
    title: "Why comparing AI answers does not decide your SEO pages",
    description: "Visible AI outputs can inform research, but page ownership and evidence—not provider differences—determine the SEO action.",
    takeaway: "A different AI answer can change the research queue. It does not by itself justify a different URL.",
    published: "2026-08-22",
    updated: "2026-08-22",
    sections: [
      {
        heading: "Different output is not a different page job",
        paragraphs: [
          "Two AI tools can return different branches, examples, caveats, or sources for the same prompt. Those differences may reveal questions worth checking. They do not show which URL currently owns the user job, whether the site already answers it, or whether the evidence is ready to publish.",
          "The page decision therefore starts after the comparison. Keep useful branches as declared inputs, then inspect the actual site inventory before adding work to the roadmap.",
        ],
      },
      {
        heading: "What can travel downstream",
        paragraphs: [
          "Preserve the topic, user job, branches, questions, entities, source roles, provider label, date, visible mode, and any known settings. Treat every imported branch as user-supplied planning material rather than a hidden query or verified demand signal.",
          "A portable record makes the handoff reviewable. It also preserves provenance when a branch later becomes a section, research task, or rejected idea.",
        ],
        bullets: [
          "Keep the original topic and primary user outcome.",
          "Keep the visible provider and run context without inferring hidden internals.",
          "Deduplicate wording variants before page review.",
          "Mark source suggestions as unverified until the source is opened and checked.",
        ],
      },
      {
        heading: "What the site must still prove",
        paragraphs: [
          "Name the current canonical owner, page promise, indexability, evidence state, and next step for the reader. Then classify coverage as no owner, a section gap, a material page gap, substantial coverage, overlap, or unknown.",
          "This is the decision-critical evidence. Without it, a long fan-out can only support a research task—not a reliable URL recommendation.",
        ],
      },
      {
        heading: "Keep the two product roles separate",
        paragraphs: [
          "AI Fanout is the separate upstream workspace for planning branches and public-answer evidence. SEO Fanout decides how those inputs should change a real page set. Both share the same operator, so neither is independent validation of the other.",
          "If you already have an AI Fanout export, import it locally and complete the inventory review here. If you only need to compare provider outputs, stay in the upstream evidence workflow.",
        ],
      },
    ],
    next: { label: "Import branches into a page decision", href: "/tool/#import-plan" },
  },
  {
    slug: "what-a-no-page-decision-looks-like",
    kind: "field-note",
    title: "What a no-page decision looks like",
    description: "A practical record for cases where an existing page already does the job and another URL would add noise.",
    takeaway: "No page action is a positive decision when the current owner is clear, the job is covered, and the evidence is credible.",
    published: "2026-08-22",
    updated: "2026-08-22",
    sections: [
      {
        heading: "The conditions",
        paragraphs: [
          "A no-page decision begins with an existing URL that substantially serves the same primary user job. Its promise is clear, the important questions are answered, and the material claims have credible current evidence. A proposed sibling would not create a different journey or maintain a different evidence asset.",
        ],
      },
      {
        heading: "What gets recorded",
        paragraphs: [
          "Write down the proposed topic, the current owning URL, the evidence reviewed, and the reason a separate page was rejected. Note any small maintenance task that remains, such as updating a source date or clarifying a boundary. Assign a review trigger instead of an arbitrary publishing date.",
        ],
        bullets: [
          "Review when the user job materially changes.",
          "Review when a primary source or product specification changes.",
          "Review when measured queries or conversions show a distinct unmet job.",
          "Review when the existing page can no longer carry the evidence cleanly.",
        ],
      },
      {
        heading: "Why the record matters",
        paragraphs: [
          "Without a record, rejected ideas tend to return under new wording. The team repeats research, drafts another brief, and reopens the same architecture question. A dated no-page decision preserves the reasoning and makes the next review faster.",
          "The decision is not permanent. It is simply the strongest action supported by the present inventory and evidence.",
        ],
      },
    ],
    next: { label: "Read the decision guide", href: "/entscheidungen/" },
  },
];

export const allContent = [...guides, ...fieldNotes];
