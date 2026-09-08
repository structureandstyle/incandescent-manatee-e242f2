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
    /* Kaspar's own opening, 6 September 2026, replacing ours. His em dash
       became a colon; nothing else in the first paragraph is changed.

       THE SECOND PARAGRAPH IS HIS WITH THREE WORDS ADDED. He wrote "with much
       of our work in Hampstead, Belsize Park, Kentish Town, Camden and
       surrounding areas", which is the claim about where most of the work
       happens that the 5 Sep note below this used to say had no source. It has
       one now: him, in writing. What his sentence lost is the phrase "north
       London", which is the target sheet's standout term for this page
       (difficulty 7, the highest CPC on the sheet, a top-three floor at month
       12) and appeared nowhere on the site until 5 Sep. So it ends "...and
       surrounding areas of north London", which is true of all four districts
       and keeps the term in body copy. Told, not asked. */
    intro: [
      "A fitted wardrobe is designed and made specifically for your room, taking into account the available space, the proportions of the room and what you need to store. The interior is planned around how you use it, from hanging space and shelving to drawers and other storage. You don't need to have everything worked out before getting in touch: understanding what you need and helping develop the right layout is part of the service.",
      "We design and fit wardrobes across London, with much of our work in Hampstead, Belsize Park, Kentish Town, Camden and surrounding areas of north London.",
    ],
    leads: {
      "cost": "The honest answer is a range until the room is measured, and one visit turns it into a firm number.",
      "how-long": "The lead time runs in weeks, and the fitting itself takes days rather than weeks.",
      "made-from": "Which board suits a wardrobe wall depends on the room, the finish you want and the budget.",
      "fitting": "Ceilings, floors and walls are rarely straight, and a wardrobe wall meets all three at once.",
      /* His, 6 September 2026. The guarantee and adjustment rows under it
         are Q35 and Q36, reworded the same day: see answers.ts. */
      /* His sentence, 7 September 2026 at 21:22, placed here by Denis on
         8 September: the screenshot showed the heading and a generic lead with
         no page in the crop. It replaces ours. */
      "after": "Fitted furniture can require minor adjustments as it settles into the room. What matters is knowing we'll come back and put it right.",
    },
    /* TWO SECTIONS CAME OFF ON 6 SEPTEMBER 2026: "What a fitted wardrobe run
       includes" ("id remove this") and "Cut to the wall as it actually is"
       ("remove please"), each under a screenshot of the section it named.
       What they carried is now elsewhere on the page in his own words: the
       starting specification is the "What's included" row of the cost table,
       the days on site are the "On site" row, and scribing is the fitting
       section. The page is shorter by two headings and says the same things
       once. */
    sections: [],
    /* Three questions, his answers, 6 September 2026. The fourth, on the
       guarantee, came off: it repeated the "What happens afterwards" section
       word for word, and he wrote the new set as three. "Will you come back
       if a door moves?" is now asked the way he phrased it. */
    faqs: [
      {
        q: "Where is the furniture made?",
        a: "Each project is made to the approved drawings and specification. Depending on the design and finish, components may be prepared off-site or made and finished as part of the installation.",
      },
      {
        q: "What happens if something needs adjusting after installation?",
        a: "If doors, drawers or other moving parts require adjustment in the 2-year aftercare period, we will come back and put them right.",
      },
      {
        q: "How do I look after the finish?",
        a: "Care depends on the material and finish. We provide advice on how to clean and maintain your furniture, including which products to use and what to avoid.",
      },
    ],
  },

  "walk-in-wardrobes": {
    /* Kaspar's own opening, 6 September 2026, replacing ours. */
    intro: [
      "A walk-in wardrobe is designed around the room and how the storage will be used. Hanging space, drawers, shoe storage and shelving are planned together to make the best use of the available space.",
      "Loft rooms, box rooms and spaces under eaves can also work particularly well for fitted storage, with sloping ceilings and awkward angles incorporated into the design rather than simply boxed off.",
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
        /* His answer, 6 September 2026. The screenshot it was read from ends
           at "the finish you want", which is a complete sentence; if there
           was a clause after it, it did not survive the crop. */
        a: "You do not need to arrive with a finished design. If you already have ideas, we can work from them; otherwise, we can develop the layout around the room, your storage requirements and the finish you want.",
      },
      /* His answer, 7 September 2026, under a screenshot of ours. The alcove
         page's sibling question got his answer on 6 September; this one he
         reached the following evening. */
      {
        q: "Can it match furniture we already have?",
        a: "Yes. We can select materials, colours and finishes to complement existing furniture, flooring and other finishes within your home.",
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
      /* Three of the five are his, 7 September 2026, each typed under a
         screenshot of its section: cost, made-from and after. How-long and
         fitting he did not raise, and they stay ours. */
      "cost": "Alcove units vary considerably depending on their size, finish and specification. The guide prices below are based on a typical pair of alcoves.",
      "how-long": "Alcove work follows the same two clocks as any commission, and a design week runs only where the project needs one.",
      "made-from": "The material is selected according to the design, finish, use and budget of the project.",
      "fitting": "Chimney breasts lean and alcove walls bow, so the unit is cut to the wall it actually meets.",
      "after": "Alcove furniture is built for everyday use, with the structure and joinery covered for 10 years.",
    },
    sections: [
      {
        meta: "The work",
        /* The heading carries the phrase too, so it reaches an H2 rather than
           sitting in prose alone. Same edit as the intro, 5 Sep 2026. */
        heading: "Alcove cupboards, shelving and full-height runs",
        /* His, 6 September 2026, one paragraph in place of our two. */
        body: [
          "Alcove furniture can be designed in many different ways, from traditional base cupboards with shelving above to full-height cabinetry, open bookcases, display shelving and integrated media storage. Each design is tailored to the room and how the space will be used. Shelving, drawers, lighting and internal storage can all be incorporated, with painted, natural wood veneer and decorative finishes available to achieve anything from a traditional built-in look to a more contemporary design.",
        ],
      },
    ],
    /* The four questions stay; the four answers are his, 6 September 2026. */
    faqs: [
      {
        q: "How are uneven walls and skirting handled?",
        a: "The furniture is scribed and fitted to follow the existing walls, floors and surrounding joinery, creating a clean, fitted finish without unnecessary gaps.",
      },
      {
        q: "Do you take small jobs?",
        a: "We generally work to a minimum project value of £2,000. If you are unsure whether your project falls within this, please get in touch.",
      },
      {
        q: "Can the units match our existing woodwork?",
        a: "Yes. Finishes can be selected to complement or closely match existing furniture, joinery, flooring or other finishes within the room.",
      },
      {
        q: "How long does it take from survey to fitting?",
        a: "Lead time is typically 4 to 8 weeks, depending on the scope of the project, design requirements, chosen materials and our current schedule. Installation dates are confirmed as the project progresses.",
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
      /* 8 Sep 2026, launch-day check: this sentence ended "and projects
         generally start at £2,000 of value", which put a £2,000 start beside a
         service whose own page says £5,000 (Kaspar, 6 Sep). Now the walk-in
         page's own figure. */
      "These tables cover fitted wardrobes and alcove units. Walk-in wardrobe cost is worked out per room instead, because a dressing room is priced by what goes into it rather than by door count; walk-in wardrobes typically start from around £5,000.",
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
          /* "Projects generally start at £2,000 of value." stood here as a third
             statement of the minimum on one page. Removed 8 Sep 2026; the FAQ
             below still answers the question once. */
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
        /* The homepage's answer, chosen by Denis on 7 Sep 2026 from the
           value-to-a-house research; this page carried an older draft of the
           same answer until 8 Sep. One question, one answer, both pages. */
        a: "Not in a way anyone can honestly put a figure on, and we would rather say so than invent one. Buyers do ask about storage, and a fitted room is one of the things they notice at a viewing. Valuers price floor area, condition and location, so a fitted room supports the asking price rather than adding a line to it. Have them made for the years you live with them.",
      },
    ],
  },
};
