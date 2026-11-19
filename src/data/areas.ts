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
    slug: "areas/hampstead",
    name: "Hampstead",
    /* On the Primrose Hill model, 15 Nov 2026 (a founder's go; Denis: "use the same design and
       structure for the next articles"). Until then: title "Hampstead carpenter, bespoke wardrobes",
       h1 "Fitted wardrobes and bespoke carpentry in Hampstead" (kept 9 Nov by a founder for carpenter
       hampstead, the search with measured demand and the map result he wins), kicker "Carpenter in
       Hampstead", primary "carpenter hampstead", at /carpenter-hampstead/. The page was live and
       indexed there from 12 Nov; it moves only when every area page is published after Kaspar has
       approved them (Denis, 15 Nov), with 301s from both old addresses. */
    titleProp: "Bespoke wardrobes in Hampstead",
    h1: "Bespoke wardrobes and fitted furniture for Hampstead's period homes and mansion flats",
    kicker: "Bespoke joinery in Hampstead",
    description:
      "Bespoke wardrobes, walk-in wardrobes, alcove units and built-in TV units for Hampstead's period houses and mansion flats, measured in the room and made to fit.",
    /* bespoke wardrobes hampstead is the area's largest product search: Search Console 51
       impressions, 11 Oct to 8 Nov, then bespoke joinery hampstead 32. Keyword Planner (London,
       14 Nov 2026) had nothing for either, only the carpenter cluster (10) and bespoke kitchens
       hampstead (10, exact phrase); it could not be asked again on 15 Nov (DataForSEO answered 402). */
    primary: "bespoke wardrobes hampstead",
    /* All three on /work/ already, all dated after incorporation (31 Oct
       2025), none from the SW7 shoot: 27 May 2026, 16 Feb 2026, 10 Nov 2025.
       15 Nov 2026: the photo register (ops PR #49) gives Hampstead one photograph,
       ssp-004, the same wardrobe as fitted-wardrobes-08 (the register's ssp-091) from the same visit, in
       portrait. Cut to the plate's 3:2 it would be a band across four doors; the
       landscape frame shows the whole run and is the one Kaspar approved on this
       page, so it stays. The register's three AI images for Hampstead are
       optional (a founder's call) and are not made. */
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
    kicker: "Bespoke joinery in Camden",
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
    slug: "areas/primrose-hill",
    name: "Primrose Hill",
    /* Product-led, 15 Nov 2026 (a founder's go for the second page; see `slug` above). "carpenter"
       is gone from the title, heading and description. */
    titleProp: "Bespoke fitted wardrobes in Primrose Hill",
    h1: "Fitted wardrobes and alcove cupboards in Primrose Hill, made to measure",
    kicker: "Bespoke joinery in Primrose Hill",
    description:
      "Bespoke fitted wardrobes, alcove cupboards and shelving for Primrose Hill homes: stucco villas, terraces and flats, measured and cut to follow the walls.",
    /* fitted wardrobes primrose hill is the area's one product search on record (Search Console,
       11 Oct to 8 Nov); Keyword Planner has no Primrose Hill phrase at all (London, 14 Nov 2026).
       Its page 1 was all directory listings on 14 Nov, with no competitor's own page. Alcove
       cupboards come second because the one customer review naming Primrose Hill is for alcove
       cupboards with floating shelves. */
    primary: "fitted wardrobes primrose hill",
    /* 15 Nov 2026: the register's allocation (ops PR #49): ssp-010, its lead (alcove shelving by a
       fireplace, a kitchen beyond), and ssp-014, the cleaner of the two same-view walk-in frames
       (ssp-013 is its alternate), cropped to 3:2 around the rails; plus the register's first AI gap,
       off-white hinged wardrobes under an existing cornice (made again on 15 Nov, Figma node 31:2, with bare walls: in the first a framed picture ran into the door frame, a founder's comment). ssp-011, a third walk-in view of the same
       room, is allocated too; the frame shows three plates. None is a recorded job in Primrose Hill;
       the alt text is the register's. The register's second gap, a media wall, has no section here. */
    plates: [
      {
        file: "/images/library/ssp-010.webp",
        type: "Alcove units",
        alt: "White fitted alcove shelving with shaker cupboards beside a black fireplace, green kitchen units and fluted dining table in view",
      },
      {
        file: "/images/library/ssp-014.webp",
        type: "Walk-in wardrobes",
        alt: "White walk-in wardrobe with hanging rails in three lit bays, open cubbies above and lit shelving on the left",
      },
      {
        file: "/images/journal/primrose-ai-offwhite-wardrobes.webp",
        type: "Off-white wardrobes below a cornice",
        ai: true,
        width: 1536,
        height: 1024,
        alt: "A wall-to-wall wardrobe with six flat hinged doors in three pairs, painted off-white, with small round brass knobs where each pair meets. It stops beneath the room's ornate original cornice, which stays in view, with slim infills at the top and sides and a recessed plinth. A sash window with a radiator beneath it is to the right, and an armchair sits in the corner.",
      },
    ],
    summary: "Italianate stucco villas and mid-Victorian terraces, with many listed houses.",
  },
  {
    slug: "areas/islington",
    name: "Islington",
    /* Product-led, 15 Nov 2026: the third page, on the Primrose Hill model (Denis, 15 Nov: "use the
       same design and structure for the next articles"). Arthur's comment of 14 Nov (site branch
       flowtoform/areas-comments-2026-11-14) put "Bespoke carpentry" in the heading and kicker; the
       model leads the heading with the product search and keeps the kicker "Bespoke joinery" (Denis,
       15 Nov: "leave joinery for now"), so "bespoke carpentry" now sits in the opening. */
    titleProp: "Bespoke wardrobes in Islington",
    h1: "Bespoke wardrobes and fitted furniture in Islington, made to measure",
    kicker: "Bespoke joinery in Islington",
    description:
      "Bespoke wardrobes, alcove units and shelving for Islington homes: Georgian and Victorian houses and flats, measured in the room and cut to fit.",
    /* bespoke wardrobes islington is the area's largest product search: Search Console 36
       impressions, 11 Oct to 8 Nov (then carpentry islington 24, bespoke furniture islington 22,
       bespoke joinery islington 14); Keyword Planner 10 (London, 14 Nov 2026). The carpenter
       cluster (carpenter islington, carpenters islington, islington carpenter: 40, peak 70) is
       larger, but it is not a product search. Keyword Planner could not be asked again on 15 Nov
       (DataForSEO answered 402). */
    primary: "bespoke wardrobes islington",
    /* 15 Nov 2026: the register's allocation (ops PR #49): ssp-048, its lead (an open wardrobe
       with an oak interior), cropped to 3:2 from the top shelf to the first drawer, leaving out
       the masking-tape scrap at the right edge and the rug, as the register asks; ssp-051, the
       cleanest of the grey kitchen frames, cropped to 3:2 (ssp-050 is the same kitchen and was
       held back, the register's own suggestion; ssp-053, 054 and 055 are alternates). Plus the
       register's second AI gap for Islington, alcove units with glazed upper cupboards and lit
       shelving in a Georgian living room (Figma node 32:2). Its first gap, closed white
       handleless wardrobes, has no plate: the frame shows three. None is a recorded job in
       Islington. */
    plates: [
      {
        file: "/images/library/ssp-048.webp",
        type: "Fitted wardrobes",
        alt: "Open wardrobe with an oak-toned interior: a top shelf, a chrome rail with black hangers, a lower shelf and the first of its drawers, with hinges on both doors.",
      },
      {
        file: "/images/library/ssp-051.webp",
        type: "Bespoke kitchens",
        alt: "Matt charcoal L-shaped handleless kitchen with an island, two white stools, a tall fridge housing, a black extractor and a white metro tile splashback.",
      },
      {
        /* 19 Nov 2026, Denis on the review link: "remove the leds here". Made again without lighting
           (Figma node 41:8, picked over 41:9 by an independent check against the render protocol;
           one faint mark on a door rail retouched). Original PNG in S&S ops deliverables/ai-renders-2026-11-14/. */
        file: "/images/journal/islington-ai-glazed-alcove-units.webp",
        type: "Glazed alcove cupboards",
        ai: true,
        width: 1536,
        height: 1024,
        alt: "Two fitted alcove units painted soft sage green either side of a white fireplace with a black cast-iron insert. Each has a two-door panelled base cupboard and a two-door glazed upper cupboard with shelves holding books and ceramics, all with small brass knobs, running up to the room's cornice. A tall sash window is to the right.",
      },
    ],
    summary: "Late Georgian squares and terraces, Victorian villas and flats in converted houses.",
  },  {
    slug: "areas/belsize-park",
    name: "Belsize Park",
    /* Product-led, 15 Nov 2026: the fifth page on the Primrose Hill model (a founder's go; Denis,
       15 Nov: "use the same design and structure for the next articles"). No "carpenter" in the
       title, heading or description; the kicker stays "Bespoke joinery" (Denis, 15 Nov: "leave
       joinery for now") and "bespoke carpentry" sits in the opening. */
    titleProp: "Bespoke wardrobes in Belsize Park",
    h1: "Bespoke wardrobes and walk-in wardrobes for Belsize Park's Victorian villas",
    kicker: "Bespoke joinery in Belsize Park",
    description:
      "Bespoke wardrobes, walk-in wardrobes and alcove units for Belsize Park's Victorian villas, mansion flats and mews houses, each designed for its room.",
    /* bespoke wardrobes belsize park is the area's one product search in Search Console: 49
       impressions at position 11.4, 18 Aug to 25 Sep (ops research/hampstead-2026-10-03/
       evidence.md), and 39 at position 11.5, 11 Sep to 8 Oct (ops briefs/case-study-2026-11.md,
       local branch area-pages/no-client-work-2026-11-06). It is not among the area queries listed
       for 11 Oct to 8 Nov, where carpenter belsize park had 18 at position 8.1, and that is not a
       product search. Keyword Planner returned nothing for any Belsize Park wardrobe phrase; its
       one figure for the area is bespoke kitchens belsize park, 10, in a single month (London,
       14 Nov 2026), so the counted, first-party search leads. Walk-in wardrobes come second
       because the register's photographs for this page are all of one walk-in wardrobe. */
    primary: "bespoke wardrobes belsize park",
    /* 15 Nov 2026: the register's allocation (ops PR #49) for Belsize Park is one walk-in wardrobe
       in four frames. ssp-008, its lead, cropped to 3:2 from the top cubbies to the deep shelf,
       leaving out the screw holes with red plugs on the right-hand wall that the register notes,
       so the low cubbies are out of frame and the alt says what is in it; ssp-006, a close view
       of the same cubbies above a hanging bay, cropped to 3:2. ssp-007 repeats the view of the
       live walk-in-wardrobes-02 frame and ssp-009 is an alternate of ssp-008. Plus the register's
       second AI gap for Belsize Park, full-height painted wardrobes in a bay-fronted bedroom
       (Figma node 33:2). Its first gap, alcove units either side of a chimney breast, has no
       plate: the frame shows three, and Islington's AI plate is already alcove units. None is
       a recorded job in Belsize Park. */
    plates: [
      {
        file: "/images/library/ssp-008.webp",
        type: "Walk-in wardrobes",
        alt: "Dark oak-effect walk-in wardrobe with four open cubbies along the top, a chrome hanging rail beneath them and its side run turning the corner on the left.",
      },
      {
        file: "/images/library/ssp-006.webp",
        type: "Walk-in wardrobe shelving",
        alt: "Dark oak-effect open cubby shelving with neat edge banding, above an open bay, against a pale grey wall.",
      },
      {
        file: "/images/journal/belsize-ai-green-wardrobes-bay.webp",
        type: "Painted wardrobes by a bay window",
        ai: true,
        width: 1536,
        height: 1024,
        alt: "Eight full-height flat wardrobe doors painted pale green, in four pairs with slim brass bar handles, running wall to wall beneath the room's cornice. A bay window with white sashes and linen curtains is to the right, with a low bench in it.",
      },
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
