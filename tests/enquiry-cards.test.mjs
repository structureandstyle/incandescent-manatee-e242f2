/**
 * The picture-card enquiry form previews (options A and B, 14 Nov 2026).
 *
 * Two kinds of check. The rules in src/scripts/enquiry-cards.mjs, which
 * decide what the form would send: one plain value for the area, prompts and
 * the width line written into the job box, the email subject built as the
 * live form builds it. And the card drawings, held to the format in
 * src/components/enquiry-cards/art/README.md, so a later drawing cannot slip
 * in a logo, a stray colour or text.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  OTHER_AREA,
  addStarter,
  chosenLine,
  chosenName,
  dropEmptyStarters,
  otherAreaValue,
  previewRows,
  setWidthLine,
  subjectFor,
} from "../src/scripts/enquiry-cards.mjs";
import { SERVICE_ART } from "../src/components/enquiry-cards/art/services.ts";
import { AREA_ART } from "../src/components/enquiry-cards/art/areas.ts";
import { SOURCE_ART } from "../src/components/enquiry-cards/art/sources.ts";

test("Somewhere else sends what was typed, one plain line", () => {
  assert.equal(otherAreaValue("  Finchley \n N3  "), "Finchley N3");
  assert.equal(otherAreaValue(""), OTHER_AREA);
  assert.equal(otherAreaValue("   "), OTHER_AREA);
  assert.equal(otherAreaValue(undefined), OTHER_AREA);
  assert.equal(Array.from(otherAreaValue("x".repeat(200))).length, 80);
});

test("a prompt starts a new line, once", () => {
  assert.deepEqual(addStarter("", "Room: "), { text: "Room: ", caret: 6 });
  assert.deepEqual(addStarter("Room: bedroom", "Rough sizes: "), {
    text: "Room: bedroom\nRough sizes: ",
    caret: "Room: bedroom\nRough sizes: ".length,
  });
  // Already there: the text is left alone and the cursor goes to that line's end.
  const twice = addStarter("Room: bedroom\nTiming: May", "Room: ");
  assert.equal(twice.text, "Room: bedroom\nTiming: May");
  assert.equal(twice.caret, "Room: bedroom".length);
});

test("a prompt tapped and never finished is not sent", () => {
  const starters = ["Room: ", "Rough sizes: ", "Needs to hold: ", "Timing: "];
  assert.equal(dropEmptyStarters("Room: main bedroom\nRough sizes: ", starters), "Room: main bedroom");
  assert.equal(dropEmptyStarters("Rough sizes:\nTiming: May", starters), "Timing: May");
  assert.equal(dropEmptyStarters("Two alcoves, 1m each.", starters), "Two alcoves, 1m each.");
});

test("the width line goes first and replaces an earlier pick", () => {
  assert.equal(setWidthLine("", "Rough width: 2 to 3m"), "Rough width: 2 to 3m");
  assert.equal(setWidthLine("Box room.", "Rough width: 2 to 3m"), "Rough width: 2 to 3m\nBox room.");
  assert.equal(
    setWidthLine("Rough width: 2 to 3m\nBox room.", "Rough width: up to 1m"),
    "Rough width: up to 1m\nBox room.",
  );
  // Moved by the visitor: replaced where it is, never stacked.
  assert.equal(
    setWidthLine("Box room.\nRough width: 2 to 3m", "Rough width: over 4m"),
    "Box room.\nRough width: over 4m",
  );
});

test("the email subject is built as the live form builds it", () => {
  assert.equal(
    subjectFor({ name: "Nuno", services: ["Alcove units and shelving"], area: "Hendon" }),
    "Website enquiry from Nuno: Alcove units and shelving, Hendon",
  );
  assert.equal(subjectFor({ name: "Nuno" }), "Website enquiry from Nuno");
  assert.equal(subjectFor({ name: "  " }), "");
  // Links and invisible characters go, line breaks become spaces.
  assert.equal(
    subjectFor({ name: "Cam​den\nLee", area: "see www.example.com" }),
    "Website enquiry from Camden Lee: see",
  );
  const long = subjectFor({ name: "A", services: ["x".repeat(300)] });
  assert.equal(Array.from(long).length, 150);
  assert.ok(long.endsWith("..."));
});

test("the chosen line names what is ticked", () => {
  assert.equal(chosenLine(["Fitted wardrobes", "Flooring"]), "Chosen: Fitted wardrobes, Flooring");
  assert.equal(chosenLine([]), "");
  assert.equal(chosenName(OTHER_AREA, "Finchley"), "Somewhere else: Finchley");
  assert.equal(chosenName(OTHER_AREA, OTHER_AREA), OTHER_AREA);
  assert.equal(chosenName("Camden", "Camden"), "Camden");
});

test("the preview table lists fields in Netlify's order, services joined, honeypot left out", () => {
  const rows = previewRows([
    ["subject", "Website enquiry from Sam: Flooring, Camden"],
    ["landing_page", ""],
    ["company-website", ""],
    ["name", "Sam"],
    ["phone", "07700 900123"],
    ["email", "sam@example.com"],
    ["service", "Flooring"],
    ["service", "Panelling and doors"],
    ["area", "Camden"],
    ["detail", ""],
    ["source", "Google Maps"],
  ]);
  assert.deepEqual(
    rows.map((r) => r.field),
    ["subject", "name", "phone", "email", "service", "area", "detail", "attachment", "source"],
  );
  assert.equal(rows.find((r) => r.field === "service").value, "Flooring, Panelling and doors");
  assert.equal(rows.find((r) => r.field === "area").goesTo, "Log: Area");
  assert.equal(rows.find((r) => r.field === "detail").value, "");
});

/* ---- The drawings ------------------------------------------------------- */

const ALLOWED_CLASSES = new Set(["k", "t", "h", "g", "gt", "f", "pf", "gw", "gd", "w", "r", "s", "rl", "m"]);
const ALLOWED_TAGS = new Set(["path", "line", "rect", "circle", "ellipse", "polyline", "polygon"]);
const ART = { ...SERVICE_ART, ...AREA_ART, ...SOURCE_ART };

/* Every id the cards name (choices.ts), read from its source text: that file
   imports the site data without file extensions, which plain Node cannot
   load, so the ids are matched rather than imported. */
const choices = readFileSync(new URL("../src/components/enquiry-cards/choices.ts", import.meta.url), "utf8");
const AREAS = readFileSync(new URL("../src/data/site.ts", import.meta.url), "utf8")
  .match(/areaServed:\s*\[([\s\S]*?)\]/)[1]
  .match(/"([^"]+)"/g)
  .map((s) => s.slice(1, -1).toLowerCase().replace(/[^a-z0-9]+/g, "-"));
const NAMED = [
  ...[...choices.matchAll(/art:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]),
  ...[...choices.matchAll(/:\s*"([a-z0-9-]+)",?\s*$/gm)].map((m) => m[1]).filter((id) => id in SERVICE_ART),
  ...AREAS,
];

test("every card has a drawing", () => {
  const missing = [...new Set(NAMED)].filter((id) => !(id in ART));
  assert.deepEqual(missing, []);
});

test("every drawing keeps to the format: allowed elements, one palette class each, no colour or text", () => {
  for (const [id, markup] of Object.entries(ART)) {
    assert.ok(markup.length < 1400, `${id} is ${markup.length} characters`);
    assert.doesNotMatch(markup, /\b(style|fill|stroke|transform|id|href)=/, `${id} carries a banned attribute`);
    // Square corners: an ellipse needs rx, a rectangle never has one.
    assert.doesNotMatch(markup, /<rect\b[^>]*\br[xy]=/, `${id} rounds a rectangle's corners`);
    assert.doesNotMatch(markup, /<(text|image|use|g|svg|defs|linearGradient|filter)\b/, `${id} carries a banned element`);
    const tags = [...markup.matchAll(/<([a-z]+)\b([^>]*)\/?>/g)];
    assert.ok(tags.length > 0, `${id} is empty`);
    for (const [, tag, attrs] of tags) {
      assert.ok(ALLOWED_TAGS.has(tag), `${id}: <${tag}> is not allowed`);
      const cls = attrs.match(/\bclass="([^"]*)"/)?.[1];
      assert.ok(cls && ALLOWED_CLASSES.has(cls), `${id}: <${tag}> class "${cls}" is not in the palette`);
    }
  }
});

test("each area map has exactly one marker", () => {
  for (const [id, markup] of Object.entries(AREA_ART)) {
    assert.equal([...markup.matchAll(/class="m"/g)].length, 1, `${id} needs one marker square`);
  }
});
