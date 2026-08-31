/**
 * The content questionnaire, as data.
 *
 * Source: `structure-and-style-content-questions (1).pdf`, sent to the client
 * 24 August 2026. 56 numbered questions plus one unnumbered blocking question
 * about the making stage, keyed here as `stage04`.
 *
 * ANSWERS RECEIVED 30 August 2026, in
 * `Structure_and_Style_Content_Questionnaire_Answers.pdf` ("the agreed working
 * answers"). The full transcription and the voice rulings that came with it
 * live in the ops repo at `docs/content-questionnaire-answers.md`. Two things
 * were explicitly held back for separate follow-up and stay null below:
 *
 *   Q10        per-service price ranges, promised as a separate pricing
 *              document. This is the one answer every gated page waits on,
 *              because the enquiry band carries it site-wide.
 *   Q44 to Q49 the portfolio projects, promised after he reviews the
 *              photographs already supplied.
 *
 * The answer document also ruled on voice rather than facts (its Part 7 and
 * Part 8 have no keys here): present Structure & Style as a company, "we"
 * throughout, no personal name, no solo-operation framing, no competitor
 * comparisons, and do not name or explain the cutting arrangement. Those
 * rulings are recorded in the ops repo and applied to the pages, not stored
 * as values.
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
 *
 * Values are copy, not notes: a confirmed value renders verbatim wherever a
 * <Value> names its question, so each one is phrased for its render slots and
 * follows the tone protocol. The client's wording is kept wherever it survives
 * those two constraints.
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
  /** Q1 ruling, 30 Aug 2026: no personal name is published anywhere on the
      site. Never rendered; kept as the record of the answer. */
  q01: { value: "No personal name is published. The site presents Structure & Style as a company.", about: "Name as published, and whether the Maker page uses his full name" },
  q02: { value: "Structure and Style Ltd, company number 16822866, incorporated 31 October 2025", about: "Company details" },
  q03: { value: "Serving homes across London", blocking: true, about: "Business base: any physical base worth naming, or service area only" },
  q04: { value: "info@structureandstyle.co.uk", about: "Email" },
  q05: { value: "07309 872555", about: "Phone and WhatsApp, already public" },
  /** Rephrased 31 Aug 2026, two Truth-gate catches: his answer said "through
      to manufacture", and the protocol caps manufacturing at one FAQ line
      site-wide (section 10), so the word cannot ride this value onto every
      page that renders it; and the brand speaks as "we", never in the third
      person (section 7). The coordination meaning is untouched. */
  q06: { value: "We manage each project from start to finish, coordinating everything from the first design conversation through to final installation and aftercare.", about: "How the work is run" },
  q07: { value: "Lead time typically 4 to 8 weeks", blocking: true, about: "Current lead time, how far ahead the work is booked" },
  q08: { value: "None currently.", about: "Social accounts actively used, or none" },
  q09: { value: "Public liability insurance of £5 million. Not currently VAT registered.", about: "Public liability cover and amount, trade bodies, accreditations" },

  // Part 2 — pricing
  q10: {
    value: null,
    blocking: true,
    provisional: ["Fitted wardrobes £3,000 to £8,000", "Kitchens £5,000 to £15,000"],
    about: "Per-service price ranges: promised 30 Aug 2026 as a separate pricing document, still to arrive",
  },
  q11: { value: "Size and complexity: difficult room shapes, sloping ceilings, bespoke internal layouts, premium materials and veneers, specialist finishes, integrated lighting and extra detailing.", about: "What moves a job to the top of its range" },
  q12: { value: "Generally £2,000 of project value.", about: "Minimum job size" },

  // Part 3 — process
  q13: { value: "Design is part of the service where the project needs it. Straightforward jobs can go straight to quotation; where design development is needed, drawings and visuals follow once the quotation is accepted and the deposit paid, with the design cost inside the quotation.", blocking: true, about: "The design service: what it covers, when it happens, whether there is a fee" },
  q14: { value: "Usually 45 to 60 minutes, longer for larger or more complex projects.", about: "How long the first visit takes" },
  q15: { value: "Nothing in particular. It is our job at the consultation and survey to ask the right questions, not the client's to arrive knowing every detail.", about: "What clients always forget to mention" },
  q16: { value: "We are straightforward about it: we explain what is driving the cost and adjust the design, materials or specification without compromising the finished piece.", about: "How budget and brief not meeting is handled" },
  q17: { value: "Usually around an hour on site, longer for larger or more complex projects.", blocking: true, about: "How long a measured survey takes on site" },
  q18: { value: "One week is set aside for design, with drawings issued for review by the end of it.", blocking: true, about: "Working days from survey to drawings" },
  q19: { value: "Up to two rounds of design revisions included. Further rounds, or substantial changes to the agreed brief, may be chargeable.", blocking: true, about: "Revisions included before it costs more" },
  q20: { value: "Scaled drawings and elevations of the agreed design, internal layouts, material and finish specifications, and an itemised fixed quotation. More complex projects add 3D visuals and detailed technical drawings.", blocking: true, about: "What the client receives at the drawings stage" },
  q21: { value: "No separate design fee on a confirmed project. Design costs sit inside the quotation, and design work starts once the quotation is accepted and the deposit paid.", about: "Design fee, and whether it is deducted if they proceed" },
  q22: {
    value: [
      "Standard and moisture-resistant MDF",
      "veneered boards",
      "plywood",
      "melamine and decorative boards",
      "high-gloss and super-matt boards",
      "textured and wood-effect finishes",
      "specialist decorative surfaces",
    ],
    blocking: true,
    about: "Full material range. His ruling: do not name who cuts, or explain the arrangement, on the site",
  },
  q23: { value: "Yes. Where the design calls for it, veneer grain and pattern are matched across adjoining doors and panels so the run reads as one piece.", about: "Whether veneer grain is matched across adjoining doors" },
  q24: { value: "Spray-painted and hand-painted finishes, natural and stained veneers, melamine and decorative boards, and lacquered or oiled finishes where they suit the piece. The right one depends on the design, how the furniture is used, the budget and what it needs to match.", blocking: true, about: "Finishes offered, and which he recommends" },
  q25: { value: "No. Different materials have different strengths, and the right one follows the design, the environment, the finish and the use.", about: "A material he avoids, and why" },

  /**
   * The unnumbered blocking question in Part 3, stage 04. The draft assumed his
   * own workshop with a dry fit on the bench. He has no workshop, so the answer
   * below is what actually happens, in his words: preparation to the approved
   * drawings, then either assembly from prepared sections or construction in
   * the room, whichever the project needs.
   */
  stage04: { value: "Components are machined, edged and finished to the approved drawings and specification. Some projects are prepared as sections ready for assembly; others are built up and finished in the room, whichever gets the better result.", blocking: true, about: "What actually happens between materials being cut and reaching site" },

  q26: { value: "It varies with scale, materials, finishes and the making involved. Once design and specification are agreed, the project gets a realistic production and installation programme.", blocking: true, about: "How long a typical job takes from ordering materials to ready to install" },
  q27: { value: "The method that suits the piece and the material: Confirmat screws, Domino joints, Lamello connectors, cams and dowels, specialist MDF screws, glue, or a combination. What matters is that the construction stays strong and true over time.", blocking: true, about: "What holds the piece together and why, in his own words" },
  q28: { value: "Blum for hinges and drawer systems, Hafele for furniture hardware and lighting, and other specialist hardware where the project calls for it.", about: "Hardware and ironmongery specified. Named brands allowed by Denis's ruling 30 Aug 2026; rendered on the materials page and service spec tables" },
  /** Rephrased 30 Aug 2026: his answer opened "We build furniture...", and
      "we build" sits on the protocol's own provenance ban list (section 5).
      The meaning is his; the verb is not. */
  q29: { value: "Every piece carries our name. It is set out, levelled, plumb, fitted and finished with the same care in the details you see and the ones you do not. It should look right, feel right and be built to last.", about: "The standard worked to. He refused the cheaper-fitter comparison framing outright" },
  q30: { value: "Typically 2 to 3 days for a straightforward wardrobe wall, closer to a week where on-site construction or hand-painting is involved.", blocking: true, about: "Days on site for a typical wardrobe wall" },
  q31: { value: "Walls, floors and ceilings are rarely straight, so the furniture is scribed, cut to follow the line of the room, rather than left with gaps. Fitted and finished, it should look like one piece that belongs in the room.", blocking: true, about: "Scribing, in his own words. He refused the versus-other-installers framing" },
  q32: { value: "The installation period is allocated and agreed when the deposit is paid, and the final dates are confirmed as the project progresses.", about: "Notice given before install" },
  q33: { value: "Floors and the surrounding area are protected before work starts, and dust extraction runs throughout. The area is tidied at the end of each day, and waste and off-cuts leave with us at the end.", about: "What clearing up actually means" },
  q34: { value: "Clear personal belongings from the area being fitted and make sure we can reach it. Anything project-specific is agreed before installation.", about: "Preparation needed from the client" },
  q35: { value: "2 years on installation and workmanship, 10 years on the structure and joinery, and the manufacturer's warranty on hinges, runners and other moving hardware.", blocking: true, about: "Guarantee: how many years and what it covers. Exclusions recorded in the ops repo transcription" },
  q36: { value: "Yes, doors and other moving parts that settle within the 2-year aftercare period are adjusted, and we come back to do it.", blocking: true, about: "Whether he returns to adjust a door after the first heating season" },
  q37: { value: "Yes. Care advice comes with the finished piece: how to clean each material and finish, and what to avoid.", about: "Maintenance advice for the finishes" },
  q38: { value: "Yes. Drawings and specifications stay on file, so a matching or additional piece later starts from the record rather than from scratch.", about: "Whether drawings are kept on file for a matching piece later" },

  // Part 4 — materials page
  /** Q39's five confirmed one-liners also sit, per material, in
      `site-content.ts` MATERIALS, which is what the chips render. Change one,
      change both. */
  q39: {
    value: [
      "MDF and moisture-resistant MDF: versatile and dimensionally stable, suited to painted furniture and detailed profiles",
      "Veneered board: the character of real timber with the stability of an engineered board",
      "Plywood: strong and durable, with a distinctive exposed edge where the design calls for it",
      "Melamine and decorative board: hard-wearing and consistent, in a wide range of colours, textures and wood finishes",
      "Specialist decorative boards: super-matt, high-gloss, textured, stone-effect and other premium surfaces",
    ],
    blocking: true,
    about: "One line per material on what it is like to work with and what it suits",
  },
  q40: { value: "There is no single default. The material follows the build, the finish the client wants, where the piece lives and the budget.", blocking: true, about: "Which material he personally reaches for, and why" },
  q41: { value: "They are chosen for long-term stability. Natural veneers develop subtly with age and light; painted and decorative finishes stay more consistent.", about: "How the materials perform over time" },
  q42: { value: "Yes: stone and other worktops, mirrors, glass, metal details, specialist handles and lighting, where the project calls for them.", about: "Accent materials in the mix" },
  q43: { value: "Solid timber rarely makes sense for fitted furniture. Engineered boards are more stable and more consistent, and a real wood veneer gives a natural timber finish where one is wanted. It also avoids using large amounts of solid hardwood to reach the same look and quality.", blocking: true, about: "How to frame engineered board over solid timber" },

  // Part 5 — work. Held back 30 Aug 2026: he selects the projects after
  // reviewing the photographs already supplied, then answers per project.
  q44: { value: null, blocking: true, about: "Which four to six jobs the Work page is built around: promised after his photo review" },
  q45: { value: null, blocking: true, about: "For each job: the room and the problem" },
  q46: { value: null, blocking: true, about: "For each job: materials, finish, rough dimensions" },
  q47: { value: null, about: "For each job: what was difficult" },
  q48: { value: null, about: "For each job: how long, survey to install" },
  q49: { value: null, about: "Whether the client is happy to be quoted or named" },

  /**
   * Part 6 — maker. DIRECTION CHANGED by the client, 30 August 2026.
   *
   * He declined Q50 to Q56 as a personal profile: no name, portrait, career
   * history or training on the site at this stage. The Maker page became the
   * About page (company framing, "we") in the same commit as this ingestion,
   * and no page gates on these questions any more, so their `blocking` flags
   * are removed rather than left to misreport the launch state. The values
   * stay null because the questions genuinely have no answers, and the
   * personal story may still be added later as the business develops.
   */
  q50: { value: null, about: "How he started. Declined 30 Aug 2026: covered by the About-page direction change" },
  q51: { value: null, about: "Where he trained. Declined 30 Aug 2026: covered by the About-page direction change" },
  q52: { value: null, about: "What he did before. Declined 30 Aug 2026: covered by the About-page direction change" },
  q53: { value: null, about: "Why fitted furniture. Declined 30 Aug 2026: covered by the About-page direction change" },
  q54: { value: null, about: "What he turns down. Declined 30 Aug 2026: covered by the About-page direction change" },
  q55: { value: null, about: "The piece he is proudest of. Declined 30 Aug 2026: covered by the About-page direction change" },
  q56: { value: null, about: "Whether he is happy to be photographed. No portrait at this stage, 30 Aug 2026" },
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
