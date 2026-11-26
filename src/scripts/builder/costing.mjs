/**
 * THE COSTING ENGINE: a design priced part by part (19 Nov 2026).
 *
 * A founder, 19 Nov 2026: the builder's price comes from a list of every
 * single thing (boards, edging, screws, glue, hinges, handles, push-to-open,
 * runners, LEDs, labour and the rest), researched prices first, Kaspar's own
 * figures as he gives them, aiming at 95% accuracy.
 *
 * It mirrors the S&S pricing workbook of 14 Nov 2026 (Flowtoform research
 * 2026-11-14-ss-pricing-workflow, tools/build_workbook.py) formula for
 * formula: the same rules, the same twelve parts per unit (sides, top,
 * bottom, fixed and adjustable shelves, back, plinth, doors, drawer fronts,
 * drawer boxes, fillers, loose panels), the same counts and labour tasks,
 * costing sections A to F, contingencies, company % and rounding up.
 * tests/builder-costing.test.mjs holds the proof: given the workbook's own
 * worked example and its 14 Nov prices, it returns the workbook's £9,150.
 *
 * What the builder needs and the workbook does not have is marked BUILDER:
 * drawers behind the doors of a wardrobe, a second hanging rail, a mirror
 * inside a door, push-to-open, pull-outs, handle prices, alcove shelves on
 * concealed supports, and the step from a design on the page to unit rows.
 *
 * Every number is in the price book (src/data/price-book.json, kept in the
 * "S&S price book" Google Sheet). This file holds the arithmetic only. Each
 * entry's figure is Kaspar's when he has given one ("kaspar"), else ours.
 *
 * Built by Flowtoform Limited.
 */

const ceilTo = (n, step) => (step > 0 ? Math.ceil(n / step - 1e-9) * step : n);
const own = (entry, key) => entry?.kaspar ?? entry?.[key];

/* ---- The price book, indexed once ---------------------------------------- */

/**
 * Turns the price book into what the arithmetic reads: the rules by code, a
 * rate he pays per m2 for each board, per metre for each edging, per unit for
 * each item (VAT added while he is not registered), and the labour tasks.
 */
export function prepare(book) {
  const R = Object.fromEntries(book.rules.map((x) => [x.code, own(x, "value")]));
  const vat = R.VAT_REGISTERED === "No" ? 1 + R.VAT_RATE : 1;
  const resolveEdge = (e) => (e === "=EDGE_PAINTED" ? R.EDGE_PAINTED : e === "=EDGE_DECOR" ? R.EDGE_DECOR : e);
  const boards = new Map(book.boards.map((b) => {
    const price = own(b, "price");
    const cutting = b.kasparCutting ?? b.cutting;
    const usable = b.kasparUsable ?? b.usable;
    const area = ((b.sheetL * b.sheetW) / 1e6) * usable;
    const exVat = area > 0 ? (price + cutting) / area : 0;
    return [b.name, { rate: exVat * vat, edge: resolveEdge(b.edge), paintable: b.paintable }];
  }));
  const edging = new Map(book.edging.map((e) => [e.name, own(e, "price") * vat]));
  const items = new Map(book.items.map((x) => {
    const pack = x.kasparPack ?? x.pack;
    const each = pack ? (own(x, "price") * (x.noVat ? 1 : vat)) / pack : 0;
    return [x.code, { each, coverage: x.kasparCoverage ?? x.coverage }];
  }));
  const labour = book.labour.map((l) => ({ code: l.code, per: l.per, where: l.where, hours: own(l, "hours"), qty: l.qty }));
  return { R, vat, boards, edging, items, labour, runnerLengths: book.runnerLengths, builder: book.builder };
}

const itemEach = (P, code) => P.items.get(code)?.each ?? 0;
const coverage = (P, code) => P.items.get(code)?.coverage || 0;

/* ---- Step 1: unit rows, as on the workbook's Units sheet ------------------- */

/**
 * A unit row has the workbook's columns: name, type ("Cupboard", "Open
 * shelving", "Drawer unit" or "Loose panel"), qty, width, height (with the
 * plinth), depth, plinth, fixed and adjustable shelves, doors, drawers,
 * drawerFrontH (0 = auto), carcassBoard, frontBoard, doorStyle ("Slab" or
 * "Shaker"; BUILDER adds "Tongue and groove" and "Fluted", slab doors with
 * their own extra lines), finish ("Hand paint", "Spray own", "Spray
 * outsourced", "None"), paintInside, back, fillers, ledM and railM (row totals).
 * BUILDER columns: innerDrawers (behind the doors), rails (how many rails
 * the rail metres make), mirrors, handle ("knob", "bar", "longbar", "edge",
 * "none").
 */
function derive(u, R, lengths) {
  const valid = Boolean(u.type) && u.qty > 0;
  const carcass = valid && u.type !== "Loose panel";
  const yes = (v) => v === "Y";
  const carcassH = carcass ? u.height - (yes(u.plinth) ? R.PLINTH_H : 0) : 0;
  const partD = carcass ? u.depth - (yes(u.back) && R.BACK_METHOD === "Applied" ? R.T_BACK : 0) : 0;
  const insideW = carcass ? u.width - 2 * R.T_CARC : 0;
  const inset = R.DOOR_TYPE === "Inset";
  const frontH = carcass ? (inset ? carcassH - 2 * R.T_CARC - 2 * R.GAP : carcassH - 2 * R.REVEAL) : 0;
  const frontW = carcass ? (inset ? insideW - 2 * R.GAP : u.width - 2 * R.REVEAL) : 0;
  const doors = Number(u.doors) || 0;
  const drawers = Number(u.drawers) || 0;
  const drawerFrontH = carcass && drawers > 0
    ? (u.drawerFrontH > 0 ? u.drawerFrontH : doors > 0 ? R.DRAWER_FRONT_DEFAULT : (frontH - (drawers - 1) * R.GAP) / drawers)
    : 0;
  const doorH = carcass && doors > 0 ? frontH - (drawers > 0 ? drawers * (drawerFrontH + R.GAP) : 0) : 0;
  const doorW = carcass && doors > 0 ? (frontW - (doors - 1) * R.GAP) / doors : 0;
  const anyDrawers = drawers + (Number(u.innerDrawers) || 0);
  let runner = 0;
  if (carcass && anyDrawers > 0) for (const L of lengths) if (L <= partD - R.RUNNER_ALLOW) runner = L;
  const hingesPerDoor = doorH > 0
    ? 2 + (doorH > R.HINGE_2_MAX) + (doorH > R.HINGE_3_MAX) + (doorH > R.HINGE_4_MAX) + (doorH > R.HINGE_5_MAX)
    : 0;
  const finished = valid && u.finish && u.finish !== "None";
  return { valid, carcass, carcassH, partD, insideW, frontH, frontW, drawerFrontH, doorH, doorW, runner, hingesPerDoor, finished };
}

/* ---- Step 2: the cut list -------------------------------------------------- */

const PARTS = ["Side", "Top", "Bottom", "Fixed shelf", "Adjustable shelf", "Back", "Plinth", "Door", "Drawer front",
  "Inner drawer front", "Drawer box", "Filler", "Loose panel"];

/** Every part of every unit, with its area, edging metres and finished faces. */
/** BUILDER: the parts of a carcass, finished as the inside is when the inside has its own finish. */
const CARCASS_PARTS = new Set(["Side", "Top", "Bottom", "Fixed shelf", "Adjustable shelf", "Back"]);

export function cutList(units, P) {
  const { R } = P;
  const parts = [];
  units.forEach((u, index) => {
    const d = derive(u, R, P.runnerLengths);
    if (!d.valid) return;
    // BUILDER: the inside may be finished differently from the outside (insideRoute); a row that
    // does not say is finished all one way, as the workbook's are.
    const insideRoute = u.insideRoute || u.finish;
    const insideFinished = d.valid && insideRoute && insideRoute !== "None";
    const carcassFaces = insideFinished && u.paintInside === "Y" && P.boards.get(u.carcassBoard)?.paintable !== "N" ? R.FACES_CARCASS : 0;
    for (const part of PARTS) {
      let mat = u.carcassBoard, L = 0, W = 0, Q = 0, edges = [], faces = 0, tab = "Board + edging", rateMat = u.carcassBoard, area = null;
      const qty = u.qty;
      if (part === "Side") {
        L = d.carcassH; W = d.partD; Q = d.carcass ? 2 * qty : 0; edges = ["L1"]; faces = carcassFaces;
      } else if (part === "Top" || part === "Bottom") {
        L = d.insideW; W = d.partD; Q = d.carcass ? qty : 0; edges = ["L1"]; faces = carcassFaces;
      } else if (part === "Fixed shelf" || part === "Adjustable shelf") {
        L = part === "Fixed shelf" ? d.insideW : d.insideW - R.SHELF_CLEAR;
        W = d.partD - (Number(u.doors) > 0 ? R.SHELF_SETBACK : 0);
        Q = d.carcass ? (Number(part === "Fixed shelf" ? u.fixedShelves : u.adjShelves) || 0) * qty : 0;
        edges = ["L1"]; faces = carcassFaces;
      } else if (part === "Back") {
        mat = rateMat = R.BACK_BOARD;
        L = R.BACK_METHOD === "Applied" ? d.carcassH : d.carcassH - 2 * R.T_CARC + 2 * R.GROOVE_DEPTH;
        W = R.BACK_METHOD === "Applied" ? u.width : d.insideW + 2 * R.GROOVE_DEPTH;
        Q = d.carcass && u.back === "Y" ? qty : 0;
        faces = carcassFaces > 0 ? R.FACES_BACK : 0;
      } else if (part === "Plinth") {
        L = u.width; W = R.PLINTH_H; Q = d.carcass && u.plinth === "Y" ? R.PLINTH_PIECES * qty : 0;
        edges = ["L1"]; faces = d.finished ? R.FACES_PLINTH : 0;
      } else if (part === "Door") {
        mat = rateMat = u.frontBoard; L = d.doorH; W = d.doorW; Q = d.carcass ? (Number(u.doors) || 0) * qty : 0;
        edges = ["L1", "L2", "W1", "W2"]; faces = d.finished ? R.FACES_FRONT : 0;
        tab = u.doorStyle === "Shaker" ? "Shaker doors" : "Board + edging";
      } else if (part === "Drawer front") {
        mat = rateMat = u.frontBoard; L = d.frontW; W = d.drawerFrontH; Q = d.carcass ? (Number(u.drawers) || 0) * qty : 0;
        edges = ["L1", "L2", "W1", "W2"]; faces = d.finished ? R.FACES_FRONT : 0;
      } else if (part === "Inner drawer front") {
        // BUILDER: a drawer behind the doors has a plain front in the carcass board, never finished.
        L = d.insideW - 2 * R.GAP; W = R.DRAWER_FRONT_DEFAULT; Q = d.carcass ? (Number(u.innerDrawers) || 0) * qty : 0;
        edges = ["L1", "L2", "W1", "W2"]; faces = 0;
      } else if (part === "Drawer box") {
        mat = `Drawer box, ${u.carcassBoard}`; L = d.runner; W = d.insideW;
        Q = d.carcass ? ((Number(u.drawers) || 0) + (Number(u.innerDrawers) || 0)) * qty : 0;
        tab = "Drawer boxes"; area = Q > 0 ? (W * L + 2 * L * R.DRAWER_SIDE_H + 2 * W * R.DRAWER_SIDE_H) / 1e6 : 0;
      } else if (part === "Filler") {
        L = u.height; W = R.FILLER_W; Q = d.valid ? Number(u.fillers) || 0 : 0; faces = d.finished ? R.FACES_FILLER : 0;
      } else if (part === "Loose panel") {
        L = u.width; W = u.height; Q = d.valid && u.type === "Loose panel" ? qty : 0; edges = ["L1"]; faces = d.finished ? R.FACES_LOOSE : 0;
      }
      if (!(Q > 0)) continue;
      L = Math.round(L * 10) / 10;
      W = Math.round(W * 10) / 10;
      const board = P.boards.get(rateMat);
      const edgeType = board?.edge ?? "None";
      const edged = edgeType && edgeType !== "None" && !(part === "Door" && tab === "Shaker doors");
      const each = area ?? (L * W) / 1e6;
      const areaTotal = each * Q;
      const edgeM = edged ? (Q * edges.reduce((s, e) => s + (e[0] === "L" ? L : W), 0)) / 1000 : 0;
      const finishM2 = areaTotal * faces * (board?.paintable === "N" ? 0 : 1);
      const rate = tab === "Shaker doors" ? itemEach(P, "CW_SHAKER_M2") : board?.rate ?? 0;
      const route = CARCASS_PARTS.has(part) ? insideRoute : u.finish;
      parts.push({
        unit: index + 1, part, name: u.name, mat, L, W, Q, areaTotal, edgeM, edgeType: edgeM > 0 ? edgeType : "",
        finishM2, finish: finishM2 > 0 ? route : "", tab, rate, boardCost: areaTotal * rate,
        style: part === "Door" ? u.doorStyle || "Slab" : "",
        hinges: part === "Door" ? Q * d.hingesPerDoor : 0,
        // Primed by the cutting service only where it is finished as the outside is (hand painting).
        primed: R._priming === "Y" && finishM2 > 0 && tab === "Board + edging" && route === u.finish,
      });
    }
  });
  return parts;
}

/* ---- Step 3: counts, labour, costing --------------------------------------- */

const sumBy = (rows, key, test) => rows.reduce((s, r) => s + (test(r) ? r[key] : 0), 0);

/** The workbook's job counts, plus the BUILDER counts. */
export function counts(units, parts, P) {
  const live = units.filter((u) => Boolean(u.type) && u.qty > 0);
  const carcassRows = live.filter((u) => u.type !== "Loose panel");
  const Qof = (part) => sumBy(parts, "Q", (r) => r.part === part);
  // BUILDER: what takes a handle. A long bar goes on doors and drawer fronts;
  // a drawer behind the doors gets an ordinary bar instead.
  const fronts = (u) => ((Number(u.doors) || 0) + (Number(u.drawers) || 0)) * u.qty;
  const inner = (u) => (Number(u.innerDrawers) || 0) * u.qty;
  const handled = (kind, f) => live.reduce((s, u) => s + (u.handle === kind ? f(u) : 0), 0);
  const doorArea = (style, finishedOnly = false) => sumBy(parts, "areaTotal", (r) => r.part === "Door" && r.style === style && (!finishedOnly || r.finishM2 > 0));
  return {
    CNT_CARCASS: carcassRows.reduce((s, u) => s + u.qty, 0),
    CNT_DOORS: Qof("Door"),
    CNT_DRAWERS: Qof("Drawer box"),
    CNT_FIXED: Qof("Fixed shelf"),
    CNT_ADJ: Qof("Adjustable shelf"),
    CNT_FILLERS: Qof("Filler"),
    CNT_LOOSE: Qof("Loose panel"),
    CNT_PLINTH_UNITS: carcassRows.reduce((s, u) => s + (u.plinth === "Y" ? u.qty : 0), 0),
    CNT_HINGES: sumBy(parts, "hinges", () => true),
    LED_M: live.reduce((s, u) => s + (Number(u.ledM) || 0), 0),
    LED_RUNS: live.filter((u) => Number(u.ledM) > 0).length,
    RAIL_M: live.reduce((s, u) => s + (Number(u.railM) || 0), 0),
    // BUILDER: a row may say how many rails its metres make (double hanging has two); the workbook counts one per row.
    RAILS: live.reduce((s, u) => s + (Number(u.railM) > 0 ? Number(u.rails) || 1 : 0), 0),
    AREA_BOARD: sumBy(parts, "areaTotal", (r) => r.tab === "Board + edging"),
    AREA_HAND: sumBy(parts, "finishM2", (r) => r.finish === "Hand paint"),
    AREA_SPRAY_OWN: sumBy(parts, "finishM2", (r) => r.finish === "Spray own"),
    AREA_SPRAY_OUT: sumBy(parts, "finishM2", (r) => r.finish === "Spray outsourced"),
    // BUILDER: oak veneer goes to a finishing shop to be stained and lacquered.
    AREA_LACQUER_OUT: sumBy(parts, "finishM2", (r) => r.finish === "Lacquer outsourced"),
    AREA_OUTSOURCED: sumBy(parts, "finishM2", (r) => r.finish === "Spray outsourced" || r.finish === "Lacquer outsourced"),
    // BUILDER: veneer faces outside (grain matched, the calibrated hours) and inside (an oak inside).
    AREA_VENEER_OUTSIDE: sumBy(parts, "finishM2", (r) => r.finish === "Lacquer outsourced" && !CARCASS_PARTS.has(r.part)),
    AREA_VENEER_INSIDE: sumBy(parts, "finishM2", (r) => r.finish === "Lacquer outsourced" && CARCASS_PARTS.has(r.part)),
    AREA_PRIMED: sumBy(parts, "areaTotal", (r) => r.primed),
    // BUILDER counts.
    // The front area of every carcass, so making and fitting hours can grow with its size:
    // a 2.3 m wardrobe carcass is not an alcove base cupboard.
    CARCASS_M2: carcassRows.reduce((s, u) => s + (u.width * (u.height - (u.plinth === "Y" ? P.R.PLINTH_H : 0)) * u.qty) / 1e6, 0),
    MIRRORS_M2: live.reduce((s, u) => s + (Number(u.mirrorM2) || 0), 0),
    MIRRORS: live.reduce((s, u) => s + (Number(u.mirrors) || 0), 0),
    TIPON_DOORS: live.reduce((s, u) => s + (u.handle === "none" && u.type !== "Loose panel" ? (Number(u.doors) || 0) * u.qty : 0), 0),
    TIPON_DRAWERS: live.reduce((s, u) => s + (u.handle === "none" && u.type !== "Loose panel" ? ((Number(u.drawers) || 0) + (Number(u.innerDrawers) || 0)) * u.qty : 0), 0),
    KNOBS: handled("knob", (u) => fronts(u) + inner(u)),
    BARS: handled("bar", (u) => fronts(u) + inner(u)) + handled("longbar", inner),
    LONGBARS: handled("longbar", fronts),
    EDGES: handled("edge", (u) => fronts(u) + inner(u)),
    ROUTED: handled("routed", (u) => fronts(u) + inner(u)),
    JEWELLERY_DRAWERS: live.reduce((s, u) => s + (Number(u.jewelleryDrawers) || 0), 0),
    TIE_RACKS: live.reduce((s, u) => s + (Number(u.tieRacks) || 0), 0),
    // Door area by style: the extra for the grooves or the fluted board, and
    // (finished doors only) the extra time finishing into them.
    AREA_TG: doorArea("Tongue and groove"),
    AREA_FLUTED: doorArea("Fluted"),
    AREA_TG_FINISHED: doorArea("Tongue and groove", true),
    AREA_FLUTED_FINISHED: doorArea("Fluted", true),
    SHOE_RACKS: live.reduce((s, u) => s + (Number(u.shoeRacks) || 0), 0),
    TROUSER_RAILS: live.reduce((s, u) => s + (Number(u.trouserRails) || 0), 0),
    FLOATING_SHELVES: live.reduce((s, u) => s + (Number(u.floatingShelves) || 0), 0),
  };
}

/** Hours per task (the workbook's Labour sheet), travel, contingency, days and site days. */
export function labour(C, P) {
  const { R } = P;
  const qtyOf = (expr) => {
    if (expr == null) return 0;
    if (typeof expr === "number") return expr;
    // A sum of counts, or "IF:<count>" for once a job when the count is above nought.
    if (expr.startsWith("IF:")) return C[expr.slice(3)] > 0 ? 1 : 0;
    return expr.split("+").reduce((s, k) => s + (Number(C[k.trim()]) || 0), 0);
  };
  const tasks = P.labour.filter((t) => t.code !== "L_TRAVEL").map((t) => ({ ...t, q: qtyOf(t.qty), h: (t.hours || 0) * qtyOf(t.qty) }));
  const siteH = tasks.reduce((s, t) => s + (t.where === "Site" ? t.h : 0), 0);
  const travel = P.labour.find((t) => t.code === "L_TRAVEL");
  const travelQ = Math.ceil(siteH / R.HOURS_PER_DAY - 1e-9);
  const travelH = (travel?.hours || 0) * travelQ;
  tasks.push({ code: "L_TRAVEL", where: "Travel", q: travelQ, h: travelH, hours: travel?.hours || 0 });
  const raw = tasks.reduce((s, t) => s + t.h, 0);
  const hours = raw * (1 + R.CONT_LABOUR);
  const days = hours / R.HOURS_PER_DAY;
  const siteDays = Math.ceil(((siteH + travelH) * (1 + R.CONT_LABOUR)) / R.HOURS_PER_DAY - 1e-9);
  return { tasks, raw, hours, days, cost: days * R.DAY_RATE, siteDays };
}

/**
 * The workbook's costing sheet: sections A to F, the totals and the quote.
 * Returns every line, so the Google Sheet and a reader can follow it.
 */
export function costing(units, P) {
  const { R } = P;
  const parts = cutList(units, P);
  const C = counts(units, parts, P);
  const lab = labour(C, P);
  const line = (section, label, qty, rate) => ({ section, label, qty, rate, cost: qty * rate });
  const lines = [];

  // A. Boards, cutting, edging, priming, drawer boxes, shaker doors, drilling, delivery.
  for (const [name, b] of P.boards) {
    const area = sumBy(parts, "areaTotal", (r) => r.mat === name && r.tab === "Board + edging");
    if (area > 0) lines.push(line("A", name, area, b.rate));
  }
  for (const [name, rate] of P.edging) {
    if (name === "None") continue;
    const m = sumBy(parts, "edgeM", (r) => r.edgeType === name);
    if (m > 0) lines.push(line("A", `Edging: ${name}`, m, rate));
  }
  if (C.AREA_PRIMED > 0) lines.push(line("A", "Priming by Cutwrights (both faces)", C.AREA_PRIMED, itemEach(P, "CW_PRIME")));
  if (C.CNT_DRAWERS > 0) {
    const box = itemEach(P, "CW_DRAWER_BOX");
    const est = sumBy(parts, "boardCost", (r) => r.part === "Drawer box");
    lines.push(box > 0 ? line("A", "Drawer boxes", C.CNT_DRAWERS, box) : { section: "A", label: "Drawer boxes (estimated from their board)", qty: C.CNT_DRAWERS, rate: 0, cost: est });
  }
  const shakerM2 = sumBy(parts, "areaTotal", (r) => r.tab === "Shaker doors");
  if (shakerM2 > 0) lines.push(line("A", "Shaker doors", shakerM2, itemEach(P, "CW_SHAKER_M2")));
  // BUILDER: tongue and groove and fluted doors are slab doors plus these.
  if (C.AREA_TG > 0) lines.push(line("A", "V-grooving, tongue and groove doors", C.AREA_TG, itemEach(P, "DOOR_TG_M2")));
  if (C.AREA_FLUTED > 0) lines.push(line("A", "Fluted MDF over plain, fluted doors", C.AREA_FLUTED, itemEach(P, "DOOR_FLUTED_M2")));
  if (C.ROUTED) lines.push(line("A", "Routed finger pulls", C.ROUTED, itemEach(P, "ROUTED_PULL")));
  // Per hinge cup, the way the cut-to-size shops that publish it price it; the workbook had one
  // figure per job, never filled (so its worked example is unchanged).
  lines.push(line("A", "Drilling hinge cups", C.CNT_HINGES, itemEach(P, "CW_DRILL")));
  lines.push(line("A", "Delivery to site", 1, itemEach(P, "CW_DELIVERY")));

  // B. Hardware and lighting.
  lines.push(line("B", "Hinges with mounting plates", C.CNT_HINGES, itemEach(P, "HINGE") + itemEach(P, "HINGE_PLATE")));
  lines.push(line("B", "Drawer runners, pair", C.CNT_DRAWERS, itemEach(P, "RUNNER")));
  lines.push(line("B", "Shelf pins", C.CNT_ADJ * R.PINS_PER_SHELF, itemEach(P, "SHELF_PIN")));
  lines.push(line("B", "Hanging rail", C.RAIL_M, itemEach(P, "RAIL")));
  lines.push(line("B", "Rail end supports", C.RAILS, itemEach(P, "RAIL_END")));
  // The workbook's single handle line, kept for rows that do not say which handle (its example).
  const untold = C.CNT_DOORS + C.CNT_DRAWERS - C.KNOBS - C.BARS - C.LONGBARS - C.EDGES - C.ROUTED - C.TIPON_DOORS - C.TIPON_DRAWERS;
  lines.push(line("B", "Handles / knobs", Math.max(0, untold), itemEach(P, "HANDLE")));
  // BUILDER: the handle chosen, priced per piece; "none" is push to open. The
  // handle's metal never moves it: brass, matt black and chrome cost the same.
  if (C.KNOBS) lines.push(line("B", "Knobs", C.KNOBS, itemEach(P, "HANDLE_KNOB")));
  if (C.BARS) lines.push(line("B", "Bar handles", C.BARS, itemEach(P, "HANDLE_BAR")));
  if (C.LONGBARS) lines.push(line("B", "Long bar handles", C.LONGBARS, itemEach(P, "HANDLE_LONGBAR")));
  if (C.EDGES) lines.push(line("B", "Edge pulls", C.EDGES, itemEach(P, "HANDLE_EDGE")));
  if (C.TIPON_DOORS) lines.push(line("B", "Push to open, doors", C.TIPON_DOORS, itemEach(P, "TIPON_DOOR")));
  if (C.TIPON_DRAWERS) lines.push(line("B", "Push to open, drawers", C.TIPON_DRAWERS, itemEach(P, "TIPON_DRAWER")));
  lines.push(line("B", "Wall fixings", C.CNT_CARCASS * R.WALL_FIX_PER_CARCASS, itemEach(P, "WALL_SCREW")));
  lines.push(line("B", "LED profile", C.LED_M, itemEach(P, "LED_PROFILE")));
  lines.push(line("B", "LED strip", C.LED_M, itemEach(P, "LED_STRIP")));
  lines.push(line("B", "LED drivers", C.LED_M > 0 ? Math.max(Math.ceil(C.LED_M / R.LED_M_PER_DRIVER - 1e-9), C.LED_RUNS) : 0, itemEach(P, "LED_DRIVER")));
  lines.push(line("B", "LED switch / door sensor and connectors", C.LED_RUNS, itemEach(P, "LED_SWITCH")));
  // BUILDER extras.
  if (C.MIRRORS) {
    lines.push(line("B", "Mirror glass, cut and polished", C.MIRRORS_M2, itemEach(P, "MIRROR_M2")));
    lines.push(line("B", "Mirror adhesive", C.MIRRORS, itemEach(P, "MIRROR_FIX")));
  }
  if (C.SHOE_RACKS) lines.push(line("B", "Shoe storage", C.SHOE_RACKS, itemEach(P, "SHOE_RACK")));
  if (C.TROUSER_RAILS) lines.push(line("B", "Pull-out trouser rail", C.TROUSER_RAILS, itemEach(P, "TROUSER_RAIL")));
  if (C.JEWELLERY_DRAWERS) lines.push(line("B", "Jewellery and watch drawer", C.JEWELLERY_DRAWERS, itemEach(P, "JEWELLERY_DRAWER")));
  if (C.TIE_RACKS) lines.push(line("B", "Tie and belt rack", C.TIE_RACKS, itemEach(P, "TIE_RACK")));
  if (C.FLOATING_SHELVES) lines.push(line("B", "Concealed shelf supports", C.FLOATING_SHELVES, itemEach(P, "SHELF_SUPPORT")));

  // C. Consumables.
  const painted = C.AREA_HAND + C.AREA_SPRAY_OWN > 0;
  lines.push(line("C", "Confirmat screws", C.CNT_CARCASS * R.USE_CONFIRMAT, itemEach(P, "CONFIRMAT")));
  lines.push(line("C", "Wood screws 4 x 40", C.CNT_CARCASS * R.USE_SCREWS, itemEach(P, "SCREW_4X40")));
  lines.push(line("C", "Dowels", C.CNT_CARCASS * R.USE_DOWELS, itemEach(P, "DOWEL")));
  lines.push(line("C", "Wood glue", C.CNT_CARCASS * R.USE_GLUE_L, itemEach(P, "GLUE")));
  lines.push(line("C", "Grab adhesive", (C.CNT_FILLERS + C.CNT_LOOSE) * R.USE_GRAB, itemEach(P, "GRAB")));
  lines.push(line("C", "Decorators caulk", painted ? C.CNT_CARCASS * R.USE_CAULK : 0, itemEach(P, "CAULK")));
  lines.push(line("C", "Wood filler", painted ? R.USE_FILLER_TIN : 0, itemEach(P, "WOOD_FILLER")));
  lines.push(line("C", "Abrasive discs", (C.AREA_HAND + C.AREA_SPRAY_OWN) * R.USE_DISCS, itemEach(P, "DISC")));
  lines.push(line("C", "Masking tape", painted ? R.USE_TAPE : 0, itemEach(P, "TAPE")));

  // D. Finish materials.
  const primed = R._priming === "Y";
  const litres = (area, coats, code) => (coverage(P, code) > 0 ? (area * coats) / coverage(P, code) : 0);
  lines.push(line("D", "Hand paint: primer", primed ? 0 : litres(C.AREA_HAND, R.PAINT_PRIMER_COATS, "PRIMER_BRUSH"), itemEach(P, "PRIMER_BRUSH")));
  lines.push(line("D", "Hand paint: topcoat", litres(C.AREA_HAND, R.PAINT_TOP_COATS, "PAINT_TOP"), itemEach(P, "PAINT_TOP")));
  lines.push(line("D", "Own spray: primer", primed ? 0 : litres(C.AREA_SPRAY_OWN, R.OWN_PRIMER_COATS, "PRIMER_SPRAY"), itemEach(P, "PRIMER_SPRAY")));
  lines.push(line("D", "Own spray: topcoat", litres(C.AREA_SPRAY_OWN, R.OWN_TOP_COATS, "TOP_SPRAY"), itemEach(P, "TOP_SPRAY")));
  lines.push(line("D", "Own spray: sundries", C.AREA_SPRAY_OWN, itemEach(P, "SPRAY_SUNDRIES")));
  lines.push(line("D", "Outsourced spraying", C.AREA_SPRAY_OUT, itemEach(P, "SPRAY_OUT")));
  if (C.AREA_LACQUER_OUT) lines.push(line("D", "Outsourced stain and lacquer", C.AREA_LACQUER_OUT, itemEach(P, "LACQUER_OUT")));

  // E. Labour.
  lines.push({ section: "E", label: "Kaspar's time", qty: lab.days, rate: R.DAY_RATE, cost: lab.cost });
  lines.push(line("E", "Helper", R.HELPER_DAYS || 0, R.HELPER_RATE));

  // F. Job costs.
  lines.push(line("F", "Drawing by his CAD drafter", R.CAD_JOBS ?? 1, itemEach(P, "CAD_DRAWING")));
  lines.push(line("F", "Parking", lab.siteDays, R.PARKING_PER_DAY));
  lines.push(line("F", "Congestion Charge", R.CONGESTION_ZONE === "Y" ? lab.siteDays : 0, itemEach(P, "CONGESTION")));
  lines.push(line("F", "ULEZ", R.ULEZ_VAN === "Y" ? lab.siteDays : 0, itemEach(P, "ULEZ")));
  lines.push(line("F", "Van running cost", lab.siteDays, R.VAN_PER_DAY || 0));
  lines.push(line("F", "Waste removal", 1, R.WASTE_PER_JOB || 0));

  const total = (s) => lines.reduce((sum, l) => sum + (l.section === s ? l.cost : 0), 0);
  const A = total("A"), B = total("B"), Cc = total("C"), D = total("D"), E = total("E"), F = total("F");
  const materials = A + B + Cc + D;
  const matCont = materials * R.CONT_MATERIALS;
  const matMarkup = (materials + matCont) * R.MATERIAL_MARKUP;
  const totalCost = materials + matCont + matMarkup + E + F;
  const company = (R.COMPANY_ON === "Labour only" ? E : totalCost) * R.COMPANY_PCT;
  const before = totalCost + company;
  const price = ceilTo(before, R.ROUND_TO);
  return { price, before, sections: { A, B, C: Cc, D, E, F }, materials, matCont, matMarkup, totalCost, company, lines, counts: C, labour: lab, parts };
}

/* ---- What a visitor's browser is given --------------------------------------- */

/** Job costs (section F): marked up by the company % only, never by the materials contingency. */
const F_ITEMS = new Set(["CAD_DRAWING", "CONGESTION", "ULEZ"]);
const F_RULES = ["PARKING_PER_DAY", "VAN_PER_DAY", "WASTE_PER_JOB"];

/**
 * The price book as the page may carry it: every rate already includes VAT
 * he pays, the materials contingency and markup, and the company %, so the
 * same arithmetic gives the same price while his costs, his day rate and his
 * margin never reach a browser. Labels and sources are dropped too.
 * tests/builder-costing.test.mjs checks the price is unchanged.
 */
export function sellBook(book) {
  const P = prepare(book);
  const R = P.R;
  const vat = P.vat;
  const cp = R.COMPANY_PCT;
  const labourOnly = R.COMPANY_ON === "Labour only";
  const kMat = (1 + R.CONT_MATERIALS) * (1 + R.MATERIAL_MARKUP) * (labourOnly ? 1 : 1 + cp);
  const kJob = labourOnly ? 1 : 1 + cp;
  const kLab = 1 + cp;
  const rules = book.rules.map((x) => {
    let value = own(x, "value");
    if (["CONT_MATERIALS", "MATERIAL_MARKUP", "COMPANY_PCT"].includes(x.code)) value = 0;
    if (x.code === "VAT_REGISTERED") value = "Yes";
    if (x.code === "DAY_RATE" || x.code === "HELPER_RATE") value = value * kLab;
    if (F_RULES.includes(x.code)) value = value * kJob;
    return { code: x.code, value };
  });
  return {
    rules,
    runnerLengths: book.runnerLengths,
    boards: book.boards.map((b) => ({
      name: b.name, sheetL: b.sheetL, sheetW: b.sheetW, edge: b.edge, paintable: b.paintable,
      usable: b.kasparUsable ?? b.usable,
      price: own(b, "price") * vat * kMat,
      cutting: (b.kasparCutting ?? b.cutting) * vat * kMat,
    })),
    edging: book.edging.map((e) => ({ name: e.name, price: own(e, "price") * vat * kMat })),
    items: book.items.map((x) => ({
      code: x.code, pack: x.kasparPack ?? x.pack, coverage: x.kasparCoverage ?? x.coverage, noVat: true,
      price: own(x, "price") * (x.noVat ? 1 : vat) * (F_ITEMS.has(x.code) ? kJob : kMat),
    })),
    labour: book.labour.map((l) => ({ code: l.code, per: l.per, where: l.where, hours: own(l, "hours"), qty: l.qty })),
    builder: book.builder,
  };
}

/* ---- BUILDER: a design on the page, as unit rows ---------------------------- */

/**
 * The step the workbook leaves to a person: a fitted wardrobe or alcove
 * units, as designed on the page, become unit rows. Every choice here is a
 * rule in the price book's "builder" section, so it can be changed there.
 * `s` is a described design (model.mjs describe()).
 */
export function unitsFor(s, P) {
  const B = P.builder;
  const fin = B.finishes[s.finish];
  // The inside finish (builder rules, insideFinishes): the board inside, whether it is finished,
  // and how. Board "" keeps the outside finish's own carcass rules (white melamine today);
  // "front" uses its door board; route "finish" finishes it as the outside is.
  const inner = B.insideFinishes?.[s.insideFinish] ?? { board: "", paint: "N", route: "" };
  const inside = (ownBoard, ownPaint) => (inner.board
    ? {
      carcassBoard: inner.board === "front" ? fin.front : inner.board,
      paintInside: inner.paint || "N",
      insideRoute: inner.route === "finish" ? fin.route : inner.route || undefined,
    }
    : { carcassBoard: ownBoard, paintInside: ownPaint });
  const handle = s.handle;
  // Slim Shaker is priced as Shaker (no slim premium found, price book note 04).
  const doorStyle = { shaker: "Shaker", slim: "Shaker", tg: "Tongue and groove", fluted: "Fluted" }[s.door] ?? "Slab";
  const rows = [];
  if (s.unit === "wardrobe") {
    const W = B.wardrobe;
    const wallL = s.fit === "both" || s.fit === "left";
    const wallR = s.fit === "both" || s.fit === "right";
    const walls = (wallL ? 1 : 0) + (wallR ? 1 : 0);
    const ends = 2 - walls;
    const carcassRun = s.w - walls * W.fillerTakes - ends * P.R.T_CARC;
    const carcassH = s.h - W.topFillerH;
    // The hanging space's height, for the LED strips down its sides (as scene.mjs draws them).
    const innerH = carcassH - P.R.PLINTH_H - 2 * P.R.T_CARC;
    s.sections.forEach((doors, i) => {
      const layout = W.insides[s.inside[i]] ?? W.insides.hang;
      const width = (carcassRun * doors) / s.doors;
      const insideW = width - 2 * P.R.T_CARC;
      const lit = s.extras.includes("lighting");
      // Lighting as drawn (research 05): the top front strip; a strip down each side where there is
      // hanging, stopping above any drawers; and one under every adjustable shelf.
      const hangs = layout.rails > 0;
      const sideRun = innerH - (hangs && layout.drawers > 0 ? 600 + P.R.T_CARC : 0) - 20;
      const ledMm = insideW * (W.ledPerSection ?? 1)
        + (hangs ? (W.ledSidesInHanging ?? 0) * sideRun : 0)
        + (W.ledUnderShelves === "Y" ? (layout.adj || 0) * (insideW - 40) : 0);
      const first = i === 0;
      rows.push({
        name: `Wardrobe section ${i + 1}`, type: "Cupboard", qty: 1, width, height: carcassH, depth: s.d,
        plinth: "Y", fixedShelves: layout.fixed, adjShelves: layout.adj, doors, drawers: 0, drawerFrontH: 0,
        frontBoard: fin.front, doorStyle, finish: fin.route, back: "Y", ...inside(fin.carcass, W.paintInside),
        fillers: first ? walls : 0, ledM: lit ? ledMm / 1000 : 0,
        railM: (layout.rails * insideW) / 1000, rails: layout.rails, innerDrawers: layout.drawers, handle,
        mirrors: first && s.extras.includes("mirror") ? 1 : 0,
        mirrorM2: first && s.extras.includes("mirror") ? mirrorArea(s, P, width, doors, carcassH) : 0,
        shoeRacks: first && s.extras.includes("shoes") ? 1 : 0,
        trouserRails: first && s.extras.includes("trousers") ? 1 : 0,
        jewelleryDrawers: first && s.extras.includes("jewellery") ? 1 : 0,
        tieRacks: first && s.extras.includes("ties") ? 1 : 0,
      });
    });
    // The strip scribed to the ceiling, and a finished end panel on each open end.
    rows.push({ name: "Top scribe strip", type: "Loose panel", qty: 1, width: s.w, height: W.topFillerH, carcassBoard: fin.front, finish: fin.route, fillers: 0 });
    if (ends) rows.push({ name: "End panel", type: "Loose panel", qty: ends, width: s.h, height: s.d, carcassBoard: fin.front, finish: fin.route, fillers: 0 });
  } else {
    const A = B.alcove;
    const widths = s.count === 2 ? [s.wl, s.wr] : [s.wl];
    const shelfDepth = Math.max(A.shelfDepthMin, Math.min(s.d - A.shelfDepthGap, A.shelfDepthMax));
    widths.forEach((w, i) => {
      const width = w - A.scribe;
      const lit = s.extras.includes("lighting");
      rows.push({
        name: `Alcove ${i + 1} base cupboard`, type: "Cupboard", qty: 1, width, height: s.base - A.topT, depth: s.d,
        plinth: "Y", fixedShelves: 0, adjShelves: A.cupboardShelves, doors: 2, drawers: s.extras.includes("drawers") ? 1 : 0, drawerFrontH: 0,
        frontBoard: fin.front, doorStyle, finish: fin.route, back: "Y",
        ...inside(fin.alcoveCarcass, fin.alcovePaintInside),
        fillers: A.fillersPerAlcove, ledM: 0, railM: 0, handle,
      });
      rows.push({ name: `Alcove ${i + 1} top`, type: "Loose panel", qty: 1, width: w, height: s.d + A.topOverhang, carcassBoard: fin.top, finish: fin.route, fillers: 0 });
      if (s.shelves > 0) {
        rows.push({
          name: `Alcove ${i + 1} shelves`, type: "Loose panel", qty: s.shelves, width, height: shelfDepth, carcassBoard: fin.shelf, finish: fin.route,
          fillers: 0, floatingShelves: s.shelves, ledM: lit ? (s.shelves * width) / 1000 : 0,
        });
      }
    });
  }
  return rows;
}

/** BUILDER: the mirror inside the first door, inset from its edges. */
function mirrorArea(s, P, width, doors, carcassH) {
  const d = derive({ type: "Cupboard", qty: 1, width, height: carcassH, depth: s.d, plinth: "Y", back: "Y", doors, drawers: 0 }, P.R, P.runnerLengths);
  const m = P.builder.wardrobe.mirrorInset;
  return Math.max(0, ((d.doorH - 2 * m) * (d.doorW - 2 * m)) / 1e6);
}

/**
 * A design's price from the price book. The priming setting follows the
 * finish (the workbook sets it once per job). Returns costing() plus the rows.
 */
export function priceDesign(s, P) {
  const fin = P.builder.finishes[s.finish];
  const Pj = { ...P, R: { ...P.R, _priming: fin.priming } };
  const units = unitsFor(s, Pj);
  return { ...costing(units, Pj), units };
}

/** The workbook's own job-level priming flag, for rows typed as in its Units sheet. */
export function priceUnits(units, P, priming = "N") {
  return costing(units, { ...P, R: { ...P.R, _priming: priming } });
}
