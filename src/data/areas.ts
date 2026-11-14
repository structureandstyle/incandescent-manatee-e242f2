/**
 * The area pages: one hub per district in the signed scope (Primrose Hill,
 * Hampstead, Camden), each a page about working in that district, not a
 * service-times-area doorway. Hampstead first, 3 October 2026.
 *
 * The slug carries the page's primary keyword (the ops architecture rule:
 * "URL slugs are hyphenated with the page's primary keyword"), so the page
 * lives at /carpenter-hampstead/ while everything visible says "Hampstead"
 * (Denis, 3 Oct 2026).
 *
 * Each page's copy lives in its own file under src/pages, in the order the
 * approved copy sets; `AreaPage` is only the frame. Its client-dependent
 * sentences are keys in answers.ts and its gate is in page-gates.ts.
 *
 * ALL TEN, 14 November 2026. A founder asked for a page for every district in
 * BUSINESS.areaServed, built as drafts for Kaspar to read and comment on over
 * Christmas: Camden, Primrose Hill and Islington first (the month 3 report told
 * him they would be live by 10 Dec), then the other six. Each H1 carries that
 * district's best exact search and each page's sections are its own; the
 * research and one structure per page are in the ops repo,
 * research/area-pages-2026-11-14/README.md. Every new page is held noindex by
 * its own check key until he has read it.
 */
import { BUSINESS } from "./site";

export type Area = {
  /** URL slug, without slashes. */
  slug: string;
  /** The district as the site names it. Must be an entry in BUSINESS.areaServed. */
  name: string;
  /** Passed to Base as `title`; Base appends " | Structure & Style". */
  titleProp: string;
  /** <h1>. */
  h1: string;
  /** The mono line above the h1. */
  kicker: string;
  /** Meta description. Aim 140 to 155 characters. */
  description: string;
  /** Primary keyword, for the record. */
  primary: string;
  /**
   * The photographs directly under the h1, labelled by type only. None is a
   * recorded job in the district, so none is captioned with a place. Each file
   * must be in public/images/_selection.json, which supplies its size.
   */
  plates: { file: string; type: string }[];
  /** One sentence for the /areas/ hub: what the homes there are like. */
  summary: string;
};

export const AREAS: Area[] = [
  {
    slug: "carpenter-hampstead",
    name: "Hampstead",
    titleProp: "Hampstead carpenter, bespoke wardrobes",
    h1: "Fitted wardrobes and bespoke carpentry in Hampstead",
    /* Kept 9 Nov 2026 (a founder), after a comment asking for "Fitted wardrobes in Hampstead": carpenter
       hampstead is the search with measured demand and the map result he wins, and the h1 already leads
       with fitted wardrobes (ops briefs/carpenter-hampstead.md, section 1). */
    kicker: "Carpenter in Hampstead",
    description:
      "Carpenter for Hampstead homes: fitted wardrobes, walk-in wardrobes, alcove units and built-in TV units, measured in the room and cut to follow the walls.",
    primary: "carpenter hampstead",
    /* All three on /work/ already, all dated after incorporation (31 Oct
       2025), none from the SW7 shoot: 27 May 2026, 16 Feb 2026, 10 Nov 2025. */
    plates: [
      { file: "/images/fitted-wardrobes/fitted-wardrobes-08.webp", type: "Fitted wardrobes" },
      { file: "/images/alcove-units/alcove-units-08.webp", type: "Alcove units" },
      { file: "/images/media-walls/media-walls-02.webp", type: "Built-in TV units" },
    ],
    summary: "Georgian houses, Victorian terraces and mansion flats, many in conservation areas.",
  },
  /* The plates on the nine pages below are PROVISIONAL (14 Nov 2026): frames
     already on /work/, three different ones per page and none of Hampstead's,
     until the photo session's register (ops repo docs/photo-usage.csv) allocates
     photographs page by page. No frame is a recorded job in its district. */
  {
    slug: "carpenter-camden",
    name: "Camden",
    titleProp: "Camden carpenter, fitted wardrobes",
    h1: "Camden carpenter for fitted wardrobes and alcove units",
    /* Camden Town and the streets around it, not the borough: the page would
       otherwise overlap every other Camden district (brief section 14, option
       a), and the site already says the business is based in Camden Town. */
    kicker: "Carpenter in Camden Town",
    description:
      "Carpenter in Camden Town: fitted wardrobes, alcove units and shelving for terraced houses and flats, measured in the room and cut to follow its walls.",
    /* camden carpenter, exact phrase, 20 a month (Keyword Planner, London, 14 Nov 2026);
       carpenter camden cluster 10. Search Console: fitted wardrobes camden 20 and bespoke
       wardrobes camden 20 impressions, 11 Oct to 8 Nov. */
    primary: "camden carpenter",
    plates: [
      { file: "/images/fitted-wardrobes/fitted-wardrobes-02.webp", type: "Fitted wardrobes" },
      { file: "/images/alcove-units/alcove-units-03.webp", type: "Alcove units" },
      { file: "/images/media-walls/media-walls-01.webp", type: "Built-in TV units" },
    ],
    summary: "Stock-brick terraces of the 1820s to 1850s over basements, with mansard rooms and mews.",
  },
  {
    slug: "carpenter-primrose-hill",
    name: "Primrose Hill",
    titleProp: "Primrose Hill carpenter, alcove units",
    h1: "Carpenter in Primrose Hill for alcove units and fitted wardrobes",
    kicker: "Carpenter in Primrose Hill",
    description:
      "Carpenter in Primrose Hill: alcove cupboards, shelving and fitted wardrobes for stucco villas, terraces and flats, measured and cut to follow the walls.",
    /* No Keyword Planner volume for any Primrose Hill phrase (London, 14 Nov 2026). Search
       Console: carpenter primrose hill 9 impressions at position 2.9, 11 Oct to 8 Nov; first
       in the map pack on 14 Nov. Alcove units lead because the one customer review that names
       Primrose Hill is for alcove cupboards with floating shelves. */
    primary: "carpenter primrose hill",
    plates: [
      { file: "/images/alcove-units/alcove-units-05.webp", type: "Alcove units" },
      { file: "/images/fitted-wardrobes/fitted-wardrobes-03.webp", type: "Fitted wardrobes" },
      { file: "/images/walk-in-wardrobes/walk-in-wardrobes-01.webp", type: "Walk-in wardrobes" },
    ],
    summary: "Italianate stucco villas and mid-Victorian terraces, with many listed houses.",
  },
  {
    slug: "carpenter-islington",
    name: "Islington",
    titleProp: "Islington carpenter, bespoke wardrobes",
    h1: "Carpenter in Islington for bespoke wardrobes and fitted furniture",
    kicker: "Carpenter in Islington",
    description:
      "Carpenter in Islington: bespoke wardrobes, alcove units and shelving for Georgian and Victorian houses and flats, measured in the room and cut to fit.",
    /* carpenter islington cluster (carpenter islington, carpenters islington, islington
       carpenter) 40 a month, peak 70 (Keyword Planner, London, 14 Nov 2026): the largest
       area figure. Search Console: bespoke wardrobes islington 36, carpentry islington 24,
       bespoke furniture islington 22 impressions, 11 Oct to 8 Nov. */
    primary: "carpenter islington",
    plates: [
      { file: "/images/fitted-wardrobes/fitted-wardrobes-10.webp", type: "Fitted wardrobes" },
      { file: "/images/alcove-units/alcove-units-10.webp", type: "Alcove units" },
      { file: "/images/bespoke-kitchens/bespoke-kitchens-01.webp", type: "Bespoke kitchens" },
    ],
    summary: "Late Georgian squares and terraces, Victorian villas and flats in converted houses.",
  },
];

/* A page for a district the business does not list would contradict the
   schema's areaServed on the same page. Fail the build rather than ship it. */
for (const area of AREAS) {
  if (!(BUSINESS.areaServed as readonly string[]).includes(area.name)) {
    throw new Error(`areas.ts: "${area.name}" is not in BUSINESS.areaServed, so it cannot have an area page.`);
  }
}

export const areaPath = (slug: string) => `/${slug}/`;

/** The area page for a district name, if there is one. */
export const areaFor = (name: string) => AREAS.find((a) => a.name === name);
