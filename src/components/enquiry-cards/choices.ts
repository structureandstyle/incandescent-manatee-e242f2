/**
 * What each picture card on the enquiry form says, what it sends, and which
 * drawing it shows. Option A of the 14 Nov 2026 previews, which a founder
 * picked the same day to replace the live form everywhere it appears: the
 * Get a quote pop-up and /contact/ (src/components/EnquiryForm.astro).
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
};

/**
 * "What do you need?" The same list, in the same order, as the checkboxes the
 * form had before the cards (2 Sep 2026, Denis's call: tick everything that
 * applies): every service page except the cost guide, the deferred home
 * office page, then three with no page of their own. Panelling and doors
 * (28 Sep 2026) and flooring are work he takes, named on his Business Profile
 * and in his reviews, with no page because there are no photographs yet; the
 * home office page is deferred, the work is not. serviceLabel, so media walls
 * reads "Built-in TV units", the label the log already records.
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

const serviceArt = (label: string) => SERVICE_ART[label] ?? "service-other";

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
 * ask. Three values are the ones the form sent before (Search, Referral,
 * Something else), so nothing that already reads them changes. Two are new
 * (Google Maps, ChatGPT): see the field mapping in site PR #43. The shared
 * log's Lead source dropdown only warns on a word it does not list, so the
 * row still lands.
 *
 * This answer is the one the log records as the lead source, and clause 2 of
 * the agreement counts an enquiry as F2F-generated when it is "recorded as
 * having found you through Google or the website". Change a value, change
 * the log.
 *
 * The Google card keeps "or another search engine" under its name, Denis's
 * 2 Sep 2026 point: a Bing or DuckDuckGo visitor should not have to pick
 * "Something else". There is no "Website" option, deliberately (Denis,
 * 2 Sep 2026): anyone filling the form in is already on the website, so it
 * cannot be how they heard about us. Left optional: never add a required
 * field to a lead form to improve our own reporting.
 */
export const SOURCE_CHOICES: Choice[] = [
  { value: "Search", label: "Google", sub: "or another search engine", art: "source-search" },
  { value: "Google Maps", label: "Google Maps", art: "source-maps" },
  { value: "ChatGPT", label: "ChatGPT", sub: "or another AI assistant", art: "source-ai" },
  { value: "Referral", label: "Someone recommended you", art: "source-referral" },
  { value: "Something else", label: "Something else", art: "source-other" },
];

/** Every drawing id the cards use, for the sprite. */
export const ART_IDS = [
  ...new Set([...SERVICE_CHOICES, ...AREA_CHOICES, ...SOURCE_CHOICES].map((c) => c.art)),
];

/**
 * The example in the job box, by service label, 2 Sep 2026 on Denis's ask:
 * give someone a shape to copy so they start typing instead of composing.
 * Each is the same three things in the same order, the three the first reply
 * needs: the room, rough sizes, and what the piece has to hold. Keyed by
 * serviceLabel, not title (5 Sep 2026): media walls keeps the search term in
 * its page title and is "Built-in TV units" everywhere else. These are
 * examples, not claims: ordinary numbers, the way a person would type it.
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
