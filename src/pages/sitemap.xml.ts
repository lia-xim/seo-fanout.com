import type { APIRoute } from "astro";

// Launch state: there are deliberately no indexable URLs.
export const GET: APIRoute = () =>
  new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n', {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });