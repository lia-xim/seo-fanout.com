import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { exampleSeoHandoff } from "../src/lib/seo-research.mjs";

const flagIndex = process.argv.indexOf("--base-url");
const baseUrl =
  flagIndex >= 0 ? process.argv[flagIndex + 1] : "http://127.0.0.1:4321";
const browser = await chromium.launch({ headless: true });
const failures = [];
const results = [];

const check = (condition, message) => {
  if (!condition) failures.push(message);
};

async function inspect(route, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto(new URL(route, baseUrl).toString(), {
    waitUntil: "networkidle",
  });
  check(response?.status() === 200, `${route} returned ${response?.status()}`);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  check(
    overflow <= 1,
    `${route} overflows viewport by ${overflow}px at ${viewport.width}px`,
  );
  const axe = await new AxeBuilder({ page }).analyze();
  const serious = axe.violations.filter((item) =>
    ["serious", "critical"].includes(item.impact || ""),
  );
  check(
    serious.length === 0,
    `${route} has serious Axe violations: ${serious.map((item) => item.id).join(", ")}`,
  );
  check(errors.length === 0, `${route} console errors: ${errors.join(" | ")}`);
  const measured = await page.evaluate(() => {
    const navigation = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    return {
      loadMs: navigation ? Math.round(navigation.duration) : null,
      transferredBytes: resources.reduce(
        (sum, resource) => sum + (resource.transferSize || 0),
        0,
      ),
    };
  });
  results.push({
    route,
    viewport: viewport.width,
    axeViolations: axe.violations.length,
    axeViolationIds: axe.violations.map((item) => item.id),
    seriousAxeViolations: serious.length,
    overflow,
    consoleErrors: errors.length,
    ...measured,
  });
  await context.close();
}

const sitemap = await (await fetch(new URL("/sitemap-0.xml", baseUrl))).text();
const routes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  ([, value]) => new URL(value).pathname,
);

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  for (const route of routes) {
    await inspect(route, viewport);
  }
}

const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  acceptDownloads: true,
});
const page = await context.newPage();
await page.goto(new URL("/page-inventory/", baseUrl).toString(), {
  waitUntil: "networkidle",
});
const [csvDownload] = await Promise.all([
  page.waitForEvent("download"),
  page.getByRole("link", { name: "Download the CSV template" }).click(),
]);
check(
  csvDownload.suggestedFilename() === "seo-page-inventory.csv",
  "CSV download filename incorrect",
);

await page.goto(new URL("/tool/", baseUrl).toString(), {
  waitUntil: "networkidle",
});
await page.getByRole("button", { name: "Try the documented example" }).click();
check(
  await page
    .getByRole("heading", { name: "Ahrefs vs Semrush for small business" })
    .isVisible(),
  "documented research result missing",
);
check(
  (await page.locator("[data-package-list] > li").count()) === 3,
  "bounded work packages missing",
);
check(
  await page.getByText(/Research one comparison guide/u).isVisible(),
  "practical takeaway missing",
);
check(
  await page.getByText("13", { exact: true }).isVisible(),
  "documented source-domain count missing",
);
check(
  await page.getByRole("link", { name: /Inspect source fixture/u }).isVisible(),
  "published fixture link missing",
);
check(
  (await page.locator("[data-unknown-list] li").count()) >= 2,
  "validation gaps missing",
);
const [jsonDownload] = await Promise.all([
  page.waitForEvent("download"),
  page.getByRole("button", { name: "Download JSON" }).click(),
]);
check(
  jsonDownload.suggestedFilename().startsWith("seo-fanout-research-plan-"),
  "research JSON export missing",
);

const handoff = exampleSeoHandoff("de");
handoff.run.evidenceState = "provider_exposed_native_search";
handoff.run.evidenceLabel = "Vom Anbieter offengelegte API-Suchaktionen";
handoff.run.providerLabel = "GPT-5.6 Luna via OpenAI API";
const encoded = Buffer.from(JSON.stringify(handoff), "utf8").toString(
  "base64url",
);
const requests = [];
page.on("request", (request) => requests.push(request.url()));
await page.goto(new URL("/methodik/", baseUrl).toString(), {
  waitUntil: "networkidle",
});
await page.goto(new URL(`/tool/#research=${encoded}`, baseUrl).toString(), {
  waitUntil: "networkidle",
});
check(
  await page
    .getByText("Welche SEO-Tools passen zu kleinen Unternehmen?", {
      exact: true,
    })
    .isVisible(),
  "transferred German result missing",
);
check(
  (await page.evaluate(() => location.hash)) === "",
  "handoff fragment was not removed",
);
check(
  !requests.some((url) => /\/api\//u.test(url)),
  "SEO research triggered an API request",
);
check(
  (await page.locator("html").getAttribute("lang")) === "de",
  "transferred language was not applied",
);

await page.goto(new URL("/lab/", baseUrl).toString(), {
  waitUntil: "networkidle",
});
await page.getByRole("button", { name: "Update matrix" }).click();
check(
  (await page.locator("#stress-grid article").count()) === 6,
  "stress test did not render six inventory states",
);

await page.goto(new URL("/tool/", baseUrl).toString(), {
  waitUntil: "networkidle",
});
await page.keyboard.press("Tab");
check(
  (await page.locator(":focus").count()) === 1,
  "keyboard focus is not present in the DOM",
);
await context.close();

const noJsContext = await browser.newContext({ javaScriptEnabled: false });
const noJsPage = await noJsContext.newPage();
await noJsPage.goto(new URL("/page-inventory/", baseUrl).toString());
check(
  await noJsPage.getByRole("heading", { level: 1 }).isVisible(),
  "worksheet main content depends on JavaScript",
);
await noJsPage.goto(new URL("/tool/", baseUrl).toString());
check(
  await noJsPage.getByRole("heading", { level: 1 }).isVisible(),
  "tool explanation depends on JavaScript",
);
await noJsContext.close();

await browser.close();
console.log(JSON.stringify({ baseUrl, results, failures }, null, 2));
if (failures.length) process.exitCode = 1;
