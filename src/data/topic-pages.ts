/**
 * Topic pages, 14 November 2026: pages about one kind of work rather than one
 * district, built on the area page frame (src/components/AreaPage.astro) so
 * they carry its order: breadcrumb, kicker, h1, three plates, the lede, the two
 * actions, the page's own sections, the closing band.
 *
 * Why not the service template ([slug].astro). That template is the seven
 * contracted service pages, read section by section into one shared gate and
 * one shared copy store (service-copy.ts). These pages were approved by a
 * founder on 14 Nov 2026 as extras for Kaspar to review over Christmas, each
 * with copy of its own, and none is a signed service page. A page here can move
 * into SERVICES later if the founders want it in the Services menu.
 *
 * Each page's copy lives in its own file under src/pages; its gate is in
 * page-gates.ts and holds it noindexed, out of the sitemap and unlinked until
 * Kaspar has checked it. scripts/verify-build.mjs reads the slugs below to
 * register each path's breadcrumb and WebPage rules, so a slug is always
 * written on its own line as `slug: "..."`.
 */

/** A real photograph from public/images/_selection.json, labelled by type only. */
type PhotoPlate = { file: string; type: string };

/**
 * An AI-generated example, made to docs/ai-render-protocol.md in the ops repo
 * where no photograph of the work exists. Captioned "AI-generated example" by
 * the frame; `type` is the short name the photo viewer adds after it.
 */
type AiPlate = { file: string; type: string; ai: true; width: number; height: number; alt: string };

export type TopicPage = {
  /** URL slug, without slashes: the page's primary keyword, hyphenated. */
  slug: string;
  /** The breadcrumb label. */
  name: string;
  /** Passed to Base as `title`; Base appends " | Structure & Style". */
  titleProp: string;
  h1: string;
  kicker: string;
  /** Meta description, 140 to 155 characters. */
  description: string;
  /** Primary keyword, for the record. */
  primary: string;
  plates: (PhotoPlate | AiPlate)[];
};

export const TOPIC_PAGES: TopicPage[] = [
  {
    slug: "bespoke-staircases",
    name: "Bespoke staircases",
    titleProp: "Bespoke staircases and staircase joinery",
    h1: "Bespoke staircases and staircase joinery in north London",
    kicker: "Staircases",
    description:
      "Bespoke staircases and staircase joinery for north London homes: new balustrades and handrails, oak treads over an old stair, and storage built underneath.",
    /* bespoke staircase, exact phrase: London 40, UK 260, peak 590 in Nov 2025; bespoke staircases
       london 10 (Keyword Planner, 14 Nov 2026). Search Console, 11 Oct to 8 Nov: bespoke staircase
       design 8, bespoke oak staircases near me 7, bespoke timber staircases london 7 impressions.
       Approved by a founder on 14 Nov 2026 (roadmap Part C, D12). */
    primary: "bespoke staircase",
    /* No photograph of staircase work exists in the library (photo session, 14 Nov 2026), so the
       three plates are AI-generated examples, made in Figma (gpt-image-2.5-sunburst) to the ops
       repo's render protocol; originals in ops deliverables/ai-renders-2026-11-14/. Kaspar
       approves each on the review link before anything is published. */
    plates: [
      {
        file: "/images/journal/staircase-ai-victorian-balustrade.webp",
        type: "Victorian balustrade",
        ai: true,
        width: 1536,
        height: 1024,
        alt: "The hall of a Victorian terraced house with a straight staircase along the wall: a polished hardwood handrail, white painted spindles and a white turned newel post with a timber cap, a sisal runner held by brass stair rods, and a black and white tiled hall floor.",
      },
      {
        file: "/images/journal/staircase-ai-oak-treads.webp",
        type: "Oak treads and new balustrade",
        ai: true,
        width: 1536,
        height: 1024,
        alt: "A straight staircase with natural oak treads over white painted risers, a square oak handrail, slim white square spindles and a white newel post with an oak cap, beside a sage green wall above an oak herringbone hall floor.",
      },
      {
        file: "/images/journal/staircase-ai-under-stair-storage.webp",
        type: "Under-stair storage",
        ai: true,
        width: 1536,
        height: 1024,
        alt: "Storage fitted under a staircase in a hallway: a tall cupboard at the high end and flat drawer fronts that step down under the slope of the stair, painted deep blue-grey with small brass knobs and a recessed plinth, below white turned spindles.",
      },
    ],
  },
  {
    slug: "loft-wardrobes",
    name: "Loft and eaves wardrobes",
    titleProp: "Loft and eaves wardrobes",
    h1: "Loft and eaves wardrobes, fitted under sloping ceilings",
    kicker: "Loft wardrobes",
    description:
      "Loft and eaves wardrobes for north London homes: fitted under sloping ceilings, with hanging where the room is tall and drawers where the eaves drop low.",
    /* loft wardrobes, exact phrase: London 170, UK 1000; sloping ceiling wardrobes London 170,
       UK 1600; eaves storage London 320, UK 1600; eaves wardrobes UK 480 (Keyword Planner,
       14 Nov 2026). One page for the loft cluster, so /fitted-wardrobes/ can link here rather
       than grow its own loft section. */
    primary: "loft wardrobes",
    plates: [
      { file: "/images/fitted-wardrobes/fitted-wardrobes-10.webp", type: "Fitted wardrobes" },
      {
        file: "/images/journal/built-in-wardrobes-ai-loft-oak-niches.webp",
        type: "Loft wardrobes with oak niches",
        ai: true,
        width: 1672,
        height: 941,
        /* The approved description from the built-in wardrobe guide (Kaspar, 23 Oct 2026). */
        alt: "Fitted loft wardrobes arranged symmetrically around an oak window seat. Four flat ivory doors on each side follow the changing ceiling height, while open oak shelving fills the lowest space beneath the eaves. Bronze pull handles, slim infills along the ceiling slopes and recessed plinths complete the design. The open niches provide space for books, folded items and display.",
      },
      {
        file: "/images/journal/loft-ai-eaves-drawers-sage.webp",
        type: "Eaves cupboards and drawers",
        ai: true,
        width: 1536,
        height: 1024,
        alt: "Eaves storage along the sloping side of a loft bedroom: a row of six pull-out drawers with four flat cupboard doors above, their tops cut to the angle of the ceiling, painted soft sage with slim brass bar handles, slim infills against the slope and a recessed plinth.",
      },
    ],
  },
  {
    slug: "built-in-bookcases",
    name: "Built-in bookcases",
    titleProp: "Built-in bookcases and bespoke shelving",
    h1: "Built-in bookcases and bespoke shelving in north London",
    kicker: "Bookcases and shelving",
    description:
      "Built-in bookcases and bespoke shelving for north London homes: whole walls of books, shelves around doors and windows, under the stairs and in alcoves.",
    /* built in bookshelves, exact phrase: London 170, UK 880; bespoke shelving London 110, UK 590;
       bespoke bookcases London 90, UK 590; fitted bookcases London 70 (Keyword Planner, 14 Nov
       2026). "bookcases london" (590) is a shopping search, flat-pack products on page 1, and is
       not the target. Kept apart from /alcove-units/, which owns alcoves either side of a
       chimney breast. */
    primary: "built in bookshelves",
    plates: [
      { file: "/images/alcove-units/alcove-units-09.webp", type: "Bookcases" },
      {
        file: "/images/journal/alcove-ai-full-height-bookcases.webp",
        type: "Full-height bookcases",
        ai: true,
        width: 1536,
        height: 1024,
        /* The approved alt text from the alcove units guide (Kaspar, 21 Oct 2026). */
        alt: "Floor-to-ceiling alcove bookcases on both sides of a traditional fireplace, with open shelves from floor to ceiling for books, artwork and decorative pieces, and warm integrated lighting creating an inviting atmosphere.",
      },
      {
        file: "/images/journal/alcove-ai-floating-shelves.webp",
        type: "Floating shelves",
        ai: true,
        width: 1536,
        height: 1024,
        /* The approved alt text from the alcove units guide (Kaspar, 21 Oct 2026). */
        alt: "Minimalist white floating shelves with warm integrated lighting beneath each shelf, above flat, handleless base cabinets on either side of a traditional fireplace. The wall above the shelves is left plain. A contemporary storage solution that combines open display shelving with concealed storage.",
      },
    ],
  },
];

export const topicPath = (slug: string) => `/${slug}/`;
