/**
 * Journal helpers shared by the index, the article route and the header.
 *
 * DRAFT PREVIEWS, 13 October 2026. A blocked article has no route on the live
 * site, which is the gate the collection was built around. But a draft that
 * cannot be seen cannot be reviewed: the alcove article went to Kaspar as a
 * standalone mockup rather than as the page itself. So a blocked article now
 * renders on the dev server, on Netlify deploy previews and branch deploys,
 * and on a local `npm run build:drafts`, always noindexed and under a bar that
 * says it is a draft. A production build never renders one: Netlify sets
 * CONTEXT=production there, and scripts/verify-build.mjs fails the build if a
 * draft page reaches dist/ in that context.
 */
import type { CollectionEntry } from "astro:content";

const context = process.env.CONTEXT ?? "";

export const SHOW_DRAFTS =
  context !== "production" &&
  (import.meta.env.DEV ||
    context === "deploy-preview" ||
    context === "branch-deploy" ||
    process.env.JOURNAL_DRAFTS === "1");

export type Article = CollectionEntry<"journal">;

/** Cleared for publication. */
export const isLive = (p: Article) => p.data.blocked === false;

/** Gets a route in this build: live, or a draft on a preview build. */
export const isRendered = (p: Article) => isLive(p) || SHOW_DRAFTS;

/**
 * Reading time from the raw article body, at 220 words a minute. Component
 * tags and their attributes are stripped first so they do not count as words;
 * text passed to a component as a prop (an idea's caption, a material card's
 * description) still counts, because the reader reads it.
 */
export function readingMinutes(body: string | undefined): number {
  if (!body) return 1;
  const text = body
    .replace(/^import .*$/gm, " ")
    .replace(/<\/?[A-Z][\w.]*/g, " ")
    .replace(/[{}<>/=]/g, " ");
  const words = text.match(/[A-Za-z0-9£'’,.-]+/g)?.length ?? 0;
  return Math.max(1, Math.round(words / 220));
}
