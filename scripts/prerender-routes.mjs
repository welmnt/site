/**
 * Emit a real index.html at every known route.
 *
 * GitHub Pages serves static files, so /programmes/ages-10-13 has nothing to
 * match and falls through to 404.html. The app still renders — but the response
 * carries HTTP 404, which tells Google not to index the page. For a marketing
 * site whose whole job is to rank and take ad traffic, that is the difference
 * between a working page and an invisible one.
 *
 * Writing the shell to each known path turns those into 200s. 404.html stays as
 * the catch-all for anything genuinely unknown.
 */
import { cpSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const shell = join(dist, "index.html");

// Keep in step with the routes in src/App.tsx and the programme slugs in
// supabase/migrations/…_seed.sql. Admin routes are deliberately absent — they
// are login-gated and should never be indexed.
const routes = [
  "programmes",
  "programmes/ages-5-9",
  "programmes/ages-10-13",
  "programmes/ages-14-17",
  "schools",
  "about",
  "faq",
  "contact",
  "privacy",
  "enrol",
  "thank-you",
];

for (const r of routes) {
  const dir = join(dist, r);
  mkdirSync(dir, { recursive: true });
  cpSync(shell, join(dir, "index.html"));
}
cpSync(shell, join(dist, "404.html"));
console.log(`prerendered ${routes.length} routes + 404.html`);
