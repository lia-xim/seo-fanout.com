import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const excluded = new Set([
  "https://seo-fanout.com/",
  "https://seo-fanout.com/404/",
]);

export default defineConfig({
  site: "https://seo-fanout.com/",
  output: "static",
  integrations: [sitemap({ filter: (page) => !excluded.has(page) })],
  devToolbar: { enabled: false },
  trailingSlash: "always",
});
