#!/usr/bin/env node
/**
 * The whole icon set, built from one piece of artwork.
 *
 *     npm i --no-save puppeteer-core && node scripts/build-icons.mjs
 *
 * WHAT THIS FIXED, 5 September 2026. public/favicon.svg and public/favicon.ico
 * were still the Astro starter's own logo, so the browser tab, the bookmark and
 * the search result favicon for this business were all a framework's mark. Two
 * audits and a render pass went past it, because every one of them checked that
 * an icon was declared rather than what the icon was of. The real mark had been
 * sitting unreferenced at src/assets/logos/favicon.svg since the port.
 *
 * That file is now the single source. Everything below is derived from it:
 *
 *   public/favicon.svg        the mark, ink on transparent, flipping to paper
 *                             under prefers-color-scheme: dark so it survives a
 *                             dark tab strip
 *   public/favicon.ico        16, 32 and 48, paper mark on the door green,
 *                             because an ICO carries no media query and a bare
 *                             ink glyph disappears on a dark tab
 *   public/apple-touch-icon.png   180, what iOS asks for
 *   public/icon-192.png, icon-512.png   what the web manifest asks for
 *   public/site.webmanifest
 *
 * The rasters are painted rather than transparent for the same reason: iOS
 * composites an apple-touch-icon over black or white of its own choosing, so a
 * transparent mark is a coin toss between correct and invisible. Green ground
 * and paper mark is the pairing the theme-color in Base.astro already declares.
 *
 * Each size is rendered from the vector at its own scale rather than resampled
 * from one raster, so none of them softens. Chrome is the renderer because
 * rasterising an SVG correctly is a job for a browser engine rather than for a
 * library that half implements one.
 *
 * puppeteer-core is deliberately NOT a dependency of this repo. The outputs are
 * committed, so the site builds and deploys without it and no browser driver
 * rides along in the Netlify install for files that change when the logo does.
 * Set CHROME_PATH if Chrome is not where the default expects it.
 */
import puppeteer from "puppeteer-core";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHROME =
  process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";

/** Door green and paper, from src/styles/tokens/colors.css. */
const GROUND = "#2C4A3A";
const MARK = "#F2EEE3";
const INK = "#221D18";

/* The canonical mark. One path, one viewBox, fill="currentColor". */
const source = readFileSync(join(ROOT, "src/assets/logos/favicon.svg"), "utf8");
const path = source.match(/<path[^>]*\sd="([^"]+)"/)?.[1];
const viewBox = source.match(/viewBox="([^"]+)"/)?.[1];
if (!path || !viewBox) throw new Error("No path or viewBox in src/assets/logos/favicon.svg");

/* The tab icon: the mark alone, so it sits on whatever the browser's tab strip
   is, and inverts with the scheme rather than carrying a ground of its own. */
writeFileSync(
  join(ROOT, "public/favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
  <path d="${path}"/>
  <style>
    path { fill: ${INK}; }
    @media (prefers-color-scheme: dark) { path { fill: ${MARK}; } }
  </style>
</svg>
`
);
console.log("wrote public/favicon.svg");

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1"],
});

/** One painted square at a given size, returned as PNG bytes. */
async function tile(px, pad = 0.18) {
  const page = await browser.newPage();
  await page.setViewport({ width: px, height: px, deviceScaleFactor: 1 });
  const inner = Math.max(1, Math.round(px * (1 - pad * 2)));
  await page.setContent(
    `<!doctype html><html><body style="margin:0;width:${px}px;height:${px}px;background:${GROUND};display:grid;place-items:center">
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${inner}" height="${inner}">
         <path d="${path}" fill="${MARK}"/>
       </svg>
     </body></html>`,
    { waitUntil: "load" }
  );
  const buf = await page.screenshot({ type: "png" });
  await page.close();
  return Buffer.from(buf);
}

for (const [file, px] of [
  ["public/apple-touch-icon.png", 180],
  ["public/icon-192.png", 192],
  ["public/icon-512.png", 512],
]) {
  writeFileSync(join(ROOT, file), await tile(px));
  console.log(`wrote ${file} at ${px}px`);
}

/**
 * The ICO, packed by hand rather than by a dependency. The format is a six
 * byte header, a sixteen byte directory entry per image, then the images
 * themselves; PNG payloads are what every browser and every Windows version
 * since Vista reads. The small sizes get less padding, because at 16px a fifth
 * of the tile spent on margin leaves a glyph too small to read.
 */
const icoSizes = [
  [16, 0.1],
  [32, 0.14],
  [48, 0.16],
];
const images = [];
for (const [px, pad] of icoSizes) images.push({ px, png: await tile(px, pad) });

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(images.length, 4);

let offset = 6 + images.length * 16;
const entries = [];
for (const { px, png } of images) {
  const e = Buffer.alloc(16);
  e.writeUInt8(px === 256 ? 0 : px, 0); // width
  e.writeUInt8(px === 256 ? 0 : px, 1); // height
  e.writeUInt8(0, 2); // palette size
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // colour planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(offset, 12);
  entries.push(e);
  offset += png.length;
}
writeFileSync(
  join(ROOT, "public/favicon.ico"),
  Buffer.concat([header, ...entries, ...images.map((i) => i.png)])
);
console.log(`wrote public/favicon.ico at ${icoSizes.map(([p]) => p).join(", ")}px`);

await browser.close();

writeFileSync(
  join(ROOT, "public/site.webmanifest"),
  JSON.stringify(
    {
      name: "Structure & Style",
      short_name: "Structure & Style",
      description: "Bespoke carpentry and joinery across London",
      start_url: "/",
      scope: "/",
      /* browser, not standalone: this is a website and it should open as one.
         standalone strips the address bar, which on a site whose whole job is
         to be trusted removes the one thing that proves where you are. */
      display: "browser",
      background_color: MARK,
      theme_color: GROUND,
      icons: [
        { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      ],
    },
    null,
    2
  ) + "\n"
);
console.log("wrote public/site.webmanifest");
