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
 *
 * Two checks added with the first area page, 3 October 2026, both failing
 * everywhere because both are errors rather than incompleteness:
 *
 *   1. Every <blockquote> on every page must be, whole, one entry of the
 *      review bank (src/data/quote-bank.json). Reviews are quoted unedited or
 *      not at all; this is what makes "never trim a review" mechanical rather
 *      than a matter of someone remembering it.
 *   2. Every £ figure on an area page must also appear on one of the service
 *      pages or the cost guide in the same build. An area page types its
 *      guide prices; this stops them drifting from the pages that own them.
 *      An area path registered below with no built page fails too, since
 *      otherwise its rules would silently never run.
 */

import { readFileSync } from "node:fs";
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
/* The area pages (src/data/areas.ts). Hard-coded like SERVICE_PATHS: this
   script is plain Node and reads nothing from src but the review bank. Add a
   path here in the same commit as its page, or its breadcrumb fails. */
const AREA_PATHS = new Set(["/carpenter-hampstead/", "/carpenter-hampstead-design/"]);
const BREADCRUMB_PATHS = new Set([...SERVICE_PATHS, ...AREA_PATHS, "/fitted-wardrobe-cost/"]);
const isArticle = (page) => page.startsWith("/journal/") && page !== "/journal/";
/** The pages that own the guide prices an area page repeats. */
const PRICE_SOURCE_PATHS = new Set([...SERVICE_PATHS, "/fitted-wardrobe-cost/"]);

/** Whitespace collapsed to single spaces and trimmed: how quote text is compared. */
const squash = (s) => s.replace(/\s+/g, " ").trim();

/* The review bank, read from beside this script rather than from the working
   directory, so the gate checks against the bank whatever it is run from. */
const QUOTE_BANK = new Set(
  JSON.parse(readFileSync(new URL("../src/data/quote-bank.json", import.meta.url), "utf8")).map((q) =>
    squash(q.text)
  )
);

/** Entity decoding for the text inside a tag: the five named ones Astro emits, and numeric forms. */
function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

/** Every blockquote's text, tags stripped, entities decoded, whitespace squashed. */
function blockquotes(html) {
  return [...html.matchAll(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi)].map((m) =>
    squash(decodeEntities(m[1].replace(/<[^>]+>/g, " ")))
  );
}

/** £ figures as written: £2,300, £10,000, £5. A trailing comma is punctuation, not the figure. */
const prices = (text) => [...new Set([...text.matchAll(/£\d{1,3}(?:,\d{3})+|£\d+/g)].map((m) => m[0]))];

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
  if (isArticle(page)) {
    // Journal articles carry Home > Journal > article (allowed 11 Oct 2026).
    const items = breadcrumbs[0]?.itemListElement;
    if (breadcrumbs.length !== 1 || !Array.isArray(items) || items.length !== 3 ||
        items[0]?.position !== 1 || items[0]?.item !== `${SITE_URL}/` ||
        items[1]?.position !== 2 || items[1]?.item !== `${SITE_URL}/journal/` ||
        items[2]?.position !== 3 || items[2]?.item !== `${SITE_URL}${page}`) {
      errors.push(`${page}  article breadcrumb schema is missing or does not match the page`);
    }
  } else if (BREADCRUMB_PATHS.has(page)) {
    const items = breadcrumbs[0]?.itemListElement;
    if (breadcrumbs.length !== 1 || !Array.isArray(items) || items.length !== 2 ||
        items[0]?.position !== 1 || items[0]?.item !== `${SITE_URL}/` ||
        items[1]?.position !== 2 || items[1]?.item !== `${SITE_URL}${page}`) {
      errors.push(`${page}  breadcrumb schema is missing or does not match the page`);
    }
  } else if (breadcrumbs.length) {
    errors.push(`${page}  unexpected breadcrumb schema`);
  }

  /* An area page describes itself as a WebPage about the one business. It
     adds no business node of its own (the single HomeAndConstructionBusiness
     check above holds for it too), and Service stays banned off the service
     paths. */
  if (AREA_PATHS.has(page)) {
    const pages = ofType("WebPage");
    if (pages.length !== 1 || pages[0].url !== `${SITE_URL}${page}` || pages[0].about?.["@id"] !== BUSINESS_ID) {
      errors.push(`${page}  area page needs one WebPage node with this page's url, about the business`);
    }
  }

  if (isArticle(page)) {
    const posts = ofType("BlogPosting");
    const post = posts[0];
    if (posts.length !== 1 || !post.headline || !post.datePublished || !post.dateModified ||
        !post.image || !post.author?.name || !post.author?.url ||
        post.publisher?.["@id"] !== BUSINESS_ID || post.mainEntityOfPage !== `${SITE_URL}${page}`) {
      errors.push(`${page}  article schema needs headline, dates, image, author, publisher and page URL`);
    }
  }
}

/**
 * The homepage review count and average come from src/data/reviews.json, which
 * F2F's Make scenario "S&S Google review count to site" rewrites from the
 * Business Profile API. Whatever writes it, a value outside the contract in
 * docs/reviews-count.md fails the build, so Netlify keeps the previous deploy
 * live rather than publishing a bad number. A missing or unparsable file fails
 * the same way. It also checks that the built homepage shows the file's
 * numbers, so the count cannot quietly go back to being typed by hand.
 *
 * The file is the one thing an automation is allowed to write on this site, so
 * it is held to exactly its three keys and a small size: nothing else can ride
 * in through it.
 */
const REVIEWS_FILE = "src/data/reviews.json";
const REVIEWS_KEYS = ["average", "count", "updated"];
const REVIEWS_MAX_BYTES = 200;

async function verifyReviews(errors) {
  let text;
  let data;
  try {
    // A byte order mark is not valid JSON, but the build reads such a file fine.
    text = (await readFile(REVIEWS_FILE, "utf8")).replace(/^\uFEFF/, "");
    data = JSON.parse(text);
  } catch (error) {
    errors.push(`${REVIEWS_FILE}  missing or not valid JSON: ${error.message}`);
    return;
  }

  if (Buffer.byteLength(text, "utf8") > REVIEWS_MAX_BYTES) {
    errors.push(`${REVIEWS_FILE}  is larger than ${REVIEWS_MAX_BYTES} bytes; it holds three short values`);
    return;
  }
  const keys = data && typeof data === "object" && !Array.isArray(data) ? Object.keys(data).sort() : [];
  if (keys.join(",") !== REVIEWS_KEYS.join(",")) {
    errors.push(`${REVIEWS_FILE}  must hold exactly ${REVIEWS_KEYS.join(", ")}, found ${JSON.stringify(keys)}`);
    return;
  }

  const { count, average, updated } = data;
  const problems = [];
  if (!Number.isInteger(count) || count < 1 || count > 1000) {
    problems.push(`count must be a whole number from 1 to 1000, found ${JSON.stringify(count)}`);
  }
  if (typeof average !== "number" || !Number.isFinite(average) || average < 1 || average > 5) {
    problems.push(`average must be a JSON number from 1 to 5, found ${JSON.stringify(average)}`);
  }
  if (typeof updated !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(updated)) {
    problems.push(`updated must be a YYYY-MM-DD date, found ${JSON.stringify(updated)}`);
  }
  if (problems.length) {
    for (const p of problems) errors.push(`${REVIEWS_FILE}  ${p}`);
    return;
  }

  const home = visibleText(await readFile(join(DIST, "index.html"), "utf8").catch(() => ""));
  // Same rounding as REVIEWS.average in site-content.ts: halves round up.
  const shown = (Math.round(average * 10) / 10).toFixed(1);
  // Wording since 6 Nov 2026 (Reviews.astro): "5.0 out of 5", the last words
  // for screen readers, and "From 20 Google reviews".
  if (!new RegExp(`\\b${count} Google reviews\\b`).test(home) || !home.includes(`${shown} out of 5`)) {
    errors.push(`/  homepage does not show ${count} Google reviews at ${shown} out of 5, as ${REVIEWS_FILE} says`);
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
/** Visible text by page, for the checks that compare one page with another. */
const texts = new Map();

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

  // A draft article renders only on preview builds (src/data/journal.ts). If
  // one reaches a production build, the gate has failed: stop the deploy.
  if (process.env.CONTEXT === "production" && html.includes("data-journal-draft")) {
    errors.push(`${page}  draft journal content in a production build`);
  }

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

  // Founder rule, 6 Nov 2026: no FAQ answer, and no sentence inside one, opens
  // with "Yes" or "No" as the reply ("Yes. ...", "No, ...", "Yes, because ...").
  // The answer leads with the fact. "No two alcoves ..." is a determiner, not a
  // reply, so only Yes/No followed by punctuation or the end counts.
  for (const m of html.matchAll(/<details\b[^>]*\bss-faq\b[^>]*>[\s\S]*?<\/summary>\s*<p\b[^>]*>([\s\S]*?)<\/p>/g)) {
    const answer = visibleText(m[1]).trim();
    for (const sentence of answer.split(/(?<=[.!?])\s+/)) {
      if (/^(Yes|No)\b\s*([.,;:!–-]|$)/i.test(sentence.trim())) {
        errors.push(`${page}  FAQ answer sentence starts with Yes/No, lead with the fact: ${JSON.stringify(sentence.trim().slice(0, 70))}`);
      }
    }
  }

  for (const [re, why] of [...FACTUAL, ...STYLE]) {
    const hits = [...new Set([...text.matchAll(re)].map((m) => m[0]))];
    if (hits.length) errors.push(`${page}  ${why}: ${hits.map((h) => JSON.stringify(h)).join(", ")}`);
  }

  // Reviews are quoted whole or not at all, on every page.
  for (const quote of blockquotes(html)) {
    if (!QUOTE_BANK.has(quote)) {
      errors.push(`${page}  blockquote text is not a verbatim bank entry: ${JSON.stringify(quote.slice(0, 60))}...`);
    }
  }

  texts.set(page, text);
}

// An area page's guide prices must each appear on a page that owns them.
for (const page of AREA_PATHS) {
  const text = texts.get(page);
  // A registered area path with no built page means its WebPage and price
  // rules never ran: a renamed or deleted page must not pass silently.
  if (text === undefined) {
    errors.push(`${page}  registered in AREA_PATHS but not in this build`);
    continue;
  }
  const owned = new Set([...PRICE_SOURCE_PATHS].flatMap((p) => prices(texts.get(p) ?? "")));
  const stray = prices(text).filter((p) => !owned.has(p));
  if (stray.length) {
    errors.push(`${page}  price(s) not on any service page or the cost guide in this build: ${stray.join(", ")}`);
  }
}

await verifyReviews(errors);

console.log(`Scanned ${files.length} page(s) in ${DIST}/.`);

if (drafts.length) {
  console.log(`\n${drafts.length} page(s) held back as drafts, correctly noindexed:`);
  for (const d of drafts) {
    // Sorted as the site-wide line below is, not in markup order.
    const asks = [...d.asks].sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
    const bits = [...asks.map(label), ...d.raw];
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
