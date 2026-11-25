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
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
  "tiktok-family-academy",
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

// Pages shared one-to-one (WhatsApp, email) need their own link preview, or the
// school sees the parents' Arabic card. Swap title, description, og:* and the image.
const META = {
  "tiktok-family-academy": {
    title: "TikTok Family Academy · Host a free morning at your school — Welmnt",
    desc: "A free three-hour morning for parents and teachers on raising teenagers online: Dr. Walaa Elgammal's workshop, a panel with your counsellor, and TikTok's safety tools set up live. Edition 3, Cairo.",
    image: "https://welmnt.me/assets/tfa/og.jpg",
  },
};
const attr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
for (const [r, m] of Object.entries(META)) {
  const f = join(dist, r, "index.html");
  let h = readFileSync(f, "utf8");
  h = h
    .replace(/<title>[^<]*<\/title>/, `<title>${m.title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${attr(m.desc)}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${attr(m.title)}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${attr(m.desc)}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1https://welmnt.me/${r}/`)
    .replace(/(<meta property="og:image" content=")[^"]*/, `$1${m.image}`)
    .replace(/(<meta property="og:locale" content=")[^"]*/, "$1en_US");
  writeFileSync(f, h);
}
cpSync(shell, join(dist, "404.html"));
console.log(`prerendered ${routes.length} routes + 404.html`);
