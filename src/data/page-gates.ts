/**
 * Which questions each page depends on.
 *
 * One place, read by two consumers: the page itself, to decide whether to send
 * `noindex`, and `astro.config.mjs`, to keep incomplete pages out of the
 * sitemap. Keeping it in one file is what stops those two drifting apart and
 * publishing a page in the sitemap that says noindex in its own head.
 *
 * A page with an empty gate has no dependency on the client and is publishable
 * as soon as it is built.
 */

import { ready, type QuestionKey } from "./answers";

/**
 * All seven service pages render from one template, src/pages/[slug].astro, so
 * they depend on exactly the same questions. Declared once rather than seven
 * times: the first version of this file listed them per page, drifted from the
 * template within a day, and left pages whose gate no longer described what
 * they showed. A page could then have gone indexable while still displaying an
 * open question.
 *
 * The union below is the template read section by section: the hero band
 * (Q3 area, Q7 lead time, Q10 price), then cost, how long, what it is made
 * from, how it is fitted, and what happens afterwards. If a section is added to
 * that template, its questions belong here in the same commit.
 */
/** The three the enquiry band shows on every page. */
const BAND_QUESTIONS = ["q03", "q07", "q10"] as const;

const SERVICE_PAGE = [
  "q03", "q07", "q10", "q11", "q12", "q18",
  "q22", "q24", "q30", "q31", "q33", "q35", "q36", "q43",
] as const;

export const PAGE_GATES = {
  /* Hero and approach both turn on how he works, the process block carries the
     untitled stage, and the maker block opens with how he started. */
  "/": [...BAND_QUESTIONS, "q06", "stage04", "q50"],

  // The seven contracted service pages, all from the one template.
  "/fitted-wardrobes/": SERVICE_PAGE,
  "/walk-in-wardrobes/": SERVICE_PAGE,
  "/alcove-units/": SERVICE_PAGE,
  "/fitted-wardrobe-cost/": SERVICE_PAGE,
  "/media-walls/": SERVICE_PAGE,
  "/bespoke-kitchens/": SERVICE_PAGE,
  "/home-office-understairs-storage/": SERVICE_PAGE,

  /**
   * The brand pages. Each list is that page read section by section, plus the
   * three the enquiry band carries on every page (Q3 area, Q7 lead time,
   * Q10 price). Same discipline as the service template: if a section is added,
   * its questions belong here in the same commit.
   */
  "/process/": [
    ...BAND_QUESTIONS,
    "q13", "q14", "q15", "q16",                     // 01 Visit
    "q17", "q18", "q19", "q20", "q21",              // 02 Survey and drawings
    "stage04", "q26", "q27", "q28", "q29",          // 03 still untitled
    "q30", "q31", "q32", "q33", "q34",              // 04 Fitting
  ],
  "/materials/": [...BAND_QUESTIONS, "q22", "q24", "q39", "q40", "q43"],
  "/work/": [...BAND_QUESTIONS, "q44", "q45", "q46", "q47", "q48", "q49"],
  /* Q56 gates the portrait rather than appearing as copy, so it is not here:
     the page is publishable without a photograph of him. */
  "/maker/": [...BAND_QUESTIONS, "q06", "q50", "q51", "q52", "q53"],

  // No client dependency.
  "/journal/": [],
  "/contact/": [],
  "/privacy/": [],
  "/thanks/": [],
} as const satisfies Record<string, readonly QuestionKey[]>;

export type GatedPath = keyof typeof PAGE_GATES;

/** The gate for a path. Unknown paths are ungated, so new pages are not silently hidden. */
export function gateFor(path: string): readonly QuestionKey[] {
  return (PAGE_GATES as Record<string, readonly QuestionKey[]>)[path] ?? [];
}

/** A page is indexable only when every question it depends on is answered. */
export function indexable(path: string): boolean {
  return ready(gateFor(path));
}

/** Paths that must stay out of the sitemap because their copy is still incomplete. */
export function blockedPaths(): string[] {
  return Object.keys(PAGE_GATES).filter((p) => !indexable(p));
}
