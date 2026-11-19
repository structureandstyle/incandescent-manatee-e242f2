/**
 * THE DESIGN-YOUR-OWN BUILDER: its rules, with no page and no 3D in them
 * (19 Nov 2026, src/pages/design-your-own.astro). Everything here is plain
 * data in, plain data out, so the tests can run it (tests/builder-model.test.mjs)
 * and the 3D view, the price line and the enquiry text all read one answer.
 *
 * THE PRICE IS NEVER TYPED HERE. The page hands in the guide starting prices
 * it read from the cost guide's own tables (src/data/service-copy.ts, through
 * src/data/builder.ts), and the extras' guide prices beside them. This file
 * decides how a design's figure is made up from those, line by line.
 *
 * His published steps, the ones the cost guide's columns name:
 *   up to 1.2m is 2 doors, up to 1.8m is 3 doors, up to 2.4m is 4 doors;
 *   a pair of alcove units, each up to about 1m wide.
 * Past those, every size still gets a figure (a founder, 19 Nov 2026), worked
 * out from his own (see guidePrice). Every extra adds its own line.
 *
 * DEFAULTS STANDING IN FOR FACTS ONLY KASPAR HOLDS (the brief lists them):
 * the height range, the door styles, and which insides count as the
 * "straightforward internal layout" his starting price names. Each is one
 * constant below.
 */

import { prepare, priceDesign } from "./costing.mjs";

/** Millimetres. The picture and the wording both take these as given. */
export const LIMITS = {
  wardrobe: { w: [600, 4800], h: [1800, 3000], d: [450, 700] },
  alcove: { w: [400, 1500], h: [1800, 3000], d: [200, 600], breast: [800, 2400], base: [600, 1100], shelves: [0, 6] },
};

/** The widest run and the widest alcove his published prices cover. */
export const PRICED_WARDROBE_MAX = 2400;
export const PRICED_ALCOVE_MAX = 1000;
/** Three open shelves above each base cupboard are in his alcove price. */
export const ALCOVE_SHELVES_INCLUDED = 3;

export const FITS = [
  { id: "both", label: "Wall to wall", text: "wall to wall" },
  { id: "left", label: "A wall on the left", text: "against a wall on the left, open on the right" },
  { id: "right", label: "A wall on the right", text: "against a wall on the right, open on the left" },
  { id: "none", label: "Open both ends", text: "open at both ends" },
];

/*
 * Door styles, handles and handle finishes. Slim Shaker, tongue and groove,
 * fluted, long bars, edge pulls and the three finishes were added on 19 Nov
 * 2026 (a founder: "Add more styles"); their words are a copy agent's. S&S's
 * own site lists fluted and grooved MDF among its panels, but how Kaspar makes
 * each style is one of the questions for him.
 */
export const DOORS = [
  { id: "shaker", label: "Shaker", text: "Shaker-style doors" },
  { id: "flat", label: "Flat", text: "flat doors" },
  { id: "slim", label: "Slim Shaker", text: "slim Shaker doors" },
  { id: "tg", label: "Tongue and groove", text: "tongue and groove doors" },
  { id: "fluted", label: "Fluted", text: "fluted doors" },
];

export const HANDLES = [
  { id: "knob", label: "Knobs", text: "knobs" },
  { id: "bar", label: "Bar handles", text: "bar handles" },
  { id: "longbar", label: "Long bar handles", text: "long bar handles" },
  { id: "edge", label: "Edge pulls", text: "edge pulls" },
  { id: "none", label: "None, push to open", text: "no handles, push to open" },
];

/** The metal of the handles. The three cost the same (price book note 04), so the choice never moves the price. */
export const HANDLE_FINISHES = [
  { id: "brass", label: "Brushed brass", text: "brushed brass" },
  { id: "black", label: "Matt black", text: "matt black" },
  { id: "chrome", label: "Polished chrome", text: "polished chrome" },
];

/**
 * What goes inside one section. `extra` names what his starting price does
 * not cover (the cost guide: drawers are priced separately): guidePrice adds
 * those drawers as their own line.
 */
export const INSIDES = [
  { id: "hang", label: "Long hanging", text: "long hanging with a shelf above" },
  { id: "double", label: "Double hanging", text: "double hanging" },
  { id: "hang-shelves", label: "Hanging over shelves", text: "hanging over shelves" },
  { id: "shelves", label: "Shelves", text: "shelves top to bottom" },
  { id: "hang-drawers", label: "Hanging over drawers", text: "hanging over three drawers", extra: "drawers" },
  { id: "shelves-drawers", label: "Shelves over drawers", text: "shelves over three drawers", extra: "drawers" },
];

/** Priced separately to the specification, in the cost guide's own words; each adds its line in guidePrice. */
export const EXTRAS = {
  wardrobe: [
    { id: "lighting", label: "Integrated lighting", text: "integrated lighting" },
    { id: "mirror", label: "A mirror inside a door", text: "a mirror inside a door" },
    { id: "shoes", label: "Shoe storage", text: "shoe storage" },
    { id: "pullouts", label: "Pull-out accessories", text: "pull-out accessories" },
  ],
  alcove: [
    { id: "lighting", label: "Integrated lighting", text: "integrated lighting" },
    { id: "drawers", label: "Drawers in the base cupboards", text: "drawers in the base cupboards" },
  ],
};

/**
 * Example colours for the picture only. Painted and sprayed work takes any
 * colour and veneer any stain, so these are five to look at, never a range to
 * choose from, and the page says so. Index 0 is each finish's default.
 */
export const COLOURS = [
  // Melamine board
  [
    { name: "white", hex: "#EFEDE8" },
    { name: "light grey", hex: "#C9C8C3" },
    { name: "cashmere", hex: "#D8CDBB" },
    { name: "graphite", hex: "#4A4A4B" },
    { name: "light oak effect", hex: "#C8A77C", grain: true },
  ],
  // Hand-painted MDF
  [
    { name: "deep green", hex: "#2C4A3A" },
    { name: "soft sage", hex: "#A3AE98" },
    { name: "off-white", hex: "#EDE8DC" },
    { name: "warm grey", hex: "#A39C91" },
    { name: "navy", hex: "#27344A" },
  ],
  // Professionally sprayed MDF
  [
    { name: "off-white", hex: "#EFEAE0" },
    { name: "soft sage", hex: "#A3AE98" },
    { name: "deep green", hex: "#2C4A3A" },
    { name: "navy", hex: "#27344A" },
    { name: "charcoal", hex: "#3B3A39" },
  ],
  // Oak veneer, stained and lacquered
  [
    { name: "natural oak", hex: "#C19A66", grain: true },
    { name: "light oak", hex: "#D8BC8E", grain: true },
    { name: "smoked oak", hex: "#8A6A47", grain: true },
    { name: "walnut stain", hex: "#6E4B2A", grain: true },
    { name: "dark stain", hex: "#3F2E21", grain: true },
  ],
];

/**
 * The designs the page opens on. LIGHTING IS ON IN BOTH (a founder, 19 Nov
 * 2026, reviewing the first build: the inside should be shown "with leds").
 * It is an extra, so its guide price is in the opening figure, on its own
 * line. A design made from anything else
 * (a link, a saved project, a part-filled form) gets only the extras it names:
 * normalise() adds none.
 */
export const DEFAULTS = {
  wardrobe: {
    unit: "wardrobe", w: 2400, h: 2400, d: 600, fit: "both", finish: 1, colour: 0,
    door: "shaker", handle: "bar", handleFinish: "brass", inside: ["hang", "hang-shelves"], extras: ["lighting"],
  },
  alcove: {
    unit: "alcove", count: 2, wl: 900, wr: 900, h: 2400, d: 350, breast: 1400, base: 850, shelves: 3,
    finish: 1, colour: 0, door: "shaker", handle: "knob", handleFinish: "brass", extras: ["lighting"],
  },
};

const clampInt = (value, [min, max], fallback) => {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};
const oneOf = (value, list, fallback) => (list.some((x) => x.id === value) ? value : fallback);

/** Doors for a run of this width, on his published steps, then one per 600mm. */
export function doorsFor(w) {
  if (w <= 1200) return 2;
  if (w <= 1800) return 3;
  if (w <= 2400) return 4;
  return Math.min(8, Math.ceil(w / 600));
}

/** Doors grouped into sections: pairs, with one single door when the count is odd. */
export function sectionsFor(doors) {
  const out = [];
  for (let left = doors; left > 0; left -= 2) out.push(left >= 2 ? 2 : 1);
  return out;
}

/**
 * Any input (a form, a link someone was sent, a saved project) becomes a
 * complete, valid design. Nothing that reaches the picture, the price or the
 * enquiry has skipped this.
 */
export function normalise(input = {}) {
  const src = input && typeof input === "object" ? input : {};
  const unit = src.unit === "alcove" ? "alcove" : "wardrobe";
  const base = DEFAULTS[unit];
  const finish = clampInt(src.finish, [0, COLOURS.length - 1], base.finish);
  const colour = clampInt(src.colour, [0, COLOURS[finish].length - 1], 0);
  const door = oneOf(src.door, DOORS, base.door);
  const handle = oneOf(src.handle, HANDLES, base.handle);
  const handleFinish = oneOf(src.handleFinish, HANDLE_FINISHES, base.handleFinish);
  const allowed = EXTRAS[unit].map((x) => x.id);
  const extras = Array.isArray(src.extras) ? allowed.filter((id) => src.extras.includes(id)) : [];

  if (unit === "alcove") {
    const L = LIMITS.alcove;
    return {
      unit,
      count: Number(src.count) === 1 ? 1 : 2,
      wl: clampInt(src.wl, L.w, base.wl),
      wr: clampInt(src.wr, L.w, base.wr),
      h: clampInt(src.h, L.h, base.h),
      d: clampInt(src.d, L.d, base.d),
      breast: clampInt(src.breast, L.breast, base.breast),
      base: clampInt(src.base, L.base, base.base),
      shelves: clampInt(src.shelves, L.shelves, base.shelves),
      finish, colour, door, handle, handleFinish, extras,
    };
  }

  const L = LIMITS.wardrobe;
  const w = clampInt(src.w, L.w, base.w);
  const count = sectionsFor(doorsFor(w)).length;
  const given = Array.isArray(src.inside) ? src.inside : [];
  // A wider run has more sections than the layout it was given: the new ones
  // repeat the last choice, so widening never resets what was already picked.
  const inside = Array.from({ length: count }, (_, i) =>
    oneOf(given[i] ?? given[given.length - 1], INSIDES, i % 2 ? "hang-shelves" : "hang"));
  return {
    unit, w,
    h: clampInt(src.h, L.h, base.h),
    d: clampInt(src.d, L.d, base.d),
    fit: oneOf(src.fit, FITS, base.fit),
    finish, colour, door, handle, handleFinish, inside, extras,
  };
}

/** The facts the picture, the summary and the price all need about a design. */
export function describe(input) {
  const s = normalise(input);
  if (s.unit === "alcove") {
    const widths = s.count === 2 ? [s.wl, s.wr] : [s.wl];
    return { ...s, widths, doors: s.count * 2 };
  }
  const doors = doorsFor(s.w);
  return { ...s, doors, sections: sectionsFor(doors) };
}

/** The extras chosen for this design, in words, in the order the form lists them. */
export function extrasChosen(input) {
  const s = describe(input);
  return EXTRAS[s.unit].filter((x) => s.extras.includes(x.id)).map((x) => x.text);
}

export const money = (n) => "£" + Math.round(n).toLocaleString("en-GB");
const metres = (mm) => (mm / 1000).toFixed(mm % 100 ? 2 : 1).replace(/\.?0+$/, (m) => (m.includes(".") ? "" : m)) + "m";
/** Each price book is indexed once, however often a visitor changes the design. */
const ready = new WeakMap();
const prepared = (book) => {
  if (!ready.has(book)) ready.set(book, prepare(book));
  return ready.get(book);
};

/**
 * The guide price of a design, worked out part by part (a founder, 19 Nov
 * 2026) from the price book the page carries: `prices.book`, the selling
 * rates (src/data/builder.ts, costing.mjs). Size, finish, door style,
 * handles, the inside of every section, every shelf and every extra all move
 * it, because each changes the parts, the finishing or the fitting time.
 *
 * Returns { from, basis, lines }: the first line is the design without its
 * extras (marked `from`, a starting price), then one line per extra chosen,
 * each what adding it costs. The lines always add up to `from`. With no price
 * book handed in, `from` is null: never a guess.
 */
export function guidePrice(input, prices) {
  const s = describe(input);
  if (!prices?.book) return { from: null, basis: "", lines: [] };
  const P = prepared(prices.book);
  const at = (extras) => priceDesign({ ...s, extras }, P).price;
  const label = s.unit === "wardrobe"
    ? `Fitted wardrobe, ${metres(s.w)} wide, ${s.doors} doors`
    : s.count === 2 ? "A pair of alcove units" : "One alcove unit";
  let running = at([]);
  const lines = [{ text: label, amount: running, from: true }];
  const chosen = [];
  for (const x of EXTRAS[s.unit]) {
    if (!s.extras.includes(x.id)) continue;
    chosen.push(x.id);
    const next = at([...chosen]);
    lines.push({ text: x.label, amount: next - running });
    running = next;
  }
  return { from: running, basis: "parts", lines };
}

/** The figure line by line, for the enquiry: "(fitted wardrobe ..., from £4,500; integrated lighting, 2 sections, £300)". */
export function priceWords(p) {
  if (!p?.from || p.lines.length < 2) return "";
  return `(${p.lines.map((l) => `${l.text.replace(/^./, (c) => c.toLowerCase())}, ${l.from ? "from " : ""}${money(l.amount)}`).join("; ")})`;
}

/** One line for a list: "Fitted wardrobe, 2.4m wide, 4 doors, hand-painted MDF". */
export function title(input, finishes) {
  const s = describe(input);
  const finish = (finishes?.[s.finish] ?? "").replace(/^./, (c) => c.toLowerCase());
  if (s.unit === "alcove") {
    return (s.count === 2 ? "A pair of alcove units" : "One alcove unit") + (finish ? ", " + finish : "");
  }
  return `Fitted wardrobe, ${metres(s.w)} wide, ${s.doors} doors` + (finish ? ", " + finish : "");
}

/**
 * The design in words, for the enquiry's job box and for anyone who cannot
 * see the picture. Plain lines, no link: the caller adds that.
 */
export function specLines(input, finishes) {
  const s = describe(input);
  const finish = (finishes?.[s.finish] ?? "").replace(/^./, (c) => c.toLowerCase());
  const colour = COLOURS[s.finish][s.colour].name;
  const door = DOORS.find((x) => x.id === s.door).text;
  // "long bar handles in matt black"; push to open has no handles, so no finish.
  const handle = HANDLES.find((x) => x.id === s.handle).text +
    (s.handle === "none" ? "" : ` in ${HANDLE_FINISHES.find((x) => x.id === s.handleFinish).text}`);
  const lines = [];
  if (s.unit === "wardrobe") {
    const fit = FITS.find((x) => x.id === s.fit).text;
    lines.push(`Fitted wardrobe: ${s.w} wide x ${s.h} high x ${s.d} deep (mm), ${fit}.`);
    lines.push(`${s.doors} doors, ${door}, ${handle}. Finish: ${finish}, shown in ${colour}.`);
    const inside = s.inside.map((id) => INSIDES.find((x) => x.id === id).text);
    lines.push(`Inside, left to right: ${inside.join("; ")}.`);
  } else {
    const sizes = s.count === 2
      ? `left alcove ${s.wl} wide, right alcove ${s.wr} wide`
      : `one alcove ${s.wl} wide`;
    lines.push(`Alcove units: ${sizes}, ${s.d} deep, ceiling ${s.h} high (mm).`);
    lines.push(`In each alcove: a base cupboard ${s.base} high with two ${door.replace(" doors", "")} doors, ${handle}, and ${s.shelves} open ${s.shelves === 1 ? "shelf" : "shelves"} above. Finish: ${finish}, shown in ${colour}.`);
  }
  const extras = extrasChosen(s);
  if (extras.length) lines.push(`Extras: ${extras.join(", ")}.`);
  return lines;
}

/* ---- A design in a link ---------------------------------------------------
   Short keys and a version number, so a link someone saved still opens after
   the builder changes. Whatever comes back out goes through normalise(), so a
   hand-edited link can only ever produce a valid design. A new key only ever
   goes on the END of a list: a link made before it simply lacks it, and
   normalise() fills in the default (handleFinish, 19 Nov 2026). */

const KEYS = {
  wardrobe: ["w", "h", "d", "fit", "finish", "colour", "door", "handle", "inside", "extras", "handleFinish"],
  alcove: ["count", "wl", "wr", "h", "d", "breast", "base", "shelves", "finish", "colour", "door", "handle", "extras", "handleFinish"],
};

const toBase64Url = (text) => {
  const b64 = typeof btoa === "function" ? btoa(text) : Buffer.from(text, "binary").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromBase64Url = (code) => {
  const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
  return typeof atob === "function" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
};

export function encode(input) {
  const s = normalise(input);
  const row = [1, s.unit === "alcove" ? "a" : "w", ...KEYS[s.unit].map((k) => s[k])];
  return toBase64Url(JSON.stringify(row));
}

/** A design from a link, or null when the code is not one of ours. */
export function decode(code) {
  try {
    const row = JSON.parse(fromBase64Url(String(code || "").trim()));
    if (!Array.isArray(row) || row[0] !== 1) return null;
    const unit = row[1] === "a" ? "alcove" : row[1] === "w" ? "wardrobe" : null;
    if (!unit) return null;
    const out = { unit };
    KEYS[unit].forEach((k, i) => { out[k] = row[i + 2]; });
    return normalise(out);
  } catch {
    return null;
  }
}

/* ---- A project: several designs and other services, one enquiry --------- */

/**
 * The words that go in the enquiry's job box. `items` are designs, `others`
 * the other services ticked, `linkFor` turns a design into its address.
 * Kept under the form's own limit of five web links: one link per design for
 * the first four, then none.
 */
export function projectText({ items = [], others = [], prices, finishes, linkFor }) {
  const out = ["Designed on the website:"];
  let known = 0;
  let unpriced = 0;
  items.forEach((item, i) => {
    const s = normalise(item);
    const p = guidePrice(s, prices);
    if (p.from) known += p.from; else unpriced += 1;
    out.push("");
    out.push(`${items.length > 1 ? `${i + 1}. ` : ""}${specLines(s, finishes).join(" ")}`);
    const parts = priceWords(p);
    out.push(p.from ? `Guide price shown: from ${money(p.from)}${parts ? ` ${parts}` : ""}.` : "No guide price shown: priced in the quotation.");
    if (linkFor && i < 4) out.push(`Open the design: ${linkFor(s)}`);
  });
  if (others.length) {
    out.push("");
    out.push(`Also wanted for the same visit: ${others.join(", ")}.`);
  }
  if (items.length > 1 && known) {
    out.push("");
    out.push(`Guide starting prices shown add up to ${money(known)}${unpriced ? ", with the rest priced in the quotation" : ""}.`);
  }
  return out.join("\n");
}

/**
 * The form's service ticks for a project. `labels` are the enquiry form's own
 * card values for the two units (the page reads them from the form's choices
 * and fails the build if either has gone), so a tick always matches a card.
 */
export function servicesFor({ items = [], others = [] }, labels) {
  const out = new Set();
  for (const item of items) out.add(labels[normalise(item).unit]);
  for (const other of others) out.add(other);
  return [...out];
}
