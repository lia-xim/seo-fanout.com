import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = join(root, "dist");
const routeFiles = new Map([
  ["/tool/", "tool/index.html"], ["/methodik/", "methodik/index.html"],
  ["/quellenrollen/", "quellenrollen/index.html"], ["/entscheidungen/", "entscheidungen/index.html"],
  ["/beispiele/", "beispiele/index.html"], ["/learn/", "learn/index.html"],
  ["/learn/what-seo-fan-out-means-here/", "learn/what-seo-fan-out-means-here/index.html"],
  ["/learn/query-fan-out-is-not-a-content-plan/", "learn/query-fan-out-is-not-a-content-plan/index.html"],
  ["/learn/when-a-topic-deserves-its-own-page/", "learn/when-a-topic-deserves-its-own-page/index.html"],
  ["/blog/", "blog/index.html"],
  ["/blog/why-more-content-is-not-always-the-answer/", "blog/why-more-content-is-not-always-the-answer/index.html"],
  ["/blog/how-to-compare-ai-answers-without-guessing/", "blog/how-to-compare-ai-answers-without-guessing/index.html"],
  ["/blog/what-a-no-page-decision-looks-like/", "blog/what-a-no-page-decision-looks-like/index.html"],
  ["/lab/", "lab/index.html"], ["/workflow/", "workflow/index.html"], ["/impressum/", "impressum/index.html"],
  ["/datenschutz/", "datenschutz/index.html"],
]);
const failures=[]; const pass=(v,m)=>{if(!v)failures.push(m)}; const read=p=>readFile(join(root,p),"utf8");
const built=new Map();
for(const [route,file] of routeFiles){try{built.set(route,await readFile(join(dist,file),"utf8"))}catch{failures.push(`missing built route ${route}`)}}
const notFound=await readFile(join(dist,"404.html"),"utf8").catch(()=>"");
const robots=await readFile(join(dist,"robots.txt"),"utf8").catch(()=>"");
const sitemap=await readFile(join(dist,"sitemap.xml"),"utf8").catch(()=>"");
const vercel=JSON.parse(await read("vercel.json"));
const siteConfig=await read("src/data/site.ts");
const toolSource=await read("src/scripts/fanout-tool.ts");
const rights=JSON.parse(await read("evidence/rights-manifest.json"));
const routePolicy=JSON.parse(await read("evidence/route-policy.json"));
const sources=JSON.parse(await read("evidence/source-register.json"));

for(const [route,html] of built){
  pass(html.includes('content="noindex, follow, noarchive"'),`${route} must be crawlable noindex`);
  pass(html.includes('<meta name="description"'),`${route} description missing`);
  pass(html.includes(`href="https://seo-fanout.com${route}"`),`${route} canonical incorrect`);
  pass(html.includes('lang="en"'),`${route} language missing`);
}
for(const text of ["One question. One clear page decision.","Primary user job","Existing coverage","Evidence on hand","Export JSON","Runs locally in your browser. Nothing is retained."]) pass((built.get("/tool/")??"").includes(text),`tool missing ${text}`);
for(const decision of ["strengthen","consolidate","create_page","evidence_asset","no_action"]) pass(toolSource.includes(decision),`missing decision ${decision}`);
pass(!toolSource.includes("localStorage")&&!toolSource.includes("sessionStorage")&&!toolSource.includes("fetch("),"tool must remain browser-local without retained/network input");
pass(robots.trim()==="User-agent: *\nAllow: /\nSitemap: https://seo-fanout.com/sitemap.xml","robots must allow crawl while preview is noindex");
pass(sitemap.includes("<urlset")&&!sitemap.includes("<url>"),"sitemap must remain valid and empty before index approval");
pass(notFound.includes("404 · Page not found")&&notFound.includes('content="noindex, follow, noarchive"'),"404 policy incorrect");
pass(vercel.redirects?.some(r=>r.source==="/"&&r.destination==="/tool/"&&r.permanent===true),"root must permanently redirect to /tool/");
const headers=vercel.headers?.flatMap(e=>e.headers??[])??[];
pass(headers.some(h=>h.key==="X-Robots-Tag"&&h.value==="noindex, follow, noarchive"),"Vercel noindex header incorrect");
pass(siteConfig.includes("indexable: false")&&siteConfig.includes("enabled: false"),"indexing and analytics must remain disabled");
pass(rights.registrationContext.includes("Newly registered")&&!JSON.stringify(rights).match(/formerSiteMaterial|trademark clearance|former-operator/i),"rights manifest must use new-registration context only");
pass(routePolicy.rootAction.status===308&&routePolicy.defaultUnknownPathAction===404&&routePolicy.catchAllRedirect===false,"route policy incorrect");
for(const id of ["google-ai-mode-2025-03","rdap-registration-2026-08-16","operator-imprint","vercel-privacy"]) pass(sources.sources.some(s=>s.id===id),`source missing ${id}`);
pass((built.get("/impressum/")??"").includes("Matthias Ramahi")&&(built.get("/impressum/")??"").includes("Kempener Straße 44"),"imprint operator data missing");
pass((built.get("/datenschutz/")??"").includes("keine Analyse- oder Trackingdienste")&&(built.get("/datenschutz/")??"").includes("Local Storage"),"privacy does not match current stack");

const hrefPattern=/<a\b[^>]*\bhref="([^"]+)"/g;
for(const [route,html] of built){for(const match of html.matchAll(hrefPattern)){const href=match[1];if(!href.startsWith("/")||href.startsWith("//"))continue;const [path,fragment]=href.split("#");const normalized=path.endsWith("/")?path:`${path}/`;const target=routeFiles.get(normalized);if(!target){failures.push(`${route} links to unregistered route ${href}`);continue}try{await access(join(dist,target));if(fragment)pass((built.get(normalized)??"").includes(`id="${fragment}"`),`missing fragment ${href}`)}catch{failures.push(`missing file ${href}`)}}}
if(failures.length){console.error(failures.join("\n"));process.exit(1)}
console.log(`QA passed: ${routeFiles.size} canonical routes, crawlable noindex preview, empty sitemap, legal pages, 404, manifests, links, and five deterministic decisions.`);
