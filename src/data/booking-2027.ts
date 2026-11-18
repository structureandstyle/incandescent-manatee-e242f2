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
/* Whole units on the house (a founder, 17 Nov 2026): only when the unit's
   starting price is no more than 11% of the quotation, and then everything on
   the house together stays within 11%. A whole unit costs Kaspar close to its
   full price, so the cap keeps a whole-unit job at his 5% floor after
   commission (price book, F2F clients/structure-and-style/christmas-bundle-numbers).
   The cheapest whole unit, the library unit at a draft £2,000, sets the first
   threshold. Steps from £15,000 stay bracketed as drafts. */
export const WHOLE_CAP = 0.11;
export const wholeFromPrice = (p: number) => Math.ceil(p / WHOLE_CAP / 100) * 100;
export const WHOLE_FROM = wholeFromPrice(2000);
const DRAFT_FROM = 15000;

/* The whole-unit thresholds (library from about £18,200 up to a 4-door
   wardrobe from about £36,400) fall inside these steps, so each row from
   £15,000 says the rule and the term below lists the thresholds. */
const WHOLE_NOTE: Record<number, string> = Object.fromEntries(
  [15000, 20000, 30000, 45000].map((n) => [n, ", or one whole unit worth up to 11% of the quotation"]),
);
export const BAND_ROWS = BANDS.map(([at, v], i) => {
  const next = BANDS[i + 1];
  const t = (n: number) => (n >= DRAFT_FROM ? draft(money(n)) : money(n));
  return [t(at) + (next ? " to " + t(next[0] - 1) : " and over"), "up to " + draft(money(v)) + (WHOLE_NOTE[at] || "")];
});

/* "No VAT is added" came out on 12 Nov (Denis: it reads as dodgy and new; if
   Kaspar does not charge VAT he can say so in person). The cancellation line
   answers Denis's "what if they pay the deposit and then cancel?": the 14-day
   right for off-premises and distance contracts, and a deposit kept only for
   work already done (CMA37). Kaspar confirms the figures. */
export const TERMS = [
  "Booked means the quotation accepted in writing and the [£500] deposit paid by 11.59pm on Thursday 31 December 2026.",
  "We collect the deposit to cover your 2D drawings and elevations, which start once it is paid, and we book your fitting slot.",
  "You can cancel within 14 days of accepting the quotation and get the deposit back in full. If you ask us to start the drawings within those 14 days and then cancel, we keep only the part that covers the drawing work already done. After that the deposit pays for the drawings. [CONFIRM]",
  "Applies to fitted wardrobe, walk-in wardrobe, alcove unit and library, TV unit and kitchen jobs, and to home office and under-stair storage, panelling and doors, and flooring [CONFIRM], with a quotation of £2,500 or more. Several units in one quotation count together.",
  "Your quotation total, the units and their parts at normal prices, sets how much is included, as in the table above. Extras on the house are £0 lines and do not add to it.",
  "Extras on the house are worth 10% to 15% of the quotation up to £60,000, and stay at " + draft("£6,000") + " above that.",
  "A whole unit can come on the house when its normal starting price is no more than 11% of the quotation: a library unit, 2.4m high and 1.2m wide, from a " + draft(money(wholeFromPrice(2000))) + " quotation; a 2-door wardrobe from " + money(wholeFromPrice(2300)) + "; a pair of alcove units from " + money(wholeFromPrice(3300)) + "; a TV unit from " + money(wholeFromPrice(3500)) + "; a 4-door wardrobe from " + money(wholeFromPrice(4000)) + ". One whole unit per quotation, valued at its normal starting price, and everything on the house together stays within 11% of the quotation. Another finish, or anything beyond what is included, is charged at normal prices.",
  "Extras on the house are picked in the basket and only fill what is included. Extras you want beyond that are added to a unit as parts, at normal prices, and count towards the quotation total.",
  "Prices on the booking page are indicative guide prices. The firm figure is the itemised quotation, sent after a measured survey or from your photos and measurements.",
  "Each extra on the house appears on the quotation as its own line at £0. Its normal price is the price on our cost guide, and what we charge for it on any other job.",
  "Prices are unchanged. The quotation is the normal itemised price for the job.",
  /* Rev 27 (a founder, 18 Nov 2026): copy agent's terms, protocol v1.4, built in unchanged. */
  "Booked by 11.59pm on Thursday 31 December 2026 (quotation accepted in writing and the deposit paid), the quoted price holds for a fitting date at any time in 2027. The price is the quoted price for the same work: a change to the work is quoted at normal prices. [CONFIRM]",
  "If you decide not to go ahead after receiving your 2D drawings and elevations, tell us within [14 days] of receiving them and the deposit is returned in full. The drawing files are handed over once the job goes ahead. This is in addition to your cancellation rights. [CONFIRM]",
  "For jobs booked by 31 December 2026, installation and workmanship are guaranteed for [10 years]. The structure of the joinery is guaranteed for 10 years, and hardware stays under its maker's warranty. [CONFIRM]",
  "Customers who let us choose the fitting week between January and April 2027 have the old wardrobes or units from the room being fitted taken away and disposed of at no charge. This covers the furniture in that room only, and the week we choose is confirmed in writing. [CONFIRM]",
  "When someone you recommend books a job by 31 December 2026, you both receive extras worth [£250] on the house. They go on each of your quotations, or on your next job if yours is already done. The person you recommend mentions your name when they send their basket or message. Extras worth [£250] are not exchanged for money. [CONFIRM]",
  "Lighting needs a power supply that can reach the unit, which we check at the visit. Where it cannot, other extras of the same value are included.",
  "Extras and whole units on the house cannot be exchanged for money, swapped for a lower price or moved to another job.",
  "The fitting date is agreed when the deposit is paid.",
  "Your cancellation rights are not affected.",
  "The closing date will not be extended.",
];
