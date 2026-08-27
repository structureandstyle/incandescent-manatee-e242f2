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

export const PAGE_GATES = {
  "/": ["q03", "q07", "q10"],

  // The seven contracted service pages. Wave one first.
  "/fitted-wardrobes/": ["q03", "q07", "q10", "q22", "q24", "q26", "q30", "q31", "q35"],
  "/walk-in-wardrobes/": ["q03", "q07", "q10", "q22", "q24", "q26", "q30", "q31", "q35"],
  "/alcove-units/": ["q03", "q07", "q10", "q22", "q24", "q26", "q30", "q31", "q35"],
  "/fitted-wardrobe-cost/": ["q03", "q07", "q10", "q11", "q12", "q19", "q21", "q35"],
  "/media-walls/": ["q03", "q07", "q10", "q22", "q24", "q26", "q30", "q35"],
  "/bespoke-kitchens/": ["q03", "q07", "q10", "q22", "q24", "q26", "q30", "q35"],
  "/home-office-understairs-storage/": ["q03", "q07", "q10", "q22", "q24", "q26", "q30", "q35"],

  // The brand pages from the design system.
  "/process/": [
    "q13", "q14", "q15", "q16", "q17", "q18", "q19", "q20",
    "stage04", "q26", "q27", "q30", "q31", "q32", "q33", "q34", "q35", "q36",
  ],
  "/materials/": ["q22", "q24", "q39", "q40", "q41", "q42", "q43"],
  "/work/": ["q44", "q45", "q46", "q47", "q48", "q49"],
  "/maker/": ["q03", "q06", "q50", "q51", "q52", "q53", "q56"],

  // No client dependency.
  "/journal/": [],
  "/contact/": ["q07"],
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
