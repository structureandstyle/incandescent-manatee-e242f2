/**
 * What /design-your-own/ needs from the rest of the site (19 Nov 2026).
 *
 * Nothing here is new information. The prices are the cost guide's own tables,
 * read rather than retyped (src/scripts/builder/prices.mjs). The services are
 * the enquiry form's own cards, so anything a visitor adds to a project ticks
 * a card that exists, with the value the shared enquiry log already records.
 * Each starting price beside a service is that service's own band line from
 * site.ts. If any of these stops lining up, the build stops.
 */
import { SERVICE_COPY } from "./service-copy";
import { SERVICES, DEFERRED_SERVICES, serviceLabel } from "./site";
import { SERVICE_CHOICES } from "../components/enquiry-cards/choices";
import { readPrices } from "../scripts/builder/prices.mjs";
import { sellBook } from "../scripts/builder/costing.mjs";
import { DESIGN_YOUR_OWN_LIVE } from "./design-your-own-gate";
import PRICE_BOOK from "./price-book.json";

/** The cost guide's guide starting prices, as numbers, and its four finish names. */
export const PRICES = readPrices(SERVICE_COPY["fitted-wardrobe-cost"].priceTables ?? []);

/**
 * THE BUILDER'S PRICE, PART BY PART (a founder, 19 Nov 2026).
 *
 * Every design is priced from the price book (./price-book.json): each board,
 * edge, hinge, handle, screw, finish and hour, through the same formulas as
 * the S&S pricing workbook (src/scripts/builder/costing.mjs). The figures are
 * researched UK prices and the workbook's assumptions until Kaspar puts in his
 * own; the book is kept in the Google Sheet "S&S price book".
 *
 * The page carries only the selling rates (sellBook): his costs, his day rate
 * and his margin are folded in and never reach a visitor's browser.
 *
 * THE PAGE CANNOT GO LIVE until he has confirmed the book: the build stops.
 */
export const SELL_BOOK = sellBook(PRICE_BOOK);
if (DESIGN_YOUR_OWN_LIVE && !PRICE_BOOK.confirmedByKaspar) {
  throw new Error("Design your own: the price book is not confirmed by Kaspar yet (confirmedByKaspar in src/data/price-book.json)");
}

/** The enquiry form's card for each unit the builder draws. */
export const UNIT_SERVICE = {
  wardrobe: "Fitted wardrobes",
  alcove: "Alcove units and shelving",
} as const;

for (const value of Object.values(UNIT_SERVICE)) {
  if (!SERVICE_CHOICES.some((c) => c.value === value)) {
    throw new Error(`Design your own: the enquiry form no longer has a "${value}" card`);
  }
}

const bandFor = (label: string) => {
  const service = [...SERVICES, ...DEFERRED_SERVICES].find((s) => serviceLabel(s) === label);
  // "Walk-in wardrobes from £5,000" gives "from £5,000". No line, no figure.
  return service?.bandPrice.match(/from £[\d,]+/)?.[0] ?? "";
};

/**
 * Everything else he does, to add to the same enquiry: every card on the form
 * except the two the builder draws and "Something else".
 */
export const OTHER_SERVICES = SERVICE_CHOICES
  .filter((c) => !Object.values(UNIT_SERVICE).includes(c.value as never) && c.value !== "Something else")
  .map((c) => ({ value: c.value, label: c.label, from: bandFor(c.value) }));
