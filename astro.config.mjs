// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { blockedPaths } from './src/data/page-gates';
import { SERVICES } from './src/data/site';
import { SERVICE_COPY } from './src/data/service-copy';

// Pages still waiting on the content questionnaire stay out of the sitemap.
// Same source as the noindex tag each page sends, so the two cannot drift into
// the state where the sitemap advertises a page whose own head says noindex.
const blocked = new Set(blockedPaths());

// The service template carries a second gate the question machinery does not
// see: a service page with no entry in SERVICE_COPY renders as the shared
// template with different photographs and stays noindexed (see
// src/pages/[slug].astro). The sitemap has to honour that gate too, or it
// advertises pages whose own head says noindex. Caught 2 Sep 2026: media walls
// and bespoke kitchens were both in the sitemap.
for (const s of SERVICES) if (!SERVICE_COPY[s.slug]) blocked.add(`/${s.slug}/`);

// The journal index noindexes itself while it has no published articles, and
// it has no question gate to express that, so it was being advertised in the
// sitemap while its own head said noindex. Read the collection directory: the
// exclusion disappears on its own the day the first article lands, rather than
// waiting for someone to remember this line exists.
//
// COUNT ONLY CLEARED ARTICLES, 13 Oct 2026. This used to count every .md file,
// so the first blocked draft committed to main would have put /journal/ in the
// sitemap while the index still said noindex (it lists only cleared articles).
// It now reads each file's front matter and counts only `blocked: false`, the
// same rule the index and the route use. A draft's own URL is excluded too:
// drafts render on preview builds (src/data/journal.ts), and a preview's
// sitemap should not advertise them either.
const JOURNAL_DIR = './src/content/journal';
const articles = existsSync(JOURNAL_DIR)
  ? readdirSync(JOURNAL_DIR).filter((f) => /\.mdx?$/.test(f))
  : [];
let liveArticles = 0;
for (const file of articles) {
  const front = readFileSync(`${JOURNAL_DIR}/${file}`, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  if (/^blocked:\s*false\s*$/m.test(front)) liveArticles++;
  else blocked.add(`/journal/${file.replace(/\.mdx?$/, '')}/`);
}
if (liveArticles === 0) blocked.add('/journal/');

// The thank-you page exists only as the landing after a form submission and
// carries the enquiry_form event. It is noindexed at the template and has no
// business in the sitemap.
blocked.add('/thanks/');

// https://astro.build/config
export default defineConfig({
  // Required for the sitemap and for absolute canonical URLs. The clean root,
  // no www: this is the canonical Google was overriding until the Business
  // Profile link was corrected on 22 August 2026.
  site: 'https://structureandstyle.co.uk',
  trailingSlash: 'always',
  integrations: [
    // Journal articles may be MDX, so they can place the journal components.
    mdx(),
    sitemap({
      // Two exclusions. Pages still waiting on the questionnaire, and the
      // internal design-system preview, which is not a client page and is
      // noindexed at the template as well.
      filter: (page) => {
        const path = new URL(page).pathname;
        return !blocked.has(path) && !path.startsWith("/ds-preview");
      },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
