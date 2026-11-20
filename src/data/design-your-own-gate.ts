/**
 * Is /design-your-own/ live? One switch, read by the page (its robots tag) and
 * by astro.config.mjs (the sitemap), so the two cannot disagree.
 *
 * FALSE until a founder approves the launch (19 Nov 2026: built for review,
 * and five facts are still owed by Kaspar; the brief lists them in the F2F
 * repo, clients/structure-and-style/design-your-own/BRIEF-2026-11-19.md).
 * While false the page builds, previews and works, and stays out of search.
 */
export const DESIGN_YOUR_OWN_LIVE = false;
