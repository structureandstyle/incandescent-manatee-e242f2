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
