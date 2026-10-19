import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { AUTHORS } from "./data/site";

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
 *
 * ARTICLE TEMPLATE, 13 October 2026. Articles may now be MDX as well as plain
 * markdown, so an article can place the journal components (ideas with a
 * photograph, the dimensioned drawing, material cards, the price panel, steps)
 * from src/components/journal/. The fields below feed the parts of the page
 * the template draws itself: byline, hero, At a glance, the jump list and the
 * closing band.
 *
 * Dates: only `published` is ever shown on the page (Arthur, 13 Oct: published
 * date only, no visible "Updated" line, on every article). `updated` exists for
 * the BlogPosting's dateModified, which the verify step requires, and defaults
 * to `published`.
 */
const figure = z.object({
  /** Root-relative path under /images/, as Plate expects. */
  src: z.string().startsWith("/images/"),
  alt: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  /** What the photograph shows, in the caption's left half. */
  caption: z.string(),
  /** The district, never an address. Absent means Kaspar has not named it yet,
      and the caption shows an open question instead. */
  area: z.string().optional(),
  /** An AI render, not a photograph of a job. Kaspar's rule, 18 Oct 2026:
      the caption reads "AI-generated example" and nothing more, and a gallery
      button follows so readers can see real work. No district is asked for.
      Keep renders under /images/journal/, never in a service folder, so they
      cannot end up in a gallery. Renders inside an article use <Render>. */
  ai: z.boolean().default(false),
});

const journal = defineCollection({
  loader: glob({ base: "./src/content/journal", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** Shown under the title. Defaults to the description. */
    standfirst: z.string().optional(),
    /** Short label for the breadcrumb, when the title is too long for one. */
    crumb: z.string().optional(),
    /** The keyword this page is written to win. From the target sheet. */
    primary: z.string(),
    published: z.coerce.date(),
    /** Schema only (dateModified). Never shown on the page. */
    updated: z.coerce.date().optional(),
    author: z.string().refine((a) => a in AUTHORS, { message: "unknown author; add them to AUTHORS in src/data/site.ts" }).default("kaspar"),
    /** Show the author's name and role in the byline. Off leaves the date and
        reading time only, as the alcove article was approved (18 Oct 2026);
        the schema still names the author. */
    byline: z.boolean().default(true),
    hero: figure,
    /** The At a glance box: three to six short points. */
    glance: z.array(z.string()).default([]),
    /** The "In this article" jump list. Each id must match a Theme on the page. */
    contents: z.array(z.object({ id: z.string(), label: z.string() })).default([]),
    /** The closing band. Defaults to the site-wide band. */
    band: z.object({ heading: z.string(), body: z.string() }).optional(),
    /** Set false only once the piece has cleared the Truth and Craft gates. */
    blocked: z.boolean().default(true),
    /** Why it is blocked, so the reason travels with the file. */
    blockedReason: z.string().optional(),
  }),
});

export const collections = { journal };
