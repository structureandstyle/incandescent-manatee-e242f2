/**
 * The design-your-own builder (19 Nov 2026, src/pages/design-your-own.astro).
 *
 * The rules in src/scripts/builder/model.mjs: how many doors a width gets,
 * what a design says in words, that a design survives a trip through a link,
 * and the words a project sends. The price itself is worked out part by part
 * since 19 Nov 2026 (a founder): tests/builder-costing.test.mjs holds that.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  COLOURS,
  DEFAULTS,
  DOORS,
  EXTRAS,
  HANDLE_FINISHES,
  HANDLES,
  INSIDES,
  decode,
  describe,
  doorsFor,
  encode,
  guidePrice,
  money,
  normalise,
  projectText,
  sectionsFor,
  servicesFor,
  specLines,
  title,
} from "../src/scripts/builder/model.mjs";
import { readPrices } from "../src/scripts/builder/prices.mjs";
import { sellBook } from "../src/scripts/builder/costing.mjs";
import { SERVICE_COPY } from "../src/data/service-copy.ts";

const TABLES = SERVICE_COPY["fitted-wardrobe-cost"].priceTables;
const PRICES = readPrices(TABLES);
/** What the page carries: the selling rates of the price book (src/data/builder.ts). */
const SELL = { book: sellBook(JSON.parse(readFileSync(new URL("../src/data/price-book.json", import.meta.url), "utf8"))) };
const LABELS = { wardrobe: "Fitted wardrobes", alcove: "Alcove units and shelving" };

test("doors follow his published width steps, then one per 600mm", () => {
  const cases = [[600, 2], [1200, 2], [1201, 3], [1800, 3], [1801, 4], [2400, 4], [2401, 5], [3000, 5], [3600, 6], [4800, 8]];
  for (const [w, doors] of cases) assert.equal(doorsFor(w), doors, `${w}mm`);
});

test("doors group into pairs, with one single when the count is odd", () => {
  assert.deepEqual(sectionsFor(2), [2]);
  assert.deepEqual(sectionsFor(3), [2, 1]);
  assert.deepEqual(sectionsFor(4), [2, 2]);
  assert.deepEqual(sectionsFor(5), [2, 2, 1]);
  assert.deepEqual(sectionsFor(8), [2, 2, 2, 2]);
});

test("the builder reads the cost guide's own tables: 12 wardrobe figures and 4 for a pair of alcoves", () => {
  assert.equal(PRICES.finishes.length, 4);
  assert.equal(PRICES.wardrobe.length, 4);
  for (const row of PRICES.wardrobe) {
    assert.equal(row.length, 3);
    assert.ok(row[0] < row[1] && row[1] < row[2], "more doors cost more");
  }
  assert.equal(PRICES.alcovePair.length, 4);
  // Every figure the builder can show is a cell of the cost guide, to the pound.
  const wardrobeRows = TABLES.find((t) => /^Fitted wardrobes/.test(t.title)).rows;
  const alcoveRows = TABLES.find((t) => /^Alcove units/.test(t.title)).rows;
  PRICES.wardrobe.forEach((row, f) => row.forEach((n, i) => assert.equal(`from ${money(n)}`, wardrobeRows[f][i + 1])));
  PRICES.alcovePair.forEach((n, f) => assert.equal(`from ${money(n)}`, alcoveRows[f][1]));
});

test("every size gets a figure, worked out part by part; no price book, no figure", () => {
  for (const design of [{ unit: "wardrobe", w: 600 }, { unit: "wardrobe", w: 2401 }, { unit: "wardrobe", w: 4800, h: 3000 },
    { unit: "alcove", count: 1 }, { unit: "alcove", count: 2, wl: 1500, wr: 400 }]) {
    const p = guidePrice(design, SELL);
    assert.ok(Number.isFinite(p.from) && p.from > 0, JSON.stringify(design));
    assert.equal(p.basis, "parts");
  }
  // No prices handed in: no figure, never a guess.
  assert.equal(guidePrice({ unit: "wardrobe", w: 2000 }, undefined).from, null);
  assert.equal(guidePrice({ unit: "wardrobe", w: 2000 }, PRICES).from, null);
});

test("anything typed, sent or saved becomes a complete, valid design", () => {
  // The opening designs show lighting; a design made from less names no extra at all.
  assert.deepEqual(DEFAULTS.wardrobe.extras, ["lighting"]);
  assert.deepEqual(DEFAULTS.alcove.extras, ["lighting"]);
  assert.deepEqual(normalise(DEFAULTS.wardrobe), DEFAULTS.wardrobe);
  assert.deepEqual(normalise(DEFAULTS.alcove), DEFAULTS.alcove);
  assert.deepEqual(normalise(), { ...DEFAULTS.wardrobe, extras: [] });
  assert.deepEqual(normalise({ unit: "alcove" }), { ...DEFAULTS.alcove, extras: [] });
  assert.deepEqual(normalise("nonsense"), { ...DEFAULTS.wardrobe, extras: [] });
  const odd = normalise({ unit: "wardrobe", w: 99999, h: -5, d: "abc", fit: "ceiling", finish: 9, colour: 77, door: "x", handle: null, inside: ["nope"], extras: ["lighting", "gold taps"] });
  assert.equal(odd.w, 4800);
  assert.equal(odd.h, 1800);
  assert.equal(odd.d, 600);
  assert.equal(odd.fit, "both");
  assert.equal(odd.finish, COLOURS.length - 1);
  assert.equal(odd.colour, COLOURS[odd.finish].length - 1);
  assert.deepEqual(odd.extras, ["lighting"]);
  assert.equal(odd.inside.length, 4);
  for (const id of odd.inside) assert.ok(INSIDES.some((x) => x.id === id));
});

test("the inside always has one layout per section, and widening keeps what was chosen", () => {
  const narrow = normalise({ unit: "wardrobe", w: 1200, inside: ["shelves"] });
  assert.deepEqual(narrow.inside, ["shelves"]);
  const wide = normalise({ ...narrow, w: 3600 });
  assert.deepEqual(wide.inside, ["shelves", "shelves", "shelves"]);
  const back = normalise({ ...wide, w: 1000 });
  assert.deepEqual(back.inside, ["shelves"]);
});

test("a design survives a trip through a link, and a broken link gives nothing", () => {
  const designs = [
    DEFAULTS.wardrobe,
    DEFAULTS.alcove,
    { unit: "wardrobe", w: 1750, h: 2670, d: 550, fit: "left", finish: 3, colour: 2, door: "flat", handle: "none", inside: ["shelves-drawers", "double"], extras: ["mirror", "shoes"] },
    { unit: "alcove", count: 1, wl: 1240, wr: 800, h: 2810, d: 410, breast: 1620, base: 900, shelves: 5, finish: 0, colour: 4, door: "flat", handle: "bar", extras: ["drawers"] },
    { unit: "wardrobe", w: 3000, h: 2500, d: 600, fit: "right", finish: 2, colour: 1, door: "fluted", handle: "edge", handleFinish: "chrome", inside: ["hang"], extras: [] },
    { unit: "alcove", count: 2, wl: 800, wr: 950, h: 2600, d: 380, breast: 1500, base: 800, shelves: 2, finish: 1, colour: 3, door: "tg", handle: "longbar", handleFinish: "black", extras: [] },
  ];
  for (const d of designs) {
    const code = encode(d);
    assert.match(code, /^[A-Za-z0-9_-]+$/, "safe in an address");
    assert.ok(code.length < 200, "short enough to paste");
    assert.deepEqual(decode(code), normalise(d));
  }
  for (const bad of ["", "abc", "!!!", encode(DEFAULTS.wardrobe).slice(3), "eyJhIjoxfQ"]) assert.equal(decode(bad), null);
});

test("a link saved before the handle finish was added still opens, in brushed brass", () => {
  // The wardrobe row as links were written until 19 Nov 2026: no handleFinish on the end.
  const before = Buffer.from(JSON.stringify([1, "w", 2400, 2400, 600, "both", 1, 0, "slim", "knob", ["hang", "hang-shelves"], ["lighting"]])).toString("base64url");
  const d = decode(before);
  assert.equal(d.handleFinish, "brass");
  assert.equal(d.door, "slim");
  assert.equal(d.handle, "knob");
  assert.deepEqual(d.extras, ["lighting"]);
  const alcove = Buffer.from(JSON.stringify([1, "a", 2, 900, 900, 2400, 350, 1400, 850, 3, 1, 0, "shaker", "knob", []])).toString("base64url");
  assert.equal(decode(alcove).handleFinish, "brass");
});

test("a hand-edited link can only ever produce a valid design", () => {
  const forged = Buffer.from(JSON.stringify([1, "w", 123456, 1, 1, "x", 99, 99, "x", "x", ["x"], ["x"]])).toString("base64url");
  const d = decode(forged);
  assert.deepEqual(d, normalise(d));
  assert.equal(d.w, 4800);
});

test("the design in words: sizes, doors, finish, inside, and the extras chosen", () => {
  const lines = specLines({ unit: "wardrobe", w: 2400, h: 2400, d: 600, fit: "both", finish: 1, colour: 0, door: "shaker", handle: "bar", inside: ["hang", "hang-drawers"], extras: ["lighting"] }, PRICES.finishes);
  assert.deepEqual(lines, [
    "Fitted wardrobe: 2400 wide x 2400 high x 600 deep (mm), wall to wall.",
    "4 doors, Shaker-style doors, bar handles in brushed brass. Finish: hand-painted MDF, shown in deep green.",
    "Inside, left to right: long hanging with a shelf above; hanging over three drawers.",
    "Extras: integrated lighting.",
  ]);
  const alcove = specLines(DEFAULTS.alcove, PRICES.finishes);
  assert.equal(alcove[0], "Alcove units: left alcove 900 wide, right alcove 900 wide, 350 deep, ceiling 2400 high (mm).");
  assert.match(alcove[1], /a base cupboard 850 high with two Shaker-style doors, knobs in brushed brass, and 3 open shelves above/);
  // The new styles read the same way; push to open has no handles, so no metal is named.
  assert.match(specLines({ ...DEFAULTS.wardrobe, door: "slim", handle: "longbar", handleFinish: "black" }, PRICES.finishes)[1],
    /^4 doors, slim Shaker doors, long bar handles in matt black\. /);
  assert.match(specLines({ ...DEFAULTS.alcove, door: "tg", handle: "edge", handleFinish: "chrome" }, PRICES.finishes)[1],
    /with two tongue and groove doors, edge pulls in polished chrome, and/);
  const push = specLines({ ...DEFAULTS.alcove, door: "fluted", handle: "none", handleFinish: "chrome" }, PRICES.finishes)[1];
  assert.match(push, /with two fluted doors, no handles, push to open, and/);
  assert.doesNotMatch(push, /chrome/);
  // The opening design shows lighting, so it is listed at once.
  assert.deepEqual(alcove.slice(2), ["Extras: integrated lighting."]);
  assert.equal(specLines({ ...DEFAULTS.alcove, extras: [] }, PRICES.finishes).length, 2);
});

test("titles read as a person would say them", () => {
  assert.equal(title(DEFAULTS.wardrobe, PRICES.finishes), "Fitted wardrobe, 2.4m wide, 4 doors, hand-painted MDF");
  assert.equal(title({ unit: "wardrobe", w: 1250, finish: 0 }, PRICES.finishes), "Fitted wardrobe, 1.25m wide, 3 doors, melamine board");
  assert.equal(title({ unit: "wardrobe", w: 3000, finish: 0 }, PRICES.finishes), "Fitted wardrobe, 3m wide, 5 doors, melamine board");
  assert.equal(title(DEFAULTS.alcove, PRICES.finishes), "A pair of alcove units, hand-painted MDF");
  assert.equal(title({ unit: "alcove", count: 1 }, PRICES.finishes), "One alcove unit, hand-painted MDF");
});

test("a project becomes one job description the form will accept", () => {
  const items = [DEFAULTS.wardrobe, DEFAULTS.alcove, { unit: "wardrobe", w: 3600 }];
  const text = projectText({
    items, others: ["Flooring"], prices: SELL, finishes: PRICES.finishes,
    linkFor: (d) => "https://structureandstyle.co.uk/design-your-own/#d=" + encode(d),
  });
  assert.match(text, /^Designed on the website:/);
  assert.match(text, /1\. Fitted wardrobe: 2400 wide/);
  assert.match(text, /2\. Alcove units: left alcove 900 wide/);
  // Each design's figure, and how it is made up when it has an extra.
  const first = guidePrice(DEFAULTS.wardrobe, SELL);
  assert.ok(text.includes(`Guide price shown: from ${money(first.from)} (fitted wardrobe, 2.4m wide, 4 doors, from ${money(first.lines[0].amount)}; integrated lighting, ${money(first.lines[1].amount)}).`));
  assert.doesNotMatch(text, /No guide price shown/);
  assert.match(text, /Also wanted for the same visit: Flooring\./);
  const total = items.reduce((s, d) => s + guidePrice(d, SELL).from, 0);
  assert.ok(text.includes(`Guide starting prices shown add up to ${money(total)}.`));
  // The form refuses more than five web links in the job box (EnquiryForm.astro).
  const many = projectText({ items: Array(7).fill(DEFAULTS.wardrobe), prices: SELL, finishes: PRICES.finishes, linkFor: () => "https://structureandstyle.co.uk/design-your-own/#d=x" });
  assert.ok((many.match(/https?:\/\//g) || []).length <= 4);
  // No em dash can reach the enquiry from here.
  assert.ok(!text.includes(String.fromCharCode(0x2014)));
});

test("a project ticks the form's own service cards", () => {
  assert.deepEqual(servicesFor({ items: [DEFAULTS.wardrobe, DEFAULTS.alcove, DEFAULTS.wardrobe], others: ["Flooring"] }, LABELS), ["Fitted wardrobes", "Alcove units and shelving", "Flooring"]);
  assert.deepEqual(servicesFor({ items: [], others: [] }, LABELS), []);
});

test("every option has words for the page and for the enquiry", () => {
  for (const list of [INSIDES, EXTRAS.wardrobe, EXTRAS.alcove, DOORS, HANDLES, HANDLE_FINISHES]) {
    for (const x of list) assert.ok(x.id && x.label && x.text, JSON.stringify(x));
  }
  // The alcove sentence turns "fluted doors" into "two fluted doors".
  for (const x of DOORS) assert.match(x.text, / doors$/, x.id);
  assert.deepEqual(DOORS.map((x) => x.id), ["shaker", "flat", "slim", "tg", "fluted"]);
  assert.deepEqual(HANDLES.map((x) => x.id), ["knob", "bar", "longbar", "edge", "none"]);
  for (const set of COLOURS) {
    assert.equal(set.length, 5);
    for (const c of set) assert.match(c.hex, /^#[0-9A-F]{6}$/);
  }
  const d = describe(DEFAULTS.wardrobe);
  assert.equal(d.doors, 4);
  assert.deepEqual(d.sections, [2, 2]);
});
