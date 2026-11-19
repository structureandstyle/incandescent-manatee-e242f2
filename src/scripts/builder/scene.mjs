/**
 * THE 3D VIEW of the design-your-own builder (19 Nov 2026; rebuilt the same
 * day after a founder's review: "the 3d rendering looks very weak", "need to
 * improve image quality", the inside "with leds, shelving, hanging rails,
 * drawers", and Open doors / Closed doors).
 *
 * Loaded only when a visitor opens the builder (the page imports this file on
 * demand), so no other page, and nothing above the builder on this one, waits
 * for a 3D library. The page works without it: the drawing in elevation.mjs
 * shows the same design, and the form, the price and the enquiry never touch
 * this file. Everything is sized from the same describe() the price and the
 * wording read (model.mjs). Nothing here knows a price.
 *
 * WHAT MAKES IT LOOK LIKE FURNITURE RATHER THAN BOXES
 *   - shading where surfaces meet (ambient occlusion), so shelves, recesses
 *     and the gaps between doors read as depth;
 *   - soft shadows from one window-like light, and reflections from a neutral
 *     room, so paint, lacquer, veneer, brass and chrome each look like
 *     themselves;
 *   - edges eased by a millimetre or two, which is what catches the light on
 *     a real door;
 *   - doors that swing on their hinges, with the inside behind them: rails,
 *     hangers and clothes, folded stacks, drawers, and LED strips that light
 *     the carcass when lighting is chosen; shut, the gaps show shadow;
 *   - wood grain sized to each part, as one sheet of veneer would be;
 *   - a camera at about eye height, inside the room when the run is wall to
 *     wall, and a scale person beside an open end rather than over the doors.
 *
 * AND STAYS LIGHT ENOUGH FOR A PHONE
 *   - it draws a frame only when something changed, never in a loop;
 *   - while the picture is being turned it draws the quick version, and the
 *     full one a moment after the hand stops;
 *   - clothes, hangers, books and folded stacks are instanced;
 *   - if the fuller pipeline cannot start on a device, the quick one stays.
 *
 * Units are metres. x runs left to right, y up from the floor, z out from the
 * back wall towards the viewer.
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { COLOURS, describe } from "./model.mjs";

const MM = 0.001;
const T = 0.018; // carcass board
const PLINTH = 0.1;
const TOP_FILL = 0.06; // scribed strip under the ceiling
const WALL_FILL = 0.04; // scribed strip against a wall
const GAP = 0.003;
const DOOR_T = 0.022;
// Just short of square to the run: two doors hinged on the same board then
// stand back to back, as they do on a real wardrobe, instead of crossing.
const OPEN_ANGLE = 1.54;
// The camera starts a few degrees above level, from about eye height, and a
// little round to one side.
const HOME_POLAR = 1.48;
const HOME_AZ = 0.38;

/** A small repeatable random source, so the clothes do not reshuffle on every change. */
const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Quiet clothes: whites, blues, greys and tans, with the odd deep colour. */
const CLOTH = [0xf1ede4, 0xe6dfd2, 0xcfd6dc, 0x9fb0bf, 0x5b6f84, 0x2f3d52, 0x26313f, 0x3a3936, 0x6d6a66, 0xa39a8d, 0xc7b79d, 0x8a6f52, 0x2c4a3a, 0x7c8b76, 0xb5876b, 0xd9c9b8];
const BOOKS = [0x2f3d52, 0x6e4b2a, 0x2c4a3a, 0xd9d2c2, 0xb28451, 0x8a2e1f, 0x3a3936, 0xa39a8d, 0xe6dfd2, 0x5b6f84, 0xc7b79d, 0x7c8b76];

const canvasTexture = (size, draw, { repeat = false, srgb = true } = {}) => {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), size);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
};

/** How much wood one copy of the grain picture stands for, across the grain and along it. */
const GRAIN_W = 0.3;
const GRAIN_L = 1.5;

/**
 * Wood grain for a veneer or oak-effect colour, drawn once per colour: broad
 * bands of tone, fine wavy lines a couple of millimetres apart, pores, and the
 * pale ray flecks of oak. It tiles both ways, so a long part shows no seams.
 */
function grainTexture(hex) {
  // A touch less saturated than the swatch: the warm window light adds the rest back.
  const base = new THREE.Color(hex);
  const grey = base.r * 0.3 + base.g * 0.59 + base.b * 0.11;
  base.lerp(new THREE.Color(grey, grey, grey), 0.12);
  return canvasTexture(512, (g, n) => {
    g.fillStyle = `#${base.getHexString()}`;
    g.fillRect(0, 0, n, n);
    const rnd = seeded(7);
    // A band wraps round the right-hand edge, so the picture tiles side to side.
    const band = (x, w, style) => {
      g.fillStyle = style;
      g.fillRect(x, 0, w, n);
      if (x + w > n) g.fillRect(x - n, 0, w, n);
    };
    for (let i = 0; i < 10; i++) {
      band(rnd() * n, 14 + rnd() * 70, rnd() > 0.45 ? `rgba(60,36,16,${0.02 + rnd() * 0.03})` : `rgba(255,246,228,${0.02 + rnd() * 0.03})`);
    }
    // Each grain line ends at the x it started from, so the picture tiles top to bottom.
    for (let i = 0; i < 170; i++) {
      const x = rnd() * n;
      const sway = (rnd() - 0.5) * 14;
      g.strokeStyle = rnd() > 0.3 ? `rgba(66,40,18,${0.05 + rnd() * 0.12})` : `rgba(255,240,214,${0.04 + rnd() * 0.06})`;
      g.lineWidth = 0.6 + rnd() * 1.6;
      for (const dx of x > n - 20 ? [0, -n] : x < 20 ? [0, n] : [0]) {
        g.beginPath();
        g.moveTo(x + dx, 0);
        g.bezierCurveTo(x + dx + sway, n * 0.3, x + dx - sway, n * 0.7, x + dx, n);
        g.stroke();
      }
    }
    for (let i = 0; i < 420; i++) {
      g.fillStyle = `rgba(50,30,12,${0.06 + rnd() * 0.1})`;
      g.fillRect(rnd() * n, rnd() * n, 0.8 + rnd() * 0.8, 3 + rnd() * 12);
    }
    for (let i = 0; i < 70; i++) {
      g.fillStyle = `rgba(255,244,222,${0.06 + rnd() * 0.1})`;
      g.fillRect(rnd() * n, rnd() * n, 3 + rnd() * 9, 1 + rnd() * 2.5);
    }
  }, { repeat: true });
}

/** An engineered oak floor: boards of uneven length, each a slightly different tone, with fine grain. */
function floorTexture() {
  return canvasTexture(1024, (g, n) => {
    const rnd = seeded(11);
    const rows = 8;
    const rh = n / rows;
    for (let r = 0; r < rows; r++) {
      let x = -rnd() * 500;
      while (x < n) {
        const len = 520 + rnd() * 560;
        const shade = 0.94 + rnd() * 0.1;
        g.fillStyle = `rgb(${Math.round(200 * shade)},${Math.round(176 * shade)},${Math.round(142 * shade)})`;
        g.fillRect(x, r * rh, len, rh);
        for (let i = 0; i < 26; i++) {
          g.fillStyle = `rgba(70,46,24,${0.02 + rnd() * 0.04})`;
          g.fillRect(x + rnd() * len, r * rh + rnd() * rh, 30 + rnd() * 160, 0.6 + rnd() * 1.2);
        }
        g.fillStyle = "rgba(60,40,20,0.3)";
        g.fillRect(x + len - 1.2, r * rh, 1.6, rh);
        x += len;
      }
      g.fillStyle = "rgba(60,40,20,0.28)";
      g.fillRect(0, r * rh, n, 1.6);
    }
  }, { repeat: true });
}

/** Soft vertical folds, used as a bump on cloth so hanging clothes are not flat slabs. */
function foldTexture() {
  return canvasTexture(256, (g, n) => {
    g.fillStyle = "#808080";
    g.fillRect(0, 0, n, n);
    const rnd = seeded(23);
    for (let i = 0; i < 46; i++) {
      const x = rnd() * n, w = 6 + rnd() * 26;
      const grad = g.createLinearGradient(x, 0, x + w, 0);
      const d = rnd() > 0.5 ? 255 : 0;
      grad.addColorStop(0, `rgba(${d},${d},${d},0)`);
      grad.addColorStop(0.5, `rgba(${d},${d},${d},${0.1 + rnd() * 0.16})`);
      grad.addColorStop(1, `rgba(${d},${d},${d},0)`);
      g.fillStyle = grad;
      g.fillRect(x, 0, w, n);
    }
  }, { repeat: true, srgb: false });
}

/** A soft round shade, laid on the floor under the person so they stand rather than float. */
function shadeTexture() {
  return canvasTexture(128, (g, n) => {
    const grad = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
    grad.addColorStop(0, "rgba(34,29,24,0.6)");
    grad.addColorStop(0.55, "rgba(34,29,24,0.22)");
    grad.addColorStop(1, "rgba(34,29,24,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, n, n);
  });
}

/** A standing person as a plain silhouette, the way an architect's drawing shows scale. */
function figureTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 640;
  const g = c.getContext("2d");
  g.fillStyle = "#221d18";
  const blob = (pts) => {
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const [cx, cy, x, y] = pts[i];
      g.quadraticCurveTo(cx, cy, x, y);
    }
    g.closePath();
    g.fill();
  };
  g.beginPath();
  g.ellipse(128, 44, 27, 33, 0, 0, Math.PI * 2);
  g.fill();
  g.fillRect(117, 70, 22, 26);
  // Shoulders, body and hips.
  blob([[128, 90], [84, 92, 72, 112], [66, 190, 86, 300], [84, 330, 90, 348], [128, 356, 166, 348], [172, 330, 170, 300], [190, 190, 184, 112], [172, 92, 128, 90]]);
  // Arms, hanging a little away from the body.
  blob([[74, 108], [52, 118, 50, 190], [46, 260, 44, 330], [42, 350, 54, 352], [66, 350, 66, 330], [70, 250, 82, 170], [84, 120, 74, 108]]);
  blob([[182, 108], [204, 118, 206, 190], [210, 260, 212, 330], [214, 350, 202, 352], [190, 350, 190, 330], [186, 250, 174, 170], [172, 120, 182, 108]]);
  // Legs and feet.
  blob([[90, 336], [86, 430, 94, 520], [92, 580, 96, 612], [84, 626, 100, 630], [122, 630, 122, 614], [124, 520, 128, 344], [110, 332, 90, 336]]);
  blob([[166, 336], [170, 430, 162, 520], [164, 580, 160, 612], [172, 626, 156, 630], [134, 630, 134, 614], [132, 520, 128, 344], [146, 332, 166, 336]]);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createView(canvas, { onLost, onRestored } = {}) {
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  // On a computer the picture is drawn at twice its size and shrunk by the
  // browser: on an ordinary screen that clears the grain the corner shading
  // leaves and sharpens every edge (about 55 ms a picture on a laptop's own
  // graphics chip). A phone already has the pixels, so it draws at its own.
  renderer.setPixelRatio(small ? Math.min(window.devicePixelRatio || 1, 2) : 2);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // The neutral curve keeps a paint colour the colour it was picked as.
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.02;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0ebe0);
  /** Drawn after the shading pass: the scale figure, which must not cast a shade of its own. */
  const overlay = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
  scene.environment = envTexture;
  scene.environmentIntensity = 0.72;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  // The wheel scrolls the page and a vertical swipe scrolls it too: a 3D view
  // that swallows both traps a phone visitor above it. Zoom is on the buttons.
  controls.enableZoom = false;
  controls.rotateSpeed = 0.7;
  controls.minAzimuthAngle = -1.05;
  controls.maxAzimuthAngle = 1.05;
  controls.minPolarAngle = 1.05;
  controls.maxPolarAngle = 1.56;
  canvas.style.touchAction = "pan-y";

  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfc6b4, 0.32));
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  sun.shadow.radius = 5;
  sun.shadow.blurSamples = small ? 8 : 14;
  sun.shadow.bias = -0.00025;
  sun.shadow.normalBias = 0.012;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xe9eef5, 0.5);
  scene.add(fill);

  /* ---- The fuller pipeline: shading in corners, a glow on the LEDs -------- */

  let composer = null;
  let aoPass = null;
  let bloomPass = null;
  try {
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    const target = new THREE.WebGLRenderTarget(Math.max(1, size.x), Math.max(1, size.y), { type: THREE.HalfFloatType, samples: small ? 2 : 4 });
    composer = new EffectComposer(renderer, target);
    composer.addPass(new RenderPass(scene, camera));
    aoPass = new GTAOPass(scene, camera, Math.max(1, size.x), Math.max(1, size.y));
    // A tight radius and a broad, forgiving smoothing pass: a wider radius
    // left a speckled fringe round every garment and door edge.
    aoPass.blendIntensity = 1;
    aoPass.updateGtaoMaterial({ radius: 0.16, distanceExponent: 2, thickness: 0.4, scale: 1.2, samples: small ? 14 : 24, distanceFallOff: 1, screenSpaceRadius: false });
    aoPass.updatePdMaterial({ lumaPhi: 10, depthPhi: 6, normalPhi: 1, radius: 14, radiusExponent: 1.2, rings: 4, samples: small ? 20 : 32 });
    composer.addPass(aoPass);
    bloomPass = new UnrealBloomPass(new THREE.Vector2(Math.max(1, size.x), Math.max(1, size.y)), 0.22, 0.55, 1.7);
    bloomPass.enabled = false;
    composer.addPass(bloomPass);
    const figures = new RenderPass(overlay, camera);
    figures.clear = false;
    figures.clearDepth = true;
    composer.addPass(figures);
    composer.addPass(new OutputPass());
  } catch {
    composer = null; // an older phone: the quick drawing is the drawing
  }

  /* ---- Shared shapes, materials and textures ----------------------------- */

  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const softBox = new RoundedBoxGeometry(1, 1, 1, 3, 0.16); // scaled per garment or folded layer
  const ball = new THREE.SphereGeometry(1, 24, 16);
  const rod = new THREE.CylinderGeometry(1, 1, 1, 18);
  const plane = new THREE.PlaneGeometry(1, 1);
  const geos = new Map();
  let used = new Set();
  /** A box with eased edges, cached by size so eight identical doors share one shape. */
  const rounded = (w0, h0, d0, r) => {
    const w = Math.max(w0, 0.001), h = Math.max(h0, 0.001), d = Math.max(d0, 0.001);
    const rr = Math.max(0.0004, Math.min(r, Math.min(w, h, d) / 2 - 0.0002));
    const key = [w, h, d, rr].map((v) => Math.round(v * 20000)).join("x");
    used.add(key);
    if (!geos.has(key)) geos.set(key, new RoundedBoxGeometry(w, h, d, 2, rr));
    return geos.get(key);
  };

  const materials = new Map();
  const textures = [];
  const keep = (t) => { textures.push(t); return t; };
  const mat = (key, make) => {
    if (!materials.has(key)) materials.set(key, make());
    return materials.get(key);
  };
  const flat = (key, color, roughness = 0.85, metalness = 0) =>
    mat(key, () => new THREE.MeshStandardMaterial({ color, roughness, metalness }));

  const floorMap = keep(floorTexture());
  const foldMap = keep(foldTexture());
  const figureMap = keep(figureTexture());
  const shadeMap = keep(shadeTexture());

  const woodSources = new Map();
  const woodMats = new Map();
  let usedWood = new Set();
  const woodSource = (hex) => {
    if (!woodSources.has(hex)) woodSources.set(hex, keep(grainTexture(hex)));
    return woodSources.get(hex);
  };

  /**
   * The finish for a part, in an example colour. A plain finish is one
   * material. Wood is a recipe that `surface` turns into each part's own grain;
   * `across` runs the grain along rails, tops and shelves; `tint` darkens a
   * set-back panel a touch.
   */
  const finishMaterial = (finish, colour, across = false, tint = 1) => {
    const c = COLOURS[finish][colour];
    // Melamine a soft sheen, hand-painted matt, sprayed a satin lacquer, veneer lacquered.
    const roughness = [0.5, 0.82, 0.34, 0.46][finish];
    if (c.grain) return { wood: true, hex: c.hex, roughness, across, tint, key: `${finish}-${colour}` };
    return mat(`finish-${finish}-${colour}-${tint}`, () => {
      const m = new THREE.MeshStandardMaterial({ color: c.hex, roughness, metalness: 0 });
      m.color.multiplyScalar(tint);
      return m;
    });
  };

  /**
   * The material for one part of the given size. Wood gets its grain scaled to
   * the part, so a narrow stile, a wide panel and a long filler all show grain
   * of the same size, as one sheet of veneer would.
   */
  const surface = (m, w, h, d) => {
    if (!m?.wood) return m;
    const across = m.across ? Math.max(h, d) : Math.max(w, d);
    const along = m.across ? w : h;
    const a = Math.max(0.02, Math.round(across * 50) / 50);
    const l = Math.max(0.2, Math.round(along * 5) / 5);
    const key = `${m.key}-${m.across ? "h" : "v"}-${m.tint}-${a}-${l}`;
    usedWood.add(key);
    if (!woodMats.has(key)) {
      const t = woodSource(m.hex).clone(); // shares the picture; only the scale is its own
      t.repeat.set(a / GRAIN_W, l / GRAIN_L);
      if (m.across) { t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; }
      t.needsUpdate = true;
      const wood = new THREE.MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: 0.3, roughness: m.roughness, metalness: 0 });
      wood.color.setScalar(m.tint);
      woodMats.set(key, wood);
    }
    return woodMats.get(key);
  };

  /* ---- State -------------------------------------------------------------- */

  let group = null;
  let figure = null;
  let doors = [];
  let openAmount = 0;
  let openTarget = 0;
  let raf = 0;
  let fineTimer = 0;
  let anim = 0;
  let fit = null;
  let lost = false;
  const state = { design: null, options: { open: false, person: true }, bounds: null, lit: false };

  function turnFigure() {
    if (!figure) return;
    figure.rotation.y = Math.atan2(camera.position.x - figure.position.x, camera.position.z - figure.position.z);
  }

  function drawQuick() {
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
    if (overlay.children.length) {
      renderer.autoClear = false;
      renderer.clearDepth();
      renderer.render(overlay, camera);
      renderer.autoClear = true;
    }
    canvas.dataset.dyoDrawn = "quick"; // which picture is on screen, for checks
  }
  function drawFull() {
    if (!composer) { drawQuick(); return; }
    composer.render();
    canvas.dataset.dyoDrawn = "full";
  }
  /** The full picture, on the next frame. */
  const requestRender = () => {
    if (lost) return;
    clearTimeout(fineTimer);
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (!lost) { turnFigure(); drawFull(); } });
  };
  /** The quick picture now, and the full one once things have been still for a moment. */
  const requestQuick = () => {
    if (lost) return;
    turnFigure();
    drawQuick();
    clearTimeout(fineTimer);
    fineTimer = setTimeout(requestRender, 170);
  };
  controls.addEventListener("change", requestQuick);

  /* ---- Building a design -------------------------------------------------- */

  function build(design, { inside = false, person = true } = {}) {
    const s = describe(design);
    const g = new THREE.Group();
    const lights = [];
    const doorList = [];
    const finish = finishMaterial(s.finish, s.colour);
    const finishAcross = finishMaterial(s.finish, s.colour, true);
    const panel = finishMaterial(s.finish, s.colour, false, 0.93);
    const carcass = flat("carcass", 0xece6da, 0.62);
    const carcassEdge = flat("carcass-edge", 0xe2dbcd, 0.62);
    const drawerFront = flat("drawer-front", 0xe6dfd1, 0.55);
    const wall = flat("wall", 0xf3efe6, 0.96);
    const trim = flat("trim", 0xf8f6f0, 0.55);
    const plinthMat = flat("plinth", 0x2a2622, 0.8);
    const chrome = flat("chrome", 0xd8d8d6, 0.18, 1);
    const brass = flat("brass", 0xb8935a, 0.3, 1);
    const channel = flat("led-channel", 0xc9c9c6, 0.4, 0.9);
    const glow = mat("glow", () => new THREE.MeshStandardMaterial({ color: 0xfff4de, emissive: 0xffe2b0, emissiveIntensity: 4.2, roughness: 1 }));
    const mirror = flat("mirror", 0xffffff, 0.03, 1);
    // Unlit, a shade under the walls: a lit ceiling facing away from the window goes grey.
    const ceiling = mat("ceiling", () => new THREE.MeshBasicMaterial({ color: 0xe6e1d7 }));
    const darkInside = flat("dark-inside", 0x2a2521, 1);
    const floor = mat("floor", () => new THREE.MeshStandardMaterial({ map: floorMap, roughness: 0.58, metalness: 0 }));
    const cloth = mat("cloth", () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.94, bumpMap: foldMap, bumpScale: 1.6 }));
    const paper = flat("paper", 0xffffff, 0.9);

    /** A part with eased edges, from its lower-left-back corner and its size. */
    const piece = (m, x0, y0, z0, w, h, d, { r = 0.002, cast = true, receive = true, parent = g } = {}) => {
      const mesh = new THREE.Mesh(rounded(w, h, d, r), surface(m, w, h, d));
      mesh.position.set(x0 + w / 2, y0 + h / 2, z0 + d / 2);
      mesh.castShadow = cast;
      mesh.receiveShadow = receive;
      parent.add(mesh);
      return mesh;
    };
    /** A plain block: backs, walls and other parts whose edges are never seen. */
    const block = (m, x0, y0, z0, w, h, d, { cast = true, receive = true, parent = g } = {}) => {
      const mesh = new THREE.Mesh(unitBox, surface(m, w, h, d));
      mesh.scale.set(Math.max(w, 1e-4), Math.max(h, 1e-4), Math.max(d, 1e-4));
      mesh.position.set(x0 + w / 2, y0 + h / 2, z0 + d / 2);
      mesh.castShadow = cast;
      mesh.receiveShadow = receive;
      parent.add(mesh);
      return mesh;
    };
    /** A wall seen only from inside the room, so turning the view never hides the furniture. */
    const sheet = (m, w, h, x, y, z, ry = 0, rx = 0) => {
      const mesh = new THREE.Mesh(plane, m);
      mesh.scale.set(w, h, 1);
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, 0);
      mesh.receiveShadow = true;
      g.add(mesh);
      return mesh;
    };
    const cylinder = (m, radius, length, x, y, z, axis = "y", parent = g) => {
      const mesh = new THREE.Mesh(rod, m);
      mesh.scale.set(radius, length, radius);
      if (axis === "x") mesh.rotation.z = Math.PI / 2;
      if (axis === "z") mesh.rotation.x = Math.PI / 2;
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      parent.add(mesh);
      return mesh;
    };

    // Instanced: everything soft (clothes, folded stacks), hanger hooks, books.
    const softs = [];
    const hooks = [];
    const hards = [];
    const soft = (cx, cy, cz, w, h, d, color, ry = 0) => softs.push([cx, cy, cz, w, h, d, color, ry]);
    const hard = (x0, y0, z0, w, h, d, color, rz = 0) => hards.push([x0 + w / 2, y0 + h / 2, z0 + d / 2, w, h, d, color, rz]);

    /** A handle on a door or drawer, in the door's own space when a parent is given. */
    const handle = (x, y, z, { vertical = true, parent = g, long = 0.24 } = {}) => {
      if (s.handle === "none") return;
      if (s.handle === "knob") {
        const k = new THREE.Mesh(ball, brass);
        k.scale.set(0.016, 0.016, 0.011);
        k.position.set(x, y, z + 0.026);
        k.castShadow = true;
        parent.add(k);
        cylinder(brass, 0.0055, 0.02, x, y, z + 0.01, "z", parent);
        return;
      }
      cylinder(brass, 0.0058, long, x, y, z + 0.03, vertical ? "y" : "x", parent);
      for (const o of [-long / 2 + 0.035, long / 2 - 0.035]) {
        cylinder(brass, 0.0045, 0.03, vertical ? x : x + o, vertical ? y + o : y, z + 0.015, "z", parent);
      }
    };

    /**
     * One door, hung on its hinge edge so it can swing. Flat, or a Shaker
     * frame around a set-back panel. `inner` adds a mirror to its inside face.
     */
    const door = ({ hinge, x, y0, w, h, z, handleY, inner = false, withHandle = true }) => {
      const pivot = new THREE.Group();
      pivot.position.set(x, y0, z);
      pivot.userData.swing = hinge === "left" ? -1 : 1;
      g.add(pivot);
      const x0 = hinge === "left" ? 0 : -w;
      const opts = { parent: pivot, r: 0.0022 };
      if (s.door === "flat") {
        piece(finish, x0, 0, -DOOR_T, w, h, DOOR_T, opts);
      } else {
        const f = Math.max(0.055, Math.min(0.085, w * 0.2));
        piece(finish, x0, 0, -DOOR_T, f, h, DOOR_T, opts);
        piece(finish, x0 + w - f, 0, -DOOR_T, f, h, DOOR_T, opts);
        piece(finishAcross, x0 + f, 0, -DOOR_T, w - 2 * f, f, DOOR_T, opts);
        piece(finishAcross, x0 + f, h - f, -DOOR_T, w - 2 * f, f, DOOR_T, opts);
        block(panel, x0 + f - 0.002, f - 0.002, -DOOR_T + 0.004, w - 2 * f + 0.004, h - 2 * f + 0.004, 0.008, { parent: pivot });
        // The back of the door is one plain face.
        block(finish, x0 + 0.004, 0.004, -DOOR_T - 0.0006, w - 0.008, h - 0.008, 0.004, { parent: pivot, cast: false });
      }
      if (inner) block(mirror, x0 + 0.06, 0.12, -DOOR_T - 0.004, w - 0.12, h - 0.24, 0.004, { parent: pivot, cast: false });
      if (withHandle) handle(hinge === "left" ? w - 0.042 : -w + 0.042, handleY - y0, 0, { parent: pivot });
      // Two hinge plates on the carcass side, seen once the door is open.
      for (const hy of [0.12, h - 0.12]) block(chrome, hinge === "left" ? 0.002 : -0.034, hy - 0.025, -DOOR_T - 0.014, 0.032, 0.05, 0.012, { parent: pivot, cast: false });
      doorList.push(pivot);
      return pivot;
    };

    /** An LED strip in its channel, facing down or back, and the warm light it gives. */
    const led = (x0, x1, y, z, { light = true, reach = 1.4 } = {}) => {
      block(channel, x0, y - 0.006, z - 0.009, x1 - x0, 0.006, 0.018, { cast: false, receive: false });
      block(glow, x0 + 0.004, y - 0.0085, z - 0.006, x1 - x0 - 0.008, 0.003, 0.012, { cast: false, receive: false });
      if (light && lights.length < 6) {
        const p = new THREE.PointLight(0xffdcae, 0.85, reach, 1.6);
        p.position.set((x0 + x1) / 2, y - 0.06, z + 0.02);
        g.add(p);
        lights.push(p);
      }
    };

    /** A rail in its sockets, with hangers and clothes on it. */
    const hanging = (rnd, ax, bx, yRail, length, zf) => {
      const cd = Math.min(0.44, zf - 0.07);
      const cz = 0.03 + (zf - 0.03 - cd) / 2 + cd / 2; // centre, front to back
      cylinder(chrome, 0.0125, bx - ax, (ax + bx) / 2, yRail, cz, "x");
      for (const ex of [ax + 0.006, bx - 0.006]) cylinder(chrome, 0.02, 0.012, ex, yRail, cz, "x");
      let x = ax + 0.035 + rnd() * 0.02;
      while (x < bx - 0.05) {
        const thick = 0.026 + rnd() * 0.03;
        const len = Math.max(0.3, length * (0.62 + rnd() * 0.38));
        const depth = cd * (0.86 + rnd() * 0.14);
        const colour = CLOTH[Math.floor(rnd() * CLOTH.length)];
        soft(x + thick / 2, yRail - 0.055 - len / 2, cz + (rnd() - 0.5) * 0.02, thick, len, depth, colour, (rnd() - 0.5) * 0.16);
        hooks.push([x + thick / 2, yRail - 0.02, cz, 0.0028, 0.07]);
        // The hanger's shoulders, a dark line across the top of each garment.
        hard(x + thick / 2 - 0.004, yRail - 0.062, cz - depth / 2, 0.008, 0.012, depth, 0x3a2e24);
        x += thick + 0.006 + rnd() * 0.012;
      }
    };

    /** Folded clothes in stacks along a shelf, and now and then a storage box. */
    const stacks = (rnd, ax, bx, y, room, zf) => {
      const slot = 0.34;
      const deep = Math.max(0.12, Math.min(0.32, zf - 0.05)); // never deeper than the carcass
      const count = Math.max(1, Math.floor((bx - ax - 0.04) / slot));
      const start = ax + (bx - ax - count * slot) / 2;
      for (let k = 0; k < count; k++) {
        const roll = rnd();
        const cx = start + slot * (k + 0.5);
        if (roll < 0.16) continue;
        if (roll > 0.84 && room > 0.2) {
          const bh = Math.min(room - 0.04, 0.16 + rnd() * 0.06);
          piece(flat("box", 0xd8ccb6, 0.9), cx - 0.14, y, zf - 0.03 - deep, 0.28, bh, deep, { r: 0.006 });
          block(flat("box-lid", 0xcbbda3, 0.9), cx - 0.145, y + bh - 0.03, zf - 0.035 - deep, 0.29, 0.03, deep + 0.01, { cast: false });
          block(brass, cx - 0.03, y + bh * 0.4, zf - 0.03, 0.06, 0.02, 0.002, { cast: false, receive: false });
          continue;
        }
        const layers = Math.max(1, Math.min(6, Math.floor((room - 0.05) / 0.038), 2 + Math.floor(rnd() * 4)));
        for (let i = 0; i < layers; i++) {
          const lw = 0.25 + rnd() * 0.035, ld = deep * (0.9 + rnd() * 0.1);
          soft(cx + (rnd() - 0.5) * 0.012, y + 0.019 + i * 0.037, zf - 0.035 - ld / 2, lw, 0.04, ld, CLOTH[Math.floor(rnd() * CLOTH.length)], (rnd() - 0.5) * 0.05);
        }
      }
    };

    let bounds;
    let personAt;
    let side;

    if (s.unit === "wardrobe") {
      const w = s.w * MM, h = s.h * MM, d = s.d * MM;
      const wallL = s.fit === "both" || s.fit === "left";
      const wallR = s.fit === "both" || s.fit === "right";
      const mL = wallL ? WALL_FILL : T, mR = wallR ? WALL_FILL : T;
      const x0 = -w / 2, x1 = w / 2;
      const iw = w - mL - mR;
      const dw = iw / s.doors;
      const doorH = h - PLINTH - TOP_FILL;
      const padL = wallL ? 0 : 1.1, padR = wallR ? 0 : 1.1;

      // The room. The floor and side walls run well past the viewer, so no edge of it shows.
      const run = d + 9;
      const roomW = w + padL + padR, roomX = (x0 - padL + x1 + padR) / 2;
      sheet(wall, roomW + 4, h, roomX, h / 2, 0);
      if (wallL) sheet(wall, run, h, x0, h / 2, run / 2, Math.PI / 2);
      if (wallR) sheet(wall, run, h, x1, h / 2, run / 2, -Math.PI / 2);
      const floorW = roomW + (wallL ? 0 : 6) + (wallR ? 0 : 6);
      const floorX = roomX + ((wallR ? 0 : 3) - (wallL ? 0 : 3));
      sheet(floor, floorW, run, floorX, 0, run / 2, 0, -Math.PI / 2);
      sheet(ceiling, floorW, run, floorX, h, run / 2, 0, Math.PI / 2);
      floorMap.repeat.set(floorW / 1.6, run / 1.6);
      // Skirting, wherever the wall is left bare.
      const skirt = (ax, bx) => { if (bx - ax > 0.02) piece(trim, ax, 0, 0, bx - ax, 0.12, 0.016, { r: 0.004 }); };
      if (!wallL) skirt(x0 - 4, x0);
      if (!wallR) skirt(x1, x1 + 4);
      if (wallL) piece(trim, x0, 0, d + 0.002, 0.016, 0.12, run - d - 0.002, { r: 0.004 });
      if (wallR) piece(trim, x1 - 0.016, 0, d + 0.002, 0.016, 0.12, run - d - 0.002, { r: 0.004 });

      // Fillers to a wall, or an end panel on an open side; the strip under the ceiling; the plinth.
      if (wallL) piece(finish, x0, 0, d - DOOR_T, WALL_FILL, h, DOOR_T); else piece(finish, x0, 0, 0, T, h, d);
      if (wallR) piece(finish, x1 - WALL_FILL, 0, d - DOOR_T, WALL_FILL, h, DOOR_T); else piece(finish, x1 - T, 0, 0, T, h, d);
      piece(finishAcross, x0 + mL, h - TOP_FILL, d - DOOR_T, iw, TOP_FILL, DOOR_T);
      block(plinthMat, x0 + mL, 0, d - 0.07, iw, PLINTH, 0.02);

      // The carcass: back, top, bottom and a board between sections.
      const cd = d - DOOR_T - 0.004; // how deep the carcass runs
      block(carcass, x0 + mL, PLINTH, 0.001, iw, doorH, 0.006, { cast: false });
      block(carcass, x0 + mL, PLINTH, 0.006, iw, T, cd - 0.006);
      block(carcass, x0 + mL, h - TOP_FILL - T, 0.006, iw, T, cd - 0.006);
      let cursor = x0 + mL;
      const sectionX = [];
      s.sections.forEach((n, i) => {
        const sw = n * dw;
        sectionX.push([cursor, cursor + sw]);
        block(carcassEdge, cursor, PLINTH, 0.006, i === 0 ? T : T / 2, doorH, cd - 0.006);
        const last = i === s.sections.length - 1;
        block(carcassEdge, cursor + sw - (last ? T : T / 2), PLINTH, 0.006, last ? T : T / 2, doorH, cd - 0.006);
        cursor += sw;
      });

      // The doors, each on its own hinge edge.
      const handleY = PLINTH + Math.min(1.05, doorH * 0.48);
      let index = 0;
      s.sections.forEach((n, si) => {
        for (let k = 0; k < n; k++, index++) {
          const left = x0 + mL + index * dw + GAP / 2;
          const hinge = n === 2 ? (k === 0 ? "left" : "right") : "right";
          door({
            hinge, x: hinge === "left" ? left : left + dw - GAP, y0: PLINTH + GAP, w: dw - GAP, h: doorH - 2 * GAP, z: d,
            handleY, inner: s.extras.includes("mirror") && si === 0 && k === 0,
          });
        }
      });

      // Shut, a wardrobe is dark inside: the hairline gaps between doors show shadow, not a lit back panel.
      if (!inside) block(darkInside, x0 + mL, PLINTH + 0.002, cd - 0.004, iw, doorH - 0.004, 0.002, { cast: false, receive: false });

      if (inside) {
        const yBot = PLINTH + T, yTop = h - TOP_FILL - T, H = yTop - yBot;
        const zf = cd - 0.012; // how far forward the inside reaches
        const lit = s.extras.includes("lighting");
        const shoes = s.extras.includes("shoes");
        const pullouts = s.extras.includes("pullouts");
        const shelf = (ax, bx, y) => piece(carcass, ax, y, 0.008, bx - ax, T, zf - 0.02, { r: 0.0015 });
        sectionX.forEach(([sx0, sx1], si) => {
          const rnd = seeded(31 + si * 17);
          const ax = sx0 + (si === 0 ? T : T / 2) + 0.002, bx = sx1 - (si === sectionX.length - 1 ? T : T / 2) - 0.002;
          const iwid = bx - ax;
          const kind = s.inside[si];
          const drawers = () => {
            const dh = 0.2;
            for (let k = 0; k < 3; k++) {
              piece(drawerFront, ax + 0.002, yBot + k * dh + 0.003, zf - 0.02, iwid - 0.004, dh - 0.006, 0.019, { r: 0.002 });
              cylinder(chrome, 0.005, Math.min(0.32, iwid * 0.45), (ax + bx) / 2, yBot + k * dh + dh * 0.62, zf + 0.022, "x");
              for (const o of [-1, 1]) cylinder(chrome, 0.004, 0.024, (ax + bx) / 2 + o * Math.min(0.14, iwid * 0.2), yBot + k * dh + dh * 0.62, zf + 0.01, "z");
            }
            shelf(ax, bx, yBot + 3 * dh);
            return yBot + 3 * dh + T;
          };
          const shelves = (from, to, count) => {
            const step = (to - from) / (count + 1);
            for (let k = 1; k <= count; k++) {
              const y = from + step * k;
              shelf(ax, bx, y);
              stacks(rnd, ax, bx, y + T, step - T, zf);
              if (lit) led(ax + 0.02, bx - 0.02, y - 0.001, zf - 0.06, { light: false });
            }
            stacks(rnd, ax, bx, from, step, zf);
          };
          /** The lowest part of a hanging section: a shoe shelf or a pull-out, when chosen. */
          const floorKit = (top) => {
            if (shoes && top - yBot > 0.42) {
              for (const sy of [yBot + 0.02, yBot + 0.2]) {
                const tilt = new THREE.Group();
                tilt.position.set(0, sy + 0.05, zf - 0.02);
                tilt.rotation.x = 0.3;
                g.add(tilt);
                block(carcass, ax, 0, -0.34, iwid, 0.014, 0.34, { parent: tilt });
                block(chrome, ax, 0.014, -0.012, iwid, 0.012, 0.008, { parent: tilt });
                for (let x = ax + 0.05; x < bx - 0.2; x += 0.24) {
                  const tone = [0x2a2622, 0x6e4b2a, 0xe6dfd2, 0x3a3936][Math.floor(rnd() * 4)];
                  for (const o of [0, 0.105]) {
                    piece(flat(`shoe-${tone}`, tone, 0.6), x + o, 0.014, -0.3, 0.09, 0.07, 0.27, { r: 0.03, parent: tilt });
                  }
                }
              }
              return yBot + 0.42;
            }
            if (pullouts && top - yBot > 0.3) {
              // A pull-out trouser rail, drawn half out with a few pairs over it.
              block(chrome, ax + 0.01, yBot + 0.2, zf - 0.26, 0.012, 0.016, 0.42);
              block(chrome, bx - 0.022, yBot + 0.2, zf - 0.26, 0.012, 0.016, 0.42);
              for (let i = 0; i < 6; i++) {
                const z = zf - 0.22 + i * 0.065;
                cylinder(chrome, 0.005, iwid - 0.03, (ax + bx) / 2, yBot + 0.208, z, "x");
                if (i % 2 === 0) soft((ax + bx) / 2, yBot + 0.11, z, iwid * 0.7, 0.2, 0.03, CLOTH[4 + Math.floor(rnd() * 5)]);
              }
              return yBot + 0.3;
            }
            return yBot;
          };

          if (kind === "hang") {
            shelf(ax, bx, yTop - 0.32);
            stacks(rnd, ax, bx, yTop - 0.32 + T, 0.3, zf);
            const low = floorKit(yTop - 0.4);
            hanging(rnd, ax, bx, yTop - 0.4, Math.min(1.35, yTop - 0.4 - low - 0.14), zf);
          } else if (kind === "double") {
            const low = floorKit(yBot + H * 0.5);
            hanging(rnd, ax, bx, yTop - 0.09, Math.min(0.98, H * 0.5 - 0.2), zf);
            hanging(rnd, ax, bx, yBot + H * 0.5, Math.min(0.98, yBot + H * 0.5 - low - 0.14), zf);
          } else if (kind === "hang-shelves") {
            const mid = yBot + H * 0.44;
            shelf(ax, bx, mid);
            hanging(rnd, ax, bx, yTop - 0.09, Math.min(1.05, yTop - 0.09 - mid - 0.16), zf);
            shelves(yBot, mid, 2);
          } else if (kind === "shelves") {
            shelves(yBot, yTop, 5);
          } else if (kind === "hang-drawers") {
            const top = drawers();
            hanging(rnd, ax, bx, yTop - 0.09, Math.min(1.25, yTop - 0.09 - top - 0.14), zf);
          } else {
            const top = drawers();
            shelves(top, yTop, 3);
          }
          if (lit) led(ax + 0.02, bx - 0.02, yTop - 0.001, zf - 0.05, { reach: Math.min(2.4, H * 0.9) });
        });
      }

      // The camera starts on an open end, or inside the room when the run is wall to wall.
      side = s.fit === "both" ? "inside" : s.fit === "right" ? "left" : "right";
      // The person stands beside the open end the camera looks from. Wall to wall
      // there is no beside, so in front of the left end, where the least is hidden.
      personAt = s.fit === "both" ? [x0 + 0.34, d + 0.75] : side === "left" ? [x0 - 0.42, d + 0.12] : [x1 + 0.42, d + 0.12];
      bounds = [x0 - (wallL ? 0 : side === "left" ? 0.55 : 0.3), x1 + (wallR ? 0 : side === "right" ? 0.55 : 0.3), h, d];
    } else {
      const h = s.h * MM, d = s.d * MM, breast = s.breast * MM, base = s.base * MM;
      const wl = s.wl * MM, wr = (s.count === 2 ? s.wr : s.wl) * MM;
      const xL = -(breast / 2 + wl), xR = breast / 2 + wr;
      const roomW = xR - xL, roomX = (xL + xR) / 2;
      const baseD = Math.max(d, 0.3);
      const run = baseD + 9;

      sheet(wall, roomW, h, roomX, h / 2, 0);
      sheet(wall, run, h, xL, h / 2, run / 2, Math.PI / 2);
      sheet(wall, run, h, xR, h / 2, run / 2, -Math.PI / 2);
      sheet(floor, roomW, run, roomX, 0, run / 2, 0, -Math.PI / 2);
      sheet(ceiling, roomW, run, roomX, h, run / 2, 0, Math.PI / 2);
      floorMap.repeat.set(roomW / 1.6, run / 1.6);
      piece(trim, xL, 0, baseD + 0.02, 0.016, 0.12, run - baseD - 0.02, { r: 0.004 });
      piece(trim, xR - 0.016, 0, baseD + 0.02, 0.016, 0.12, run - baseD - 0.02, { r: 0.004 });

      // The chimney breast, with a plain stone fireplace and something on the mantel.
      block(wall, -breast / 2, 0, 0, breast, h, d);
      const fw = Math.min(0.66, breast - 0.52), fh = 0.74;
      const stone = flat("stone", 0xe4ded0, 0.82);
      block(flat("hearth-dark", 0x1f1c19, 1), -fw / 2, 0, d - 0.16, fw, fh, 0.17, { cast: false });
      piece(stone, -fw / 2 - 0.15, 0, d, 0.15, fh + 0.02, 0.06, { r: 0.005 });
      piece(stone, fw / 2, 0, d, 0.15, fh + 0.02, 0.06, { r: 0.005 });
      piece(stone, -fw / 2 - 0.15, fh, d, fw + 0.3, 0.15, 0.06, { r: 0.005 });
      piece(stone, -fw / 2 - 0.23, fh + 0.15, d, fw + 0.46, 0.05, 0.15, { r: 0.006 });
      piece(stone, -fw / 2 - 0.24, 0, d, fw + 0.48, 0.03, 0.4, { r: 0.004 });
      const skirtL = -fw / 2 - 0.24, skirtR = fw / 2 + 0.24;
      if (skirtL + breast / 2 > 0.03) {
        piece(trim, -breast / 2, 0, d, skirtL + breast / 2, 0.12, 0.016, { r: 0.004 });
        piece(trim, skirtR, 0, d, breast / 2 - skirtR, 0.12, 0.016, { r: 0.004 });
      }
      // A round mirror over the mantel, and two things standing on it.
      if (breast > 0.9 && h - (fh + 0.2) > 0.9) {
        const my = fh + 0.2 + Math.min(0.62, (h - fh - 0.2) * 0.42);
        const mr = Math.min(0.3, breast * 0.24);
        const frame = new THREE.Mesh(rod, brass);
        frame.scale.set(mr, 0.018, mr);
        frame.rotation.x = Math.PI / 2;
        frame.position.set(0, my, d + 0.012);
        frame.castShadow = true;
        g.add(frame);
        const glass = new THREE.Mesh(rod, mirror);
        glass.scale.set(mr - 0.014, 0.004, mr - 0.014);
        glass.rotation.x = Math.PI / 2;
        glass.position.set(0, my, d + 0.021);
        g.add(glass);
        cylinder(flat("vase", 0xdcd5c6, 0.5), 0.04, 0.2, -fw / 2 - 0.08, fh + 0.3, d + 0.075);
        cylinder(flat("candle", 0xf4efe4, 0.7), 0.014, 0.17, fw / 2 + 0.05, fh + 0.285, d + 0.075);
        cylinder(brass, 0.03, 0.012, fw / 2 + 0.05, fh + 0.206, d + 0.075);
      }

      const lit = s.extras.includes("lighting");
      const withDrawers = s.extras.includes("drawers");
      const unit = (ax, bx, seed) => {
        const rnd = seeded(seed);
        const aw = bx - ax;
        const f = 0.02;
        const topT = 0.03;
        block(plinthMat, ax, 0, baseD - 0.07, aw, PLINTH, 0.02);
        block(carcass, ax, PLINTH, 0.003, aw, base - PLINTH - topT, 0.006, { cast: false });
        block(carcass, ax + f, PLINTH, 0.006, aw - 2 * f, T, baseD - DOOR_T - 0.012);
        piece(finish, ax, PLINTH, 0.006, f, base - PLINTH - topT, baseD - 0.006);
        piece(finish, bx - f, PLINTH, 0.006, f, base - PLINTH - topT, baseD - 0.006);
        piece(finishAcross, ax, base - topT, 0, aw, topT, baseD + 0.018, { r: 0.004 });
        const dw = (aw - 2 * f) / 2;
        let doorTop = base - topT - GAP;
        if (withDrawers) {
          const dh = 0.17;
          piece(finishAcross, ax + f + GAP / 2, doorTop - dh, baseD - DOOR_T, aw - 2 * f - GAP, dh, DOOR_T);
          handle((ax + bx) / 2, doorTop - dh / 2, baseD, { vertical: false, long: Math.min(0.24, aw * 0.3) });
          doorTop -= dh + GAP;
        }
        const doorH = doorTop - PLINTH - GAP;
        const hy = PLINTH + GAP + doorH - 0.13;
        door({ hinge: "left", x: ax + f + GAP / 2, y0: PLINTH + GAP, w: dw - GAP, h: doorH, z: baseD, handleY: hy });
        door({ hinge: "right", x: bx - f - GAP / 2, y0: PLINTH + GAP, w: dw - GAP, h: doorH, z: baseD, handleY: hy });
        if (!inside) block(darkInside, ax + f, PLINTH + T, baseD - DOOR_T - 0.008, aw - 2 * f, doorTop - PLINTH - T, 0.002, { cast: false, receive: false });
        if (inside) {
          piece(carcass, ax + f, PLINTH + doorH * 0.5, 0.008, aw - 2 * f, T, baseD - 0.07, { r: 0.0015 });
          stacks(rnd, ax + f, bx - f, PLINTH + T, doorH * 0.5 - T, baseD - 0.05);
          stacks(rnd, ax + f, bx - f, PLINTH + doorH * 0.5 + T, doorH * 0.5 - T - 0.02, baseD - 0.05);
        }
        // Open shelves above, the top one a hand's width under the ceiling.
        const sd = Math.max(0.16, Math.min(d - 0.02, 0.3));
        const step = s.shelves ? (h - base - 0.28) / s.shelves : 0;
        for (let k = 1; k <= s.shelves; k++) {
          const y = base + step * k;
          piece(finishAcross, ax, y - 0.032, 0, aw, 0.032, sd, { r: 0.003 });
          if (lit) led(ax + 0.03, bx - 0.03, y - 0.033, sd - 0.05, { reach: Math.max(0.7, step * 1.3) });
        }
        // Books in runs, some leaning, with a few things between them.
        for (let k = 0; k <= s.shelves; k++) {
          const y = k === 0 ? base : base + step * k;
          const room = (k === s.shelves ? 0.28 : step) - 0.06;
          if (room < 0.12) continue;
          let x = ax + 0.05 + rnd() * 0.05;
          const end = ax + aw * (0.5 + rnd() * 0.28);
          while (x < end) {
            const bw = 0.016 + rnd() * 0.03;
            const bh = Math.min(room, 0.18 + rnd() * 0.09);
            const bd = Math.min(sd - 0.05, 0.13 + rnd() * 0.06);
            hard(x, y, sd - 0.035 - bd, bw, bh, bd, BOOKS[Math.floor(rnd() * BOOKS.length)]);
            x += bw + 0.0015;
          }
          if (rnd() > 0.35 && end + 0.2 < bx) {
            // Three books lying flat, with something on top.
            const fx = Math.min(bx - 0.26, end + 0.05 + rnd() * 0.04);
            let fy = y;
            for (let i = 0; i < 3 && fy - y < room - 0.1; i++) {
              const th = 0.022 + rnd() * 0.018;
              hard(fx + rnd() * 0.01, fy, Math.max(0.012, sd - 0.2), 0.2, th, Math.min(0.15, sd - 0.03), BOOKS[Math.floor(rnd() * BOOKS.length)]);
              fy += th;
            }
          }
          if (rnd() > 0.45 && aw > 0.62) {
            const vh = Math.min(room, 0.13 + rnd() * 0.1);
            cylinder(flat(`pot-${k % 2}`, k % 2 ? 0xdcd5c6 : 0x7c8b76, 0.55), 0.045 - rnd() * 0.012, vh, bx - 0.11 - rnd() * 0.05, y + vh / 2, sd * 0.5);
          }
        }
      };
      unit(xL, -breast / 2, 5);
      if (s.count === 2) unit(breast / 2, xR, 9);
      bounds = [xL, xR, h, baseD];
      personAt = [breast / 2 - 0.26, d + 0.42];
      side = "inside";
    }

    // The instanced things: soft goods, the hooks they hang from, and books.
    if (softs.length) {
      const im = new THREE.InstancedMesh(softBox, cloth, softs.length);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color(), up = new THREE.Vector3(0, 1, 0);
      softs.forEach(([x, y, z, w, hh, dd, color, ry], i) => {
        q.setFromAxisAngle(up, ry);
        m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(w, hh, dd));
        im.setMatrixAt(i, m4);
        im.setColorAt(i, c.set(color));
      });
      im.castShadow = true;
      im.receiveShadow = true;
      g.add(im);
    }
    if (hooks.length) {
      const im = new THREE.InstancedMesh(rod, chrome, hooks.length);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
      hooks.forEach(([x, y, z, r, len], i) => {
        m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(r, len, r));
        im.setMatrixAt(i, m4);
      });
      g.add(im);
    }
    if (hards.length) {
      const im = new THREE.InstancedMesh(unitBox, paper, hards.length);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color(), fwd = new THREE.Vector3(0, 0, 1);
      hards.forEach(([x, y, z, w, hh, dd, color, rz], i) => {
        q.setFromAxisAngle(fwd, rz);
        m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(w, hh, dd));
        im.setMatrixAt(i, m4);
        im.setColorAt(i, c.set(color));
      });
      im.castShadow = true;
      im.receiveShadow = true;
      g.add(im);
    }

    let fig = null;
    if (person) {
      // About 1.72m tall, always turned to face the viewer, with a soft patch of shade at the feet.
      fig = new THREE.Group();
      fig.position.set(personAt[0], 0, personAt[1]);
      const body = new THREE.Mesh(plane, mat("figure", () => new THREE.MeshBasicMaterial({ map: figureMap, transparent: true, opacity: 0.44, depthTest: false, depthWrite: false })));
      body.scale.set(0.688, 1.72, 1);
      body.position.y = 0.86;
      body.renderOrder = 1;
      const underfoot = new THREE.Mesh(plane, mat("figure-shade", () => new THREE.MeshBasicMaterial({ map: shadeMap, transparent: true, opacity: 0.5, depthTest: false, depthWrite: false })));
      underfoot.scale.set(0.62, 0.3, 1);
      underfoot.rotation.x = -Math.PI / 2;
      underfoot.position.y = 0.002;
      fig.add(underfoot, body);
    }

    return { g, bounds, side, doors: doorList, figure: fig, lit: lights.length > 0 };
  }

  /* ---- Camera ------------------------------------------------------------- */

  /**
   * Where the camera starts, round from straight on. From an open end, a
   * three-quarter view. Inside a room (wall to wall, or alcoves), as far round
   * as it can go while still standing inside the right-hand wall, so that wall
   * is seen from the room like a photograph, not cut away.
   */
  function homeAzimuth(side, bounds, dist) {
    if (side === "left") return -HOME_AZ;
    if (side === "right") return HOME_AZ;
    const room = (bounds[1] - bounds[0]) / 2 - 0.15;
    return Math.asin(THREE.MathUtils.clamp(room / (dist * Math.sin(HOME_POLAR)), 0, Math.sin(HOME_AZ)));
  }

  function frameCamera(bounds, side) {
    const [x0, x1, h, d] = bounds;
    const aspect = camera.aspect || 1;
    const half = THREE.MathUtils.degToRad(camera.fov / 2);
    const tall = (h * 0.5) / Math.tan(half);
    const wide = ((x1 - x0) * 0.5) / (Math.tan(half) * aspect);
    const dist = Math.max(tall, wide) * 1.1 + d + 0.3;
    const target = new THREE.Vector3((x0 + x1) / 2, h * 0.48, d * 0.45);
    const home = homeAzimuth(side, bounds, dist);
    let az = home, pol = HOME_POLAR;
    // A new size keeps the angle the visitor turned to, unless the picture changed sides.
    if (fit && fit.side === side) { az = controls.getAzimuthalAngle(); pol = controls.getPolarAngle(); }
    controls.target.copy(target);
    controls.minDistance = dist * 0.45;
    controls.maxDistance = dist * 1.5;
    camera.position.set(
      target.x + dist * Math.sin(pol) * Math.sin(az),
      target.y + dist * Math.cos(pol),
      target.z + dist * Math.sin(pol) * Math.cos(az),
    );
    camera.lookAt(target);
    controls.update();
    // One soft light, from the front and to the left, like a window behind the viewer's shoulder.
    sun.position.set(target.x - Math.max(2.6, (x1 - x0) * 0.75), h + 1.3, d + 3.4);
    sun.target.position.set(target.x, h * 0.35, d * 0.5);
    const span = Math.max(x1 - x0, h) * 0.7 + 1.4;
    Object.assign(sun.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 0.5, far: 16 });
    sun.shadow.camera.updateProjectionMatrix();
    fill.position.set(target.x + 3.2, h * 0.8, d + 4);
    fit = { key: bounds.map((n) => n.toFixed(3)).join(), side, home };
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (state.bounds) frameCamera(state.bounds, state.side);
    requestRender();
  }

  /* ---- Doors -------------------------------------------------------------- */

  function setDoors(amount) {
    openAmount = amount;
    const eased = amount * amount * (3 - 2 * amount);
    for (const pivot of doors) pivot.rotation.y = pivot.userData.swing * eased * OPEN_ANGLE;
  }

  function animateDoors() {
    cancelAnimationFrame(anim);
    const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      setDoors(openTarget);
      if (!openTarget) rebuild();
      requestRender();
      return;
    }
    let last = performance.now();
    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const dir = Math.sign(openTarget - openAmount);
      const next = THREE.MathUtils.clamp(openAmount + dir * dt / 0.55, 0, 1);
      setDoors(next);
      if (next === openTarget) {
        if (!openTarget) rebuild(); // closed again: the inside is put away
        requestRender();
        return;
      }
      turnFigure();
      drawQuick();
      anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }

  function rebuild() {
    if (!state.design) return;
    used = new Set();
    usedWood = new Set();
    const built = build(state.design, { inside: state.options.open || openAmount > 0, person: state.options.person });
    if (group) {
      // Shapes are shared; only the instanced clothes and books hold buffers of their own.
      group.traverse((o) => { if (o.isInstancedMesh) o.dispose(); });
      scene.remove(group);
    }
    if (figure) overlay.remove(figure);
    group = built.g;
    figure = built.figure;
    doors = built.doors;
    scene.add(group);
    if (figure) overlay.add(figure);
    for (const [key, geo] of geos) if (!used.has(key)) { geo.dispose(); geos.delete(key); }
    for (const [key, wood] of woodMats) if (!usedWood.has(key)) { wood.map?.dispose(); wood.dispose(); woodMats.delete(key); }
    state.lit = built.lit;
    if (bloomPass) bloomPass.enabled = built.lit;
    setDoors(openAmount);
    const key = built.bounds.map((n) => n.toFixed(3)).join();
    const moved = !fit || fit.key !== key || fit.side !== built.side;
    state.bounds = built.bounds;
    state.side = built.side;
    if (moved) frameCamera(built.bounds, built.side);
  }

  function update(design, options = {}) {
    state.design = design;
    const wasOpen = state.options.open;
    state.options = { ...state.options, ...options };
    openTarget = state.options.open ? 1 : 0;
    if (state.options.open !== wasOpen) {
      // Opening: the inside is built first, then the doors swing. Closing: they swing, then it is put away.
      if (state.options.open) rebuild();
      animateDoors();
      return;
    }
    rebuild();
    requestRender();
  }

  /** Nearer or further, in steps, within the limits the framing set. */
  function zoom(step) {
    const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
    const next = THREE.MathUtils.clamp(dir.length() * (step > 0 ? 0.85 : 1 / 0.85), controls.minDistance, controls.maxDistance);
    camera.position.copy(controls.target).add(dir.setLength(next));
    controls.update();
    requestRender();
  }

  /** Straight on, or the three-quarter view it opens with. */
  function look(view) {
    const dist = camera.position.distanceTo(controls.target);
    const az = view === "front" ? 0 : (fit?.home ?? HOME_AZ), pol = view === "front" ? 1.5 : HOME_POLAR;
    camera.position.set(
      controls.target.x + dist * Math.sin(pol) * Math.sin(az),
      controls.target.y + dist * Math.cos(pol),
      controls.target.z + dist * Math.sin(pol) * Math.cos(az),
    );
    controls.update();
    requestRender();
  }

  /** The current view as a picture (drawn afresh first, so it is never blank). */
  function snapshot(type = "image/jpeg", quality = 0.88) {
    turnFigure();
    drawFull();
    return canvas.toDataURL(type, quality);
  }

  const onContextLost = (e) => { e.preventDefault(); lost = true; cancelAnimationFrame(anim); onLost?.(); };
  const onContextRestored = () => { lost = false; onRestored?.(); if (state.design) { rebuild(); requestRender(); } };
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

  const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  observer?.observe(canvas);
  resize();

  function dispose() {
    cancelAnimationFrame(raf);
    cancelAnimationFrame(anim);
    clearTimeout(fineTimer);
    observer?.disconnect();
    canvas.removeEventListener("webglcontextlost", onContextLost);
    canvas.removeEventListener("webglcontextrestored", onContextRestored);
    controls.dispose();
    for (const m of materials.values()) m.dispose();
    for (const wood of woodMats.values()) { wood.map?.dispose(); wood.dispose(); }
    for (const t of textures) t.dispose();
    for (const geo of geos.values()) geo.dispose();
    for (const geo of [unitBox, softBox, ball, rod, plane]) geo.dispose();
    aoPass?.dispose();
    bloomPass?.dispose();
    composer?.dispose();
    envTexture.dispose();
    pmrem.dispose();
    renderer.dispose();
  }

  return { update, resize, zoom, look, snapshot, dispose };
}
