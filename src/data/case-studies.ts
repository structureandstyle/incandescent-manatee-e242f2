/**
 * Case studies, as data.
 *
 * A case study is a page built from a record of one finished job. This file
 * holds the record's shape and the entries; the route is
 * src/pages/case-studies/[slug].astro and the index is
 * src/pages/case-studies/index.astro. Brief: briefs/case-study-2026-11.md in
 * the S&S ops repo (section 6 is the page spec, section 7 the intake block the
 * second and third entries reuse).
 *
 * Every client fact lives in src/data/answers.ts under the entry's keys, the
 * same way the rest of the site holds the questionnaire. An entry here holds no
 * fact about a job: only the slug, which keys it reads, and which of them it
 * waits on. Filling the answers is the whole job of publishing it.
 *
 * THE GATE. `gate` lists the keys that must all be answered. src/data/
 * page-gates.ts turns each entry into a gated path, so one list drives the
 * page's noindex, the sitemap exclusion in astro.config.mjs, and the checks in
 * scripts/verify-build.mjs. `optional` keys (cost, review, video) are shown if
 * answered and never needed to publish.
 *
 * NO LINKS YET. Nothing in the header, footer or any other page links to
 * /case-studies/ or to an entry. A link is added in the same commit that
 * answers the entry's gate, not before.
 *
 * ADDING THE SECOND AND THIRD. Add their keys to answers.ts (copy the cs1_
 * block, rename cs2_), add an entry below, and nothing else changes.
 */
import type { QuestionKey } from "./answers";

export type CaseStudyKeys = {
  title: QuestionKey;
  area: QuestionKey;
  home: QuestionKey;
  handover: QuestionKey;
  pieces: QuestionKey;
  materials: QuestionKey;
  painting: QuestionKey;
  problem: QuestionKey;
  dates: QuestionKey;
  photos: QuestionKey;
  cost: QuestionKey;
  review: QuestionKey;
  video: QuestionKey;
};

export type CaseStudy = {
  /** The URL segment. Working slug from the brief; it follows the title, so a
      change of service or district in cs1_title is a change here too. */
  slug: string;
  /** A SERVICES slug once the title's service is confirmed, otherwise null.
      Null means the page links to no service page. */
  service: string | null;
  /** The date the piece is published, YYYY-MM-DD, set by the person who clears
      it. Null while it is a draft. */
  published: string | null;
  keys: CaseStudyKeys;
  /** Every one must be answered before the page is indexable. */
  gate: readonly QuestionKey[];
  /** Why it is held, shown in the draft bar. */
  note: string;
};

export const CASE_STUDIES: readonly CaseStudy[] = [
  {
    slug: "alcove-units-belsize-park",
    service: null,
    published: null,
    keys: {
      title: "cs1_title",
      area: "cs1_area",
      home: "cs1_home",
      handover: "cs1_handover",
      pieces: "cs1_pieces",
      materials: "cs1_materials",
      painting: "cs1_painting",
      problem: "cs1_problem",
      dates: "cs1_dates",
      photos: "cs1_photos",
      cost: "cs1_cost",
      review: "cs1_review",
      video: "cs1_video",
    },
    gate: [
      "cs1_title", "cs1_area", "cs1_home", "cs1_handover", "cs1_pieces",
      "cs1_materials", "cs1_painting", "cs1_problem", "cs1_dates", "cs1_photos",
      "cs1_consent", "cs1_photographer", "cs1_photos_checked",
      "cs1_facts_confirmed", "cs1_kaspar_yes", "cs1_copy_cleared",
    ],
    note: "Waiting on Kaspar's facts, photographs and the customer's OK",
  },
];

export const caseStudyPath = (c: CaseStudy) => `/case-studies/${c.slug}/`;

/** The title rule from the brief: "[Service] in [Area]". */
export const TITLE_PATTERN = /^[A-Z][A-Za-z' -]+ in [A-Z][A-Za-z' -]+$/;
