/**
 * What each picture card on the enquiry form says, what it sends, and which
 * drawing it shows. Preview only (options A and B, 14 Nov 2026): the live form
 * is src/components/EnquiryForm.astro and is untouched until a founder picks.
 *
 * VALUES ARE THE CONTRACT. Netlify records them, the notification email shows
 * them, and Make scenario 7361484 copies them into the shared enquiry log by
 * field name. A card's `value` is what lands in the log; its `label` is what a
 * visitor reads. The two only differ on "How did you hear about us?".
 */
import { SERVICES, DEFERRED_SERVICES, BUSINESS, serviceLabel } from "../../data/site";

export type Choice = {
  /** What the form sends. */
  value: string;
  /** What the card says. */
  label: string;
  /** A second, quieter line under the label. */
  sub?: string;
  /** Drawing id in ./art (see ./art/README.md). */
  art: string;
  /** Option B's width cards: the line the card writes into the job box. */
  line?: string;
};

/**
 * "What do you need?" The same list, in the same order, as CHOICES in the live
 * EnquiryForm.astro, built the same way so the two cannot drift: every service
 * page except the cost guide, the deferred home office page, then the three
 * that have no page. Its header comment says why each of the last three is
 * there. serviceLabel, so media walls reads "Built-in TV units", the label the
 * log already records.
 */
const SERVICE_ART: Record<string, string> = {
  "Fitted wardrobes": "fitted-wardrobes",
  "Walk-in wardrobes": "walk-in-wardrobes",
  "Alcove units and shelving": "alcove-units",
  "Built-in TV units": "tv-units",
  "Bespoke kitchens": "kitchens",
  "Home office and under-stair storage": "under-stairs",
  "Panelling and doors": "panelling-doors",
  Flooring: "flooring",
  "Something else": "service-other",
};

export const serviceArt = (label: string) => SERVICE_ART[label] ?? "service-other";

export const SERVICE_CHOICES: Choice[] = [
  ...SERVICES.filter((s) => s.slug !== "fitted-wardrobe-cost").map(serviceLabel),
  ...DEFERRED_SERVICES.map(serviceLabel),
  "Panelling and doors",
  "Flooring",
  "Something else",
].map((label) => ({ value: label, label, art: serviceArt(label) }));

/**
 * "Which area of north London?" One card per area the business names
 * (BUSINESS.areaServed, the list the schema and the area lists use), then
 * "Somewhere else". Choosing that card opens a box for the area or postcode,
 * and what is typed there becomes the card's value, so the log's Area column
 * still gets one plain answer: "Islington", or "Finchley", or "N3 2AB". The
 * typed box itself has no name and is never sent on its own.
 */
export const OTHER_AREA = "Somewhere else";

const kebab = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const AREA_CHOICES: Choice[] = [
  ...BUSINESS.areaServed.map((area) => ({ value: area, label: area, art: kebab(area) })),
  { value: OTHER_AREA, label: OTHER_AREA, art: "area-other" },
];

/**
 * "How did you hear about us?" Split into five on 14 Nov 2026, a founder's
 * ask. Three values are the ones the live form sends today (Search, Referral,
 * Something else), so nothing that already reads them changes. Two are new
 * (Google Maps, ChatGPT): see the field mapping in the pull request.
 *
 * The Google card keeps "or another search engine" under its name, Denis's
 * 2 Sep 2026 point: a Bing or DuckDuckGo visitor should not have to pick
 * "Something else". There is still no "Website" option, for the reason the
 * live form's comment gives.
 */
export const SOURCE_CHOICES: Choice[] = [
  { value: "Search", label: "Google", sub: "or another search engine", art: "source-search" },
  { value: "Google Maps", label: "Google Maps", art: "source-maps" },
  { value: "ChatGPT", label: "ChatGPT", sub: "or another AI assistant", art: "source-ai" },
  { value: "Referral", label: "Someone recommended you", art: "source-referral" },
  { value: "Something else", label: "Something else", art: "source-other" },
];

/**
 * Option B only: "Roughly how wide is it?" Not a field of its own. Picking a
 * card writes its line at the top of the job box, where the visitor can see
 * and change it, so `detail` stays the one place the job is described. `line`
 * is that text.
 */
export type WidthChoice = Choice & { line: string };

export const WIDTH_CHOICES: WidthChoice[] = [
  { value: "1", label: "Up to 1m", sub: "one alcove", art: "width-1", line: "Rough width: up to 1m" },
  { value: "2", label: "1 to 2m", art: "width-2", line: "Rough width: 1 to 2m" },
  { value: "3", label: "2 to 3m", art: "width-3", line: "Rough width: 2 to 3m" },
  { value: "4", label: "3 to 4m", art: "width-4", line: "Rough width: 3 to 4m" },
  { value: "5", label: "Over 4m", sub: "a whole wall or more", art: "width-5", line: "Rough width: over 4m" },
  { value: "6", label: "Not sure yet", art: "width-unsure", line: "Rough width: not sure yet" },
];

/** Every drawing id the cards use, for the sprite. */
export const ART_IDS = [
  ...new Set([...SERVICE_CHOICES, ...AREA_CHOICES, ...SOURCE_CHOICES, ...WIDTH_CHOICES].map((c) => c.art)),
];

/**
 * The example in the job box, by service label. Copied word for word from
 * JOB_EXAMPLES in the live EnquiryForm.astro (2 and 5 Sep 2026, Denis's ask),
 * whose comment says why each is the room, rough sizes and what it holds.
 */
export const JOB_EXAMPLE_DEFAULT =
  "Bedroom wall about 3m wide and 2.4m to the ceiling. Hanging both sides, drawers in the middle.";

export const JOB_EXAMPLES: Record<string, string> = {
  "Fitted wardrobes": JOB_EXAMPLE_DEFAULT,
  "Walk-in wardrobes":
    "Box room about 2m by 2.5m. Hanging on two walls, shoe shelves and a bank of drawers.",
  "Alcove units and shelving":
    "Two alcoves either side of the chimney breast, about 1m wide. Cupboards below, open shelves above.",
  "Built-in TV units":
    "Living room chimney wall, 65 inch TV. Cables and a console to hide, sockets already there.",
  "Bespoke kitchens":
    "Galley kitchen about 4m long. One wall of units and a tall run for the oven and fridge.",
  "Home office and under-stair storage":
    "Under the stairs, about 2m along and sloping. Coats, shoes and a bit of shelving.",
};

/** The service list a form shows: the full list, or on a service page that service and "Something else". */
export function serviceChoicesFor(service?: string): Choice[] {
  if (!service) return SERVICE_CHOICES;
  return [service, "Something else"].map((label) => ({ value: label, label, art: serviceArt(label) }));
}
