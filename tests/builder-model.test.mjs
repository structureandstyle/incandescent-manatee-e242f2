/**
 * The design-your-own builder (19 Nov 2026, src/pages/design-your-own.astro).
 *
 * Two kinds of check. The rules in src/scripts/builder/model.mjs: how many
 * doors a width gets, what a design says in words, and that a design survives
 * a trip through a link. And the price: the builder must show exactly the
 * cost guide's figures, which it reads from the cost guide's own tables
 * (src/scripts/builder/prices.mjs), and no figure at all for anything he has
 * not published a price for.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  ALCOVE_SHELVES_INCLUDED,
  COLOURS,
  DEFAULTS,
  EXTRAS,
  INSIDES,
  decode,
  describe,
  doorsFor,
  encode,
  guidePrice,
  money,
  normalise,
  projectText,
  quotedItems,
  sectionsFor,
  servicesFor,
  specLines,
  title,
} from "../src/scripts/builder/model.mjs";
import { readPrices } from "../src/scripts/builder/prices.mjs";
import { SERVICE_COPY } from "../src/data/service-copy.ts";

const TABLES = SERVICE_COPY["fitted-wardrobe-cost"].priceTables;
const PRICES = readPrices(TABLES);
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

test("a wardrobe within 2.4m lands on the cost guide's figure for its doors and finish", () => {
  const widths = [[1000, 0], [1200, 0], [1500, 1], [1800, 1], [2000, 2], [2400, 2]];
  for (let finish = 0; finish < 4; finish++) {
    for (const [w, column] of widths) {
      const p = guidePrice({ unit: "wardrobe", w, finish }, PRICES);
      assert.equal(p.from, PRICES.wardrobe[finish][column], `${w}mm, finish ${finish}`);
    }
  }
});

test("nothing he has not priced gets a figure", () => {
  assert.deepEqual(guidePrice({ unit: "wardrobe", w: 2401 }, PRICES), { from: null, why: "wider than 2.4m" });
  assert.deepEqual(guidePrice({ unit: "wardrobe", w: 4800 }, PRICES), { from: null, why: "wider than 2.4m" });
  assert.equal(guidePrice({ unit: "alcove", count: 1 }, PRICES).from, null);
  assert.equal(guidePrice({ unit: "alcove", count: 2, wl: 1001, wr: 900 }, PRICES).from, null);
  assert.equal(guidePrice({ unit: "alcove", count: 2, wl: 900, wr: 1200 }, PRICES).from, null);
  // No prices handed in: no figure, never a guess.
  assert.equal(guidePrice({ unit: "wardrobe", w: 2000 }, undefined).from, null);
});

test("a pair of alcoves up to 1m each lands on the cost guide's pair price", () => {
  for (let finish = 0; finish < 4; finish++) {
    assert.equal(guidePrice({ unit: "alcove", count: 2, wl: 1000, wr: 760, finish }, PRICES).from, PRICES.alcovePair[finish]);
  }
});

test("extras and options never move the figure: they are priced in the quotation", () => {
  const plain = guidePrice({ unit: "wardrobe", w: 2400, finish: 1 }, PRICES).from;
  const loaded = guidePrice({
    unit: "wardrobe", w: 2400, finish: 1, door: "flat", handle: "none", h: 3000, d: 700, fit: "none",
    inside: ["hang-drawers", "shelves-drawers"], extras: ["lighting", "mirror", "shoes", "pullouts"],
  }, PRICES).from;
  assert.equal(loaded, plain);
  assert.deepEqual(
    quotedItems({ unit: "wardrobe", inside: ["hang-drawers", "hang"], extras: ["mirror", "lighting"] }),
    ["drawers", "integrated lighting", "a mirror inside a door"],
  );
  assert.deepEqual(quotedItems({ unit: "alcove", shelves: ALCOVE_SHELVES_INCLUDED }), []);
  assert.deepEqual(quotedItems({ unit: "alcove", shelves: ALCOVE_SHELVES_INCLUDED + 1, extras: ["drawers"] }), ["extra shelves", "drawers in the base cupboards"]);
});

test("anything typed, sent or saved becomes a complete, valid design", () => {
  assert.deepEqual(normalise(), DEFAULTS.wardrobe);
  assert.deepEqual(normalise({ unit: "alcove" }), DEFAULTS.alcove);
  assert.deepEqual(normalise("nonsense"), DEFAULTS.wardrobe);
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
  ];
  for (const d of designs) {
    const code = encode(d);
    assert.match(code, /^[A-Za-z0-9_-]+$/, "safe in an address");
    assert.ok(code.length < 200, "short enough to paste");
    assert.deepEqual(decode(code), normalise(d));
  }
  for (const bad of ["", "abc", "!!!", encode(DEFAULTS.wardrobe).slice(3), "eyJhIjoxfQ"]) assert.equal(decode(bad), null);
});

test("a hand-edited link can only ever produce a valid design", () => {
  const forged = Buffer.from(JSON.stringify([1, "w", 123456, 1, 1, "x", 99, 99, "x", "x", ["x"], ["x"]])).toString("base64url");
  const d = decode(forged);
  assert.deepEqual(d, normalise(d));
  assert.equal(d.w, 4800);
});

test("the design in words: sizes, doors, finish, inside, and what is priced in the quotation", () => {
  const lines = specLines({ unit: "wardrobe", w: 2400, h: 2400, d: 600, fit: "both", finish: 1, colour: 0, door: "shaker", handle: "bar", inside: ["hang", "hang-drawers"], extras: ["lighting"] }, PRICES.finishes);
  assert.deepEqual(lines, [
    "Fitted wardrobe: 2400 wide x 2400 high x 600 deep (mm), wall to wall.",
    "4 doors, Shaker-style doors, bar handles. Finish: hand-painted MDF, shown in deep green.",
    "Inside, left to right: long hanging with a shelf above; hanging over three drawers.",
    "To price in the quotation: drawers, integrated lighting.",
  ]);
  const alcove = specLines(DEFAULTS.alcove, PRICES.finishes);
  assert.equal(alcove[0], "Alcove units: left alcove 900 wide, right alcove 900 wide, 350 deep, ceiling 2400 high (mm).");
  assert.match(alcove[1], /a base cupboard 850 high with two Shaker-style doors, knobs, and 3 open shelves above/);
  assert.equal(alcove.length, 2);
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
    items, others: ["Flooring"], prices: PRICES, finishes: PRICES.finishes,
    linkFor: (d) => "https://structureandstyle.co.uk/design-your-own/#d=" + encode(d),
  });
  assert.match(text, /^Designed on the website:/);
  assert.match(text, /1\. Fitted wardrobe: 2400 wide/);
  assert.match(text, /2\. Alcove units: left alcove 900 wide/);
  assert.match(text, /No guide price shown: priced in the quotation\./);
  assert.match(text, /Also wanted for the same visit: Flooring\./);
  const total = PRICES.wardrobe[1][2] + PRICES.alcovePair[1];
  assert.ok(text.includes(`Guide starting prices shown add up to ${money(total)}, with the rest priced in the quotation.`));
  // The form refuses more than five web links in the job box (EnquiryForm.astro).
  const many = projectText({ items: Array(7).fill(DEFAULTS.wardrobe), prices: PRICES, finishes: PRICES.finishes, linkFor: () => "https://structureandstyle.co.uk/design-your-own/#d=x" });
  assert.ok((many.match(/https?:\/\//g) || []).length <= 4);
  // No em dash can reach the enquiry from here.
  assert.ok(!text.includes(String.fromCharCode(0x2014)));
});

test("a project ticks the form's own service cards", () => {
  assert.deepEqual(servicesFor({ items: [DEFAULTS.wardrobe, DEFAULTS.alcove, DEFAULTS.wardrobe], others: ["Flooring"] }, LABELS), ["Fitted wardrobes", "Alcove units and shelving", "Flooring"]);
  assert.deepEqual(servicesFor({ items: [], others: [] }, LABELS), []);
});

test("every option has words for the page and for the enquiry", () => {
  for (const list of [INSIDES, EXTRAS.wardrobe, EXTRAS.alcove]) {
    for (const x of list) assert.ok(x.id && x.label && x.text, JSON.stringify(x));
  }
  for (const set of COLOURS) {
    assert.equal(set.length, 5);
    for (const c of set) assert.match(c.hex, /^#[0-9A-F]{6}$/);
  }
  const d = describe(DEFAULTS.wardrobe);
  assert.equal(d.doors, 4);
  assert.deepEqual(d.sections, [2, 2]);
});
