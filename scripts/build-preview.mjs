#!/usr/bin/env node
/**
 * The client-preview build, for a static host.
 *
 *     npm run build:preview
 *
 * Built for Cloudflare Pages (direct upload), and it works on any static host
 * that reads a `_headers` file. It runs the ordinary production build and then
 * makes three changes to `dist/`, all of them preview-only.
 *
 * WHY A HOSTED PREVIEW RATHER THAN A TUNNEL. A tunnel lives on somebody's
 * laptop: close the lid and the client's link dies, and the free ones rotate
 * their hostname while you are not looking, which is worse than no link at all
 * because it breaks after you have sent it. A preview somebody is meant to
 * inspect over several days has to be hosted.
 *
 * WHY A SCRIPT AND NOT public/_headers or a component flag. Anything in public/
 * ships with every build including production, and a noindex header on the live
 * site would take the whole thing out of Google. Everything here happens to
 * `dist/`, which is disposable and gitignored, so none of it can reach
 * production: that runs `build:production`, which never calls this.
 *
 * ---------------------------------------------------------------------------
 * 1. noindex, on every response
 *
 * A hosted preview is a public URL serving an entire site before it launches.
 * Nothing links to it, but "nothing links to it" is not a crawl policy: the URL
 * travels by email and WhatsApp, previews get forwarded, and a second copy of a
 * site indexed ahead of the real one is slow and annoying to undo. noindex is
 * the signal that actually means do not index. robots.txt only asks a crawler
 * not to fetch, and a URL it has never fetched can still be indexed from a link.
 *
 * IT IS DONE TWICE, ON PURPOSE. The `_headers` file is the clean way and every
 * static host reads it, but Cloudflare's own documentation describes it as
 * belonging in the build output directory without saying plainly whether a
 * direct upload counts, and this is not a thing to be approximately sure about:
 * if the header is silently ignored, the whole of an unlaunched client site is
 * crawlable. So every page also carries a robots meta tag in its own head,
 * which no host can decline to serve. Belt and braces, because the failure is
 * invisible and expensive and the second belt costs one line.
 *
 * 2. Analytics cannot fire, whatever anyone clicks
 *
 * The site is consent-gated, so nothing loads until a visitor accepts. But a
 * client reviewing a website will accept, because accepting is what you do with
 * a cookie banner, and then his own live GA4 property collects sessions from a
 * pages.dev hostname. Worse, the enquiry journey below ends on /thanks/, which
 * fires `enquiry_form`: that is the event the commission evidence rests on from
 * 11 November, and a test conversion in it is not something you can cleanly take
 * back out.
 *
 * So the Google tag URL is rewritten to something inert. The cookie notice still
 * renders and still works, because it is part of the site he is reviewing, but
 * accepting loads nothing. The four enquiry events still push to `dataLayer`,
 * where they sit in an array nobody reads: exactly what Base.astro already
 * describes for a visitor who declines.
 *
 * 3. The enquiry form completes its journey
 *
 * Netlify Forms is a Netlify feature and this preview is not on Netlify, so the
 * POST has nowhere to go: on a static host it fails. Measured against a plain
 * static server, a submission returns 404. The client will fill that form in,
 * because it is the most interesting thing on the page and he has been asked to
 * review the site, and an error at the end of it reads as "the website is
 * broken" rather than "this is a preview".
 *
 * So a small script intercepts the submit and goes to /thanks/, which is what
 * Netlify will do in production. Nothing is recorded, and that is correct: a
 * preview must not be able to manufacture a lead, and the real form test is a
 * separate deliberate act against the real deploy.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

/* 1. ----------------------------------------------------------------------- */
writeFileSync(
  join(DIST, "_headers"),
  `# PREVIEW BUILD ONLY, written by scripts/build-preview.mjs.
# Never deploy this directory to production: the rule below takes every page
# out of Google. Production headers live in netlify.toml.
/*
  X-Robots-Tag: noindex, nofollow
`
);

/* The banner a reviewer sees, so nobody mistakes the preview for the live site
   in a screenshot six months from now. Appended before </body> alongside the
   form handler below. */
const PREVIEW_SCRIPT = `<script>
/* Preview build. Injected by scripts/build-preview.mjs, never in production. */
document.addEventListener("submit", function (e) {
  var f = e.target;
  if (!f || f.getAttribute("name") !== "enquiry") return;
  /* Netlify Forms does not exist on this host, so the POST would fail. Go
     where a real submission goes and record nothing. */
  e.preventDefault();
  location.assign("/thanks/");
});
</script>`;

const GTAG = "https://www.googletagmanager.com/gtag/js?id=";
const GTAG_DEAD = "about:blank#analytics-disabled-on-preview&id=";

const ROBOTS_META = '<meta name="robots" content="noindex,nofollow">';

let pages = 0;
let analyticsNeutralised = 0;
let robotsAdded = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walk(full);
      continue;
    }
    if (!entry.endsWith(".html")) continue;
    let html = readFileSync(full, "utf8");

    /* 1b. The second belt: a robots meta in the page's own head. Pages already
       held back by their gate carry one, so this only adds what is missing. */
    if (!/<meta\s+name="robots"/i.test(html)) {
      html = html.replace(/<head>/i, `<head>${ROBOTS_META}`);
      robotsAdded += 1;
    }

    /* 2. */
    if (html.includes(GTAG)) {
      html = html.split(GTAG).join(GTAG_DEAD);
      analyticsNeutralised += 1;
    }

    /* 3. */
    html = html.includes("</body>")
      ? html.replace("</body>", `${PREVIEW_SCRIPT}</body>`)
      : html + PREVIEW_SCRIPT;

    writeFileSync(full, html);
    pages += 1;
  }
}
walk(DIST);

console.log("");
console.log(`  Preview build ready in dist/  (${pages} pages)`);
console.log("    - X-Robots-Tag: noindex, nofollow on every response");
console.log(`    - robots noindex meta in every head (${robotsAdded} added, rest already had one)`);
console.log(`    - analytics cannot load (${analyticsNeutralised} pages rewritten)`);
console.log("    - the enquiry form completes to /thanks/ and records nothing");
console.log("");
console.log("  Upload dist/ to Cloudflare Pages as a direct upload.");
console.log("  DO NOT deploy this directory to production.");
console.log("");
