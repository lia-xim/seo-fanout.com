import assert from "node:assert/strict";
import test from "node:test";
import {
  SEO_HANDOFF_SCHEMA,
  analyzeSeoHandoff,
  classifyQuery,
  decodeSeoResearchHandoff,
  exampleSeoHandoff,
} from "../src/lib/seo-research.mjs";

const encode = (payload) => Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

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
  assert.throws(() => decodeSeoResearchHandoff(encode({ ...fixture, producer: "example.com" })), /UNSUPPORTED_HANDOFF/u);
  assert.throws(() => decodeSeoResearchHandoff(encode({ ...fixture, schemaVersion: "ai-fanout.seo-research-handoff/2.0" })), /UNSUPPORTED_HANDOFF/u);
  const unsafe = structuredClone(fixture);
  unsafe.run.queries[0].sources = [{ url: "javascript:alert(1)", title: "unsafe", scope: "query" }];
  assert.throws(() => decodeSeoResearchHandoff(encode(unsafe)), /INVALID_SOURCE_URL/u);
});

test("creates transparent wording lenses without a model call", () => {
  assert.equal(classifyQuery("compare SEO tool pricing"), "compare");
  assert.equal(classifyQuery("SEO tool setup tutorial"), "implementation");
  const analysis = analyzeSeoHandoff(exampleSeoHandoff("en"));
  assert.ok(analysis.lenses.length >= 3);
  assert.ok(analysis.recurringTerms.some((item) => item.term === "seo"));
  assert.equal(analysis.sourceCount, 0);
});
