/**
 * Page content carried over from the Claude Design project's
 * `ui_kits/website/site-data.js`, CORRECTED ON THE WAY IN.
 *
 * Why this file reads like a list of deletions
 * -------------------------------------------
 * The design was drafted before the content questionnaire went to the client on
 * 24 August 2026, and several things it asserts turned out not to be true. They
 * are removed here rather than softened, and each one is replaced by the number
 * of the question that refills it. Nothing is lost: a claim becomes a tracked
 * gap. See `answers.ts` for the questions and `page-gates.ts` for which page
 * each one holds back.
 *
 * The five corrections, and the evidence for each:
 *
 * 1. WORKSHOP AND BENCH. The design's process stage 03 read "Benchwork in the
 *    workshop: cutting, jointing, finishing. One commission on the bench at a
 *    time", and the enquiry band carried "Bench books 6-8 weeks ahead".
 *    Questionnaire Q3 states plainly: "You do not have your own workshop:
 *    materials are cut to size by a workshop you use." The tone protocol's
 *    section 10 makes this an absolute factual limit. The questionnaire's own
 *    unnumbered stage-04 question exists because what happens after the
 *    materials are cut is genuinely unknown, so the stage cannot even be titled
 *    yet, let alone written.
 *
 * 2. MATERIALS. The design listed European oak, American black walnut and
 *    painted tulipwood, all solid timbers, with quarter-sawn grain references.
 *    What is actually on file is MDF, veneered MDF and plywood. Q43 exists to
 *    frame that properly, as a considered choice for fitted furniture rather
 *    than a downgrade, in his words rather than ours.
 *
 * 3. THE THREE CASE STUDIES. "Alcove library, Queen's Park", "Wardrobe wall,
 *    West Hampstead" and "Window seat and shelving, Kensal Rise" came with
 *    specification tables: 14 shelves on brass pins, a 3.4m span, mitred
 *    waterfall edges, years. None of it is sourced. Q44 exists precisely
 *    because we do not know which jobs are real, and the journal article was
 *    Truth-blocked on exactly this class of invention: ten claims about client
 *    briefs that no photograph could evidence.
 *
 * 4. THE REVIEW QUOTES. The design's four quotes are instructions to a writer,
 *    not quotes: "Pull the strongest line about fit and finish". The aggregate
 *    is real and confirmed against the Business Profile, so 15 at 5.0 stays.
 *    The quotes must be pulled from genuine reviews, unedited, with no gating.
 *
 * 5. THE ENQUIRY BAND FACTS. Price band, lead time and area were carried over
 *    from an earlier draft and marked unconfirmed even in the design system's
 *    own README. All three are questions.
 *
 * What is NOT changed: the layout, the type, the colour, the motion, the
 * structure of the pages. The design work is sound. It was drafted against
 * facts that have since been checked.
 */

import type { QuestionKey } from "./answers";

/* ------------------------------------------------------------------ nav */

/**
 * Journal, not Guides. The design system's nav said Guides, the page brief's
 * slug says /journal/, and the design system's own template folder says
 * notes-post. Settled on Journal because "guides" already means something else
 * on this site: the cost guide is one of the seven contracted service pages.
 */
export const NAV = [
  { label: "Process", href: "/process/" },
  { label: "Materials", href: "/materials/" },
  { label: "Work", href: "/work/" },
  /* Was Maker. The client's Part 6 direction change, 30 Aug 2026: company
     presentation, no personal profile. */
  { label: "About", href: "/about/" },
  /* Journal returns to the nav the day the first article publishes. Until
     then a primary nav link to an empty section costs credibility on every
     page. The route stays live and noindexed (2 Sep 2026). */
] as const;

export const ENQUIRE_HREF = "/contact/";

/* -------------------------------------------------------------- enquiry */

/**
 * The heading and body are the design's own and assert nothing unverified.
 * The three facts beneath them were price, lead time and area, and all three
 * are now questions rather than statements.
 */
export const BAND = {
  heading: "If you have a room in mind, start here.",
  body:
    "Write with rough dimensions, a photo or two, and a sense of what the piece needs to do. " +
    "You will get a considered reply, not a brochure.",
  /** Rendered through <Value>, so each becomes finished copy or an open question. */
  facts: ["q10", "q07", "q03"] as QuestionKey[],
} as const;

/* ------------------------------------------------------------ reviews */

/**
 * Read live from the public profile on 1 September 2026: 14 reviews at 5.0.
 * The count moved DOWN from the 22 August baseline of 15, and the review that
 * left the profile is Arthur Kvasnei's. Recorded in the ops repo baseline
 * (A6.1); the site states what the profile shows today.
 *
 * The quotes are real, transcribed verbatim from the profile on 1 September
 * 2026. Compliance line: genuine past customers only, unedited, no gating, no
 * incentives. Unedited means unedited, and that rule decides the selection:
 * a review is quotable only when its COMPLETE text also passes the site's own
 * gates. Eleven of the fourteen carry text; eight of those eleven are excluded
 * because their verbatim text names a person (the Q1/Q60 ruling keeps every
 * personal name off the site, and two also name Uwe, who left in April 2026),
 * says "the team" (the verify gate's crew-noun ban, and a headcount the
 * business does not have), or carries an em dash (the style gate). What
 * remains is below. Never trim a review around a problem word: pick a
 * different review.
 */
export const REVIEWS = {
  count: 14,
  average: "5.0",
  source: "Google Business Profile",
  /** The public profile, for the click-through. The cid is the listing's
      stable id, taken from the Maps place URL on 1 September 2026. */
  profileUrl: "https://maps.google.com/?cid=14703132250787863880",
  quotes: [
    {
      text: "Really pleased with the work. They did our wall panelling, new doors, skirting and architraves and everything looks sharp and properly finished. Turned up when they said they would and left the place tidy. Would happily recommend.",
      meta: "Rafael C · Panelling, doors and skirting",
    },
    {
      text: "I’m very happy with the finish, everything looks as we explained and wanted. Definitely recommend",
      meta: "Vasily S · August 2026",
    },
    {
      text: "Very happy with everything. Recommend",
      meta: "Erald G · May 2026",
    },
  ],
} as const;

/* ---------------------------------------------------------- materials */

/**
 * CONFIRMED under Q22 and Q39, 30 Aug 2026. The range is broader than the
 * three boards previously on file, and each `description` is his Q39 answer
 * for that material. The same five lines sit as the Q39 record in
 * `answers.ts`: change one, change both. His Q22 ruling also stands: who cuts
 * the material, and the arrangement behind it, stays off the site.
 *
 * The SIXTH entry is not a Q39 line. Hardware joined 1 September 2026 on
 * Denis's ask for an even grid, and it is the one addition already confirmed
 * on file: its description is the Q28 answer, and Denis's 30 Aug ruling puts
 * Blum and Hafele into materials contexts as a quality signal, named where
 * hardware is genuinely the subject. This card is that subject.
 *
 * `uses`, `pros` and `cons` were added 1 September 2026 for the expandable
 * cards. The rule for every line: general facts about the material family, or
 * facts confirmed in the questionnaire (grain matching Q23, ageing Q41,
 * hardware warranty Q35). Nothing about who cuts, nothing about any specific
 * job, and no finish word (hand-painted, solid timber) the protocol reserves
 * for verified jobs.
 *
 * Swatches. Drawn in CSS from 30 Aug 2026, and FOUR OF THE SIX BECAME REAL
 * PHOTOGRAPHS on 2 Sep 2026 (Denis: a materials section should show the
 * material). Each photographed swatch is a crop of the client's own finished
 * work, taken from a photograph already published on this site, so nothing new
 * is asserted and no stock imagery enters: see public/images/materials/README.md
 * for the crop table. Web-found photography stays rejected, because unlicensed
 * imagery is a rights problem and a photograph of someone else's material
 * reads as a claim about ours.
 *
 * ALL SIX ARE MATERIAL SAMPLES as of 2 Sep 2026, from the set Denis curates by
 * hand in the ops repo's `Photos/Materials`, one file per card. They show the
 * board itself, which a photograph of finished work cannot: a painted door
 * shows the paint, not the MDF under it.
 *
 * Do not re-derive these crops by eye. `scripts/build-material-swatches.py` in
 * the ops repo maps his filenames onto the filenames below and rewrites them
 * all in one command, which is what makes swapping a sample cheap. Change a
 * filename here and change it there in the same commit.
 *
 * They are third-party product photographs. The rights question was put to
 * Denis on 2 Sep 2026 and he ruled they stay; the position is recorded in
 * public/images/materials/README.md and is closed, not open.
 */
export const MATERIALS = [
  {
    key: "mdf",
    name: "MDF and MR MDF",
    description: "Versatile and dimensionally stable, suited to painted furniture and detailed profiles.",
    /* Moisture-resistant MDF, green all the way through, from Denis's sample
       set. The green is the point: it is how MR MDF is told apart from
       standard board on site, so the swatch carries a fact rather than a
       colour. Regenerate with scripts/build-material-swatches.py in the ops
       repo, which is what maps his filenames onto these. */
    swatch: "url(/images/materials/mdf-board.webp) center / cover",
    uses: "Painted wardrobes, alcove units, panelling and detailed door profiles. The moisture-resistant version, MR MDF, goes where damp is a risk.",
    pros: [
      "Stays flat and does not move with the seasons",
      "Takes paint smoothly, with no grain showing through",
      "Profiles, grooves and mouldings cut cleanly",
      "Consistent all the way through, with no knots or voids",
    ],
    cons: [
      "Bare edges soak up paint, so they are sealed before finishing",
      "Standard board swells if it sits wet, which is what the moisture-resistant version is for",
      "No grain of its own: a timber look comes from veneer or a wood-effect board instead",
    ],
  },
  {
    key: "veneer",
    name: "Veneered board",
    description: "The character of real timber with the stability of an engineered board.",
    /* Oak veneered MDF with its edge banding, from Denis's sample set,
       2 Sep 2026. It replaced a crop of his own walk-in interior that our
       triage read as veneer but he had never confirmed: the sample says what
       the board is without anyone having to identify it. */
    swatch: "url(/images/materials/veneered-board.webp) center / cover",
    uses: "Wardrobe doors, panelling and shelving where real timber should show. Where the design calls for it, grain is matched across adjoining doors so the run reads as one piece.",
    pros: [
      "A real timber surface: oak veneer is oak, cut thin",
      "Far more stable across a fitted run than timber in one piece",
      "Grain and pattern can be matched door to door",
    ],
    cons: [
      "The timber layer is thin, so a deep scratch cannot be sanded out the way solid wood can",
      "Every visible edge is finished with a matching timber strip, which is part of the work",
      "Natural veneers develop subtly with age and light; painted and decorative finishes stay more consistent",
    ],
  },
  {
    key: "plywood",
    name: "Plywood",
    description: "Strong and durable, with a distinctive exposed edge where the design calls for it.",
    /* A hardwood-core plywood board corner with the laminations showing, from
       Denis's sample set, 2 Sep 2026. It replaced a crop of plywood carcasses
       on one of his sites, which read as a room rather than as the board. */
    swatch: "url(/images/materials/plywood.webp) center / cover",
    uses: "The boxes and frames behind fitted furniture, long shelf spans, and designs that show its striped edge on purpose.",
    pros: [
      "Strong for its weight, and stiff over a long shelf span",
      "Holds screws and fixings well",
      "The striped edge is a finish in its own right",
    ],
    cons: [
      "Costs more than MDF for the same panel",
      "Face grain varies from sheet to sheet",
      "Paint needs more preparation on plywood than on MDF",
    ],
  },
  {
    key: "melamine",
    name: "Melamine and decorative board",
    description: "Hard-wearing and consistent, in a wide range of colours, textures and wood finishes.",
    /* A melamine-faced board, its finish arrived on the board and its edge
       showing. From Denis's sample set, 2 Sep 2026. */
    swatch: "url(/images/materials/melamine-board.webp) center / cover",
    uses: "Wardrobe interiors, storage runs and complete pieces where the budget leads. The finish arrives on the board, ready made.",
    pros: [
      "Hard-wearing and wipes clean",
      "Colour and texture identical panel to panel",
      "The widest choice of colours, textures and wood finishes in the range",
      "No site finishing, which keeps cost and time down",
    ],
    cons: [
      "The finish is fixed in the factory, so it cannot be repainted later",
      "A hard knock can chip an edge, and a chip cannot be invisibly repaired",
    ],
  },
  {
    key: "specialist",
    name: "Specialist decorative boards",
    description: "Super-matt, high-gloss, textured, stone-effect and other premium surfaces.",
    /* A fluted timber-faced panel: the textured end of this card's range,
       which the flat boards elsewhere in the grid cannot show. From Denis's
       sample set, 2 Sep 2026. */
    swatch: "url(/images/materials/specialist-board.webp) center / cover",
    uses: "Doors and visible fronts where the surface leads the design: super-matt, high-gloss, textured and stone-effect pieces.",
    pros: [
      "Surfaces paint and veneer cannot give: deep gloss, soft matt, stone and texture",
      "Factory-made finishes, consistent and hard-wearing",
    ],
    cons: [
      "The most expensive boards in the range",
      "A damaged panel is usually replaced rather than repaired",
    ],
  },
  {
    key: "hardware",
    name: "Hardware",
    /** The Q28 answer, shortened to the two named brands. Named here because
        hardware is the subject of this card, per the 30 Aug 2026 ruling. */
    description: "Blum for hinges and drawer systems, Hafele for furniture hardware and lighting, with soft-close as standard.",
    /* The hinge programme laid out: the range this card is describing, rather
       than one hinge. From Denis's sample set, 2 Sep 2026. */
    swatch: "url(/images/materials/hardware.webp) center / cover",
    uses: "Hinges, drawer runners, lift-up doors, interior fittings and lighting: the moving parts of every piece, and the ones you put a hand on every day.",
    pros: [
      /* Soft-close is in the client's own pricing document, as part of the
         starting specification for a fitted wardrobe. It is a quoted inclusion,
         not an upsell, and saying so is worth more than the feature is. */
      "Soft-close on doors and drawers, in the starting specification rather than an upgrade",
      "A door slows at the end of its travel and lands quietly instead of banging shut",
      "A loaded drawer runs out straight and pulls back without a shove",
      "Precise adjustment, so doors and drawers line up and stay lined up",
      "Moving hardware carries its manufacturer's warranty on top of our own guarantee",
      "Both brands publish their ranges, so what we specify can be looked up",
    ],
    cons: [
      "Branded hardware costs more than unbranded",
      "The moving parts do the hardest work in a piece, so this is the wrong place to save",
      "Soft-close mechanisms are what wears first on any piece, which is why the warranty matters",
    ],
  },
] as const;

/* -------------------------------------------------------------- work */

/**
 * Empty, and that is the correct state.
 *
 * The photographs exist: 634 files locally, triaged by service, with 23 usable
 * for fitted wardrobes alone. What does not exist is the story behind any
 * individual job, which is what Q44 to Q49 ask for. The questionnaire puts the
 * reason better than a comment can: a page of finished photographs with no
 * story behind them is a gallery, not a case for hiring you.
 */
export const COMMISSIONS = [] as {
  title: string;
  description: string;
  spec: { label: string; value: string }[];
}[];

/* ----------------------------------------------------------- process */

/**
 * The homepage questions, from the FAQ research of 24 Aug 2026 (ops repo,
 * deliverables/homepage-faq.md: live People Also Ask plus Search Console),
 * reworked 31 Aug 2026 to company voice and the confirmed answers. Four of the
 * researched six ship now. The price question waits on Q10 and joins this list
 * the day the pricing document lands, because it is the highest-volume
 * question of them all; the what-if-he-is-ill question waits on the one
 * approved sentence the protocol requires and Kaspar has not yet given.
 */
export const HOMEPAGE_FAQS = [
  {
    q: "What does a fitted wardrobe cost?",
    a: "Guide prices start at £2,300 for a 2-door wardrobe in melamine, and £2,500 hand-painted. Width, finish and any internal drawers or lighting move the figure, and a firm number follows one visit. The cost guide gives every step.",
  },
  {
    q: "Who actually does the work?",
    a: "The person who measures your room is the person who draws it and the person who fits it. Nobody is sent in their place.",
  },
  {
    q: "How long does a commission take?",
    a: "Lead time is typically 4 to 8 weeks, and a straightforward wardrobe wall takes 2 to 3 days on site. You get the dates when the project is programmed.",
  },
  {
    q: "What guarantee comes with the work?",
    a: "The guarantee covers installation and workmanship for 2 years and the structure and joinery for 10 years. Hinges, runners and other moving hardware carry their manufacturer's warranty.",
  },
  {
    q: "Do fitted wardrobes add value to a house?",
    a: "Nobody can give you an honest figure for that. What is checkable is the space: a run built to the room uses the full height and the corners. Whether it shows in a valuation depends on the house and the buyer.",
  },
] as const;

/**
 * Four stages, all four now titled and written from his 30 Aug 2026 answers.
 *
 * Stage 3 spent a week untitled, correctly: the design had filled it with
 * "Benchwork in the workshop: cutting, jointing, finishing. One commission on
 * the bench at a time", which was confidently written and false (no workshop,
 * Q3). The unnumbered stage-04 answer is what actually happens, and the copy
 * below carries it without claiming the making as ours.
 */
export const PROCESS = [
  {
    number: "01",
    title: "Visit",
    /** Length is Q14. The old "no charge, samples brought along" line carried
        a "Confirmed" note from the design era with no source anywhere: not in
        the questionnaire, the ops docs, or his own old site. Stripped 30 Aug
        2026 by the Truth gate; restored only if Kaspar confirms it.

        Rewritten 2 Sep 2026, on Denis reading "We meet at the room" and saying
        it looked bad. He was right, and the sentence was ours rather than
        Kaspar's, so there was nothing to protect. Two problems went with it.
        The agenda that followed, "layout, storage, materials, finishes and the
        look", traces to no answer at all: it survived from the design era the
        same way the samples line did. And Q15, one of his best answers, was
        going unused anywhere on the site: it is our job to ask the right
        questions, not the client's to arrive knowing every detail. That is
        the sentence a first-time client actually needs. */
    confirmed:
      "We visit your home to see the room, usually for 45 to 60 minutes. It runs longer for a larger or more complex project. You do not need to have every answer ready: asking the right questions is our job.",
    questions: ["q13", "q14", "q15", "q16"] as QuestionKey[],
    /** Stamped mono facts on the process page, all from confirmed answers. */
    details: ["Usually 45 to 60 minutes", "In your home"],
  },
  {
    number: "02",
    title: "Survey and drawings",
    /** Order per Q13 and Q21: quotation first, drawings once it is accepted.

        The design week is CONDITIONAL and was being stated as automatic.
        Q13 says straightforward jobs go straight to quotation and only
        projects needing design development get the week. Read as a promise,
        the old wording committed us to a design week on every job. */
    confirmed:
      "The measured survey takes about an hour on site, longer for larger or more complex projects. A fixed, itemised quotation follows, and design costs sit inside it where your project needs design work. Where a design week runs, drawings are issued for review with up to two rounds of revisions included.",
    questions: ["q17", "q18", "q19", "q20", "q21"] as QuestionKey[],
    details: ["Survey about an hour", "Drawings within the design week", "Two revision rounds included"],
  },
  {
    number: "03",
    /* Was "Production" with "machined, edged and finished". Tone protocol
       section 10 gives making one FAQ entry and no heading, and offers the
       wording the site may use: components are prepared to the approved
       drawings, and that is the whole story. Retitled 2 Sep 2026; the
       stage-04 facts about assembly and finishing in the room are his and
       stay. */
    title: "Preparation",
    /** The third sentence is Q32 and is new here. The stage claimed a
        programme "agreed per project" on its chip and said nothing about
        timing in the body, which left the chip asserting something the copy
        never supported. Q32 is the actual fact and it is the one a client
        wants at this point: the installation period is agreed at deposit,
        the dates firm up as the work progresses. */
    confirmed:
      "Components are prepared to the approved drawings and specification. Some pieces arrive as sections ready to assemble; others are built up and finished in the room, whichever gets the better result. The installation period is agreed when the deposit is paid, and the dates are confirmed as the project progresses.",
    questions: ["stage04", "q26", "q27", "q28", "q32"] as QuestionKey[],
    details: ["Programme agreed per project", "Blum and Hafele hardware"],
  },
  {
    number: "04",
    title: "Fitting",
    /** Three corrections, 2 Sep 2026.

        The week-long case now names its real driver. Q30 ties it to on-site
        construction or hand-painting, and the copy had generalised that to
        "more complex projects", which is a wider promise than he made: it
        tells a reader any involved job runs a week. "Built up in the room" is
        Q30's on-site construction in the words stage 03 already uses.
        Hand-painting stays out, because section 5 allows it only where it is
        verified true of the job being shown.

        The scribing gloss keeps "which means". Without it the sentence reads
        as two separate things done to the edge rather than one being the
        definition of the other, and the definition is the only reason
        section 7 permits the word at all. It ends at "the room" rather than
        listing wall, floor and ceiling, which the home page lede three
        screens above already says almost word for word.

        The clearing-up sentence carries Q33's dust extraction instead of
        repeating the daily tidy, which the chip beside it already stamps. */
    confirmed:
      "Typically 2 to 3 days on site for a straightforward wardrobe wall, closer to a week where it is built up in the room. Every edge is scribed, which means cut to follow the line of the room. Floors and the surrounding area are protected before work starts, and dust extraction runs throughout.",
    questions: ["q30", "q31", "q33", "q34"] as QuestionKey[],
    details: ["Typically 2 to 3 days", "Tidied at the end of each day"],
  },
] as const;

/* -------------------------------------------------------------- contact */

/** Confirmed on file, questionnaire Q4 and Q5. Q5 notes both are already public. */
export const CONTACT = {
  email: "info@structureandstyle.co.uk",
  phoneDisplay: "07309 872555",
  phoneHref: "tel:+447309872555",
  whatsapp: "https://wa.me/447309872555",
  whatsappMessage: "Hello, I have a room in mind.",
} as const;
