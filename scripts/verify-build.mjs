#!/usr/bin/env node
/**
 * The merge gate. Run against `dist/` after `astro build`.
 *
 *     npm run build && npm run verify
 *
 * Modelled on `verify()` in the Flow to Form document kit (`brand/f2f_doc.py`),
 * which greps a built PDF for the things that must never ship. Same idea, same
 * job, applied to built HTML.
 *
 * The rule that matters
 * ---------------------
 * This does NOT fail merely because placeholders exist. It has to be possible to
 * build and preview the site while the client's answers are outstanding, which
 * is the entire point of the branch deploy. What it refuses is an INDEXABLE page
 * that still carries an open question. A page keeps its noindex until its gate
 * in src/data/page-gates.ts is satisfied, so the only way to trip this is to
 * publish something unfinished, which is exactly what should fail.
 *
 * Factual and style breaches fail everywhere, indexable or not, because they are
 * errors rather than incompleteness. A draft page carrying a claim the client
 * has told us is false is not a draft, it is wrong.
 */

import { readdir, readFile } from "node:fs/promises";
import { join, sep } from "node:path";

const DIST = "dist";

/**
 * Absolute factual limits from the client's tone protocol, section 10, and
 * confirmed by the content questionnaire: "You do not have your own workshop:
 * materials are cut to size by a workshop you use."
 *
 * Deliberately narrow. A blunt ban on "workshop" would be wrong, because Q22
 * offers "precision cut by a trusted workshop partner" as acceptable wording.
 * What is false is claiming the workshop, the bench, or the manufacturing as
 * his, and any plural that implies staff he does not have.
 */
const FACTUAL = [
  [/\b(our|my|the) workshop\b/gi, "claims a workshop; he has none (Q3)"],
  [/\b(in|at|to) the workshop\b/gi, "places work in a workshop he does not have (Q3)"],
  [/\bbench\s*work\b/gi, "benchwork; the making stage is unknown until Q-stage04"],
  [/\bon the bench\b/gi, "on the bench; he has no bench (Q3)"],
  [/\bbench is booked\b/gi, "bench booked; use lead time wording from Q7"],
  [/\bwe manufacture\b/gi, "claims manufacturing (protocol 10)"],
  [/\bwe (build|make)\b/gi, "claims making (protocol 5 provenance ban)"],
  [/\b(builds|makes) and fits\b/gi, "claims making in third person (protocol 5)"],
  [/\b(our|the|a) (team|crew|joiners|craftsmen|fitters)\b/gi, "crew noun; he works alone (Q6)"],
  [/\bwe are a team\b/gi, "crew noun; he works alone (Q6)"],
  [/\bcut on site\b/gi, "promises work is cut on site (protocol 10)"],
  [/\bguaranteed response\b/gi, "guaranteed response time (protocol 10)"],
];

/** House style, from the F2F writing standard and the document kit's verify(). */
const STYLE = [
  [/—/g, "em dash, banned in client-facing copy"],
  [/Structure&style/g, "legacy brand spelling bug"],
  [/\b(AI-powered|cutting-edge|seamless|leverage|revolutionise|founding client)\b/gi, "banned word"],
];

/** Hand-typed placeholders, the convention the document kit already greps for. */
const RAW_PLACEHOLDER = /\[[A-Z][A-Z _/]{3,}\]|\bTBC\b|\bTODO\b|\bXXX\b|\bLorem\b/g;
const SITE_URL = "https://structureandstyle.co.uk";
const BUSINESS_ID = `${SITE_URL}/#business`;
const SERVICE_PATHS = new Set([
  "/fitted-wardrobes/",
  "/walk-in-wardrobes/",
  "/alcove-units/",
  "/media-walls/",
  "/bespoke-kitchens/",
]);
const BREADCRUMB_PATHS = new Set([...SERVICE_PATHS, "/fitted-wardrobe-cost/"]);

function verifySchema(html, page, errors) {
  const scripts = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (scripts.length !== 1) {
    errors.push(`${page}  expected one JSON-LD script, found ${scripts.length}`);
    return;
  }

  let nodes;
  try {
    const parsed = JSON.parse(scripts[0][1]);
    nodes = Array.isArray(parsed) ? parsed : parsed["@graph"] ?? [parsed];
    if (!Array.isArray(nodes)) throw new Error("schema graph is not an array");
  } catch (error) {
    errors.push(`${page}  invalid JSON-LD: ${error.message}`);
    return;
  }

  for (const node of nodes) {
    if (node?.["@context"] !== "https://schema.org" || !node["@type"]) {
      errors.push(`${page}  schema node needs schema.org context and a type`);
    }
  }

  const ofType = (type) => nodes.filter((node) => node?.["@type"] === type);
  const business = ofType("HomeAndConstructionBusiness");
  if (business.length !== 1) {
    errors.push(`${page}  expected one HomeAndConstructionBusiness node`);
  } else {
    const entity = business[0];
    if (entity["@id"] !== BUSINESS_ID || entity.name !== "Structure & Style" || entity.url !== `${SITE_URL}/`) {
      errors.push(`${page}  business identity does not match the canonical site`);
    }
    if (entity.telephone !== "+447309872555") {
      errors.push(`${page}  business telephone is not in international format`);
    }
    if (entity.logo !== `${SITE_URL}/icon-512.png` || entity.image !== `${SITE_URL}/og-default.jpg`) {
      errors.push(`${page}  business logo or image is missing or varies by page`);
    }
    if ("aggregateRating" in entity || "review" in entity) {
      errors.push(`${page}  business schema must not mark up its own reviews`);
    }
  }

  const websites = ofType("WebSite");
  if (page === "/") {
    if (websites.length !== 1 || websites[0].name !== "Structure & Style" || websites[0].url !== `${SITE_URL}/`) {
      errors.push(`${page}  homepage needs one WebSite node with the preferred site name`);
    }
  } else if (websites.length) {
    errors.push(`${page}  WebSite name markup belongs on the homepage only`);
  }

  if (ofType("FAQPage").length) {
    errors.push(`${page}  obsolete FAQPage markup is present`);
  }

  const services = ofType("Service");
  if (SERVICE_PATHS.has(page)) {
    if (services.length !== 1 || services[0].url !== `${SITE_URL}${page}` || services[0].provider?.["@id"] !== BUSINESS_ID) {
      errors.push(`${page}  service schema is missing or does not match the page`);
    }
  } else if (services.length) {
    errors.push(`${page}  Service schema is present on a non-service page`);
  }

  const breadcrumbs = ofType("BreadcrumbList");
  if (BREADCRUMB_PATHS.has(page)) {
    const items = breadcrumbs[0]?.itemListElement;
    if (breadcrumbs.length !== 1 || !Array.isArray(items) || items.length !== 2 ||
        items[0]?.position !== 1 || items[0]?.item !== `${SITE_URL}/` ||
        items[1]?.position !== 2 || items[1]?.item !== `${SITE_URL}${page}`) {
      errors.push(`${page}  breadcrumb schema is missing or does not match the page`);
    }
  } else if (breadcrumbs.length) {
    errors.push(`${page}  unexpected breadcrumb schema`);
  }

  if (page.startsWith("/journal/") && page !== "/journal/") {
    const posts = ofType("BlogPosting");
    const post = posts[0];
    if (posts.length !== 1 || !post.headline || !post.datePublished || !post.dateModified ||
        !post.image || !post.author?.name || !post.author?.url ||
        post.publisher?.["@id"] !== BUSINESS_ID || post.mainEntityOfPage !== `${SITE_URL}${page}`) {
      errors.push(`${page}  article schema needs headline, dates, image, author, publisher and page URL`);
    }
  }
}

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

/** Visible text only. Script and style contents are not copy and must not be scanned. */
function visibleText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&hairsp;|&#8202;/g, "")
    .replace(/\s+/g, " ");
}

/** Numbered questions read as Q7; the unnumbered making-stage one reads as
    "stage 04", so prefixing it with Q produced "Qstage 04". */
const label = (q) => (/^\d+$/.test(q) ? `Q${q}` : q.replace(/^./, (c) => c.toUpperCase()));

const files = await htmlFiles(DIST).catch(() => {
  console.error(`No ${DIST}/ directory. Run \`npm run build\` first.`);
  process.exit(2);
});

const errors = [];
const drafts = [];
const held = [];
const openQuestions = new Set();

for (const file of files) {
  const html = await readFile(file, "utf8");
  const text = visibleText(html);
  // Normalise separators: this runs on Windows, and a report full of
  // backslashes does not match the URLs it is talking about.
  const page = file.split(sep).join("/").replace(/^dist/, "").replace(/index\.html$/, "") || "/";

  const noindex = /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html);
  const asks = [...html.matchAll(/data-q="([^"]+)"/g)].map((m) => m[1]);
  const raw = [...text.matchAll(RAW_PLACEHOLDER)].map((m) => m[0]);

  verifySchema(html, page, errors);

  asks.forEach((q) => openQuestions.add(q));

  // Held back but carrying no open question: its gate is unsatisfied even
  // though nothing on the page is visibly marked. Worth naming, otherwise a
  // page can sit out of the index indefinitely without anyone noticing.
  if (noindex && !asks.length && !raw.length) held.push(page);

  if (asks.length || raw.length) {
    if (noindex) {
      drafts.push({ page, asks: [...new Set(asks)], raw: [...new Set(raw)] });
    } else {
      errors.push(
        `${page}  INDEXABLE but unfinished: ${asks.length} open question(s)` +
          `${asks.length ? ` (${[...new Set(asks)].join(", ")})` : ""}` +
          `${raw.length ? `, raw placeholder(s): ${[...new Set(raw)].join(", ")}` : ""}`
      );
    }
  }

  for (const [re, why] of [...FACTUAL, ...STYLE]) {
    const hits = [...new Set([...text.matchAll(re)].map((m) => m[0]))];
    if (hits.length) errors.push(`${page}  ${why}: ${hits.map((h) => JSON.stringify(h)).join(", ")}`);
  }
}

console.log(`Scanned ${files.length} page(s) in ${DIST}/.`);

if (drafts.length) {
  console.log(`\n${drafts.length} page(s) held back as drafts, correctly noindexed:`);
  for (const d of drafts) {
    const bits = [...d.asks.map(label), ...d.raw];
    console.log(`  ${d.page}  waiting on ${bits.join(", ")}`);
  }
}

if (held.length) {
  console.log(`\n${held.length} page(s) noindexed by their gate but carrying no open question:`);
  for (const p of held) console.log(`  ${p}`);
  console.log("  (their gate in src/data/page-gates.ts is unsatisfied; check it is still right)");
}

if (openQuestions.size) {
  const sorted = [...openQuestions].sort((a, b) =>
    a.localeCompare(b, "en", { numeric: true })
  );
  console.log(`\nOutstanding questions across the site: ${sorted.map(label).join(", ")}`);
}

if (errors.length) {
  console.error(`\nVERIFY FAILED, ${errors.length} problem(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log("\nVerify passed. Nothing indexable is unfinished, and no factual or style breaches.");
