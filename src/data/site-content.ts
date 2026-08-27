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
  { label: "Maker", href: "/maker/" },
  { label: "Journal", href: "/journal/" },
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
 * Aggregate only. Confirmed against the Business Profile on 23 August 2026:
 * 15 reviews at 5.0, all 15 answered as of 24 August.
 *
 * `quotes` is deliberately empty. The design shipped four placeholder strings
 * that described what a quote should do rather than quoting anyone. Real
 * quotes come from the profile, unedited, from genuine past customers, with no
 * gating and no incentives, which is a compliance red line in the playbook and
 * not merely a preference.
 */
export const REVIEWS = {
  count: 15,
  average: "5.0",
  source: "Google Business Profile",
  quotes: [] as { text: string; meta: string }[],
} as const;

/* ---------------------------------------------------------- materials */

/**
 * PROVISIONAL. The three names come from what the client has told us and are
 * pending his confirmation under Q22, which also asks whether this is the full
 * range and who cuts the material to size. Every description is Q39, the one he
 * reaches for is Q40, and how the choice is framed is Q43.
 *
 * Swatch colours are deliberately not assigned. The design mapped oak, walnut
 * and painted tulipwood onto --oak, --walnut and --green; those tokens survive
 * as photography references but must not be reused to stand for materials that
 * are not those timbers. Picking the real swatches is a design decision that
 * waits on knowing the actual finishes (Q24).
 */
export const MATERIALS = [
  { name: "MDF", descriptionQ: "q39" as QuestionKey },
  { name: "Veneered MDF", descriptionQ: "q39" as QuestionKey },
  { name: "Plywood", descriptionQ: "q39" as QuestionKey },
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
 * Four stages. Stages 1, 2 and 4 have a confirmed shape and unconfirmed detail.
 * Stage 3 has neither: it cannot be titled until Q-stage04 says what actually
 * happens between the materials being cut and the piece reaching site.
 *
 * The design filled stage 3 with "Benchwork in the workshop: cutting, jointing,
 * finishing. One commission on the bench at a time." That is the single most
 * confidently written sentence in the design and it is false.
 */
export const PROCESS = [
  {
    number: "01",
    title: "Visit",
    /** Free, at the client's home, samples brought along. Confirmed. */
    confirmed:
      "We meet at the room. No charge for the first visit, and material samples come with us.",
    questions: ["q13", "q14", "q15", "q16"] as QuestionKey[],
  },
  {
    number: "02",
    title: "Survey and drawings",
    confirmed: "Scaled elevations and a fixed, itemised quotation.",
    questions: ["q17", "q18", "q19", "q20", "q21"] as QuestionKey[],
  },
  {
    /** Title withheld. See Q-stage04. */
    number: "03",
    title: null,
    confirmed: null,
    questions: ["stage04", "q26", "q27", "q28", "q29"] as QuestionKey[],
  },
  {
    number: "04",
    title: "Fitting",
    confirmed: "Scribed to your walls and floors, and finished in place.",
    questions: ["q30", "q31", "q32", "q33", "q34"] as QuestionKey[],
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
