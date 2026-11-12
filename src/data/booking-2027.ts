/**
 * PREVIEW ONLY, 12 Nov 2026: shared by the early-2027 booking page
 * (src/pages/book-early-2027.astro) and its terms page
 * (src/pages/book-early-2027/terms.astro), so the steps and the terms are
 * written once. Denis's review the same evening moved the terms and the
 * "how much is included" table off the booking page onto their own page.
 *
 * Every figure in [brackets] is a draft waiting on Kaspar.
 */

/** Preview: wrap draft figures in brackets. False once Kaspar's prices are in. */
export const DRAFT = true;
export const draft = (s: string) => (DRAFT ? `[${s}]` : s);
export const money = (n: number) => `£${n.toLocaleString("en-GB")}`;

/* Extras on the house, rev 14 (Arthur, 12 Nov: "the value has to be 10 to 15%,
   and we want to upsell, not discount"). Each step is about half again the one
   below and its allowance is 13 to 15% of the step, so the share never goes
   above 15% and falls to no less than 10% just before the next step. Below
   £2,500 (Arthur's first step) nothing is included. All drafts for Kaspar. */
export const BANDS: [number, number][] = [
  [2500, 350], [3500, 500], [5000, 750], [7500, 1000], [10000, 1500],
  [15000, 2000], [20000, 3000], [30000, 4500], [45000, 6000],
];
export const WHOLE_FROM = 15000;

const WHOLE_NOTE: Record<number, string> = {
  15000: ", enough for a library unit",
  20000: ", enough for a 2-door wardrobe",
  30000: ", enough for a pair of alcove units, a TV unit or a 4-door wardrobe",
  45000: ", enough for any of the whole units",
};
export const BAND_ROWS = BANDS.map(([at, v], i) => {
  const next = BANDS[i + 1];
  const t = (n: number) => (n >= WHOLE_FROM ? draft(money(n)) : money(n));
  return [t(at) + (next ? " to " + t(next[0] - 1) : " and over"), "up to " + draft(money(v)) + (WHOLE_NOTE[at] || "")];
});

/* "No VAT is added" came out on 12 Nov (Denis: it reads as dodgy and new; if
   Kaspar does not charge VAT he can say so in person). The cancellation line
   answers Denis's "what if they pay the deposit and then cancel?": the 14-day
   right for off-premises and distance contracts, and a deposit kept only for
   work already done (CMA37). Kaspar confirms the figures. */
export const TERMS = [
  "Booked means the quotation accepted in writing and the [15%] deposit paid by 11.59pm on Sunday 31 January 2027.",
  "We collect the deposit to cover your 2D drawings and elevations, which start once it is paid, and we book your fitting slot.",
  "You can cancel within 14 days of accepting the quotation and get the deposit back in full. If you ask us to start the drawings within those 14 days and then cancel, we keep only the part that covers the drawing work already done. After that the deposit pays for the drawings. [CONFIRM]",
  "Applies to fitted wardrobe, walk-in wardrobe, alcove unit, TV unit and kitchen jobs with a quotation of £2,500 or more. Several units in one quotation count together.",
  "Your quotation total, the units and their parts at normal prices, sets how much is included, as in the table above. Extras on the house are £0 lines and do not add to it.",
  "Extras on the house are worth 10% to 15% of the quotation up to £60,000, and stay at " + draft("£6,000") + " above that.",
  "From " + draft("£15,000") + ", what is included can take in one whole unit: a library unit, 2.4m high and 1.2m wide, a 2-door or 4-door wardrobe, a pair of alcove units or a TV unit, valued at its normal starting price, with extras for whatever is left. Another finish, or anything beyond what is included, is charged at normal prices.",
  "Extras on the house are picked in the basket and only fill what is included. Extras you want beyond that are added to a unit as parts, at normal prices, and count towards the quotation total.",
  "Prices on the booking page are indicative guide prices. The firm figure is the itemised quotation, sent after a measured survey or from your photos and measurements.",
  "Each extra on the house appears on the quotation as its own line at £0. Its normal price is the price on our cost guide, and what we charge for it on any other job.",
  "Prices are unchanged. The quotation is the normal itemised price for the job.",
  "Lighting needs a power supply that can reach the unit, which we check at the visit. Where it cannot, other extras of the same value are included.",
  "Extras and whole units on the house cannot be exchanged for money, swapped for a lower price or moved to another job.",
  "The fitting date is agreed when the deposit is paid.",
  "Your cancellation rights are not affected.",
  "The closing date will not be extended.",
];
