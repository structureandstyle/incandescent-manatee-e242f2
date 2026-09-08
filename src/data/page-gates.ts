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
  "q22", "q24", "q28", "q30", "q31", "q33", "q35", "q36", "q43",
] as const;

export const PAGE_GATES = {
  /* Hero and approach both turn on how the work is run, the process block
     carries the once-untitled stage, and the about block carries the Q29
     standard and the Q35 guarantee. Q50 left this gate 30 Aug 2026 with the
     Part 6 direction change: the maker story is declined, so nothing may wait
     on it. */
  "/": [...BAND_QUESTIONS, "q06", "stage04", "q29", "q35"],

  // The seven contracted service pages, all from the one template.
  "/fitted-wardrobes/": SERVICE_PAGE,
  "/walk-in-wardrobes/": SERVICE_PAGE,
  "/alcove-units/": SERVICE_PAGE,
  "/fitted-wardrobe-cost/": SERVICE_PAGE,
  "/media-walls/": SERVICE_PAGE,
  "/bespoke-kitchens/": SERVICE_PAGE,
  /* home-office-understairs-storage deferred 31 Aug 2026 with its SERVICES
     entry: no route, no gate. See DEFERRED_SERVICES in site.ts. */

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
  "/materials/": [...BAND_QUESTIONS, "q22", "q24", "q28", "q39", "q40", "q43"],
  /* Q44 to Q49 left this gate on 8 September 2026, after launch, Denis's
     decision. They are the case-study questions: which projects may be named,
     where, what was built, what the client said. The page they gated no longer
     exists. On 6 September Kaspar replaced the case-study portfolio with one
     continuous gallery of his own photographs, each carrying a plain type
     label and no claim about any project, and nothing on the page now waits on
     an answer from him. It is linked from every page and was the only finished
     page Google was told to ignore.

     Publishing the photographs treats his supplying them as permission to
     publish them; they are already on the live home page, and he reviewed this
     gallery twice. If real case studies are ever written, they need those six
     answers and this gate comes back with them. */
  "/work/": [...BAND_QUESTIONS],
  /* Was "/maker/" gated on Q50 to Q53. The client changed direction 30 Aug
     2026: no personal profile, so the page became About Structure & Style and
     depends only on the company answers it shows. Expanded 31 Aug 2026 to the
     full Our Approach page his Part 6 answer specified; Q35 joined the gate
     with the aftercare section. */
  "/about/": [...BAND_QUESTIONS, "q06", "q29", "q35"],

  // No client dependency.
  "/journal/": [],
  "/contact/": [],
  "/privacy/": [],
  "/cookies/": [],
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
