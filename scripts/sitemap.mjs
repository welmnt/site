/** Generate sitemap.xml from the same route list the prerenderer uses. */
import { writeFileSync } from "node:fs";

const BASE = "https://welmnt.me";
// Only pages a stranger should be able to land on from a search result.
// /admin is staff-only and /thank-you is meaningless without having just booked.
const routes = [
  ["", "1.0"],
  ["programmes", "0.9"],
  ["programmes/ages-5-9", "0.8"],
  ["programmes/ages-10-13", "0.8"],
  ["programmes/ages-14-17", "0.8"],
  ["schools", "0.7"],
  ["about", "0.6"],
  ["faq", "0.6"],
  ["contact", "0.5"],
  ["enrol", "0.7"],
  ["privacy", "0.2"],
];
const today = new Date().toISOString().slice(0, 10);

writeFileSync(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    ([r, p]) =>
      `  <url><loc>${BASE}/${r}${r ? "/" : ""}</loc><lastmod>${today}</lastmod><priority>${p}</priority></url>`
  )
  .join("\n")}
</urlset>
`
);
console.log(`sitemap: ${routes.length} urls`);
