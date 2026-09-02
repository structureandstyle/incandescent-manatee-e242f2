/**
 * Single source of truth for business facts.
 *
 * NAP must match the Google Business Profile exactly and be used without
 * variation everywhere. Citations are checked character by character, so a
 * second version of the phone number or the name is a real cost.
 */

export const SITE_URL = "https://structureandstyle.co.uk";

export const BUSINESS = {
  /** Trading name. House rule is "Structure & Style", never "Structure&style". */
  name: "Structure & Style",
  legalName: "Structure and Style Ltd",
  companyNumber: "16822866",
  /** Exactly as it reads on the Business Profile. */
  profileName: "Structure & Style – Bespoke Carpentry & Interiors",
  /* London-led per Kaspar's Q3 answer and Denis's ruling, 30 Aug 2026. The
     named districts below stay: they are where the demand and the reviews are. */
  tagline: "Bespoke carpentry and joinery across London",
  phoneDisplay: "07309 872555",
  phoneHref: "tel:+447309872555",
  whatsapp: "https://wa.me/447309872555",
  email: "info@structureandstyle.co.uk",
  /** Service-area business: no public address, so no PostalAddress in schema. */
  areaServed: [
    "Hampstead",
    "Belsize Park",
    "Primrose Hill",
    "Kentish Town",
    "Camden",
    "Swiss Cottage",
    "Highgate",
    "West Hampstead",
    "Islington",
    "Maida Vale",
  ],
  openingHours: [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "18:00" },
    { days: ["Saturday"], opens: "09:00", closes: "14:00" },
  ],
  /** Read live from the public profile on 1 September 2026. Down from the
      22 August baseline of 15: Arthur Kvasnei's review is no longer on the
      profile. See the ops repo baseline record, A6.1. */
  reviewCount: 14,
  ratingValue: "5.0",
} as const;

/** GA4 measurement ID, live in Kaspar's own Analytics account. */
export const GA4_ID = "G-FSGVTJXMMP";

export type Service = {
  slug: string;
  /** Nav and card label. */
  title: string;
  /**
   * What this service is called everywhere OTHER than its own page.
   *
   * It exists for one service. Protocol section 5 bans "media wall" as a
   * brand-facing term and then carves out one exception: it may appear on a
   * single search-facing page, because the phrase carries 90,500 UK searches a
   * month and throwing that away is its own kind of mistake. It may never
   * appear on the home page, in a hero, or in a service page title.
   *
   * That is a real conflict, not a contradiction: the phrase is worth having
   * where a searcher types it and worth avoiding where a buyer reads it. So
   * the page keeps the keyword in its title and heading, and `label` carries
   * an approved alternative everywhere else.
   *
   * Defaults to `title`, so this stays empty for every other service.
   */
  label?: string;
  /** <h1>. Carries the primary keyword without reading like it does. */
  heading: string;
  /** Primary keyword, for the record rather than for stuffing. */
  primary: string;
  /** Meta description. Aim 140 to 155 characters. */
  description: string;
  /**
   * The <title>, where the H1 runs past the roughly 60 characters a result
   * page shows. Optional: a page whose heading is short enough uses it.
   */
  metaTitle?: string;
  /**
   * The one price line the enquiry band shows on this page. Site-wide it
   * used to show "Fitted wardrobes from £2,300" on every service page, a
   * wardrobe price above the alcove form (2 Sep 2026).
   */
  bandPrice: string;
  /** One line used on the homepage grid. */
  summary: string;
  /**
   * The guide-price line for the page's cost section. Sourced from the
   * client's pricing document of 31 Aug 2026
   * (Structure_and_Style_Guide_Pricing_Wardrobes_Alcoves.pdf, ops repo).
   * Services it does not price carry the honest per-project line instead,
   * per tone protocol section 12: never "price on application" alone.
   */
  price: string;
  wave: 1 | 2;
};

/**
 * The signed set: six service pages plus the cost guide, seven in total.
 * Build order and the two-wave sequence come from the SEO runbook, section 2.5.
 * Wave one ships before 1 September because wardrobe searches peak in September.
 */
export const SERVICES: Service[] = [
  {
    slug: "fitted-wardrobes",
    metaTitle: "Fitted wardrobes London, made to measure",
    bandPrice: "Fitted wardrobes from £2,300",
    price:
      "From £2,300 for a 2-door run up to 1.2m in melamine. Width and finish move it: from £4,000 at 4 doors, and painted, sprayed and oak veneer finishes step up from there. Internal drawers and integrated lighting add to any of them.",
    title: "Fitted wardrobes",
    heading: "Fitted wardrobes in London, made to measure",
    primary: "fitted wardrobes london",
    description:
      "Built-in and fitted wardrobes made to measure for your room, designed around what you store and fitted wall to wall, across Hampstead, Camden and London.",
    summary:
      "Built-in wardrobes cut to follow your walls, ceiling and floor, with the hanging, shelving and drawer split worked out around what you actually keep.",
    wave: 1,
  },
  {
    slug: "walk-in-wardrobes",
    metaTitle: "Bespoke walk-in wardrobes, London",
    bandPrice: "Projects generally from £2,000",
    price:
      "Priced per room. A measured survey, usually about an hour on site, gives a firm, itemised figure, and projects generally start at £2,000 of value.",
    title: "Walk-in wardrobes",
    heading: "Bespoke walk-in wardrobes and dressing rooms",
    primary: "bespoke walk in wardrobe",
    description:
      "Bespoke walk-in wardrobes and dressing room fit-outs for London homes, including loft rooms, box rooms and eaves where standard storage will not fit.",
    summary:
      "Dressing rooms planned as a whole, so rails, drawer banks, shoe racks and shelving line through instead of being fitted wall by wall.",
    wave: 1,
  },
  {
    slug: "alcove-units",
    metaTitle: "Alcove units and shelving in London",
    bandPrice: "Alcove units from £3,300 a pair",
    price:
      "From £3,300 for a pair of alcove units in melamine, from £3,600 hand-painted, and from £6,000 in oak veneer. Based on base cupboards with shelving over, up to about 1m per alcove. Shelving detail, drawers and lighting move it further.",
    title: "Alcove units and shelving",
    heading: "Alcove units, cupboards and shelving in London",
    primary: "alcove units london",
    description:
      "Alcove cupboards and shelving built into chimney breast recesses across London, measured and scribed individually so doors sit flush and lines run true.",
    summary:
      "No two alcoves in a period house are the same width. Each unit is built to its own measurements and cut to follow the wall.",
    wave: 1,
  },
  {
    slug: "fitted-wardrobe-cost",
    metaTitle: "Built-in wardrobe cost in London",
    bandPrice: "Fitted wardrobes from £2,300",
    price:
      "From £2,300 for a 2-door wardrobe in melamine to £6,300 and up for 4 doors in oak veneer. The tables below give every step between.",
    title: "What fitted wardrobes cost",
    heading: "How much do fitted wardrobes cost in London?",
    primary: "built in wardrobe cost",
    description:
      "What fitted wardrobes and alcove units actually cost in London, guide prices by size and finish, what moves the figure, and how to read a quotation.",
    summary:
      "Honest price ranges, what moves them, and the questions worth asking before you accept any quote.",
    wave: 1,
  },
  {
    slug: "media-walls",
    metaTitle: "Media walls and TV units, London",
    bandPrice: "Projects generally from £2,000",
    price:
      "Priced per project. A measured survey, usually about an hour on site, gives a firm, itemised figure, and projects generally start at £2,000 of value.",
    title: "Media walls and TV units",
    label: "Built-in TV units",
    heading: "Media walls and built-in TV units",
    primary: "media wall london",
    description:
      "Media walls and built-in TV units for London homes, with cable routing, ventilation and electrics planned from the start, so the finished wall sits flush.",
    summary:
      "Cable routing, ventilation and console space planned from the start, with electrics and plastering coordinated as part of the job.",
    wave: 2,
  },
  {
    slug: "bespoke-kitchens",
    metaTitle: "Bespoke kitchens in London",
    bandPrice: "Projects generally from £2,000",
    price:
      "Priced per project. A measured survey, usually about an hour on site, gives a firm, itemised figure, and projects generally start at £2,000 of value.",
    title: "Bespoke kitchens",
    heading: "Bespoke kitchens, made to measure",
    primary: "bespoke kitchens london",
    description:
      "Bespoke kitchen design, build and installation for London homes, including the awkward runs around chimney breasts, boilers, boxing and sloping ceilings.",
    summary:
      "Cabinets, tall units and islands built to the room, including the runs standard units cannot cover.",
    wave: 2,
  },
];

/**
 * Deferred, 31 Aug 2026, Denis's call: the page ships when its imagery exists.
 * The photo library holds ZERO usable under-stair photographs and no finished
 * home office, and a service page with empty plates sells nothing. This is a
 * deferral of a signed wave-two page, not a drop: it is recorded in the ops
 * repo's engagement status, Kaspar gets told in the next update, and the ask
 * that brings it back is him photographing an under-stair or home office job.
 * To restore: move the entry back into SERVICES and re-add its gate in
 * page-gates.ts.
 */
export const DEFERRED_SERVICES: Service[] = [
  {
    slug: "home-office-understairs-storage",
    bandPrice: "Projects generally from £2,000",
    price:
      "Priced per project. A measured survey, usually about an hour on site, gives a firm, itemised figure, and projects generally start at £2,000 of value.",
    title: "Home office and under-stair storage",
    heading: "Home office and under-stair storage",
    primary: "under stairs storage london",
    description:
      "Built-in desks, study storage and under-stair storage that uses the whole void, fitted around windows, radiators and the stair pitch.",
    summary:
      "Desks and storage fitted around windows, radiators and sloped ceilings, and under-stair storage that uses the whole void.",
    wave: 2,
  },
];

export const servicePath = (s: Service) => `/${s.slug}/`;

/** What to call a service anywhere but its own page. See `label` above. */
export const serviceLabel = (s: Service) => s.label ?? s.title;
