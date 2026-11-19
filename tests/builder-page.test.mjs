/**
 * The design-your-own page and the enquiry form it hands over to (19 Nov 2026).
 *
 * The builder has no form of its own. It opens the site's Get a quote pop-up,
 * ticks the service cards and fills the job box (src/scripts/builder/ui.mjs).
 * That only works while the form keeps the three things the builder reaches
 * for, and the form has changed its insides before (site PR #46 moved the
 * cards' name to data-field). These checks read the sources, so a change to
 * the form that would strand the builder fails here instead of on a visitor.
 *
 * Also held here: the flat drawing, which is the page's picture wherever 3D
 * cannot run, and the page's own promises (no second form, out of the index
 * until the launch switch is turned).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DEFAULTS, describe } from "../src/scripts/builder/model.mjs";
import { elevationSvg } from "../src/scripts/builder/elevation.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const page = read("src/pages/design-your-own.astro");
const ui = read("src/scripts/builder/ui.mjs");
const form = read("src/components/EnquiryForm.astro");
const cards = read("src/components/enquiry-cards/CardGroup.astro");
const base = read("src/layouts/Base.astro");
const builderData = read("src/data/builder.ts");
const choices = read("src/components/enquiry-cards/choices.ts");

test("the enquiry form still has what the builder fills in", () => {
  // The pop-up the builder opens.
  assert.match(base, /id="enquiry-modal"/);
  assert.match(ui, /getElementById\("enquiry-modal"\)/);
  // The job box, by the field name Make maps.
  assert.match(form, /name="detail"/);
  assert.match(ui, /textarea\[name="detail"\]/);
  // The service cards: found by data-field once the form's script has run, by name before it has.
  assert.match(cards, /data-field=\{name\}/);
  assert.match(form, /name="service"/);
  assert.match(ui, /input\[type="checkbox"\]\[data-field="service"\]/);
  assert.match(ui, /input\[type="checkbox"\]\[name="service"\]/);
});

test("the two units tick cards the form really has", () => {
  for (const label of ["Fitted wardrobes", "Alcove units and shelving"]) {
    assert.ok(builderData.includes(`"${label}"`), `builder.ts names ${label}`);
    assert.ok(choices.includes(`"${label}"`), `the form's choices list ${label}`);
  }
});

test("the page has no form of its own to register or to drift", () => {
  assert.doesNotMatch(page, /data-netlify/);
  assert.doesNotMatch(page, /<EnquiryForm/);
  assert.doesNotMatch(page, /name="form-name"/);
  // Its controls never post anywhere: the form element exists for grouping only.
  assert.match(ui, /addEventListener\("submit", \(e\) => e\.preventDefault\(\)\)/);
});

test("the page stays out of the index until the launch switch is turned", () => {
  assert.match(page, /noindex=\{!DESIGN_YOUR_OWN_LIVE\}/);
  assert.match(read("astro.config.mjs"), /if \(!DESIGN_YOUR_OWN_LIVE\) blocked\.add\('\/design-your-own\/'\)/);
  assert.match(read("src/data/design-your-own-gate.ts"), /export const DESIGN_YOUR_OWN_LIVE = (true|false);/);
});

test("the 3D library is fetched on demand, never with the page", () => {
  assert.match(ui, /import\("\.\/scene\.mjs"\)/);
  assert.doesNotMatch(ui, /from "three"/);
  assert.doesNotMatch(page, /from "three"/);
  assert.doesNotMatch(read("src/scripts/builder/model.mjs"), /from "three"/);
  assert.doesNotMatch(read("src/scripts/builder/elevation.mjs"), /from "three"/);
});

test("the flat drawing draws every design the builder can make", () => {
  const designs = [
    DEFAULTS.wardrobe,
    DEFAULTS.alcove,
    { unit: "wardrobe", w: 600, h: 1800, d: 450, fit: "none", door: "flat", handle: "none" },
    { unit: "wardrobe", w: 4800, h: 3000, d: 700, fit: "left", handle: "knob", inside: ["shelves", "double", "hang-drawers", "shelves-drawers"] },
    { unit: "alcove", count: 1, wl: 1500, shelves: 0, extras: ["drawers"] },
    { unit: "alcove", count: 2, wl: 400, wr: 1500, shelves: 6, door: "flat", handle: "bar" },
  ];
  for (const design of designs) {
    for (const open of [false, true]) {
      const svg = elevationSvg(design, { open });
      assert.match(svg, /^<svg [^>]*viewBox="[-\d. ]+"[^>]*>.*<\/svg>$/s);
      assert.ok(!/NaN|undefined|Infinity/.test(svg), `no broken numbers: ${JSON.stringify(design)}`);
      // It is decoration beside a described picture: the page's own label carries the words.
      assert.match(svg, /aria-hidden="true"/);
    }
  }
  // One door drawn per door the rules give the run.
  const wide = describe({ unit: "wardrobe", w: 3600, door: "flat" });
  const doors = (elevationSvg(wide).match(/stroke-width="6"\/>/g) || []).length;
  assert.equal(doors, wide.doors);
});
