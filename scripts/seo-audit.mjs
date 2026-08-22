import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const origin = "https://seo-fanout.com";
const live = process.argv.includes("--live");

const clean = (value = "") =>
  value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const match = (html, expression) => expression.exec(html)?.[1]?.trim() || "";

async function getText(path) {
  if (live) {
    const response = await fetch(new URL(path, origin), { redirect: "manual" });
    return { status: response.status, text: await response.text() };
  }
  const file = path === "/" ? "index.html" : path.slice(1) + "index.html";
  return { status: 200, text: await readFile(join(root, "dist", file), "utf8") };
}

const sitemapText = live
  ? await (await fetch(origin + "/sitemap-0.xml")).text()
  : await readFile(join(root, "dist", "sitemap-0.xml"), "utf8");
const routes = [...sitemapText.matchAll(/<loc>https:\/\/seo-fanout\.com([^<]+)<\/loc>/g)].map(
  ([, path]) => path,
);
const pages = [];

for (const route of routes) {
  const { status, text: html } = await getText(route);
  const title = match(html, /<title>([^<]*)<\/title>/i);
  const description = match(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const canonical = match(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
  const robots = match(html, /<meta\s+name="robots"\s+content="([^"]*)"/i);
  const h1 = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((item) => clean(item[1]));
  const links = [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)]
    .map((item) => item[1].split("#")[0])
    .filter((href) => href.startsWith("/") && !href.startsWith("//"));
  pages.push({
    route,
    status,
    title,
    description,
    canonical,
    robots,
    h1,
    links: [...new Set(links)],
    words: clean(html).split(/\s+/).filter(Boolean).length,
    og: /<meta\s+property="og:title"/i.test(html) && /<meta\s+property="og:image"/i.test(html),
    schema: [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].length,
  });
}

const routeSet = new Set(routes);
const inbound = new Map(routes.map((route) => [route, 0]));
const broken = [];
for (const page of pages) {
  for (const link of page.links) {
    if (/\.[a-z0-9]+$/i.test(link)) {
      if (!live) {
        try {
          await access(join(root, "dist", link.slice(1)));
        } catch {
          broken.push(page.route + " -> " + link);
        }
      }
      continue;
    }
    const normalized = link.endsWith("/") ? link : link + "/";
    if (routeSet.has(normalized)) inbound.set(normalized, inbound.get(normalized) + 1);
    else broken.push(page.route + " -> " + link);
  }
}

const duplicateValues = (key) => {
  const values = new Map();
  for (const page of pages) {
    const value = page[key];
    if (!value) continue;
    values.set(value, [...(values.get(value) || []), page.route]);
  }
  return [...values.entries()].filter(([, found]) => found.length > 1);
};

const findings = [];
for (const page of pages) {
  if (page.status !== 200) findings.push(page.route + ": status " + page.status);
  if (page.canonical !== origin + page.route) findings.push(page.route + ": canonical " + (page.canonical || "missing"));
  if (page.robots !== "index, follow") findings.push(page.route + ": robots " + (page.robots || "missing"));
  if (page.h1.length !== 1) findings.push(page.route + ": " + page.h1.length + " H1 elements");
  if (!page.title || !page.description) findings.push(page.route + ": missing title or description");
  if (!page.og) findings.push(page.route + ": incomplete OG metadata");
}
for (const [value, found] of duplicateValues("title")) findings.push("duplicate title: " + value + " (" + found.join(", ") + ")");
for (const [value, found] of duplicateValues("description")) findings.push("duplicate description: " + value + " (" + found.join(", ") + ")");
for (const item of broken) findings.push("broken internal link: " + item);

const report = {
  mode: live ? "live" : "dist",
  auditedAt: new Date().toISOString(),
  pageCount: pages.length,
  findings,
  orphans: routes.filter((route) => inbound.get(route) === 0),
  pages: pages.map(({ links, ...page }) => ({ ...page, inbound: inbound.get(page.route) })),
};

console.log(JSON.stringify(report, null, 2));
if (findings.length) process.exitCode = 1;