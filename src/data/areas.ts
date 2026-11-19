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
           (Figma node 41:8). Then, the same day, Denis: "remove the plants from inside the alcove units":
           made again with nothing but books, bowls and jugs on the shelves (node 43:9, picked over 43:8 by
           an independent check against the render protocol: 43:8 stopped short of the cornice and had slab
           base doors). Then Denis asked for handles on the glazed doors and for the bowl on the coffee
           table to go: made again (node 45:11: a knob on every door, no coffee table; picked over 45:10,
           which had an unexplained strip on the left wall). The four glazed-door knobs came out lumpy,
           so each was replaced with a copy of the base knob below it. Original PNGs in S&S ops
           deliverables/ai-renders-2026-11-14/. */
        file: "/images/journal/islington-ai-glazed-alcove-units.webp",
        type: "Glazed alcove cupboards",
        ai: true,
        width: 1536,
        height: 1024,
        alt: "Two fitted alcove units painted soft sage green either side of a white fireplace with a black cast-iron insert. Each has a two-door panelled base cupboard and a two-door glazed upper cupboard with shelves holding books, bowls and jugs, all with small brass knobs, running up to the room's cornice. A tall sash window with shutters is to the right.",
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
        alt: "Sage green full-height wardrobes with four pairs of flat doors and slim brass bar handles fill one bedroom wall, with slim matching infills under the cornice and a recessed plinth. A bay window with white sashes and a cream curtain is to the right, with a low bench beside it.",
      },
    ],
    summary: "Large Victorian villas, mansion flats and mews houses in Camden's Belsize conservation area.",
  },
  {
    slug: "areas/kentish-town",
    name: "Kentish Town",
    /* Product-led, 17 Nov 2026: the sixth page on the Primrose Hill model (a founder's go, 17 Nov:
       "continue with the next Area page"; Denis, 15 Nov: "use the same design and structure for the
       next articles"). No "carpenter" in the title, heading or description; the kicker stays
       "Bespoke joinery" (Denis, 15 Nov: "leave joinery for now") and "bespoke carpentry" sits in
       the opening. The title drops "bespoke" before kitchens so the full title stays near 65
       characters with the business name. */
    titleProp: "Fitted wardrobes and kitchens in Kentish Town",
    h1: "Fitted wardrobes and bespoke kitchens for Kentish Town's terraced houses",
    kicker: "Bespoke joinery in Kentish Town",
    description:
      "Fitted wardrobes, bespoke kitchens and alcove units for Kentish Town's Georgian and Victorian terraces, some narrow, each planned for its own room.",
    /* No measured product search exists for Kentish Town. Keyword Planner returned nothing for any
       of 22 Kentish Town phrases (London, 14 Nov 2026), and the only Kentish Town query in Search
       Console is carpenter kentish town (16 impressions at position 1.9, 11 Oct to 8 Nov 2026; one
       impression at position 2 in the 20 Aug 2026 export), which is not a product search. fitted wardrobes
       kentish town leads because it is the product search the 14 Nov research checked live (ops
       serps-areas-2: page 1 is directories, one Islington page and one Camden case study, so
       nobody holds it) and the area plan's first product; Kaspar's own sentence of 6 Sep 2026
       names Kentish Town among the areas with much of the wardrobe work. Bespoke kitchens come
       second because the register's photographs for this page are all of one kitchen (as walk-in
       wardrobes on Belsize Park). bespoke kitchens kentish town showed no People also ask box on
       17 Nov (UK, desktop, the built-in browser). */
    primary: "fitted wardrobes kentish town",
    /* 17 Nov 2026: the register's allocation (ops PR #49) for Kentish Town is the May 2025 grey
       handleless kitchen, split with Islington in different views (Islington shows ssp-051, the
       L-shaped run from the far corner). ssp-020, its lead, cropped to 3:2 from y 520 of the
       portrait original: the view down the long room past the island to the glazed wall; ssp-019,
       the sink corner with the wall units and metro tiles, cropped to 3:2 from y 600. ssp-021 and
       ssp-022 are allocated but the frame shows three plates (ssp-022 is close to Islington's
       view); ssp-024 and ssp-025 are alternates. Plus the register's AI gap for Kentish Town,
       closed white handleless fitted wardrobes with slim infills (Figma node 34:2): the page has
       no wardrobe photograph. None is a recorded job in Kentish Town. */
    plates: [
      {
        file: "/images/library/ssp-020.webp",
        type: "Bespoke kitchens",
        alt: "Dark grey kitchen island with a marble-effect top and two white stools, tall units at left and an open room beyond.",
      },
      {
        file: "/images/library/ssp-019.webp",
        type: "Handleless kitchen units",
        alt: "Matt grey handleless kitchen units with a white marble-effect worktop, a black sink and spring tap, and white metro tiles.",
      },
      {
        file: "/images/journal/kentish-ai-white-handleless-wardrobes.webp",
        type: "White handleless wardrobes",
        ai: true,
        width: 1536,
        height: 1024,
        alt: "Six matt white flat doors with no handles run along one bedroom wall under the ceiling moulding, above a recessed base. Light falls from a sash window with a white roller blind on the left, over a pale oak floor and the corner of a bed.",
      },
    ],
    summary: "Georgian and Victorian terraces, many of them listed, around Leighton Road and Kelly Street.",
  },
  {
    slug: "areas/swiss-cottage",
    name: "Swiss Cottage",
    /* Product-led, 17 Nov 2026: the seventh page on the Primrose Hill model (a founder's go, 17 Nov:
       "move on to the next area"; Denis, 15 Nov: "use the same design and structure for the next
       articles"). No "carpenter" in the title, heading or description; the kicker stays "Bespoke
       joinery" (Denis, 15 Nov: "leave joinery for now") and "bespoke carpentry" sits in the opening. */
    titleProp: "Bespoke wardrobes in Swiss Cottage",
    h1: "Bespoke wardrobes for the mansion blocks and Victorian houses around Swiss Cottage",
    kicker: "Bespoke joinery in Swiss Cottage",
    description:
      "Bespoke wardrobes, fitted drawers and alcove units for the mansion blocks and late Victorian houses around Swiss Cottage, each planned for its room.",
    /* bespoke wardrobes swiss cottage is the area's largest product search on record: 19 impressions
       at position 22.3 in Search Console, 18 Aug to 25 Sep 2026 (ops research/hampstead-2026-10-03/
       evidence.md, local branch area-pages/no-client-work-2026-11-06), where carpenter swiss cottage
       had 33. In 11 Oct to 8 Nov, fitted wardrobes swiss cottage had 2 at 6.0 and carpenter swiss
       cottage 3 at 1.7. Keyword Planner returned nothing for any of 22 Swiss Cottage phrases (London,
       14 Nov 2026). The heading names the two kinds of home Camden's appraisals describe around the junction (Swiss Cottage proper is east of Finchley Road; the mansion blocks and semis are in South Hampstead, the conservation area that carried the Swiss Cottage name until 2011). */
    primary: "bespoke wardrobes swiss cottage",
    /* 17 Nov 2026: the register's allocation (ops PR #49) for Swiss Cottage is the May 2026 wardrobe
       with oak drawers (Islington shows the open wardrobe; this page the drawer close-ups). ssp-032,
       its lead, landscape, cropped to 3:2 from y 333: the shelf and the four-drawer bank inside the
       open wardrobe; ssp-033, portrait, cropped to 3:2 from y 900: a drawer pulled open, leaving out
       the rug fringe the register notes. ssp-056 and ssp-059 are allocated but the frame shows three
       plates; ssp-035, 036 and 061 are alternates. Plus the register's first AI gap for Swiss Cottage,
       a full-height sliding-door wardrobe with a real top track housing, mid-grey (Figma node 35:2):
       the page has no closed wardrobe. Its second gap, alcove shelving with LED strips, has no plate.
       None is a recorded job in Swiss Cottage. */
    plates: [
      {
        file: "/images/library/ssp-032.webp",
        type: "Fitted wardrobe drawers",
        alt: "Four oak-effect drawers with slim bar handles under an oak-effect shelf inside an open wardrobe, above a wooden floor.",
      },
      {
        file: "/images/library/ssp-033.webp",
        type: "Wardrobe drawer interior",
        alt: "Oak-effect wardrobe drawer pulled open to show its oak-effect interior and slim bar handle, below a closed drawer.",
      },
      {
        file: "/images/journal/swiss-ai-grey-sliding-wardrobe.webp",
        type: "Grey sliding-door wardrobe",
        ai: true,
        width: 1536,
        height: 1024,
        alt: "Three full-height flat sliding wardrobe doors in matt mid-grey, each with a slim recessed pull, under a matching pelmet below the cornice. A tall sash window with a linen curtain is to the right, and the end of a bed to the left.",
      },
    ],
    summary: "Late Victorian houses and mansion-block flats around the Finchley Road junction.",
  },
  {
    slug: "areas/highgate",
    name: "Highgate",
    /* Product-led, 17 Nov 2026: the eighth page on the Primrose Hill model (a founder's go, 17 Nov:
       "next"; Denis, 15 Nov: "use the same design and structure for the next articles"). No
       "carpenter" in the title, heading or description; the kicker stays "Bespoke joinery" (Denis,
       15 Nov: "leave joinery for now") and "bespoke carpentry" sits in the opening. */
    titleProp: "Fitted wardrobes and alcove units in Highgate",
    h1: "Fitted wardrobes and alcove units for Highgate's Georgian and Victorian homes",
    kicker: "Bespoke joinery in Highgate",
    description:
      "Fitted wardrobes and alcove units for Highgate's Georgian and Victorian homes, on both sides of the High Street, each drawn for its own room.",
    /* No wardrobe or alcove search is measured for Highgate. Keyword Planner's only figures are the
       carpenter highgate group (10 each, London, 14 Nov 2026), not product searches; Search Console's
       one product search is bespoke kitchens highgate, 2 impressions at 45.5 (11 Oct to 8 Nov), and
       the page has no kitchen photograph or kitchen section. fitted wardrobes highgate leads because
       the register's lead photograph is a fitted wardrobe and the search returns a People also ask
       box (17 Nov: costs and companies). Alcove units come second: the register's AI gap for Highgate
       is alcove units, and the appraisals' Georgian houses carry the alcove section. */
    primary: "fitted wardrobes highgate",
    /* 17 Nov 2026: the register's allocation (ops PR #49) for Highgate is two frames from the SW7
       flat (31 Aug 2026 drop, professional exports, already 3:2): ssp-037, the bedroom with a white
       Shaker wardrobe, a different view of the room in the live doors-panelling-02 frame; ssp-039,
       the bathroom with a floating vanity unit, a different view of the live bathroom-01 frame. Plus
       the register's first AI gap for Highgate, alcove units with arched open shelving above
       panelled cupboards, chalky white (Figma node 36:2). Its other gaps (shelving round a bay with a
       window seat, a media wall) have no plate. None is a recorded job in Highgate. */
    plates: [
      {
        file: "/images/library/ssp-037.webp",
        type: "Shaker fitted wardrobe",
        alt: "White Shaker-style fitted wardrobe with brass bar handles beside wall panelling and a doorway to a marble-effect bathroom.",
      },
      {
        file: "/images/library/ssp-039.webp",
        type: "Bathroom vanity unit",
        alt: "Floating taupe two-drawer vanity unit with a white top and brass taps against marble-effect tiles, beside a toilet and bath.",
      },
      {
        file: "/images/journal/highgate-ai-arched-alcove-units.webp",
        type: "Arched alcove shelving",
        ai: true,
        width: 1536,
        height: 1024,
        alt: "Alcove units painted chalky white either side of a chimney breast and fireplace: open shelves inside an arched frame above panelled cupboards with small brass knobs, below the room's cornice. A sash window is to the right.",
      },
    ],
    summary: "Georgian village houses, Victorian terraces and flats, split between Camden and Haringey.",
  },
  {
    slug: "areas/west-hampstead",
    name: "West Hampstead",
    /* Product-led, 17 Nov 2026: the ninth page on the Primrose Hill model (a founder's go, 17 Nov:
       "Yes, West Hampstead"; Denis, 15 Nov: "use the same design and structure for the next
       articles"). No "carpenter" in the title, heading or description; the kicker stays "Bespoke
       joinery" (Denis, 15 Nov: "leave joinery for now") and "bespoke carpentry" sits in the opening. */
    titleProp: "Fitted and walk-in wardrobes in West Hampstead",
    h1: "Fitted and walk-in wardrobes for West Hampstead's mansion flats and houses",
    kicker: "Bespoke joinery in West Hampstead",
    description:
      "Fitted wardrobes, walk-in wardrobes and alcove units for the mansion flats, Edwardian houses and Victorian streets either side of West End Lane.",
    /* No product search is measured for West Hampstead. Keyword Planner returned nothing for any
       West Hampstead phrase (London, 14 Nov 2026); Search Console's only area queries are carpenter
       south hampstead (12 impressions at 1.9, 11 Oct to 8 Nov; 24 at 7.96, 18 Aug to 25 Sep) and
       carpenter west hampstead (1), neither a product search. Fitted wardrobes lead, the broad
       product and the register's AI gap (Shaker wardrobes in an alcove); walk-in wardrobes come
       second because the register's photographs for this page are one walk-in. */
    primary: "fitted wardrobes west hampstead",
    /* 17 Nov 2026: the register's allocation (ops PR #49) for West Hampstead is the June 2025 white
       LED walk-in, split with Primrose Hill in different views (Primrose Hill shows ssp-014, the view
       from the doorway). ssp-042, its lead, portrait, cropped to 3:2 from y 1700: shelves over five
       black-handled drawers, lit shoe cubbies and a rail at the right; ssp-044, cropped from y 1300:
       hanging rails at the left, shelves and drawers at the right. ssp-043 is close to ssp-042;
       ssp-041 (an internal door) has no service page to show. Plus the register's AI gap for West
       Hampstead, Shaker wardrobes in the alcoves projecting past the chimney breast (Figma node
       37:2). None is a recorded job in West Hampstead. */
    plates: [
      {
        file: "/images/library/ssp-042.webp",
        type: "Walk-in wardrobe",
        alt: "White fitted walk-in shelving with LED strips, a column of narrow lit cubbies and five black-handled drawers, with hanging rails at each side.",
      },
      {
        file: "/images/library/ssp-044.webp",
        type: "Walk-in wardrobe drawers and rails",
        alt: "White walk-in wardrobe with hanging rails at the left and LED-lit shelves above black-handled drawers at the right.",
      },
      {
        file: "/images/journal/westhampstead-ai-shaker-alcove-wardrobes.webp",
        type: "Shaker alcove wardrobes",
        ai: true,
        width: 1536,
        height: 1024,
        alt: "Shaker wardrobes in a soft stone colour either side of a chimney breast and black cast-iron fireplace, each standing slightly forward of the breast with a finished side panel and brass bar handles. A sash window is to the right.",
      },
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
