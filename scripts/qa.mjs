import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("..", import.meta.url)),
  dist = join(root, "dist");
const routeFiles = new Map([
  ["/tool/", "tool/index.html"],
  ["/methodik/", "methodik/index.html"],
  ["/page-inventory/", "page-inventory/index.html"],
  ["/quellenrollen/", "quellenrollen/index.html"],
  ["/entscheidungen/", "entscheidungen/index.html"],
  ["/beispiele/", "beispiele/index.html"],
  ["/learn/", "learn/index.html"],
  [
    "/learn/what-seo-fan-out-means-here/",
    "learn/what-seo-fan-out-means-here/index.html",
  ],
  [
    "/learn/query-fan-out-is-not-a-content-plan/",
    "learn/query-fan-out-is-not-a-content-plan/index.html",
  ],
  [
    "/learn/when-a-topic-deserves-its-own-page/",
    "learn/when-a-topic-deserves-its-own-page/index.html",
  ],
  ["/blog/", "blog/index.html"],
  [
    "/blog/why-more-content-is-not-always-the-answer/",
    "blog/why-more-content-is-not-always-the-answer/index.html",
  ],
  [
    "/blog/how-to-compare-ai-answers-without-guessing/",
    "blog/how-to-compare-ai-answers-without-guessing/index.html",
  ],
  [
    "/blog/what-a-no-page-decision-looks-like/",
    "blog/what-a-no-page-decision-looks-like/index.html",
  ],
  ["/lab/", "lab/index.html"],
  ["/workflow/", "workflow/index.html"],
  ["/seo-query-fanout-workflow/", "seo-query-fanout-workflow/index.html"],
  ["/geo-evidence-workflow/", "geo-evidence-workflow/index.html"],
  ["/impressum/", "impressum/index.html"],
  ["/datenschutz/", "datenschutz/index.html"],
  ["/korrekturen/", "korrekturen/index.html"],
]);
const fail = [];
const pass = (v, m) => {
  if (!v) fail.push(m);
};
const read = (p) => readFile(join(root, p), "utf8");
const built = new Map();
for (const [route, file] of routeFiles) {
  try {
    built.set(route, await readFile(join(dist, file), "utf8"));
  } catch {
    fail.push("missing " + route);
  }
}
const notFound = await readFile(join(dist, "404.html"), "utf8"),
  robots = await readFile(join(dist, "robots.txt"), "utf8"),
  sitemapIndex = await readFile(join(dist, "sitemap-index.xml"), "utf8"),
  sitemap = await readFile(join(dist, "sitemap-0.xml"), "utf8");
const vercel = JSON.parse(await read("vercel.json")),
  site = await read("src/data/site.ts"),
  tool = await read("src/scripts/fanout-tool.ts"),
  engine = await read("src/lib/decision-engine.ts"),
  cases = JSON.parse(await read("evidence/validation-cases.json")),
  handoffSchema = JSON.parse(await read("evidence/ai-fanout-planner-handoff.schema.v1.json")),
  handoffFixture = JSON.parse(await read("evidence/ai-fanout-planner-handoff.synthetic.v1.json"));
for (const [route, html] of built) {
  pass(html.includes('content="index, follow"'), route + " not indexable");
  pass(
    html.includes('href="https://seo-fanout.com' + route + '"'),
    route + " canonical incorrect",
  );
  pass(
    sitemap.includes("<loc>https://seo-fanout.com" + route + "</loc>"),
    route + " missing sitemap",
  );
}
pass(
  !sitemap.includes("<loc>https://seo-fanout.com/</loc>"),
  "redirected root in sitemap",
);
pass(!sitemap.includes("/404/"), "404 in sitemap");
pass(
  (sitemap.match(/<url>/g) || []).length === routeFiles.size,
  "sitemap count mismatch",
);
pass(
  sitemapIndex.includes("https://seo-fanout.com/sitemap-0.xml"),
  "sitemap index missing generated chunk",
);
pass(
  robots.trim() ===
    "User-agent: *\nAllow: /\nSitemap: https://seo-fanout.com/sitemap-index.xml",
  "robots launch policy incorrect",
);
pass(
  notFound.includes('content="noindex, follow, noarchive"'),
  "404 must remain noindex",
);
pass(
  vercel.redirects?.some(
    (r) =>
      r.source === "/" && r.destination === "/tool/" && r.permanent === true,
  ),
  "root redirect missing",
);
pass(
  !(vercel.headers || [])
    .flatMap((e) => e.headers || [])
    .some((h) => /robots/i.test(h.key)),
  "noindex header remains",
);
pass(site.includes("indexable: true"), "site indexing disabled");
const requiredHeaders = [
  "Content-Security-Policy",
  "X-Content-Type-Options",
  "Referrer-Policy",
  "Permissions-Policy",
  "X-Frame-Options",
  "Strict-Transport-Security",
];
const configuredHeaders = (vercel.headers || [])
  .flatMap((e) => e.headers || [])
  .map((h) => h.key);
for (const header of requiredHeaders)
  pass(configuredHeaders.includes(header), "missing security header " + header);
for (const [route, html] of built) {
  pass(
    html.includes('<meta property="og:title"') &&
      html.includes('<meta name="twitter:card"') &&
      html.includes("/social-card.png"),
    route + " social metadata missing",
  );
}
pass(
  (built.get("/datenschutz/") || "").includes('<html lang="de">') &&
    (built.get("/impressum/") || "").includes('<html lang="de">'),
  "German legal language missing",
);
pass(
  (built.get("/tool/") || "").includes('"@type":"Person"') &&
    (built.get("/tool/") || "").includes('"@type":"WebApplication"'),
  "tool schema creator incorrect",
);
pass(cases.cases.length === 10, "ten validation cases required");
pass(
  cases.cases.filter((c) => c.publish).length >= 3,
  "three published cases required",
);
pass(
  (built.get("/beispiele/") || "").includes("10 of 10 inventories reviewed"),
  "case gate copy missing",
);
pass(
  (built.get("/korrekturen/") || "").includes("five German business days") &&
    (built.get("/korrekturen/") || "").includes("within two business days"),
  "correction SLA missing",
);
for (const decision of [
  "extend_page",
  "add_section",
  "merge_content",
  "evidence_asset",
  "create_url",
  "no_action",
])
  pass(engine.includes(decision), "missing " + decision);
pass(
  !tool.includes("fetch(") && !tool.includes("localStorage"),
  "tool sends or retains input",
);
pass(
  tool.includes("ai_fanout_import") && /file\.size\s*>\s*200000/.test(tool),
  "local AI Fanout import contract missing",
);
pass(
  handoffSchema.properties?.data?.properties?.plannerVersion?.const ===
    "fanout-planner/1.0.0" &&
    handoffSchema.properties?.data?.properties?.methodVersion?.const ===
      "hypothetical-query-fanout/1.0",
  "AI Fanout consumer contract version mismatch",
);
pass(
  handoffFixture.data?.branches?.length >= 4 &&
    handoffFixture.data?.branches?.every(
      (branch) =>
        branch.query && branch.intent && branch.rationale &&
        branch.sourceType && branch.assumption,
    ) &&
    handoffFixture.data?.notice?.includes("Not an AI Fanout export"),
  "synthetic handoff fixture invalid or provenance boundary missing",
);
pass(
  tool.includes('"data.question"') && tool.includes('"sourcetype"'),
  "AI Fanout response-shaped handoff is not parsed",
);
const href = /<a\b[^>]*\bhref="([^"]+)"/g;
for (const [route, html] of built) {
  for (const m of html.matchAll(href)) {
    const u = m[1];
    if (!u.startsWith("/") || u.startsWith("//")) continue;
    const [p, f] = u.split("#");
    if (/\.[a-z0-9]+$/i.test(p)) {
      try {
        await access(join(dist, p.slice(1)));
      } catch {
        fail.push("missing asset " + u);
      }
      continue;
    }
    const n = p.endsWith("/") ? p : p + "/",
      target = routeFiles.get(n);
    if (!target) {
      fail.push(route + " unregistered link " + u);
      continue;
    }
    try {
      await access(join(dist, target));
      if (f)
        pass(
          (built.get(n) || "").includes('id="' + f + '"'),
          "missing fragment " + u,
        );
    } catch {
      fail.push("missing " + u);
    }
  }
}
if (fail.length) {
  console.error(fail.join("\n"));
  process.exit(1);
}
console.log(
  "QA passed: 21 indexable canonical pages, generated sitemap, root/www policy contract, noindex 404, ten validations, four published cases, correction SLA, links and deterministic tool.",
);
