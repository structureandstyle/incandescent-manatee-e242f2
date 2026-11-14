/**
 * Topic pages, 14 November 2026: pages about one kind of work rather than one
 * district, built on the area page frame (src/components/AreaPage.astro) so
 * they carry its order: breadcrumb, kicker, h1, three plates, the lede, the two
 * actions, the page's own sections, the closing band.
 *
 * Why not the service template ([slug].astro). That template is the seven
 * contracted service pages, read section by section into one shared gate and
 * one shared copy store (service-copy.ts). These pages were approved by a
 * founder on 14 Nov 2026 as extras for Kaspar to review over Christmas, each
 * with copy of its own, and none is a signed service page. A page here can move
 * into SERVICES later if the founders want it in the Services menu.
 *
 * Each page's copy lives in its own file under src/pages; its gate is in
 * page-gates.ts and holds it noindexed, out of the sitemap and unlinked until
 * Kaspar has checked it. scripts/verify-build.mjs reads the slugs below to
 * register each path's breadcrumb and WebPage rules, so a slug is always
 * written on its own line as `slug: "..."`.
 */

/** A real photograph from public/images/_selection.json, labelled by type only. */
type PhotoPlate = { file: string; type: string };

/**
 * An AI-generated example, made to docs/ai-render-protocol.md in the ops repo
 * where no photograph of the work exists. Captioned "AI-generated example" by
 * the frame; `type` is the short name the photo viewer adds after it.
 */
type AiPlate = { file: string; type: string; ai: true; width: number; height: number; alt: string };

export type TopicPage = {
  /** URL slug, without slashes: the page's primary keyword, hyphenated. */
  slug: string;
  /** The breadcrumb label. */
  name: string;
  /** Passed to Base as `title`; Base appends " | Structure & Style". */
  titleProp: string;
  h1: string;
  kicker: string;
  /** Meta description, 140 to 155 characters. */
  description: string;
  /** Primary keyword, for the record. */
  primary: string;
  plates: (PhotoPlate | AiPlate)[];
};

export const TOPIC_PAGES: TopicPage[] = [];

export const topicPath = (slug: string) => `/${slug}/`;
