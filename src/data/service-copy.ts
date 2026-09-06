/**
 * Wave-one page bodies: fitted wardrobes, walk-in wardrobes, alcove units and
 * the cost guide. Written 30 Aug 2026 against SS_COPY_TONE_PROTOCOL_v1.4 (ops
 * repo root) and sourced ONLY from confirmed facts:
 *
 *   - the client's questionnaire answers (`answers.ts`, ingested 30 Aug 2026,
 *     transcription in the ops repo at docs/content-questionnaire-answers.md)
 *   - `site.ts` service definitions and the Business Profile facts
 *
 * Nothing here asserts a specific past job, a figure, or a capability the
 * answers do not support: the Truth gate blocked ten invented case claims on
 * 24 Aug and nothing of that kind is written again. Case-study material waits
 * on Q44 to Q49.
 *
 * Prices appear ONLY in the priceTables and priceNotes of the cost guide,
 * transcribed from the client's pricing document of 31 Aug 2026, and in the
 * per-service price lines in site.ts from the same source. No other string
 * carries a figure beyond the confirmed £2,000 general minimum.
 *
 * The manufacturing FAQ line appears exactly once on the site, on the fitted
 * wardrobes page, in the protocol's fixed wording. Do not repeat it anywhere
 * (protocol section 10: one FAQ entry is the whole allocation).
 *
 * Wave-two pages (media walls, kitchens, home office) have no entry yet and
 * the template renders nothing extra for them.
 */

export type ServiceCopy = {
  /** Body paragraphs rendered after the photography, before the spec sections. */
  intro: string[];
  /**
   * Per-service lead lines for the shared spec sections, keyed by section id
   * (cost, how-long, made-from, fitting, after). The spec-table FACTS are
   * identical across pages by design; these leads are what stops the five
   * sections reading as the same page seven times. A missing key falls back
   * to the template's generic lead.
   */
  leads?: Record<string, string>;
  /** Extra sections rendered after the spec sections. */
  sections: { meta: string; heading: string; body: string[] }[];
  /**
   * Guide-price tables, rendered directly after the cost section. Source:
   * the client's pricing document, 31 Aug 2026 (ops repo,
   * Structure_and_Style_Guide_Pricing_Wardrobes_Alcoves.pdf). Figures are
   * transcribed, never invented; the board brand named in the source stays
   * off the page pending a ruling (see the ops notes).
   */
  priceTables?: { title: string; note: string; columns: string[]; rows: string[][] }[];
  /** Paragraphs rendered under the price tables. */
  priceNotes?: string[];
  /** Question-and-answer block. First sentence of every answer answers. */
  faqs: { q: string; a: string }[];
};

export const SERVICE_COPY: Partial<Record<string, ServiceCopy>> = {
  "fitted-wardrobes": {
    intro: [
      "A fitted wardrobe is measured against your walls, floor and ceiling, then designed around what you keep. The run uses the top of the room and both corners rather than losing them.",
      /* "north London" appeared nowhere on this site until 5 Sep 2026, and
         "fitted wardrobes north london" is the target sheet's standout term:
         difficulty 7, the highest CPC on the sheet, and a top-three floor at
         month 12. The sentence states which of the service areas are north
         London rather than claiming where most of the work happens, which is a
         separate claim with no source behind it. */
      "The inside is planned first: hanging heights, shelving, drawers and anything that needs a home. You do not need to arrive knowing any of that. Asking the right questions at the first visit is our job, not yours.",
      "Wardrobes are fitted across London, including Hampstead, Belsize Park, Kentish Town and Camden in north London.",
    ],
    leads: {
      "cost": "The honest answer is a range until the room is measured, and one visit turns it into a firm number.",
      "how-long": "The lead time runs in weeks, and the fitting itself takes days rather than weeks.",
      "made-from": "Which board suits a wardrobe wall depends on the room, the finish you want and the budget.",
      "fitting": "Ceilings, floors and walls are rarely straight, and a wardrobe wall meets all three at once.",
      "after": "Doors and hinges do the daily work, so the cover on workmanship and moving parts is listed plainly.",
    },
    sections: [
      {
        meta: "The work",
        heading: "What a fitted wardrobe run includes",
        body: [
          "The work covers wardrobe walls, alcove-to-alcove runs, and wardrobes that follow sloping ceilings and awkward room shapes. Doors are hinged on Blum hardware, in painted, veneered or decorative board finishes.",
          "Inside, drawer banks run on Blum systems, and integrated lighting is wired in where the design calls for it. Veneer grain is matched across adjoining doors, so a run reads as one piece rather than a row of panels.",
        ],
      },
      {
        meta: "Fit",
        heading: "Cut to the wall as it actually is",
        body: [
          "Walls, floors and ceilings are rarely straight, so each piece is scribed: cut to follow the line of the room rather than left with gaps.",
          "Fitting a straightforward wardrobe wall typically takes 2 to 3 days on site. Hand-painting or on-site construction can take it closer to a week, and you get the dates when the project is programmed.",
        ],
      },
    ],
    faqs: [
      {
        q: "Where is the furniture made?",
        a: "Components are made to our drawings by specialist suppliers, then cut and fitted in your home by us. Which supplier depends on the job.",
      },
      {
        q: "What guarantee comes with a fitted wardrobe?",
        a: "The guarantee covers installation and workmanship for 2 years and the structure and joinery for 10 years. Hinges, runners and other moving hardware carry their manufacturer's warranty.",
      },
      {
        q: "Will you come back if a door moves?",
        a: "Yes, doors and other moving parts that settle within the 2-year aftercare period are adjusted, and we come back to do it.",
      },
      {
        q: "How do I look after the finish?",
        a: "That depends on the material and finish, so the care advice comes with the finished piece: how to clean it and what to avoid. Natural veneers develop subtly with age and light. Painted and decorative finishes stay more consistent.",
      },
    ],
  },

  "walk-in-wardrobes": {
    intro: [
      "A walk-in wardrobe is planned as one room rather than a run of units. Rails, drawer banks, shoe storage and shelving are set out together, so the lines carry through from wall to wall.",
      "Loft rooms, box rooms and eaves take fitted storage well, because the awkward angles are measured and used rather than boxed off. The first visit happens at the room itself and usually takes 45 to 60 minutes.",
    ],
    leads: {
      "cost": "A whole room's fit-out sits behind a single itemised quotation for the agreed scope.",
      /* Kaspar's own line, 6 September 2026, in place of ours about the design
         week. His says what a reader of this page is actually asking: a
         walk-in is a bigger job than a wardrobe run and the time follows the
         room. The design week is still on the page, in the row below.

         He read the materials and fitting sections on the same pass and wrote
         "same as for wardrobes" against both. Read as what it says, that the
         answers there are the wardrobe answers, which they already are: those
         rows are the shared Q22, Q24, Q28, Q43, Q31 and Q33, identical on
         every service page. Nothing was changed on the strength of it. */
      "how-long": "Walk-in wardrobes are larger projects, so installation time depends on the size of the room and the specification.",
      "made-from": "In a walk-in the inside is on show, so interior finishes matter as much as fronts.",
      "fitting": "A flat, square wall is the exception in these rooms rather than the rule.",
      "after": "Rails, runners and hinges carry the daily traffic, and each carries its manufacturer's warranty.",
    },
    sections: [
      {
        meta: "Planning",
        heading: "Designed around what you keep",
        body: [
          "Rail heights come from what hangs. Drawer and shelf splits come from what folds. We ask about all of it at the consultation, so you do not need to arrive with a plan.",
          "Mirrors, glass, metal details and specialist handles can be worked into the design, and integrated lighting is specified where the design calls for it.",
        ],
      },
      {
        meta: "Finish",
        heading: "Matching what you already own",
        body: [
          "Finishes include spray-painted and hand-painted work, natural and stained veneers, and decorative boards. There is no single house finish: the right one depends on the design, how the room is used and what it needs to match.",
        ],
      },
    ],
    faqs: [
      {
        q: "How soon can a walk-in wardrobe be fitted?",
        a: "Lead time is typically 4 to 8 weeks, depending on the project and the current schedule. Installation dates are allocated when the deposit is paid and confirmed as the project progresses.",
      },
      {
        q: "Do you design it, or do I?",
        a: "Either route works: straightforward projects can go straight to quotation. Where design development is needed, drawings and visuals follow once the quotation is accepted, with up to two revision rounds included.",
      },
      {
        q: "Can it match furniture we already have?",
        a: "Yes, matching existing furniture and finishes within the property is one of the things the finish is chosen for.",
      },
      {
        q: "What do you need from us before fitting?",
        a: "Clear personal belongings from the area being fitted and make sure we can reach it. Anything project-specific is agreed before installation, and floors and the surrounding area are protected before work starts.",
      },
    ],
  },

  "alcove-units": {
    /* Kaspar's own two paragraphs, 6 September 2026, replacing ours.
       ONE WORD IS NOT HIS: he wrote "the client's requirements" and this page
       says "you" and "your" throughout, so it reads "your own requirements".
       Told rather than asked, and easy to put back.

       What went with the old intro, and where it still lives: the scribing
       sentence is the fitting section and the first FAQ, and "alcove
       cupboards", the 2,400-a-month phrase this page was missing until 5 Sep,
       is the H2 below. Losing it from the prose is survivable; losing it from
       the heading is not, so check both before editing either. */
    intro: [
      "Alcove furniture is designed around the space and how it will be used. It can include fitted cupboards, floating or fitted shelving, full-height cabinetry, display storage, media units or a combination of these.",
      "The layout, proportions and internal storage are developed around the room and your own requirements, with a choice of painted, veneered and decorative finishes to suit the design.",
    ],
    leads: {
      "cost": "A smaller piece follows the same pricing logic, and the table below is the honest version of it.",
      "how-long": "Alcove work follows the same two clocks as any commission, and a design week runs only where the project needs one.",
      "made-from": "Painted finishes are chosen for alcove work when the unit should match the room's existing woodwork.",
      "fitting": "Chimney breasts lean and alcove walls bow, so the unit is cut to the wall it actually meets.",
      "after": "Shelves carry real weight for years, and the 10-year cover on structure and joinery is the line that matters.",
    },
    sections: [
      {
        meta: "The work",
        /* The heading carries the phrase too, so it reaches an H2 rather than
           sitting in prose alone. Same edit as the intro, 5 Sep 2026. */
        heading: "Alcove cupboards, shelving and full-height runs",
        body: [
          "Base cupboards with shelving over is the classic arrangement, and it is right for most rooms. Full-height built-in cupboards, open bookshelves and display shelving with integrated lighting all follow the same rule: the alcove is measured first, and the design follows it.",
          "Painted finishes suit alcove work, because the joinery reads as part of the room. Veneers and decorative boards are there where a different look is wanted, and grain is matched across adjoining doors.",
        ],
      },
    ],
    faqs: [
      {
        q: "How are uneven walls and skirting handled?",
        a: "Every piece is cut to follow the line of the wall, floor and ceiling rather than left with gaps. Fitted and finished, the unit should look like it belongs to the room.",
      },
      {
        q: "Do you take small jobs?",
        a: "Yes, down to a general minimum of £2,000 of project value. If you are not sure whether yours fits, ask before ruling it out.",
      },
      {
        q: "Can the units match our existing woodwork?",
        a: "Yes, the finish is chosen partly around what it needs to match, whether existing furniture or the room's own joinery.",
      },
      {
        q: "How long does it take from survey to fitting?",
        a: "The overall lead time is typically 4 to 8 weeks, with dates confirmed as the project is programmed. We set aside one week for design and issue drawings for review by the end of it.",
      },
    ],
  },

  "fitted-wardrobe-cost": {
    intro: [
      "Every fitted or built-in wardrobe is priced as a whole job, to its own room. The guide tables below give the honest starting points, and a firm number follows one visit.",
      "What follows is what actually moves the price, how the quotation works, and what it includes.",
    ],
    priceTables: [
      {
        title: "Fitted wardrobes, guide starting prices",
        note: "The starting specification: a made-to-measure fitted wardrobe with a straightforward internal layout, standard shelving and hanging space, soft-close hinges, delivery and professional installation.",
        columns: ["Finish", "2 doors, up to 1.2m", "3 doors, up to 1.8m", "4 doors, up to 2.4m"],
        rows: [
          ["Melamine board", "from £2,300", "from £3,200", "from £4,000"],
          ["Hand-painted MDF", "from £2,500", "from £3,500", "from £4,500"],
          ["Professionally sprayed MDF", "from £3,200", "from £4,300", "from £5,400"],
          ["Oak veneer, stained and lacquered", "from £3,700", "from £5,000", "from £6,300"],
        ],
      },
      {
        title: "Alcove units, guide starting prices for a pair",
        note: "Based on a pair of fitted alcove units either side of a chimney breast. Each is a base cupboard with two doors and three open shelves above, up to about 1m wide per alcove.",
        columns: ["Finish", "Pair of alcove units"],
        rows: [
          ["Melamine board", "from £3,300"],
          ["Hand-painted MDF", "from £3,600"],
          ["Professionally sprayed MDF", "from £4,000"],
          ["Oak veneer, stained and lacquered", "from £6,000"],
        ],
      },
    ],
    priceNotes: [
      "Drawers, integrated lighting, mirrors, shoe storage, pull-out accessories and extra shelving are priced separately to the specification. So are premium hardware, decorative door details, cornices, specialist backing panels, TV and media integration and other bespoke options.",
      "These are guide starting prices rather than fixed quotations. The final figure depends on exact dimensions, internal layout, materials and finish, design details, access and site conditions. A detailed, itemised quotation follows the measured survey.",
      /* Added 5 Sep 2026. The page offers walk-in wardrobes twice and never
         said whether these tables price them, which the 4 Sep read flagged and
         left. It also puts "walk-in wardrobe cost" on the page that targets
         it, where the phrase did not appear at all. */
      "These tables cover fitted wardrobes and alcove units. Walk-in wardrobe cost is worked out per room instead, because a dressing room is priced by what goes into it rather than by door count, and projects generally start at £2,000 of value.",
    ],
    leads: {
      "cost": "This page is the whole answer: the range, what moves it, and what the number includes.",
      "how-long": "The same complexity that moves the price also stretches or shortens the programme.",
      "made-from": "Premium veneers and specialist finishes sit higher in the range than painted board, as the factors below show.",
      "fitting": "This is where the days on site inside the figure actually come from.",
      "after": "What stands behind the number: the cover on the work after the invoice is paid.",
    },
    sections: [
      {
        meta: "The price",
        heading: "What moves a fitted wardrobe up its range",
        body: [
          "Size and complexity lead. A longer run, a difficult room shape or a sloping ceiling adds work at the survey, at the drawings and at the fitting.",
          "Premium materials and veneers cost more than painted board, and specialist finishes add finishing time. Hand-painting on site can add days to the installation itself.",
          "Bespoke internal layouts, integrated lighting, and complex hardware and detailing move the figure the same way: they add design time, parts and fitting time.",
        ],
      },
      {
        meta: "The process",
        heading: "How the quotation works",
        body: [
          "The first visit usually takes 45 to 60 minutes, and a measured survey takes about an hour. The quotation that follows is fixed and itemised for the agreed scope.",
          "There is no separate design fee: design costs sit inside the quotation. Drawings start once the quotation is accepted and the deposit paid, with up to two rounds of revisions included.",
          "Projects generally start at £2,000 of value.",
        ],
      },
      {
        meta: "Reading a quote",
        heading: "What our quotation itemises",
        body: [
          "The quotation is itemised for the agreed scope: the design, the materials and finishes, and the internal layout are specified before anything is ordered. You can see what the number is made of.",
          "Two guarantees and a warranty sit behind the number. Installation and workmanship are covered for 2 years, the structure and joinery for 10 years, and moving hardware carries its manufacturer's warranty.",
        ],
      },
    ],
    faqs: [
      {
        q: "Why is there no single price for fitted wardrobes?",
        a: "Because the room decides it. Length, shape, materials, finish and the internal layout all move the figure, so the honest answer is a range, firmed up after one visit.",
      },
      {
        q: "Does the price include design?",
        a: "Yes, any design work the project needs is included in the quotation, and there is no separate design fee.",
      },
      {
        q: "Is there a minimum job size?",
        a: "Projects generally start at £2,000 of value. If yours sits near that line, ask before ruling it out.",
      },
      {
        q: "Do fitted wardrobes add value to a house?",
        a: "Nobody can give you an honest figure for that, and a number quoted without a source is a guess. What is checkable is the space: a run built to the room uses the full height and the corners, which freestanding furniture cannot. Whether that shows up in a valuation depends on the house and the buyer.",
      },
    ],
  },
};
