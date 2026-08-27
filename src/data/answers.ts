/**
 * The content questionnaire, as data.
 *
 * Source: `structure-and-style-content-questions (1).pdf`, sent to the client
 * 24 August 2026. 56 numbered questions plus one unnumbered blocking question
 * about the making stage, keyed here as `stage04`.
 *
 * THIS IS THE ONLY FILE THAT CHANGES WHEN HIS ANSWERS ARRIVE. Pages read from
 * it and hold no copy of their own, so filling a value in here is the whole
 * edit. No page is touched.
 *
 * How a page goes live
 * --------------------
 * Each page declares the questions it needs (`REQUIRES` in the page file).
 * `unanswered()` reports which of those are still outstanding, and the page
 * passes `noindex` to Base.astro while any remain. So pages publish themselves
 * as answers arrive, one at a time, rather than everything waiting on the
 * slowest reply. `npm run verify` refuses to pass if an indexable page still
 * carries an <Ask>.
 *
 * `value: null` means outstanding. `provisional` is what we already hold from
 * his Business Profile or from what he has told us, pending his confirmation:
 * it is shown inside an <Ask> so it reads as unconfirmed, and it never counts
 * as answered.
 */

export type Answer = {
  /** The confirmed answer. null means still outstanding. */
  value: string | string[] | null;
  /** What we hold pending confirmation. Never treated as answered. */
  provisional?: string | string[];
  /** Marked BLOCKING in the questionnaire: these hold the launch. */
  blocking?: true;
  /** One line on what the question is, for the outstanding-questions report. */
  about: string;
};

export const ANSWERS = {
  // Part 1 — what we already hold
  q01: { value: null, provisional: "Kaspars Tormanis", about: "Name as published, and whether the Maker page uses his full name" },
  q02: { value: "Structure and Style Ltd, company number 16822866, incorporated 31 October 2025", about: "Company details" },
  q03: { value: null, blocking: true, about: "Business base: any physical base worth naming, or service area only" },
  q04: { value: "info@structureandstyle.co.uk", about: "Email" },
  q05: { value: "07309 872555", about: "Phone and WhatsApp, already public" },
  q06: { value: null, provisional: "Solo. Coordinates a plumber, electrician and plasterer when a job needs them.", about: "How he works" },
  q07: { value: null, blocking: true, about: "Current lead time, how far ahead the work is booked" },
  q08: { value: null, about: "Social accounts actively used, or none" },
  q09: { value: null, provisional: "Not VAT registered", about: "Public liability cover and amount, trade bodies, accreditations" },

  // Part 2 — pricing
  q10: {
    value: null,
    blocking: true,
    provisional: ["Fitted wardrobes £3,000 to £8,000", "Kitchens £5,000 to £15,000"],
    about: "Per-service price ranges, all seven services",
  },
  q11: { value: null, about: "What moves a job to the top of its range" },
  q12: { value: null, about: "Minimum job size" },

  // Part 3 — process
  q13: { value: null, blocking: true, about: "The design service: what it covers, when it happens, whether there is a fee" },
  q14: { value: null, about: "How long the first visit takes" },
  q15: { value: null, about: "What clients always forget to mention" },
  q16: { value: null, about: "How he handles budget and brief not meeting" },
  q17: { value: null, blocking: true, about: "How long a measured survey takes on site" },
  q18: { value: null, blocking: true, about: "Working days from survey to drawings" },
  q19: { value: null, blocking: true, about: "Revisions included before it costs more" },
  q20: { value: null, blocking: true, about: "What the client receives at the drawings stage" },
  q21: { value: null, about: "Design fee, and whether it is deducted if they proceed" },
  q22: { value: null, blocking: true, provisional: ["MDF", "Veneered MDF", "Plywood"], about: "Full material range, and who cuts to size and whether they can be named" },
  q23: { value: null, about: "Whether veneer grain is matched across adjoining doors" },
  q24: { value: null, blocking: true, about: "Finishes offered, and which he recommends" },
  q25: { value: null, about: "A material he avoids, and why" },

  /**
   * The unnumbered blocking question in Part 3, stage 04. The draft assumed his
   * own workshop with a dry fit on the bench. He has no workshop, so what
   * actually happens after the materials are cut is unknown, and the stage
   * cannot be written or even titled until he says.
   */
  stage04: { value: null, blocking: true, about: "What actually happens between materials being cut and reaching site" },

  q26: { value: null, blocking: true, about: "How long a typical job takes from ordering materials to ready to install" },
  q27: { value: null, blocking: true, about: "What holds the piece together and why, in his own words" },
  q28: { value: null, about: "Hardware and ironmongery specified" },
  q29: { value: null, about: "Anything in the process a client would be surprised by" },
  q30: { value: null, blocking: true, about: "Days on site for a typical wardrobe wall" },
  q31: { value: null, blocking: true, about: "Scribing properly versus the shortcut, in his own words" },
  q32: { value: null, about: "Notice given before install" },
  q33: { value: null, about: "What clearing up actually means" },
  q34: { value: null, about: "Preparation needed from the client" },
  q35: { value: null, blocking: true, about: "Guarantee: how many years and what it covers" },
  q36: { value: null, blocking: true, about: "Whether he returns to adjust a door after the first heating season" },
  q37: { value: null, about: "Maintenance advice for the finishes" },
  q38: { value: null, about: "Whether drawings are kept on file for a matching piece later" },

  // Part 4 — materials page
  q39: { value: null, blocking: true, about: "One line per material on what it is like to work with and what it suits" },
  q40: { value: null, blocking: true, about: "Which material he personally reaches for, and why" },
  q41: { value: null, about: "How the materials perform over time" },
  q42: { value: null, about: "Accent materials in the mix" },
  q43: { value: null, blocking: true, about: "How to frame engineered board over solid timber" },

  // Part 5 — work
  q44: { value: null, blocking: true, about: "Which four to six jobs the Work page is built around" },
  q45: { value: null, blocking: true, about: "For each job: the room and the problem" },
  q46: { value: null, blocking: true, about: "For each job: materials, finish, rough dimensions" },
  q47: { value: null, about: "For each job: what was difficult" },
  q48: { value: null, about: "For each job: how long, survey to install" },
  q49: { value: null, about: "Whether the client is happy to be quoted or named" },

  // Part 6 — maker
  q50: { value: null, blocking: true, about: "How he started" },
  q51: { value: null, blocking: true, about: "Where he trained and how long he has been doing this" },
  q52: { value: null, about: "What he did before" },
  q53: { value: null, about: "Why fitted furniture specifically" },
  q54: { value: null, about: "What he turns down" },
  q55: { value: null, about: "The piece he is proudest of" },
  q56: { value: null, blocking: true, about: "Whether he is happy to be photographed" },
} as const satisfies Record<string, Answer>;

export type QuestionKey = keyof typeof ANSWERS;

/** True when the question has a confirmed answer. A provisional value is not one. */
export function answered(key: QuestionKey): boolean {
  const a = ANSWERS[key] as Answer;
  if (a.value === null) return false;
  return Array.isArray(a.value) ? a.value.length > 0 : a.value.trim() !== "";
}

/** Which of the given questions are still outstanding. */
export function unanswered(keys: readonly QuestionKey[]): QuestionKey[] {
  return keys.filter((k) => !answered(k));
}

/**
 * A page is indexable only once every question it depends on is answered. This
 * is what makes pages publish themselves rather than waiting on a single
 * all-or-nothing release.
 */
export function ready(keys: readonly QuestionKey[]): boolean {
  return unanswered(keys).length === 0;
}

/**
 * How a question is referred to in the annotation a visitor never sees but a
 * reviewer does: "q07" reads as 7, and the unnumbered making-stage question
 * reads as "stage 04", which is how the questionnaire itself labels it.
 */
export function questionLabel(key: QuestionKey): string {
  return key === "stage04" ? "stage 04" : key.replace(/^q0?/, "");
}

/**
 * What to show for a question that has no confirmed answer yet: the provisional
 * value if we hold one, otherwise a short description of what is missing.
 * Never a claim, because it never ships: anything rendered through this is
 * wrapped in an Ask and keeps its page out of the index.
 */
export function placeholderFor(key: QuestionKey): string {
  const a = ANSWERS[key] as Answer;
  const p = a.provisional;
  if (p) return Array.isArray(p) ? p.join(" · ") : p;
  return a.about;
}

/** Every outstanding question, for the build-time report. */
export function outstanding(): QuestionKey[] {
  return (Object.keys(ANSWERS) as QuestionKey[]).filter((k) => !answered(k));
}

/** Outstanding questions that the questionnaire marked as holding the launch. */
export function outstandingBlocking(): QuestionKey[] {
  return outstanding().filter((k) => (ANSWERS[k] as Answer).blocking === true);
}
