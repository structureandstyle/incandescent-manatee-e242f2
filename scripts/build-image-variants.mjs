#!/usr/bin/env node
/**
 * Width variants for every photograph, and one share image per service.
 *
 *     node scripts/build-image-variants.mjs
 *
 * WHY, 5 September 2026. Every photograph on this site shipped at exactly one
 * resolution to every device. A 390px phone downloaded the identical 1400 to
 * 1636px file a desktop got, photography is about two thirds of the build's
 * weight, and mobile largest-contentful-paint sat at 3.4 to 3.9 seconds on the
 * four heaviest pages. The 3 September audit called this the single biggest
 * mobile win and it has been open since; the 4 September photography commit,
 * which took the fitted-wardrobe set from 278KB to 726KB and shares it with the
 * cost guide, made it larger rather than smaller.
 *
 * This writes `<name>-<w>w.webp` beside each original for every width smaller
 * than the original, and `public/images/_variants.json` recording what exists.
 * Plate.astro reads that manifest and emits a srcset, so a phone fetches the
 * 400 or 640 and a desktop the original. Nothing is deleted: the original stays
 * the largest candidate and the plain `src`, so a browser that ignores srcset
 * gets exactly what it got before.
 *
 * IT DOES NOT TOUCH public/images/materials. Those six are CSS background
 * images on the material chips, and background-image has no srcset. They are
 * handled in MaterialChip.astro instead.
 *
 * IT ALSO WRITES public/og/<slug>.jpg, 1200 x 630, one per service, from that
 * service's own first landscape photograph. Every page shared one share image
 * before this: a real photograph of the client's work, but a kitchen, on the
 * wardrobe pages. JPEG rather than WebP on purpose, because a share card is
 * read by a dozen different scrapers and some of the older ones still do not
 * take WebP, and this is the one image where a silent failure is invisible to
 * us and obvious to whoever was sent the link.
 *
 * sharp comes with Astro, so there is nothing to install. Re-run it when a
 * photograph is added or replaced, and commit what it writes.
 */
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, extname, basename } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES = join(ROOT, "public/images");

/**
 * The widths, chosen from what the layout actually asks for rather than from a
 * round-number habit. The gallery runs three columns inside a 1240px measure,
 * so a plate is about 380 CSS px on a desktop and about 335 on a 375px phone;
 * at device pixel ratio 2 those want 760 and 670. A full-width plate on a phone
 * wants about 750. 400 covers a low-density phone, 640 and 900 cover the two
 * real cases either side, 1280 covers a retina desktop plate, and the original
 * stays as the top candidate for the full-width hero.
 */
const WIDTHS = [400, 640, 900, 1280];

/** Directories of photographs. Material swatches are backgrounds, not <img>. */
const SKIP_DIRS = new Set(["materials"]);
const VARIANT = /-\d+w\.webp$/;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      yield* walk(full);
    } else if (entry.name.endsWith(".webp") && !VARIANT.test(entry.name)) {
      yield full;
    }
  }
}

const manifest = {};
let written = 0;
let bytes = 0;

for await (const file of walk(IMAGES)) {
  const meta = await sharp(file).metadata();
  const key = "/" + relative(join(ROOT, "public"), file).split(/[\\/]/).join("/");
  const made = [];
  for (const w of WIDTHS) {
    if (w >= meta.width) continue;
    const out = join(dirname(file), `${basename(file, extname(file))}-${w}w.webp`);
    await sharp(file)
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 72, effort: 5 })
      .toFile(out);
    made.push(w);
    written += 1;
    bytes += statSync(out).size;
  }
  if (made.length) manifest[key] = made;
  console.log(`${key}  ${meta.width}px  ->  ${made.join(", ") || "no smaller widths"}`);
}

writeFileSync(join(IMAGES, "_variants.json"), JSON.stringify(manifest, null, 1) + "\n");
console.log(`\n${written} variants, ${(bytes / 1024 / 1024).toFixed(2)}MB, manifest written`);

/* The share images. One per service, from its own first landscape photograph,
   because a portrait crops badly into a 1200 x 630 card. */
const selection = JSON.parse(readFileSync(join(IMAGES, "_selection.json"), "utf8"));
const OG_DIR = join(ROOT, "public/og");
if (!existsSync(OG_DIR)) mkdirSync(OG_DIR, { recursive: true });

for (const [slug, shots] of Object.entries(selection)) {
  if (!Array.isArray(shots) || !shots.length) continue;
  const landscape = shots.find((s) => s.w / s.h >= 1.2) ?? shots[0];
  const src = join(ROOT, "public", landscape.file.replace(/^\//, ""));
  const out = join(OG_DIR, `${slug}.jpg`);
  await sharp(src)
    .resize({ width: 1200, height: 630, fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  console.log(`og/${slug}.jpg  from  ${landscape.file}`);
}
