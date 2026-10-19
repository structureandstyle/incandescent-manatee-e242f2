/**
 * The hand-drawn tool glyphs, shared by ProcessStep (the four stages) and
 * NextSteps (the thank-you page). Moved out of ProcessStep.astro 19 Oct 2026
 * so both draw from one set; the note on the plane glyph stays in
 * ProcessStep.astro, beside the stages it describes.
 *
 * Each glyph sits on a 60x44 grid. Strokes scribe in along their own length;
 * the filled tones fade in instead (see FADES).
 */

export type Tone = "bd" | "md" | "chf" | "pfl" | "ppl" | "hl" | "gr";
export type Glyph = [string, Record<string, string | number>, Tone];

const L = (x1: number, y1: number, x2: number, y2: number, t: Tone): Glyph =>
  ["line", { x1, y1, x2, y2 }, t];

export const GLYPHS: Record<string, Glyph[]> = {
  tape: [
    ["circle", { cx: 20, cy: 19, r: 14 }, "bd"],
    ["circle", { cx: 20, cy: 19, r: 8.5 }, "bd"],
    ["circle", { cx: 20, cy: 19, r: 3.5 }, "bd"],
    ["path", { d: "M28.5,6.5 Q37.5,10 37.5,19 L37.5,25.5" }, "bd"],
    L(37.5, 25.5, 51, 25.5, "bd"),
    L(33, 33, 51, 33, "bd"),
    ["rect", { x: 51, y: 23.5, width: 3.6, height: 10.5, rx: 1 }, "bd"],
    L(40, 33, 40, 28.8, "md"),
    L(44, 33, 44, 28.8, "md"),
    L(48, 33, 48, 28.8, "md"),
    ["path", { d: "M26.8,29.3 L29.8,29.3 L29.8,26.3" }, "bd"],
    ["circle", { cx: 23, cy: 28.6, r: 0.9 }, "chf"],
  ],
  pencil: [
    L(47.6, 5.6, 52.4, 12.4, "bd"),
    L(47.6, 5.6, 19.6, 25.6, "bd"),
    L(52.4, 12.4, 24.4, 32.4, "bd"),
    L(43.5, 8.5, 48.3, 15.3, "md"),
    L(45.9, 11.9, 22, 29, "md"),
    L(19.6, 25.6, 24.4, 32.4, "bd"),
    L(19.6, 25.6, 12, 36.5, "bd"),
    L(24.4, 32.4, 12, 36.5, "bd"),
    ["path", { d: "M12,36.5 L14.9,33 L16.4,35.2 Z" }, "chf"],
  ],
  plane: [
    ["path", { d: "M4,36 L56,36" }, "md"],
    ["path", { d: "M4,36 L4,32.5 Q4,31 6,31 L15,31" }, "md"],
    ["circle", { cx: 10.5, cy: 25.8, r: 3.8 }, "md"],
    L(8.7, 31, 9.2, 29.3, "md"),
    L(12.3, 31, 11.8, 29.3, "md"),
    ["path", { d: "M15,31 Q21,30 23.5,26.2" }, "md"],
    L(35, 6.5, 23.5, 26.2, "md"),
    L(38, 8.5, 27.5, 25.5, "md"),
    L(35, 6.5, 38, 8.5, "md"),
    ["circle", { cx: 30.2, cy: 16, r: 2 }, "md"],
    ["circle", { cx: 27.4, cy: 20.3, r: 1.5 }, "md"],
    ["path", { d: "M27.5,25.5 Q30,27.6 32,25.2 C34,15.5 40,12.5 45,13.5 C51.5,15 51,21.5 46.5,26 Q44,28.6 43.6,33.2" }, "md"],
    ["path", { d: "M36.5,28 C36.8,21.5 40,17.5 44,18 C48,18.6 47.4,23 44.2,26.4 Q42.4,28.4 42,31" }, "md"],
    ["path", { d: "M43.6,33.2 L56,33.2 L56,36" }, "md"],
  ],
  square: [
    ["path", { d: "M14,4 L24,4 L24,30 L52,30 L52,40 L14,40 Z" }, "chf"],
    ["circle", { cx: 19, cy: 8.5, r: 1.6 }, "pfl"],
    L(24.6, 30.7, 30.6, 38.7, "ppl"),
    ...[6.2, 8.6, 11, 13.4, 15.8, 18.2, 20.6, 23, 25.4, 27.8].map(
      (y, i): Glyph => L(14, y, i % 2 ? 17 : 18.6, y, "ppl")
    ),
    ...[26, 28.4, 30.8, 33.2, 35.6, 38, 40.4, 42.8, 45.2, 47.6, 50].map(
      (x, i): Glyph => L(x, 40, x, i % 2 ? 37 : 35.4, "ppl")
    ),
    /* the wall it is squared against */
    L(11.5, 2, 11.5, 42.5, "hl"),
    L(11.5, 42.5, 54, 42.5, "hl"),
  ],
  /* The two that come before the process, drawn for the thank-you page in
     the same hand: the enquiry sheet with its tick in green (the one thing
     already done), and the reply. A speech mark rather than an envelope or a
     handset, because the reply comes by phone or by email. */
  sheet: [
    ["path", { d: "M17,3 L37,3 L45,11 L45,41 L17,41 Z" }, "bd"],
    ["path", { d: "M37,3 L37,11 L45,11" }, "md"],
    L(22, 15, 32, 15, "md"),
    L(22, 20.5, 40, 20.5, "md"),
    L(22, 26, 36, 26, "md"),
    ["path", { d: "M24.5,33 L29,37 L38.5,29" }, "gr"],
  ],
  reply: [
    ["path", { d: "M10,5 L50,5 Q53,5 53,8 L53,27 Q53,30 50,30 L27,30 L16,39 L18.5,30 L10,30 Q7,30 7,27 L7,8 Q7,5 10,5 Z" }, "bd"],
    L(15, 13, 45, 13, "md"),
    L(15, 18.5, 41, 18.5, "md"),
    L(15, 24, 31, 24, "md"),
  ],
};

export const ICON_NAMES: Record<string, string> = {
  tape: "measuring tape",
  pencil: "pencil",
  plane: "hand plane",
  square: "try square",
  sheet: "enquiry form",
  reply: "message",
};

export const TONE: Record<Tone, string> = {
  bd: "stroke:var(--char);stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round",
  md: "stroke:var(--char);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round",
  chf: "fill:var(--char);stroke:none",
  pfl: "fill:var(--paper);stroke:none",
  ppl: "stroke:var(--paper);stroke-width:1.2",
  hl: "stroke:var(--hair);stroke-width:1.2",
  gr: "stroke:var(--green);stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round",
};

/* These tones are filled shapes rather than strokes, so they fade rather than draw. */
export const FADES: Record<string, boolean> = { chf: true, pfl: true, ppl: true };
