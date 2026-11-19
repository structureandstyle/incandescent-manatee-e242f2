/**
 * The builder's costing engine (19 Nov 2026, src/scripts/builder/costing.mjs).
 *
 * The proof that the code and the S&S pricing workbook are one set of
 * formulas: fed the workbook's own worked example and its 14 Nov figures
 * (tests/fixtures, extracted from the workbook's source), the engine returns
 * the workbook's sections and its £9,150, to the pound.
 *
 * Then the builder's side: every design gets a price; every choice moves it;
 * the selling rates the page carries give exactly the same price as the
 * private book while carrying none of his costs, day rate or margin; and the
 * page cannot go live until Kaspar has confirmed the book.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { prepare, priceDesign, priceUnits, sellBook } from "../src/scripts/builder/costing.mjs";
import { DEFAULTS, DOORS, EXTRAS, HANDLE_FINISHES, HANDLES, INSIDES, describe, guidePrice } from "../src/scripts/builder/model.mjs";

const json = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
const V0 = json("tests/fixtures/price-book-v0.json");
const EXAMPLE = json("tests/fixtures/workbook-v0-example.json");
const BOOK = json("src/data/price-book.json");
const P = prepare(BOOK);
const SELL = { book: sellBook(BOOK) };
const price = (design, p = P) => priceDesign(describe(design), p).price;

test("fed the workbook's own worked example, the engine gives the workbook's figures", () => {
  const q = priceUnits(EXAMPLE.units, prepare(V0), EXAMPLE.priming);
  const r = (n) => Math.round(n);
  // The workbook's README, "The worked example": A 945, B 385, C 104, D 137, contingency 79,
  // labour 4,535, job costs 1,420, total cost 7,604, company 1,521, quote 9,150.
  assert.deepEqual(
    { A: r(q.sections.A), B: r(q.sections.B), C: r(q.sections.C), D: r(q.sections.D), E: r(q.sections.E), F: r(q.sections.F) },
    { A: 945, B: 385, C: 104, D: 137, E: 4535, F: 1420 },
  );
  assert.equal(r(q.matCont), 79);
  assert.equal(r(q.totalCost), 7604);
  assert.equal(r(q.company), 1521);
  assert.equal(q.price, 9150);
  // And the counts the README quotes: about 30 m2 of board, 77 m of prep tape, 51 m2 painted, 20 hinges, 11.2 m of LED, 14.2 days.
  assert.equal(r(q.counts.AREA_BOARD), 30);
  assert.equal(r(q.lines.find((l) => l.label === "Edging: Prep tape 0.3mm").qty), 77);
  assert.equal(r(q.counts.AREA_HAND), 51);
  assert.equal(q.counts.CNT_HINGES, 20);
  assert.equal(q.counts.LED_M, 11.2);
  assert.equal(q.labour.days.toFixed(1), "14.2");
});

test("every board and item the engine and the builder's rules name is in the price book", () => {
  const boards = new Set(BOOK.boards.map((b) => b.name));
  for (const f of BOOK.builder.finishes) {
    for (const key of ["front", "carcass", "alcoveCarcass", "top", "shelf"]) assert.ok(boards.has(f[key]), `${f.name}: ${key} board "${f[key]}"`);
  }
  const items = new Set(BOOK.items.map((x) => x.code));
  const used = readFileSync(new URL("../src/scripts/builder/costing.mjs", import.meta.url), "utf8").match(/itemEach\(P, "([A-Z_0-9]+)"\)/g)
    .map((m) => m.match(/"([A-Z_0-9]+)"/)[1]);
  for (const code of new Set(used)) assert.ok(items.has(code), `price book item ${code}`);
  for (const id of INSIDES.map((x) => x.id)) assert.ok(BOOK.builder.wardrobe.insides[id], `inside layout ${id}`);
  // Every labour task's quantity names a count the engine makes.
  const made = priceDesign(describe(DEFAULTS.wardrobe), P).counts;
  for (const t of BOOK.labour) {
    assert.ok(t.hours >= 0, t.code);
    if (typeof t.qty !== "string" || t.code === "L_TRAVEL") continue;
    for (const name of t.qty.replace(/^IF:/, "").split("+").map((x) => x.trim())) assert.ok(name in made, `${t.code} counts ${name}`);
  }
});

test("every door style, handle and handle finish is priced, each on its own line", () => {
  const base = { ...DEFAULTS.wardrobe, extras: [] };
  const at = (change) => priceDesign(describe({ ...base, ...change }), P);
  const line = (q, label) => q.lines.find((l) => l.label === label);
  for (const d of DOORS) assert.ok(at({ door: d.id }).price > 0, d.id);
  for (const h of HANDLES) assert.ok(at({ handle: h.id }).price > 0, h.id);
  // Slim Shaker is priced as Shaker; grooves and a fluted board each cost more than a plain door.
  assert.equal(at({ door: "slim" }).price, at({ door: "shaker" }).price);
  assert.ok(at({ door: "tg" }).price > at({ door: "flat" }).price, "tongue and groove over flat");
  assert.ok(at({ door: "fluted" }).price > at({ door: "flat" }).price, "fluted over flat");
  const tg = at({ door: "tg" });
  assert.ok(line(tg, "V-grooving, tongue and groove doors").qty > 3, "about 4 m2 of door");
  assert.ok(tg.labour.tasks.find((t) => t.code === "L_TG_FINISH").q > 0);
  const fluted = at({ door: "fluted" });
  assert.ok(line(fluted, "Fluted MDF over plain, fluted doors").cost > 0);
  assert.ok(fluted.labour.tasks.find((t) => t.code === "L_FLUTED_FINISH").q > 0);
  // Melamine is not painted, so no finishing time into the reeds.
  assert.equal(at({ door: "fluted", finish: 0 }).labour.tasks.find((t) => t.code === "L_FLUTED_FINISH").q, 0);
  // Long bars and edge pulls: one per door, at their own price; long bars cost more than bars.
  assert.equal(line(at({ handle: "longbar" }), "Long bar handles").qty, 4);
  assert.equal(line(at({ handle: "edge" }), "Edge pulls").qty, 4);
  assert.ok(at({ handle: "longbar" }).price > at({ handle: "bar" }).price);
  // Drawers behind the doors take an ordinary bar, not a long one.
  const drawers = at({ handle: "longbar", inside: ["hang-drawers", "hang"] });
  assert.equal(line(drawers, "Long bar handles").qty, 4);
  assert.equal(line(drawers, "Bar handles").qty, 3);
  // The metal never moves the price.
  const metals = HANDLE_FINISHES.map((f) => at({ handleFinish: f.id }).price);
  assert.ok(metals.every((p) => p === metals[0]), metals.join(", "));
  // Routed pulls: one routed recess a door, no handle bought.
  const routed = at({ handle: "routed" });
  assert.equal(line(routed, "Routed finger pulls").qty, 4);
  assert.equal(line(routed, "Bar handles"), undefined);
});

test("a founder's review, 19 Nov 2026: the inside finish, the accessories and the light round the inside are all priced", () => {
  const base = { ...DEFAULTS.wardrobe, extras: [] };
  const at = (change) => priceDesign(describe({ ...base, ...change }), P);
  const line = (q, label) => q.lines.find((l) => l.label === label);
  // Inside finish: white melamine is the standard. Oak-effect melamine is its own board (in this book
  // no dearer a square metre than white, its larger sheet spreading the cutting); lacquered oak veneer
  // and the outside's own painted finish each cost more, oak veneer lacquered by the finisher.
  const white = at({ insideFinish: "white" }).price;
  assert.equal(white, at({}).price);
  assert.ok(line(at({ insideFinish: "oakeffect" }), "MFC Egger decor 18mm"), "oak-effect board inside");
  for (const f of ["oak", "match"]) assert.ok(at({ insideFinish: f }).price > white, f);
  const oak = at({ finish: 2, insideFinish: "oak" });
  assert.ok(oak.counts.AREA_LACQUER_OUT > 0, "oak inside is lacquered");
  assert.ok(oak.counts.AREA_SPRAY_OUT > 0, "the outside is still sprayed");
  assert.ok(at({ unit: "alcove", count: 2, insideFinish: "oak" }).price > at({ unit: "alcove", count: 2 }).price, "alcove cupboards too");
  // The accessories: each its own line, each moving the price.
  const all = at({ extras: ["jewellery", "ties", "trousers"] });
  assert.equal(line(all, "Jewellery and watch drawer").qty, 1);
  assert.equal(line(all, "Tie and belt rack").qty, 1);
  assert.equal(line(all, "Pull-out trouser rail").qty, 1);
  // The light round the inside: the default's two sections both have hanging, so each has a strip
  // down both sides as well as the top, and the hanging-over-shelves one a strip under each shelf.
  const lit = at({ extras: ["lighting"] });
  const top = (2400 - 2 * 40 - 2 * 18) / 1000; // both sections' top strips, about the run's inside width
  assert.ok(lit.counts.LED_M > top + 4 * 2, `${lit.counts.LED_M} m of LED`);
  assert.equal(at({ extras: ["lighting"], inside: ["shelves", "shelves"] }).counts.LED_M > top, true);
});

test("the selling rates give the same price as the private book, and carry none of his costs", () => {
  const designs = [
    DEFAULTS.wardrobe, DEFAULTS.alcove,
    { unit: "wardrobe", w: 4800, h: 3000, d: 700, fit: "none", finish: 3, door: "shaker", handle: "none", inside: ["hang-drawers", "double", "shelves", "shelves-drawers"], extras: ["lighting", "mirror", "shoes", "pullouts"] },
    { unit: "wardrobe", w: 1300, h: 2100, d: 500, fit: "left", finish: 2, door: "flat", handle: "knob", inside: ["shelves"], extras: [] },
    { unit: "alcove", count: 1, wl: 1400, h: 2900, d: 450, base: 1000, shelves: 6, finish: 0, handle: "bar", extras: ["drawers", "lighting"] },
  ];
  const sellP = prepare(SELL.book);
  for (const d of designs) assert.equal(price(d, sellP), price(d), JSON.stringify(d));
  const rule = (code) => SELL.book.rules.find((x) => x.code === code).value;
  assert.equal(rule("COMPANY_PCT"), 0);
  assert.equal(rule("CONT_MATERIALS"), 0);
  assert.equal(rule("MATERIAL_MARKUP"), 0);
  assert.notEqual(rule("DAY_RATE"), BOOK.rules.find((x) => x.code === "DAY_RATE").value);
  const text = JSON.stringify(SELL.book);
  for (const word of ["source", "Kaspar", "kaspar", "label", "basis"]) assert.ok(!text.includes(`"${word}"`), `no ${word} on the page`);
});

test("every design the builder can make gets a price, and a wider run never costs less", () => {
  for (let finish = 0; finish < 4; finish++) {
    let last = 0;
    for (let w = 600; w <= 4800; w += 150) {
      const p = price({ unit: "wardrobe", w, finish, extras: [] });
      assert.ok(Number.isFinite(p) && p > 0, `${w}mm, finish ${finish}`);
      assert.ok(p >= last, `${w}mm costs ${p}, less than ${last}`);
      last = p;
    }
    for (const count of [1, 2]) {
      for (const wl of [400, 900, 1500]) assert.ok(price({ unit: "alcove", count, wl, wr: wl, finish }) > 0);
    }
  }
});

test("every choice moves the price: size, finish, inside, shelves, handles and each extra", () => {
  const base = { unit: "wardrobe", w: 2400, finish: 1, inside: ["hang", "hang-shelves"], extras: [] };
  const p0 = price(base);
  assert.ok(price({ ...base, h: 3000 }) > p0, "taller");
  assert.ok(price({ ...base, finish: 3 }) > p0, "oak veneer over hand-painted");
  assert.ok(price({ ...base, inside: ["hang-drawers", "hang-shelves"] }) > p0, "drawers");
  for (const x of EXTRAS.wardrobe) assert.ok(price({ ...base, extras: [x.id] }) > p0, `extra: ${x.id}`);
  const alcove = { unit: "alcove", count: 2, wl: 900, wr: 900, shelves: 3, finish: 1, extras: [] };
  assert.ok(price({ ...alcove, shelves: 5 }) > price(alcove), "two more shelves");
  for (const x of EXTRAS.alcove) assert.ok(price({ ...alcove, extras: [x.id] }) > price(alcove), `alcove extra: ${x.id}`);
});

test("the page's figure: the design, then what each extra adds, always adding up", () => {
  const p = guidePrice({ ...DEFAULTS.wardrobe, extras: ["lighting", "mirror", "shoes"] }, SELL);
  assert.equal(p.lines.length, 4);
  assert.equal(p.lines[0].from, true);
  assert.equal(p.lines.reduce((s, l) => s + l.amount, 0), p.from);
  for (const l of p.lines.slice(1)) assert.ok(l.amount > 0, l.text);
  assert.equal(p.from, price({ ...DEFAULTS.wardrobe, extras: ["lighting", "mirror", "shoes"] }));
  // No price book: no figure, never a guess.
  assert.equal(guidePrice(DEFAULTS.wardrobe, undefined).from, null);
});

test("his own figure wins over ours", () => {
  const book = structuredClone(BOOK);
  const hinge = book.items.find((x) => x.code === "HINGE");
  hinge.kaspar = hinge.price * 3;
  assert.ok(price(DEFAULTS.wardrobe, prepare(book)) > price(DEFAULTS.wardrobe));
  const rate = book.rules.find((x) => x.code === "DAY_RATE");
  rate.kaspar = rate.value + 100;
  assert.ok(price(DEFAULTS.wardrobe, prepare(book)) > price(DEFAULTS.wardrobe));
});

test("the price book is not his until he confirms it, and the page cannot go live before", () => {
  assert.equal(typeof BOOK.confirmedByKaspar, "boolean");
  const live = /export const DESIGN_YOUR_OWN_LIVE = true;/.test(readFileSync(new URL("../src/data/design-your-own-gate.ts", import.meta.url), "utf8"));
  assert.ok(!live || BOOK.confirmedByKaspar, "turn the page live only once confirmedByKaspar is true");
  assert.match(readFileSync(new URL("../src/data/builder.ts", import.meta.url), "utf8"), /DESIGN_YOUR_OWN_LIVE && !PRICE_BOOK\.confirmedByKaspar/);
});
