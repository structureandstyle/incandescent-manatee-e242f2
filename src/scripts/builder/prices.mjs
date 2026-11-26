/**
 * THE BUILDER'S PRICES ARE THE COST GUIDE'S, READ, NEVER RETYPED (19 Nov 2026).
 *
 * /fitted-wardrobe-cost/ owns the guide starting prices: two tables in
 * src/data/service-copy.ts, transcribed from the client's pricing document.
 * The builder shows the same figures, so it reads those tables and turns each
 * "from £2,300" into 2300. Change a price in the cost guide and the builder
 * follows on the next build; there is no second list to forget.
 *
 * If the tables stop looking the way this expects (a new column, a renamed
 * finish, a cell that is not a price), this throws and the build stops, rather
 * than the builder quietly showing a wrong or missing figure.
 */

const figure = (cell, where) => {
  const m = /^from £([\d,]+)$/.exec(String(cell).trim());
  if (!m) throw new Error(`Builder prices: ${where} is ${JSON.stringify(cell)}, expected "from £1,234"`);
  return Number(m[1].replace(/,/g, ""));
};

/**
 * @param {{ title: string, columns: string[], rows: string[][] }[]} priceTables
 * @returns {{ finishes: string[], wardrobe: number[][], alcovePair: number[] }}
 *   wardrobe[finish] is [2 doors, 3 doors, 4 doors]; alcovePair[finish] is a pair.
 */
export function readPrices(priceTables) {
  const wardrobes = priceTables?.find((t) => /^Fitted wardrobes/.test(t.title));
  const alcoves = priceTables?.find((t) => /^Alcove units/.test(t.title));
  if (!wardrobes || !alcoves) throw new Error("Builder prices: the cost guide's wardrobe or alcove table is missing");

  const doors = wardrobes.columns.slice(1).map((c) => Number(/^(\d) doors, up to/.exec(c)?.[1]));
  if (doors.join() !== "2,3,4") {
    throw new Error(`Builder prices: wardrobe columns are ${JSON.stringify(wardrobes.columns)}, expected 2, 3 and 4 doors`);
  }
  if (alcoves.columns.length !== 2 || !/pair/i.test(alcoves.columns[1])) {
    throw new Error(`Builder prices: alcove columns are ${JSON.stringify(alcoves.columns)}, expected one price for a pair`);
  }

  const finishes = wardrobes.rows.map((r) => r[0]);
  const alcoveFinishes = alcoves.rows.map((r) => r[0]);
  if (finishes.length !== 4 || finishes.join("|") !== alcoveFinishes.join("|")) {
    throw new Error("Builder prices: the wardrobe and alcove tables no longer list the same four finishes");
  }

  return {
    finishes,
    wardrobe: wardrobes.rows.map((r) => r.slice(1).map((cell, i) => figure(cell, `${r[0]}, ${doors[i]} doors`))),
    alcovePair: alcoves.rows.map((r) => figure(r[1], `${r[0]}, alcove pair`)),
  };
}
