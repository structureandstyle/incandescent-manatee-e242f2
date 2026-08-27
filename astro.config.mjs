// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { blockedPaths } from './src/data/page-gates';

// Pages still waiting on the content questionnaire stay out of the sitemap.
// Same source as the noindex tag each page sends, so the two cannot drift into
// the state where the sitemap advertises a page whose own head says noindex.
const blocked = new Set(blockedPaths());

// https://astro.build/config
export default defineConfig({
  // Required for the sitemap and for absolute canonical URLs. The clean root,
  // no www: this is the canonical Google was overriding until the Business
  // Profile link was corrected on 22 August 2026.
  site: 'https://structureandstyle.co.uk',
  trailingSlash: 'always',
  integrations: [
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
