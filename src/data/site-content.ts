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
      text: "I'm very happy with the finish, everything looks as we explained and wanted. Definitely recommend",
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
/**
 * EVERY CARD REWRITTEN BY KASPAR, 6 September 2026, on his review of the
 * preview: he opened each card in turn and typed its replacement underneath,
 * description, Used for, In its favour and The trade-offs, in that order. What
 * is below is his text with only the ampersands in his headings written out.
 *
 * Five cards, not six. "lets remove plywood for now, if someone specifically
 * asks for it we can do it" (13:30). Its swatch stays on disk and its entry is
 * a git log away; nothing else referenced it.
 *
 * Three renamed: MDF and MR MDF is now MR MDF, because that is the board he
 * uses and the standard grade is not offered; Veneered board is Natural wood
 * veneer; Specialist decorative boards is Decorative and feature panels, and
 * that one is a widening as well as a rename, since fluted, grooved and
 * slatted panels and panels with metal in them were nowhere on the old card.
 *
 * The 30 Aug rule for these lines was that each one is either a general fact
 * about the material family or a confirmed questionnaire answer. These are
 * neither: they are his own later statements, which outrank both. The Q39
 * descriptions this note used to say to keep in step with answers.ts are
 * superseded by the descriptions here.
 */
export const MATERIALS = [
  {
    key: "mdf",
    name: "MR MDF",
    description: "A stable, moisture-resistant board that we use as standard for painted fitted furniture.",
    /* Moisture-resistant MDF, green all the way through, from Denis's sample
       set. The green is the point: it is how MR MDF is told apart from
       standard board on site, so the swatch carries a fact rather than a
       colour. Regenerate with scripts/build-material-swatches.py in the ops
       repo, which is what maps his filenames onto these. */
    swatch: "url(/images/materials/mdf-board.webp) center / cover",
    uses: "Painted wardrobes, alcove units, built-in furniture, panelling and detailed door profiles.",
    pros: [
      "Dimensionally stable, with far less seasonal movement than solid timber",
      "Takes paint smoothly, with no grain showing through",
      "Profiles, grooves and mouldings cut cleanly",
      "Consistent throughout, with no knots or natural defects",
      "Offers greater resistance to moisture and humidity than standard MDF",
    ],
    cons: [
      "Cut edges need to be properly sealed and prepared before painting",
      "Moisture-resistant does not mean waterproof, so it is not intended for prolonged exposure to water",
      "It has no natural grain; where a timber appearance is wanted, we use real wood veneer instead",
    ],
  },
  {
    key: "veneer",
    name: "Natural wood veneer",
    description: "The character and variation of real timber, combined with the stability of an engineered board.",
    /* Oak veneered MDF with its edge banding, from Denis's sample set,
       2 Sep 2026. */
    swatch: "url(/images/materials/veneered-board.webp) center / cover",
    uses: "Fitted furniture and interior joinery where the look and feel of real timber is wanted. It can be used throughout a project, from doors and cabinetry to shelving and panelling, with the grain selected and matched where the design calls for it.",
    pros: [
      "A genuine timber surface, with the natural grain and variation of real wood",
      "More dimensionally stable than using wide sections of solid timber",
      "Grain and pattern can be matched across adjoining doors and panels",
      "Can be stained and finished in a wide range of tones, allowing the timber to complement existing flooring, doors or furniture",
      "Available in a wide range of timber species",
    ],
    /* His trade-offs for this card sat behind a "Read more" in the thread and
       did not survive the screenshot. The three below are the general facts
       about veneer from the previous card, kept because a card with a favour
       list and no trade-offs reads as a brochure, and every other card here
       has both. Swap them for his the moment he sends them. */
    cons: [
      "The timber layer is thin, so a deep scratch cannot be sanded out the way solid wood can",
      "Every visible edge is finished with a matching timber strip, which is part of the work",
      "Natural veneers develop subtly with age and light; painted and decorative finishes stay more consistent",
    ],
  },
  {
    key: "melamine",
    name: "Melamine and decorative boards",
    description: "Hard-wearing, consistent and available in a wide range of colours, textures and wood-effect finishes.",
    /* A melamine-faced board, its finish arrived on the board and its edge
       showing. From Denis's sample set, 2 Sep 2026. */
    swatch: "url(/images/materials/melamine-board.webp) center / cover",
    uses: "Wardrobe interiors, shelving and complete fitted furniture where a durable, factory-finished surface is wanted. Available in plain colours, wood effects and textured finishes to suit different interiors.",
    pros: [
      "Hard-wearing and easy to clean",
      "Consistent colour and finish from panel to panel",
      "Wide choice of colours, textures and wood-effect finishes",
      "No painting or staining required, reducing finishing time and cost",
    ],
    cons: [
      "The colour and finish are selected from an existing range rather than created specifically for the project",
      "Unlike painted MDF, the finish cannot simply be repainted in a different colour later",
      "Damaged or chipped surfaces can be more difficult to repair invisibly than a painted finish",
    ],
  },
  {
    key: "specialist",
    name: "Decorative and feature panels",
    description: "Textured, grooved and specialist panels used to add depth, pattern and detail to fitted furniture and interior joinery.",
    /* A fluted timber-faced panel: exactly the kind of panel this card now
       describes. From Denis's sample set, 2 Sep 2026. */
    swatch: "url(/images/materials/specialist-board.webp) center / cover",
    uses: "Feature panels, cabinet fronts, wall panelling, TV units and other fitted joinery where the surface forms part of the design. Options can include fluted and grooved MDF, slatted panels, textured surfaces and panels incorporating metal or other decorative elements.",
    pros: [
      "Adds depth and texture beyond a flat painted or veneered surface",
      "Can be used selectively as a feature or carried across a larger fitted installation",
      "Available in a wide range of patterns, profiles and materials",
      "Can be combined with painted MDF, veneer and other finishes within the same project",
    ],
    cons: [
      "Detailed and textured surfaces can require more cleaning than flat panels",
      "Some specialist panels have fixed dimensions, patterns or repeat sizes that need to be considered during the design",
      "Cost and lead time vary considerably depending on the panel and finish specified",
    ],
  },
  {
    key: "hardware",
    name: "Hardware",
    description: "Quality hardware is specified as standard, using established manufacturers such as Blum and Häfele for hinges, drawer systems and furniture fittings.",
    /* The hinge programme laid out: the range this card is describing, rather
       than one hinge. From Denis's sample set, 2 Sep 2026. */
    swatch: "url(/images/materials/hardware.webp) center / cover",
    uses: "Hinges, drawer runners, lift-up mechanisms, interior fittings and other moving components that determine how the furniture feels and performs in everyday use.",
    pros: [
      "Smooth, reliable operation for doors and drawers",
      "Precise adjustment, helping doors and drawer fronts stay properly aligned",
      "Soft-close hinges and drawer systems included as standard where appropriate",
      "Wide range of specialist fittings for different furniture and storage requirements",
      "Manufacturer warranties apply to hardware alongside our own workmanship guarantee",
    ],
    cons: [
      "Quality hardware adds to the initial cost of the project, but it provides smoother operation, better adjustment and greater durability over the life of the furniture",
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
  /* His answer, 6 September 2026, under a screenshot of this question. The
     figures are the pricing document's and unchanged; the £2,500 hand-painted
     step went, because he chose to lead with the 4-door figure instead. */
  {
    q: "What does a fitted wardrobe cost?",
    a: "A fitted wardrobe typically starts from £2,300 for a 2-door wardrobe, with 4-door wardrobes starting from around £4,000. The final price depends on the size, internal layout, material and finish, with drawers, lighting and other details priced as required.",
  },
  /* His answer, 7 September 2026, under a screenshot of this question. The
     same screenshot came on 6 September with nothing typed beneath it. It
     replaces "The person who measures your room is the person who draws it
     and the person who fits it. Nobody is sent in their place", which was the
     one-person line and its only place on the site. Removed on his
     instruction: do not put it back without his word. */
  {
    q: "Who actually does the work?",
    a: "Each project is managed by Structure & Style from the initial survey through to installation and aftercare. We remain responsible for the work and the finished result throughout.",
  },
  /* His answer, 6 September 2026. */
  {
    q: "How long does a commission take?",
    a: "Lead time is typically 4 to 8 weeks, depending on the size and complexity of the project. Installation usually takes a few days for a straightforward fitted wardrobe, with larger projects taking longer. Dates are confirmed in advance.",
  },
  {
    q: "What guarantee comes with the work?",
    a: "The guarantee covers installation and workmanship for 2 years and the structure and joinery for 10 years. Hinges, runners and other moving hardware carry their manufacturer's warranty.",
  },
  /* Rewritten 7 September 2026 on the research note in the ops repo,
     docs/value-to-a-house-research-2026-09-07.md: fifteen sources fetched and
     checked at their URLs. No independent UK figure exists, and every number
     in circulation ("adds £100k", "2 to 5%", "56% recovery") is a wardrobe
     vendor's or nobody's, so none of them is here and none may be. What the
     answer carries is the three things the independent sources support:
     buyers ask about storage (Rightmove, 600,000 listings, 2023, storage
     fourth among what buyers enquire about), a valuer prices floor area and
     holds refits at "supports the asking price" (RICS Registered Valuer,
     June 2026), and fitted wardrobes are fixtures that go with the house
     (HomeOwners Alliance, TA10). Denis chose the plain version over the two
     that name the sources; the sources stay in the note. */
  {
    q: "Do fitted wardrobes add value to a house?",
    a: "Not in a way anyone can honestly put a figure on, and we would rather say so than invent one. Buyers do ask about storage, and a fitted room is one of the things they notice at a viewing. Valuers price floor area, condition and location, so a fitted room supports the asking price rather than adding a line to it. Have them made for the years you live with them.",
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
    /* "Visit" until 6 September 2026, when Kaspar named the four stages he
       wants a visitor to see: Visit & Survey, Quotation & Drawings,
       Preparation, Fitting. Three and four already matched his wording.

       Renamed again on 7 September 2026, from his rewrite of the About page's
       four-stage sentence: Survey & Planning, Quotation & Design. Applied
       here, so the homepage and /process/ follow, because on 6 September he
       asked for one set of names across the site. Told, not asked.

       The rename MOVED A SENTENCE RATHER THAN ADDING ONE. Stage 02 carried the
       survey, the quotation and the drawings, which is three promises in one
       stage, while the visit stood alone with none of the measuring in it. The
       survey sentence below is stage 02's own, verbatim apart from its length
       qualifier being merged with the visit's, and Q17 moves with it. No new
       copy was written for either stage. */
    title: "Survey & Planning",
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
        the sentence a first-time client actually needs.

        "The space", not "the room", on Denis's reading 2 Sep 2026. It is also
        the more accurate word: an alcove, a landing or a run of wall is not a
        room, and half the services are not fitted in one. Checked against the
        section 5 lists first, since "space" is the kind of word an estate
        agent reaches for. It is not on them. */
    confirmed:
      "We visit your home to see the space, usually for 45 to 60 minutes. You do not need to have every answer ready: asking the right questions is our job. The measured survey takes about an hour on site, and both run longer for a larger or more complex project.",
    questions: ["q13", "q14", "q15", "q16", "q17"] as QuestionKey[],
    /** Stamped mono facts on the process page, all from confirmed answers. */
    details: ["Usually 45 to 60 minutes", "Survey about an hour", "In your home"],
  },
  {
    number: "02",
    title: "Quotation & Design",
    /** Order per Q13 and Q21: quotation first, drawings once it is accepted.

        The design week is CONDITIONAL and was being stated as automatic.
        Q13 says straightforward jobs go straight to quotation and only
        projects needing design development get the week. Read as a promise,
        the old wording committed us to a design week on every job. */
    confirmed:
      "A fixed, itemised quotation follows the survey, and design costs sit inside it where your project needs design work. Where a design week runs, drawings are issued for review with up to two rounds of revisions included.",
    questions: ["q18", "q19", "q20", "q21"] as QuestionKey[],
    details: ["Drawings within the design week", "Two revision rounds included"],
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
    details: ["Programme agreed per project", "Blum and Häfele hardware"],
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
