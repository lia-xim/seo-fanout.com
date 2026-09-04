import assert from "node:assert/strict";
import test from "node:test";
import {
  SEO_HANDOFF_SCHEMA,
  analyzeSeoHandoff,
  classifyQuery,
  classifySourceRole,
  decodeSeoResearchHandoff,
  documentedSeoHandoff,
  exampleSeoHandoff,
} from "../src/lib/seo-research.mjs";

const encode = (payload) =>
  Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

test("decodes the exact handoff contract and preserves evidence state", () => {
  const fixture = exampleSeoHandoff("de");
  const decoded = decodeSeoResearchHandoff(encode(fixture));
  assert.equal(decoded.schemaVersion, SEO_HANDOFF_SCHEMA);
  assert.equal(decoded.run.language, "de");
  assert.equal(decoded.run.evidenceState, "modelled_search_ideas");
  assert.equal(decoded.run.queries.length, 5);
});

test("rejects unknown producers, versions and unsafe source URLs", () => {
  const fixture = exampleSeoHandoff("en");
  assert.throws(
    () =>
      decodeSeoResearchHandoff(encode({ ...fixture, producer: "example.com" })),
    /UNSUPPORTED_HANDOFF/u,
  );
  assert.throws(
    () =>
      decodeSeoResearchHandoff(
        encode({
          ...fixture,
          schemaVersion: "ai-fanout.seo-research-handoff/2.0",
        }),
      ),
    /UNSUPPORTED_HANDOFF/u,
  );
  const unsafe = structuredClone(fixture);
  unsafe.run.queries[0].sources = [
    { url: "javascript:alert(1)", title: "unsafe", scope: "query" },
  ];
  assert.throws(
    () => decodeSeoResearchHandoff(encode(unsafe)),
    /INVALID_SOURCE_URL/u,
  );
});

test("creates transparent wording lenses without a model call", () => {
  assert.equal(classifyQuery("compare SEO tool pricing"), "compare");
  assert.equal(classifyQuery("SEO tool setup tutorial"), "implementation");
  const analysis = analyzeSeoHandoff(exampleSeoHandoff("en"));
  assert.ok(analysis.lenses.length >= 3);
  assert.ok(analysis.recurringTerms.some((item) => item.term === "seo"));
  assert.equal(analysis.sourceCount, 0);
  assert.equal(analysis.workingDirection.key, "review_groups");
  assert.equal(
    analysis.queries.length,
    analysis.queries.filter((query) => query.action && query.evidenceNeed)
      .length,
  );
  assert.ok(analysis.unknowns.some((item) => item.includes("Search demand")));
});

test("turns the documented owner-run observation into three bounded work packages", () => {
  const fixture = documentedSeoHandoff("en");
  const analysis = analyzeSeoHandoff(fixture);
  assert.equal(fixture.run.question, "Ahrefs vs Semrush for small business");
  assert.equal(fixture.run.sourceDocumentUrl, "https://ai-fanout.com/examples/openai-observations-2026-08-27.json");
  assert.equal(analysis.sourceCount, 0);
  assert.equal(analysis.sourceDomainCount, 13);
  assert.equal(analysis.workingDirection.key, "one_comparison_guide");
  assert.match(analysis.workingDirection.title, /one comparison guide/u);
  assert.deepEqual(
    analysis.workPackages.map((workPackage) => workPackage.key),
    ["comparison", "pricing", "fit"],
  );
  assert.deepEqual(
    analysis.workPackages.map((workPackage) => workPackage.queries.length),
    [1, 2, 1],
  );
});

test("keeps a narrow provider fanout together as one working brief", () => {
  const fixture = exampleSeoHandoff("en");
  fixture.run.question = "AI search citations";
  fixture.run.queries = [
    {
      text: "AI search citations how citations work official documentation",
      intent: "",
      reason: "",
      sourceRelation: "",
      sources: [],
    },
    {
      text: "AI search citation accuracy study",
      intent: "",
      reason: "",
      sourceRelation: "",
      sources: [],
    },
    {
      text: "AI search citations best practices publishers",
      intent: "",
      reason: "",
      sourceRelation: "",
      sources: [],
    },
  ];
  const analysis = analyzeSeoHandoff(fixture);
  assert.equal(analysis.workingDirection.key, "one_brief");
  assert.match(analysis.workingDirection.title, /one research plan/u);
  assert.equal(analysis.queries.length, 3);
  assert.deepEqual(
    analysis.queries.map((query) => query.lensKey),
    ["definition", "evidence", "guidance"],
  );
});

test("turns run-level sources into a useful evidence mix without inventing query mappings", () => {
  const fixture = exampleSeoHandoff("en");
  fixture.run.runSources = [
    {
      url: "https://developers.google.com/search/docs",
      title: "Google Search docs",
      scope: "provider_run",
    },
    {
      url: "https://arxiv.org/abs/1234.5678",
      title: "Research paper",
      scope: "provider_run",
    },
    {
      url: "https://www.reddit.com/r/SEO/",
      title: "Community discussion",
      scope: "provider_run",
    },
  ];
  const analysis = analyzeSeoHandoff(fixture);
  assert.equal(classifySourceRole("developers.google.com"), "primary");
  assert.equal(classifySourceRole("arxiv.org"), "research");
  assert.equal(classifySourceRole("reddit.com"), "community");
  assert.deepEqual(analysis.evidenceMix.map((item) => item.key).sort(), [
    "community",
    "primary",
    "research",
  ]);
  assert.equal(analysis.mappedQueryCount, 0);
  assert.match(
    analysis.nextAction,
    /Map the strongest primary or research sources/u,
  );
});
