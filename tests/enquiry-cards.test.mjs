/**
 * The enquiry form's picture cards (14 Nov 2026, EnquiryForm.astro).
 *
 * Three kinds of check. The rules in src/scripts/enquiry-cards.mjs, which
 * decide what the form sends: one plain value for the area, and the prompts
 * written into the job box. The form's contract with Netlify and Make, read
 * from its source: the form name, the fields Make maps by name, and the
 * unlabelled first input that keeps each card question's email heading. And
 * the card drawings, held to the format in
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

test("the chosen line names what is ticked", () => {
  assert.equal(chosenLine(["Fitted wardrobes", "Flooring"]), "Chosen: Fitted wardrobes, Flooring");
  assert.equal(chosenLine([]), "");
  assert.equal(chosenName(OTHER_AREA, "Finchley"), "Somewhere else: Finchley");
  assert.equal(chosenName(OTHER_AREA, OTHER_AREA), OTHER_AREA);
  assert.equal(chosenName("Camden", "Camden"), "Camden");
});

/* ---- The form's contract with Netlify and Make -------------------------- */

const form = readFileSync(new URL("../src/components/EnquiryForm.astro", import.meta.url), "utf8");
const cardGroup = readFileSync(new URL("../src/components/enquiry-cards/CardGroup.astro", import.meta.url), "utf8");
const markup = form.slice(form.indexOf("<form"), form.indexOf("</form>"));

test("the form is still the Netlify form Make reads", () => {
  assert.match(markup, /name="enquiry"/);
  assert.match(markup, /data-netlify="true"/);
  assert.match(markup, /netlify-honeypot="company-website"/);
  assert.match(markup, /enctype="multipart\/form-data"/);
  assert.match(markup, /action="\/thanks\/"/);
  assert.match(markup, /<input type="hidden" name="form-name" value="enquiry" \/>/);
  assert.match(markup, /name="company-website"/);
  // Make scenario 7361484 maps these by name.
  for (const field of ["name", "phone", "email", "detail", "subject"]) {
    assert.match(markup, new RegExp(`name="${field}"`), `${field} is missing`);
  }
});

test("each card question keeps its field name and its email heading", () => {
  for (const [field, type] of [["service", "checkbox"], ["area", "radio"], ["source", "radio"]]) {
    const group = markup.match(new RegExp(`<CardGroup[^>]*?name="${field}"[^>]*?>`, "s"))?.[0];
    assert.ok(group, `no card question sends ${field}`);
    assert.match(group, new RegExp(`type="${type}"`), `${field} is not ${type}`);
    assert.match(group, /\bemailHeading\b/, `${field} has lost its email heading`);
  }
  // The heading input is the group's own type, named as the field, with no value.
  assert.match(cardGroup, /<p hidden><input type=\{type\} name=\{name\} value="" tabindex="-1" \/><\/p>/);
});

test("the Somewhere else box has no name, so it is never sent on its own", () => {
  const box = markup.match(/<input[^>]*data-ec-other-input[^>]*>/)?.[0];
  assert.ok(box);
  assert.doesNotMatch(box, /\bname=/);
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

test("the Somewhere else map keeps its one marker, and the landmarks carry none", () => {
  for (const [id, markup] of Object.entries(AREA_ART)) {
    const markers = [...markup.matchAll(/class="m"/g)].length;
    assert.equal(markers, id === "area-other" ? 1 : 0, `${id} has ${markers} marker(s)`);
  }
});
