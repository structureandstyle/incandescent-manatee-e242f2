import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * The journal.
 *
 * This collection exists so a guide is a content drop rather than a build job:
 * add a markdown file to src/content/journal/ and the index, the route, the
 * schema and the sitemap entry all follow. That was the reason for building the
 * route in step 6 rather than waiting until there was something to put in it.
 *
 * It is empty on purpose. The first article, "built in wardrobe ideas" at 4,400
 * searches a month, is drafted in the ops repo and Truth-blocked: round one
 * failed on ten invented claims about client briefs that no photograph can
 * evidence. Q44 to Q49 are what unblock it, which means the journal and the
 * site are waiting on the same questionnaire.
 *
 * `blocked` is required rather than optional, and defaults to true. A draft
 * cannot reach the site by someone forgetting a front-matter field.
 */
const journal = defineCollection({
  loader: glob({ base: "./src/content/journal", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** The keyword this page is written to win. From the target sheet. */
    primary: z.string(),
    published: z.coerce.date(),
    /** Set false only once the piece has cleared the Truth and Craft gates. */
    blocked: z.boolean().default(true),
    /** Why it is blocked, so the reason travels with the file. */
    blockedReason: z.string().optional(),
  }),
});

export const collections = { journal };
