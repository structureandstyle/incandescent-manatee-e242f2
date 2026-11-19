/**
 * THE DESIGN AS A FLAT DRAWING, straight on (19 Nov 2026).
 *
 * The builder shows this the moment the page opens, before any 3D has loaded,
 * and keeps showing it wherever 3D cannot run: an old phone, a browser with
 * graphics switched off, a lost graphics context. It is drawn from the same
 * describe() as the 3D view and the price, so the two pictures cannot disagree.
 *
 * Returns SVG markup as a string. No page and no library, so the tests run it.
 * Sizes are millimetres: one unit in the drawing is one millimetre on the wall.
 */
import { COLOURS, describe } from "./model.mjs";

const INK = "#221D18";
const PLINTH = 100;
const TOP_FILL = 60;
const WALL_FILL = 40;
const END = 18;

const n = (v) => Math.round(v * 10) / 10;
const rect = (x, y, w, h, attrs = "") => `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" ${attrs}/>`;
const line = (x1, y1, x2, y2, attrs = "") => `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" ${attrs}/>`;

/** A door seen from the front: the slab, a Shaker panel if it has one, its handle. */
function door(s, x, y, w, h, fill, handleSide, handleY) {
  let out = rect(x, y, w, h, `fill="${fill}" stroke="${INK}" stroke-width="6"`);
  if (s.door === "shaker") {
    const f = Math.min(75, w * 0.22);
    out += rect(x + f, y + f, w - 2 * f, h - 2 * f, `fill="none" stroke="${INK}" stroke-width="4" opacity=".55"`);
  }
  if (s.handle !== "none" && handleSide) {
    const hx = handleSide === "right" ? x + w - 40 : x + 40;
    out += s.handle === "knob"
      ? `<circle cx="${n(hx)}" cy="${n(handleY)}" r="14" fill="#B08D57" stroke="${INK}" stroke-width="3"/>`
      : line(hx, handleY - 100, hx, handleY + 100, `stroke="#B08D57" stroke-width="12" stroke-linecap="round"`);
  }
  return out;
}

/** A measurement beside the drawing: a thin line with ticks and the figure in millimetres. */
function measure(x1, y1, x2, y2, label, size) {
  const horizontal = y1 === y2;
  const tick = size * 0.5;
  const mid = horizontal
    ? `<text x="${n((x1 + x2) / 2)}" y="${n(y1 + size * 1.5)}" text-anchor="middle">${label}</text>`
    : `<text x="${n(x1 - size * 0.7)}" y="${n((y1 + y2) / 2)}" text-anchor="middle" transform="rotate(-90 ${n(x1 - size * 0.7)} ${n((y1 + y2) / 2)})">${label}</text>`;
  const ticks = horizontal
    ? line(x1, y1 - tick, x1, y1 + tick) + line(x2, y2 - tick, x2, y2 + tick)
    : line(x1 - tick, y1, x1 + tick, y1) + line(x2 - tick, y2, x2 + tick, y2);
  return `<g class="dyo-measure" stroke="${INK}" stroke-width="3" fill="${INK}" font-size="${size}" opacity=".7">${line(x1, y1, x2, y2)}${ticks}${mid.replace("<text", '<text stroke="none"')}</g>`;
}

/**
 * @param {object} design  any design; it is normalised first.
 * @param {{ open?: boolean }} [options]  open: doors off, the inside shown.
 */
export function elevationSvg(design, { open = false } = {}) {
  const s = describe(design);
  const fill = COLOURS[s.finish][s.colour].hex;
  const wallHatch = `stroke="${INK}" stroke-width="8"`;
  let body = "";
  let W, H;
  const size = 62; // measurement lettering, in drawing units

  if (s.unit === "wardrobe") {
    W = s.w; H = s.h;
    const wallL = s.fit === "both" || s.fit === "left";
    const wallR = s.fit === "both" || s.fit === "right";
    const mL = wallL ? WALL_FILL : END, mR = wallR ? WALL_FILL : END;
    const iw = W - mL - mR;
    const dw = iw / s.doors;
    const top = TOP_FILL, bottom = H - PLINTH;
    // Ceiling and floor, and the walls the run meets.
    body += line(-260, 0, W + 260, 0, wallHatch) + line(-260, H, W + 260, H, wallHatch);
    if (wallL) body += line(0, 0, 0, H, wallHatch);
    if (wallR) body += line(W, 0, W, H, wallHatch);
    // Fillers or end panels, the strip under the ceiling, the plinth.
    body += rect(0, 0, mL, H, `fill="${fill}" stroke="${INK}" stroke-width="4"`);
    body += rect(W - mR, 0, mR, H, `fill="${fill}" stroke="${INK}" stroke-width="4"`);
    body += rect(mL, 0, iw, top, `fill="${fill}" stroke="${INK}" stroke-width="4"`);
    body += rect(mL, bottom, iw, PLINTH, `fill="${INK}" opacity=".85"`);
    if (!open) {
      let i = 0;
      const handleY = bottom - Math.min(1050, (bottom - top) * 0.48);
      for (const count of s.sections) {
        for (let k = 0; k < count; k++, i++) {
          const side = count === 2 ? (k === 0 ? "right" : "left") : "left";
          body += door(s, mL + i * dw, top, dw, bottom - top, fill, side, handleY);
        }
      }
    } else {
      body += rect(mL, top, iw, bottom - top, `fill="#E9E3D6" stroke="${INK}" stroke-width="6"`);
      let x = mL;
      s.sections.forEach((count, si) => {
        const sw = count * dw;
        if (si) body += line(x, top, x, bottom, `stroke="${INK}" stroke-width="6"`);
        const a = x + 30, b = x + sw - 30;
        const shelf = (y) => line(x, y, x + sw, y, `stroke="${INK}" stroke-width="6"`);
        const rail = (y, len) => {
          let o = line(a, y, b, y, `stroke="${INK}" stroke-width="10" stroke-linecap="round"`);
          for (let hx = a + 50; hx < b - 20; hx += 62) o += line(hx, y + 14, hx, y + len, `stroke="${INK}" stroke-width="22" opacity=".28" stroke-linecap="round"`);
          return o;
        };
        const drawers = () => {
          let o = "";
          for (let k = 0; k < 3; k++) o += rect(x + 12, bottom - (k + 1) * 200, sw - 24, 194, `fill="#D8D0BF" stroke="${INK}" stroke-width="4"`);
          return o + shelf(bottom - 600);
        };
        const span = bottom - top;
        const kind = s.inside[si];
        if (kind === "hang") body += shelf(top + 300) + rail(top + 360, Math.min(1300, span - 480));
        else if (kind === "double") body += rail(top + 80, Math.min(950, span * 0.5 - 180)) + rail(top + span * 0.5, Math.min(950, span * 0.5 - 140));
        else if (kind === "hang-shelves") {
          const mid = bottom - span * 0.44;
          body += shelf(mid) + rail(top + 80, Math.min(1000, mid - top - 220)) + shelf(mid + (bottom - mid) / 3) + shelf(mid + (2 * (bottom - mid)) / 3);
        } else if (kind === "shelves") for (let k = 1; k <= 5; k++) body += shelf(top + (span * k) / 6);
        else if (kind === "hang-drawers") body += drawers() + rail(top + 80, Math.min(1200, span - 820));
        else { body += drawers(); for (let k = 1; k <= 3; k++) body += shelf(top + ((span - 600) * k) / 4); }
        x += sw;
      });
    }
    body += measure(0, H + 150, W, H + 150, `${s.w} mm`, size);
    body += measure(-150, 0, -150, H, `${s.h} mm`, size);
  } else {
    const widths = s.count === 2 ? [s.wl, s.wr] : [s.wl, s.wl];
    W = widths[0] + s.breast + widths[1]; H = s.h;
    const bx = widths[0]; // where the chimney breast starts
    body += line(0, 0, W, 0, wallHatch) + line(0, H, W, H, wallHatch) + line(0, 0, 0, H, wallHatch) + line(W, 0, W, H, wallHatch);
    // The chimney breast and a plain fireplace.
    body += rect(bx, 0, s.breast, H, `fill="#F4F0E6" stroke="${INK}" stroke-width="6"`);
    const fw = Math.min(620, s.breast - 500), fh = 720, fx = bx + (s.breast - fw) / 2;
    body += rect(fx - 140, H - fh - 120, fw + 280, fh + 120, `fill="#E2DCCD" stroke="${INK}" stroke-width="4"`);
    body += rect(fx, H - fh, fw, fh, `fill="${INK}" opacity=".85"`);
    body += rect(fx - 220, H - fh - 165, fw + 440, 45, `fill="#E2DCCD" stroke="${INK}" stroke-width="4"`);
    const unit = (x0, aw) => {
      let o = "";
      const baseTop = H - s.base;
      o += rect(x0, baseTop, aw, 25, `fill="${fill}" stroke="${INK}" stroke-width="4"`);
      o += rect(x0, H - PLINTH, aw, PLINTH, `fill="${INK}" opacity=".85"`);
      let dTop = baseTop + 25;
      if (s.extras.includes("drawers")) {
        o += rect(x0 + 20, dTop, aw - 40, 170, `fill="${fill}" stroke="${INK}" stroke-width="6"`);
        dTop += 174;
      }
      const dh = H - PLINTH - dTop, dw = (aw - 40) / 2;
      if (!open) {
        o += door(s, x0 + 20, dTop, dw, dh, fill, "right", dTop + 120);
        o += door(s, x0 + 20 + dw, dTop, dw, dh, fill, "left", dTop + 120);
      } else {
        o += rect(x0 + 20, dTop, aw - 40, dh, `fill="#E9E3D6" stroke="${INK}" stroke-width="6"`) + line(x0 + 20, dTop + dh / 2, x0 + aw - 20, dTop + dh / 2, `stroke="${INK}" stroke-width="6"`);
      }
      const step = s.shelves ? (s.h - s.base - 280) / s.shelves : 0;
      for (let k = 1; k <= s.shelves; k++) o += rect(x0, baseTop - step * k, aw, 30, `fill="${fill}" stroke="${INK}" stroke-width="4"`);
      return o;
    };
    body += unit(0, widths[0]);
    if (s.count === 2) body += unit(bx + s.breast, widths[1]);
    body += measure(0, H + 150, widths[0], H + 150, `${s.wl} mm`, size);
    if (s.count === 2) body += measure(bx + s.breast, H + 150, W, H + 150, `${s.wr} mm`, size);
    body += measure(-150, 0, -150, H, `${s.h} mm`, size);
  }

  const pad = 330;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-140} ${n(W + pad * 2)} ${n(H + 140 + 330)}" fill="none" font-family="'Spline Sans Mono','Courier New',monospace" aria-hidden="true" focusable="false">${body}</svg>`;
}
