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
  /**
   * The address without its outer slashes. "areas/<area>" since 14 Nov 2026,
   * when a founder moved the area pages to /areas/<area>/ one at a time, with
   * product-led titles and headings in place of "carpenter" (enquiry quality
   * over volume: "We don't need carpenter and get a lead that is looking for
   * someone to install a door"). A page not yet moved keeps its old slug until
   * its turn; the old address then redirects (netlify.toml).
   */
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
  plates: (
    /* A photograph from the photo register (ops repo docs/photo-usage.csv) carries the
       register's alt text, which says what is in the frame and never names a place. */
    | { file: string; type: string; alt?: string }
    /* An AI-generated example where the photo register lists a gap (ops repo
       docs/photo-usage.md), made to the render protocol: captioned "AI-generated
       example" by the frame, never a photograph of a job (14 Nov 2026). */
    | { file: string; type: string; ai: true; width: number; height: number; alt: string }
  )[];
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
    slug: "areas/camden",
    name: "Camden",
    /* Product-led, 14 Nov 2026 (a founder; see `slug` above): the first page moved. "carpenter"
       is gone from the title, heading and description. Camden Town and the streets around it
       remain the page's scope, not the borough (brief section 14, option a). */
    titleProp: "Bespoke fitted wardrobes in Camden",
    h1: "Bespoke fitted wardrobes and alcove units in Camden",
    /* "Bespoke carpentry", Arthur's comment on the review link, 14 Nov 2026; the footer tagline's words. */
    kicker: "Bespoke carpentry in Camden",
    description:
      "Bespoke fitted wardrobes and alcove units for Camden homes: terraced houses and flats, measured in the room and cut to walls that are rarely straight.",
    /* Search Console, 11 Oct to 8 Nov: fitted wardrobes camden 20 and bespoke wardrobes camden 20
       impressions, the area's two largest product searches. Keyword Planner (London, 14 Nov 2026):
       built in wardrobes camden 10, exact phrase; no data for fitted or bespoke wardrobes camden. */
    primary: "fitted wardrobes camden",
    /* 14 Nov 2026: the register's allocation for Camden (ops PR #49): ssp-027, its lead, and ssp-029
       (cropped to the plate's 3:2 around the open bay), downloaded from Drive with the user's yes,
       plus the register's AI gap, closed hinged wardrobes in warm grey. Neither photograph is a
       recorded job in Camden; the alt text is the register's. ssp-017 and ssp-018, also allocated
       here, are interiors that would make a fourth and fifth plate; the frame shows three. */
    plates: [
      {
        file: "/images/library/ssp-027.webp",
        type: "Bookcases",
        alt: "White built-in bookcase in three bays with open shelves above six handleless cupboard doors, lit by two wall lights",
      },
      {
        file: "/images/library/ssp-029.webp",
        type: "Fitted wardrobes",
        alt: "White handleless fitted wardrobe with one door open showing oak interior, chrome hanging rail, top shelf and lower shelves",
      },
      {
        file: "/images/journal/camden-ai-grey-shaker-wardrobes.webp",
        type: "Grey Shaker-style wardrobes",
        ai: true,
        width: 1536,
        height: 1024,
        alt: "A wall-to-wall wardrobe with six full-height Shaker-style doors in three pairs, painted warm mid-grey, with slim aged-brass bar handles where each pair meets. The room's cornice runs across the top above a slim infill, slim side infills reach the floor and a recessed plinth runs beneath. A sash window and a bed sit either side.",
      },
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
    /* "Bespoke carpentry" in the heading and the kicker (Arthur's comments on the review link, 14 Nov
       2026), and so in the title and description too, as Camden went product-led the same day (see
       `slug`). The address stays /carpenter-islington/ until the page's turn to move. */
    titleProp: "Bespoke carpentry and wardrobes in Islington",
    h1: "Bespoke carpentry in Islington for wardrobes and fitted furniture",
    kicker: "Bespoke carpentry in Islington",
    description:
      "Bespoke carpentry in Islington: wardrobes, alcove units and shelving for Georgian and Victorian houses and flats, measured in the room and cut to fit.",
    /* carpenter islington cluster (carpenter islington, carpenters islington, islington
       carpenter) 40 a month, peak 70 (Keyword Planner, London, 14 Nov 2026): the largest
       area figure. Search Console: bespoke wardrobes islington 36, carpentry islington 24,
       bespoke furniture islington 22 impressions, 11 Oct to 8 Nov. The carpenter cluster is the larger
       search; the page gives it up for the enquiries the product words bring (14 Nov 2026). */
    primary: "bespoke carpentry islington",
    plates: [
      { file: "/images/doors-panelling/doors-panelling-02.webp", type: "Doors and panelling" },
      /* fitted-wardrobes-02 in place of alcove-units-10 (14 Nov 2026): that photo is portrait, and
         the 3:2 plate cut it to a strip of ceiling (Arthur's comment: "looks weird"). This one is
         landscape, on /work/ already and on no other area page. */
      { file: "/images/fitted-wardrobes/fitted-wardrobes-02.webp", type: "Fitted wardrobes" },
      { file: "/images/bespoke-kitchens/bespoke-kitchens-01.webp", type: "Bespoke kitchens" },
    ],
    summary: "Late Georgian squares and terraces, Victorian villas and flats in converted houses.",
  },  {
    slug: "carpenter-belsize-park",
    name: "Belsize Park",
    titleProp: "Belsize Park carpenter, fitted wardrobes",
    h1: "Carpenter in Belsize Park for fitted wardrobes and alcove units",
    kicker: "Carpenter in Belsize Park",
    description:
      "Carpenter in Belsize Park: fitted wardrobes and alcove units for Victorian villas, mansion flats and mews houses, measured and cut to follow the walls.",
    /* No Keyword Planner volume for any Belsize Park phrase but bespoke kitchens belsize park (10, exact phrase; London, 14 Nov 2026). Search Console: carpenter belsize park 18 impressions at position 8.1, 11 Oct to 8 Nov. No map pack on 14 Nov. */
    primary: "carpenter belsize park",
    plates: [
      { file: "/images/fitted-wardrobes/fitted-wardrobes-09.webp", type: "Fitted wardrobes" },
      { file: "/images/walk-in-wardrobes/walk-in-wardrobes-03.webp", type: "Walk-in wardrobes" },
      { file: "/images/bespoke-kitchens/kitchen-shaker-showpiece.webp", type: "Bespoke kitchens" },
    ],
    summary: "Large Victorian villas, mansion flats and mews houses in Camden's Belsize conservation area.",
  },
  {
    slug: "carpenter-kentish-town",
    name: "Kentish Town",
    titleProp: "Kentish Town carpenter, fitted wardrobes",
    h1: "Carpenter in Kentish Town for fitted wardrobes and shelving",
    kicker: "Carpenter in Kentish Town",
    description:
      "Carpenter in Kentish Town: fitted wardrobes, alcove units and shelving for Georgian and Victorian terraces. Guide prices and a fixed itemised quotation.",
    /* No Keyword Planner volume for any of 22 Kentish Town phrases (London, 14 Nov 2026). Search Console: carpenter kentish town 16 impressions at position 1.9, 11 Oct to 8 Nov; third in the map pack on 14 Nov. */
    primary: "carpenter kentish town",
    plates: [
      { file: "/images/fitted-wardrobes/fitted-wardrobes-07.webp", type: "Fitted wardrobes" },
      { file: "/images/alcove-units/alcove-units-01.webp", type: "Alcove units" },
      { file: "/images/bespoke-kitchens/bespoke-kitchens-07.webp", type: "Bespoke kitchens" },
    ],
    summary: "Georgian and Victorian terraces, many of them listed, around Leighton Road and Kelly Street.",
  },
  {
    slug: "carpenter-swiss-cottage",
    name: "Swiss Cottage",
    titleProp: "Swiss Cottage carpenter, wardrobes",
    h1: "Carpenter in Swiss Cottage for fitted wardrobes and built-in storage",
    kicker: "Carpenter in Swiss Cottage",
    description:
      "Carpenter in Swiss Cottage: we design and fit wardrobes, alcove units and shelving for mansion blocks and large houses, with guide prices and advice.",
    /* No Keyword Planner volume for any of 22 Swiss Cottage phrases (London, 14 Nov 2026). Search Console: carpenter swiss cottage 3, fitted wardrobes swiss cottage 2 impressions, 11 Oct to 8 Nov. */
    primary: "carpenter swiss cottage",
    plates: [
      { file: "/images/fitted-wardrobes/fitted-wardrobes-06.webp", type: "Fitted wardrobes" },
      { file: "/images/alcove-units/alcove-units-06.webp", type: "Alcove units" },
      { file: "/images/media-walls/media-walls-03.webp", type: "Built-in TV units" },
    ],
    summary: "Late Victorian houses and mansion-block flats around the Finchley Road junction.",
  },
  {
    slug: "carpenter-highgate",
    name: "Highgate",
    titleProp: "Highgate carpenter, walk-in wardrobes",
    h1: "Carpenter in Highgate for walk-in wardrobes and fitted furniture",
    kicker: "Carpenter in Highgate",
    description:
      "Carpenter in Highgate for walk-in wardrobes, fitted wardrobes and alcove units. Measured in the room, with guide prices and what each council asks of you.",
    /* carpenter highgate cluster (carpenter highgate, carpenters highgate, carpentry highgate) 10 (Keyword Planner, London, 14 Nov 2026). Walk-in wardrobes lead because the one review that names Highgate is for a walk-in wardrobe. */
    primary: "carpenter highgate",
    plates: [
      { file: "/images/walk-in-wardrobes/walk-in-wardrobes-02.webp", type: "Walk-in wardrobes" },
      { file: "/images/alcove-units/alcove-units-07.webp", type: "Alcove units" },
      { file: "/images/doors-panelling/doors-panelling-01.webp", type: "Doors and panelling" },
    ],
    summary: "Georgian village houses, Victorian terraces and flats, split between Camden and Haringey.",
  },
  {
    slug: "carpenter-west-hampstead",
    name: "West Hampstead",
    titleProp: "West Hampstead carpenter, wardrobes",
    h1: "Carpenter in West Hampstead for fitted wardrobes and alcove units",
    kicker: "Carpenter in West Hampstead",
    description:
      "West Hampstead carpenter for fitted wardrobes, alcove units and built-in TV units in mansion flats and houses. Guide prices and a 2-year guarantee.",
    /* No Keyword Planner volume for any of 22 West Hampstead phrases (London, 14 Nov 2026) and no Search Console impressions: the page serves the service-area list and the map. */
    primary: "carpenter west hampstead",
    plates: [
      { file: "/images/fitted-wardrobes/fitted-wardrobes-05.webp", type: "Fitted wardrobes" },
      { file: "/images/alcove-units/alcove-units-04.webp", type: "Alcove units" },
      { file: "/images/bespoke-kitchens/bespoke-kitchens-08.webp", type: "Bespoke kitchens" },
    ],
    summary: "Red-brick Victorian and Edwardian houses and mansion flats around West End Lane.",
  },
  {
    slug: "carpenter-maida-vale",
    name: "Maida Vale",
    titleProp: "Maida Vale carpenter, fitted wardrobes",
    h1: "Carpenter in Maida Vale for fitted wardrobes in mansion flats and houses",
    kicker: "Carpenter in Maida Vale",
    description:
      "Fitted wardrobes, alcove units and shelving for Maida Vale mansion flats and period houses, measured in the room and cut to follow its walls.",
    /* carpenter maida vale cluster (carpenter maida vale, carpenters maida vale, carpentry maida vale) 10 (Keyword Planner, London, 14 Nov 2026). No map pack on 14 Nov. City of Westminster. */
    primary: "carpenter maida vale",
    plates: [
      { file: "/images/fitted-wardrobes/fitted-wardrobes-01.webp", type: "Fitted wardrobes" },
      { file: "/images/alcove-units/alcove-units-02.webp", type: "Alcove units" },
      { file: "/images/media-walls/media-walls-04.webp", type: "Built-in TV units" },
    ],
    summary: "Stucco crescents, red-brick terraces and early mansion flats in the City of Westminster.",
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
