import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://seo-fanout.com/",
  output: "static",
  devToolbar: { enabled: false },
  trailingSlash: "always",
});
