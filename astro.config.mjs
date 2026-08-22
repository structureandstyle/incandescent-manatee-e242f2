// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Required for the sitemap and for absolute canonical URLs. The clean root,
  // no www: this is the canonical Google was overriding until the Business
  // Profile link was corrected on 22 August 2026.
  site: 'https://structureandstyle.co.uk',
  trailingSlash: 'always',
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
});
