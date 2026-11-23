/**
 * Simulations for scripts/verify-build.mjs, the merge gate.
 *
 * Each case writes a small dist/ into a temporary directory and runs the real
 * script there, exactly as `npm run verify` does after a build. No Astro build
 * is needed. The cases are the area-page rules added 3 October 2026: the
 * breadcrumb registration and WebPage rule for area paths, the blockquote
 * guard against the review bank, and the price-subset check, plus the gate
 * itself (an area page with open questions passes as a noindexed draft and
 * fails as soon as it is indexable).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("../scripts/verify-build.mjs", import.meta.url));
const BANK = JSON.parse(readFileSync(new URL("../src/data/quote-bank.json", import.meta.url), "utf8"));
const SITE = "https://structureandstyle.co.uk";
const AREA = "/carpenter-hampstead/";
const PAGE_ORDER = ["areaHampstead1", "areaHampstead3", "areaHampstead2", "areaHampstead4"];

const business = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "@id": `${SITE}/#business`,
  name: "Structure & Style",
  url: `${SITE}/`,
  telephone: "+447309872555",
  logo: `${SITE}/icon-512.png`,
  image: `${SITE}/og-default.jpg`,
};
const breadcrumb = (path, name) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name, item: `${SITE}${path}` },
  ],
});
const webPage = (path) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE}${path}#webpage`,
  url: `${SITE}${path}`,
  about: { "@id": `${SITE}/#business` },
  spatialCoverage: { "@type": "Place", name: "Hampstead" },
});

/** HTML-escaped as Astro escapes an expression: & < > " and the apostrophe. */
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const quote = (text) => `<blockquote style="white-space:pre-line">${esc(text)}</blockquote>`;
const ask = (q, text) =>
  `<span class="ask" data-q="${q}"><span class="sr-only">Open question ${q}: </span>[&hairsp;${esc(text)}&hairsp;]</span>`;

const ozge = BANK.find((q) => q.id.startsWith("ozge")).text;

function html({ noindex = false, nodes = [], body = "" }) {
  return (
    `<!doctype html><html lang="en-GB"><head><title>t</title>` +
    (noindex ? `<meta name="robots" content="noindex,nofollow">` : "") +
    `<script type="application/ld+json">${JSON.stringify([business, ...nodes])}</script>` +
    `</head><body><main>${body}</main></body></html>`
  );
}

/** The area page as the build renders it with every key open, overridable per case. */
function areaPage(over = {}) {
  return {
    noindex: true,
    nodes: [webPage(AREA), breadcrumb(AREA, "Hampstead")],
    body:
      `<p>Every figure below is a starting price. Fitted wardrobes start from £2,300.</p>` +
      `<p>Bespoke kitchens typically start from £10,000, and more.</p>` +
      /* In the order the built page renders them (C3's bullets come before
         C2's sentence), so the draft report's sort is tested, not assumed. */
      PAGE_ORDER.map((k) => `<p>${ask(k, "a sentence waiting on the client")}</p>`).join("") +
      quote(ozge),
    ...over,
  };
}

/** The cost guide owns the prices the area page repeats. */
const costGuide = {
  nodes: [breadcrumb("/fitted-wardrobe-cost/", "What fitted wardrobes cost")],
  body: `<p>From £2,300.</p><p>Bespoke kitchens from £10,000</p>`,
};

/* verify-build also checks that the homepage shows the count and average in
   src/data/reviews.json (site PR #15). A noindexed home stub that says them
   keeps that check out of the way of the area-page cases. */
const REVIEWS_DATA = JSON.parse(readFileSync(new URL("../src/data/reviews.json", import.meta.url), "utf8").replace(/^﻿/, ""));
const homeStub = {
  noindex: true,
  nodes: [{ "@context": "https://schema.org", "@type": "WebSite", name: "Structure & Style", url: `${SITE}/` }],
  body: `<p>${(Math.round(REVIEWS_DATA.average * 10) / 10).toFixed(1)} out of 5 from ${REVIEWS_DATA.count} Google reviews</p>`,
};

/* The design-led copy of the Hampstead page (7 Nov 2026) was registered in
   AREA_PATHS until it was deleted on 12 Nov 2026, so the sandboxes no longer
   carry a stub for it.

   Since 14 Nov 2026 verify-build reads its area paths from src/data/areas.ts,
   which lists ten. Every area page a case does not supply gets a noindexed
   stub with its WebPage and breadcrumb, so the cases test Hampstead alone, as
   before. The stubs carry no prices, so the price rule never needs an owner
   for them. */
const OTHER_AREAS = [...readFileSync(new URL("../src/data/areas.ts", import.meta.url), "utf8")
  .matchAll(/^\s*slug:\s*"([a-z0-9/-]+)"/gm)]
  .map((m) => `/${m[1]}/`)
  .filter((p) => p !== AREA);
/* Under /areas/ the trail is Home > Areas > page (14 Nov 2026). */
const hubCrumb = (path, name) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
    { "@type": "ListItem", position: 2, name: "Areas", item: `${SITE}/areas/` },
    { "@type": "ListItem", position: 3, name, item: `${SITE}${path}` },
  ],
});
const areaStub = (path) => ({
  noindex: true,
  nodes: [webPage(path), path.startsWith("/areas/") ? hubCrumb(path, "Area") : breadcrumb(path, "Area")],
  body: "<p>Area.</p>",
});

function run(pages, { stubAreas = true } = {}) {
  const stubs = stubAreas ? Object.fromEntries(OTHER_AREAS.map((p) => [p, areaStub(p)])) : {};
  pages = { "/": homeStub, ...stubs, ...pages };
  const root = mkdtempSync(join(tmpdir(), "ss-verify-"));
  try {
    /* verify-build reads src/data/reviews.json from its working directory
       (the review count guard, site PR #15), so the sandbox carries the real one. */
    mkdirSync(join(root, "src", "data"), { recursive: true });
    writeFileSync(join(root, "src", "data", "reviews.json"), readFileSync(new URL("../src/data/reviews.json", import.meta.url)));
    for (const [path, page] of Object.entries(pages)) {
      const dir = join(root, "dist", ...path.split("/").filter(Boolean));
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, "index.html"), html(page));
    }
    const r = spawnSync(process.execPath, [SCRIPT], { cwd: root, encoding: "utf8" });
    return { code: r.status, out: `${r.stdout}\n${r.stderr}` };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("an area page with the four keys open passes as a noindexed draft", () => {
  const r = run({ [AREA]: areaPage(), "/fitted-wardrobe-cost/": costGuide });
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /\/carpenter-hampstead\/ {2}waiting on AreaHampstead1, AreaHampstead2, AreaHampstead3, AreaHampstead4/);
});

test("the same page forced indexable with the keys open fails", () => {
  const r = run({ [AREA]: areaPage({ noindex: false }), "/fitted-wardrobe-cost/": costGuide });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /\/carpenter-hampstead\/ {2}INDEXABLE but unfinished: 4 open question\(s\)/);
});

test("the whole Ozge review passes, entity-encoded", () => {
  const r = run({ [AREA]: areaPage({ noindex: false, body: quote(ozge) }), "/fitted-wardrobe-cost/": costGuide });
  assert.equal(r.code, 0, r.out);
});

test("a trimmed Ozge review fails", () => {
  const trimmed = ozge.split(". ").slice(0, 3).join(". ") + ".";
  const r = run({ [AREA]: areaPage({ body: quote(trimmed) }), "/fitted-wardrobe-cost/": costGuide });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /blockquote text is not a verbatim bank entry/);
});

test("one word changed inside a review fails", () => {
  const edited = ozge.replace("very happy", "really happy");
  const r = run({ [AREA]: areaPage({ body: quote(edited) }), "/fitted-wardrobe-cost/": costGuide });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /not a verbatim bank entry/);
});

test("the blockquote guard covers every page, not only area pages", () => {
  const r = run({ "/about/": { body: quote(ozge.slice(0, 100)) } });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /\/about\/ {2}blockquote text is not a verbatim bank entry/);
});

test("a price on the area page that no service page shows fails", () => {
  const r = run({
    [AREA]: areaPage({ body: `<p>Fitted wardrobes start from £2,400.</p>` }),
    "/fitted-wardrobe-cost/": costGuide,
  });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /price\(s\) not on any service page or the cost guide in this build: £2,400/);
});

test("prices fail when no service page is in the build to own them", () => {
  const r = run({ [AREA]: areaPage() });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /not on any service page/);
});

test("an area page without its WebPage node fails", () => {
  const r = run({ [AREA]: areaPage({ nodes: [breadcrumb(AREA, "Hampstead")] }), "/fitted-wardrobe-cost/": costGuide });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /area page needs one WebPage node/);
});

test("a WebPage node pointing at another URL fails", () => {
  const r = run({
    [AREA]: areaPage({ nodes: [webPage("/hampstead/"), breadcrumb(AREA, "Hampstead")] }),
    "/fitted-wardrobe-cost/": costGuide,
  });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /area page needs one WebPage node/);
});

test("a registered area path missing from the build fails", () => {
  const r = run({ "/fitted-wardrobe-cost/": costGuide });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /\/carpenter-hampstead\/ {2}registered in AREA_PATHS but not in this build/);
});

test("a breadcrumb on an unregistered path still fails", () => {
  const r = run({ "/primrose-hill/": { nodes: [breadcrumb("/primrose-hill/", "Primrose Hill")] } });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /\/primrose-hill\/ {2}unexpected breadcrumb schema/);
});

test("a Service node on an area page fails", () => {
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    url: `${SITE}${AREA}`,
    provider: { "@id": `${SITE}/#business` },
  };
  const r = run({
    [AREA]: areaPage({ nodes: [webPage(AREA), breadcrumb(AREA, "Hampstead"), service] }),
    "/fitted-wardrobe-cost/": costGuide,
  });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /Service schema is present on a non-service page/);
});

test("an area page under /areas/ needs the Home > Areas > page breadcrumb", () => {
  const path = "/areas/camden/";
  const ok = run({ [AREA]: areaPage(), [path]: { noindex: true, nodes: [webPage(path), hubCrumb(path, "Camden")], body: "<p>Camden.</p>" }, "/fitted-wardrobe-cost/": costGuide });
  assert.equal(ok.code, 0, ok.out);
  const flat = run({ [AREA]: areaPage(), [path]: { noindex: true, nodes: [webPage(path), breadcrumb(path, "Camden")], body: "<p>Camden.</p>" }, "/fitted-wardrobe-cost/": costGuide });
  assert.equal(flat.code, 1, flat.out);
  assert.match(flat.out, /\/areas\/camden\/ {2}area breadcrumb schema is missing or does not match Home > Areas > page/);
});
