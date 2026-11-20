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
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { COLOURS, DOORS, EXTRAS, HANDLES, HANDLE_FINISHES, INSIDES, INSIDE_FINISHES, describe, normalise } from "./model.mjs";

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
/**
 * Where a tall Shaker door's mid rail sits: its centre about a third of the way
 * up, so the small panel is at the bottom (a founder's review, 19 Nov 2026:
 * "bottom is where the small square goes not top"; it was two thirds up).
 */
const MID_RAIL = 0.34;
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
  g.fillStyle = "#6f6a64"; // a mid warm grey: reads as a person against walls and doors alike
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

/**
 * The room the picture is lit by and reflects: a plain bedroom with one tall
 * window on the left, towards the viewer, the side the sunlight in the
 * picture comes from. Generated here, as three's RoomEnvironment is, so there
 * is no picture file to download; but with one strong window instead of a
 * studio's even light, so lacquer, chrome, brass and the mirror show a window
 * and the light has a direction (research 2026-11-19-ss-3d-realism, fix 1).
 */
function windowRoom() {
  const room = new THREE.Scene();
  const box = new THREE.BoxGeometry();
  box.deleteAttribute("uv");
  const lit = (hex, k = 1, side = THREE.FrontSide) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), side });
  const add = (m, [sx, sy, sz], [x, y, z]) => {
    const o = new THREE.Mesh(box, m);
    o.scale.set(sx, sy, sz);
    o.position.set(x, y, z);
    room.add(o);
  };
  add(lit(0xe7e2d8, 0.85, THREE.BackSide), [12, 6, 12], [0, 3, 0]); // walls and ceiling
  add(lit(0x8a6a4a, 0.7), [11.8, 0.04, 11.8], [0, 0.02, 0]); // a wooden floor
  // A bed, a chest of drawers and a chair: darker shapes for a reflection to show.
  for (const [size, at] of [[[2.2, 0.6, 2], [2.4, 0.3, 3.2]], [[1, 0.9, 0.5], [-4.6, 0.45, -3]], [[0.6, 0.8, 1.6], [5, 0.4, -3.5]]]) {
    add(lit(0x5a514a, 0.55), size, at);
  }
  add(lit(0xf3f6ff, 16), [0.04, 2.4, 2.2], [-5.96, 2.7, 2.4]); // the window: daylight, a touch cool
  add(lit(0xf4f2ee, 0.9), [0.06, 2.4, 0.06], [-5.93, 2.7, 2.4]); // its glazing bars
  add(lit(0xf4f2ee, 0.9), [0.06, 0.06, 2.2], [-5.93, 3.0, 2.4]);
  add(lit(0xfff1dd, 4), [0.7, 0.03, 0.7], [0, 5.97, 0]); // a ceiling light
  return room;
}

/** Faint vertical brush marks, used as a bump on hand-painted parts so they are not one flat colour. */
function brushTexture() {
  return canvasTexture(256, (g, n) => {
    g.fillStyle = "#808080";
    g.fillRect(0, 0, n, n);
    const rnd = seeded(41);
    for (let i = 0; i < 260; i++) {
      const x = rnd() * n;
      const v = rnd() > 0.5 ? 255 : 0;
      g.strokeStyle = `rgba(${v},${v},${v},${0.04 + rnd() * 0.08})`;
      g.lineWidth = 0.5 + rnd() * 1.5;
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x + (rnd() - 0.5) * 3, n);
      g.stroke();
    }
  }, { repeat: true, srgb: false });
}

/** A soft dark patch, laid on the floor under a unit so it stands on it rather than floats (fix 3). */
function contactTexture() {
  return canvasTexture(256, (g, n) => {
    g.clearRect(0, 0, n, n);
    g.filter = "blur(22px)";
    g.fillStyle = "rgba(20,16,12,0.85)";
    g.fillRect(n * 0.14, n * 0.14, n * 0.72, n * 0.72);
    g.filter = "none";
  });
}

/**
 * A routed finger pull seen face on (a founder's review, 19 Nov 2026:
 * "routed, so handless but with reccess"): a long slot with rounded ends,
 * darker on one side where its wall is in shadow, a fine light line where the
 * other edge catches the light, and a soft shadow under its top end. Laid just
 * over the door face, cut out by its alpha and tinted with the door's colour.
 */
function slotTexture() {
  const c = document.createElement("canvas");
  c.width = 32;
  c.height = 512;
  const g = c.getContext("2d");
  g.beginPath();
  g.roundRect(1, 1, 30, 510, 15);
  g.clip();
  // A groove in the door's own colour, a shade darker, not a black bar.
  const across = g.createLinearGradient(0, 0, 32, 0);
  across.addColorStop(0, "#8c8c8c");
  across.addColorStop(0.35, "#a8a8a8");
  across.addColorStop(0.85, "#d0d0d0");
  across.addColorStop(1, "#f4f4f4");
  g.fillStyle = across;
  g.fillRect(0, 0, 32, 512);
  const top = g.createLinearGradient(0, 0, 0, 70);
  top.addColorStop(0, "rgba(0,0,0,0.3)");
  top.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = top;
  g.fillRect(0, 0, 32, 70);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/**
 * Hanging clothes, made as a side view of the garment, thin, and hung edge-on
 * from the rail, so each has shoulders sloping from the hanger and its own
 * outline (fix 4). Unit size: 1 front to back (z), 1 tall (y, hanging down
 * from the hanger at 0), 1 thick (x, along the rail).
 */
function garmentGeometry(kind) {
  const outline = {
    shirt: [[-0.12, 0], [-0.5, -0.1], [-0.48, -1], [0.48, -1], [0.5, -0.1], [0.12, 0]],
    coat: [[-0.12, 0], [-0.52, -0.08], [-0.5, -1], [0.5, -1], [0.52, -0.08], [0.12, 0]],
    dress: [[-0.08, 0], [-0.36, -0.07], [-0.28, -0.36], [-0.5, -1], [0.5, -1], [0.28, -0.36], [0.36, -0.07], [0.08, 0]],
    trousers: [[-0.4, 0], [-0.42, -1], [0.42, -1], [0.4, 0]],
  }[kind];
  const s = new THREE.Shape();
  s.moveTo(outline[0][0], outline[0][1]);
  for (const [u, v] of outline.slice(1)) s.lineTo(u, v);
  s.closePath();
  // A deep, rounded bevel: cloth has no hard edges.
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, steps: 1, bevelEnabled: true, bevelThickness: 0.45, bevelSize: 0.02, bevelSegments: 3, curveSegments: 4 });
  g.translate(0, 0, -0.5);
  g.rotateY(Math.PI / 2);
  g.computeVertexNormals();
  return g;
}

/** A wooden hanger's shoulders: a thin chevron, the same way round as the garments. */
function hangerGeometry() {
  const s = new THREE.Shape();
  const pts = [[-0.5, -0.12], [0, 0], [0.5, -0.12], [0.5, -0.17], [0, -0.05], [-0.5, -0.17]];
  s.moveTo(pts[0][0], pts[0][1]);
  for (const [u, v] of pts.slice(1)) s.lineTo(u, v);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
  g.translate(0, 0, -0.5);
  g.rotateY(Math.PI / 2);
  return g;
}

export function createView(canvas, { onLost, onRestored, onPhoto } = {}) {
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
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0ebe0);
  /** Drawn after the shading pass: kept for anything that must sit on top of the picture. */
  const overlay = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const roomScene = windowRoom();
  const envTexture = pmrem.fromScene(roomScene, 0.02).texture;
  roomScene.traverse((o) => { if (o.isMesh) o.material.dispose(); });
  roomScene.children[0]?.geometry.dispose();
  scene.environment = envTexture;
  // Less light from the room than before and more from the window, so the
  // picture has contrast and the inside of a carcass is darker than the room.
  scene.environmentIntensity = 0.62;
  /** The inside of a carcass sees less of the room: its own, dimmer share of it. */
  const INSIDE_ENV = 0.42;

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

  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfc6b4, 0.16));
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  sun.shadow.radius = 5;
  sun.shadow.blurSamples = small ? 8 : 14;
  sun.shadow.bias = -0.00025;
  sun.shadow.normalBias = 0.012;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xe9eef5, 0.3);
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
  const softBox = new RoundedBoxGeometry(1, 1, 1, 2, 0.07); // a folded layer: soft edges, flat faces
  const GARMENTS = ["shirt", "coat", "dress", "trousers"];
  const garmentGeos = Object.fromEntries(GARMENTS.map((k) => [k, garmentGeometry(k)]));
  const hangerGeo = hangerGeometry();
  // A turned knob: rose, neck and a domed head, its axis out of the door.
  const knobGeo = (() => {
    const profile = [[0, 0], [0.0105, 0], [0.0105, 0.002], [0.0058, 0.0045], [0.0048, 0.012], [0.0105, 0.0165], [0.0155, 0.021], [0.0152, 0.026], [0.011, 0.0295], [0, 0.031]];
    const geo = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), 28);
    geo.rotateX(Math.PI / 2);
    return geo;
  })();
  /** A bar handle with rounded ends, one shape per length. */
  const capsules = new Map();
  const capsule = (long) => {
    const key = Math.round(long * 1000);
    if (!capsules.has(key)) capsules.set(key, new THREE.CapsuleGeometry(0.0062, Math.max(0.01, long - 0.0124), 6, 16));
    return capsules.get(key);
  };
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
  const brushMap = keep(brushTexture());
  const contactMap = keep(contactTexture());
  const slotMap = keep(slotTexture());
  /** A material for the inside of a carcass: it takes the room's light at the inside's dimmer share. */
  const inCarcass = (m) => {
    m.envMap = envTexture;
    m.envMapIntensity = INSIDE_ENV;
    return m;
  };

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
    // Melamine a soft sheen; hand-painted matt with faint brush marks; sprayed a
    // satin lacquer with a clear coat that shows the window; veneer lacquered.
    const roughness = [0.5, 0.8, 0.42, 0.5][finish];
    const clearcoat = [0, 0, 0.55, 0.32][finish];
    if (c.grain) return { wood: true, hex: c.hex, roughness, clearcoat, across, tint, key: `${finish}-${colour}` };
    return mat(`finish-${finish}-${colour}-${tint}`, () => {
      const m = clearcoat
        ? new THREE.MeshPhysicalMaterial({ color: c.hex, roughness, metalness: 0, clearcoat, clearcoatRoughness: 0.18 })
        : new THREE.MeshStandardMaterial({ color: c.hex, roughness, metalness: 0 });
      if (finish === 1) {
        m.bumpMap = brushMap;
        m.bumpScale = 0.22;
      }
      m.color.multiplyScalar(tint);
      return m;
    });
  };

  /**
   * The material for one part of the given size. Wood gets its grain scaled to
   * the part, so a narrow stile, a wide panel and a long filler all show grain
   * of the same size, as one sheet of veneer would.
   */
  const surface = (m, w, h, d, shift = 0) => {
    if (!m?.wood) return m;
    const across = m.across ? Math.max(h, d) : Math.max(w, d);
    const along = m.across ? w : h;
    const a = Math.max(0.02, Math.round(across * 50) / 50);
    const l = Math.max(0.2, Math.round(along * 5) / 5);
    const key = `${m.key}-${m.across ? "h" : "v"}-${m.tint}-${a}-${l}${shift ? `-s${shift}` : ""}`;
    usedWood.add(key);
    if (!woodMats.has(key)) {
      const t = woodSource(m.hex).clone(); // shares the picture; only the scale is its own
      t.repeat.set(a / GRAIN_W, l / GRAIN_L);
      // `shift` boards along: a tongue and groove door's boards carry one veneer's grain across.
      if (shift) t.offset.x = (shift * a) / GRAIN_W;
      if (m.across) { t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; }
      t.needsUpdate = true;
      const wood = m.clearcoat
        ? new THREE.MeshPhysicalMaterial({ map: t, bumpMap: t, bumpScale: 0.3, roughness: m.roughness, metalness: 0, clearcoat: m.clearcoat, clearcoatRoughness: 0.3 })
        : new THREE.MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: 0.3, roughness: m.roughness, metalness: 0 });
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
  const state = { design: null, options: { open: false, person: false }, bounds: null, lit: false, strips: [] };

  /* ---- The photo: the same design traced with real light, once still ------ */

  // Computers only: a phone keeps the real-time picture. It needs WebGL2 with float
  // render targets, and stays off when the visitor has asked to save data.
  // `?photo=off` in the address keeps the real-time picture only (for checks and screenshots);
  // `?photo=on` makes the photo on any computer, however slowly (for checking it on a laptop).
  /** The graphics chip's name, where the browser gives it (Chrome and Edge give it in full). */
  const chip = (() => {
    try {
      const gl = renderer.getContext();
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      return String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER) || "");
    } catch {
      return "";
    }
  })();
  // Intel's HD and UHD graphics (most office laptops), phone and tablet chips and software
  // drawing make the photo too slowly to be worth it (20 Nov 2026, an Intel HD 630: 95 seconds
  // preparing, then 2 samples a second, the page slow throughout): they keep the real-time
  // picture. Any other computer too slow for it is found once it starts (photo.mjs, MIN_RATE).
  const slowChip = /\b(U?HD Graphics|Mali|Adreno|PowerVR|SwiftShader|llvmpipe|Software|Basic Render)/i.test(chip);
  const photoForced = /[?&]photo=on\b/.test(location.search);
  const photoAllowed = renderer.capabilities.isWebGL2 && renderer.extensions.has("EXT_color_buffer_float")
    && !/[?&]photo=off\b/.test(location.search)
    && (photoForced || (!small && !slowChip && !(typeof navigator !== "undefined" && navigator.connection?.saveData)));
  /** How strongly the photo's window and the room behind the viewer light it (tuned by eye, 19 Nov 2026). */
  const PHOTO_KEY = 7;
  const PHOTO_ENV = 0.55;
  let photo = null;
  let photoLoading = null;
  let photoTimer = 0;
  let photoFailed = false;
  let sceneVersion = 0; // goes up whenever what is in the scene changes: a design, the doors
  let keyLight = null;

  let photoState = "";
  function stopPhoto() {
    clearTimeout(photoTimer);
    photo?.stop();
    // The page's note under the picture goes back to how to turn it.
    if (photoState === "tracing" || photoState === "photo") onPhoto?.("stopped", 0);
    photoState = "";
  }
  function schedulePhoto() {
    if (!photoAllowed || photoFailed || lost) return;
    clearTimeout(photoTimer);
    // Not while someone is still choosing (20 Nov 2026: starting half a second after every
    // change kept a laptop's graphics busy while the visitor was still clicking). The first
    // time waits longest, as the tracer's very large shader is compiled then.
    photoTimer = setTimeout(startPhoto, photo ? 2200 : 4000);
  }
  /* While the page is scrolled, or the picture is off screen or in a hidden tab, the tracing
     waits, so the graphics chip is the page's; it carries on where it left off. */
  let scrollTimer = 0;
  let onScreen = true;
  const holdPhoto = () => photo?.pause();
  const carryOn = () => { if (onScreen && !document.hidden) photo?.resume(); };
  const onScroll = () => {
    holdPhoto();
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(carryOn, 700);
  };
  const onVisibility = () => (document.hidden ? holdPhoto() : carryOn());
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  const seen = typeof IntersectionObserver === "function"
    ? new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) carryOn(); else holdPhoto(); })
    : null;
  seen?.observe(canvas);
  async function startPhoto() {
    if (lost || !group) return;
    try {
      if (!photo) {
        photoLoading ??= import("./photo.mjs");
        const { createPhoto } = await photoLoading;
        if (lost || photo) return;
        photo = createPhoto({
          renderer, camera, drawRaster: drawFull, forced: photoForced,
          onState: (kind, n, progress) => {
            canvas.dataset.dyoPhoto = kind;
            canvas.dataset.dyoSamples = String(n);
            if (kind === "slow") {
              // Too slow here: no more photos this visit; the real-time picture is still on screen.
              photoFailed = true;
              photo.stop();
              photoState = "";
              onPhoto?.("stopped", 0);
              return;
            }
            if (kind === "photo" || kind === "done") canvas.dataset.dyoDrawn = "photo";
            photoState = kind;
            onPhoto?.(kind, progress);
          },
        });
      }
      photo.show(scene, { version: sceneVersion, strips: state.strips, key: keyLight, environmentIntensity: PHOTO_ENV });
    } catch (e) {
      // Anything the tracer cannot do leaves the real-time picture as it was.
      photoFailed = true;
      console.warn("The traced picture is not available here:", e);
      photo?.stop();
      requestRender();
    }
  }

  /* ---- Shaders built ahead of time -------------------------------------------- */
  /*
   * A material's shader is built the first time it is drawn, and the page waits for it: on a
   * laptop's own graphics 1.8 seconds when the picture first loaded, and about 120 ms whenever a
   * style was first shown (measured 20 Nov 2026). Asked for ahead of time, the browser builds
   * them on threads of its own (the parallel compile extension) while the page goes on answering.
   * The first picture waits for its own shaders; every other style's are built in the background.
   */
  let ready = false;
  let warming = null;
  let gone = false;
  function warm(root) {
    const keep = renderer.getRenderTarget();
    const ask = (target) => {
      renderer.setRenderTarget(target);
      try {
        return renderer.compileAsync(root, camera, scene);
      } finally {
        renderer.setRenderTarget(keep);
      }
    };
    // The full picture is drawn into a render target, the quick one (while turning) to the screen.
    return Promise.all([composer ? ask(composer.readBuffer) : null, ask(null)]);
  }
  /** The shading passes' own shaders too: the corner shading's alone took 440 ms to build on a laptop. */
  function warmPasses() {
    if (!composer) return null;
    // A pass draws one big triangle with corners and picture positions only (no normals, which
    // would make it a different shader): the same here, or the shaders asked for are not the ones drawn.
    const tri = new THREE.BufferGeometry();
    tri.setAttribute("position", new THREE.Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3));
    tri.setAttribute("uv", new THREE.Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));
    const passes = new THREE.Scene();
    for (const m of [
      aoPass?.gtaoMaterial, aoPass?.pdMaterial, aoPass?.blendMaterial, aoPass?.copyMaterial,
      bloomPass?.materialHighPassFilter, ...(bloomPass?.separableBlurMaterials ?? []), bloomPass?.compositeMaterial, bloomPass?.blendMaterial,
    ]) if (m) passes.add(new THREE.Mesh(tri, m));
    // The corner shading draws the scene's normals first, every part in one material, lit or not.
    const normals = new THREE.Group();
    const instanced = aoPass ? new THREE.InstancedMesh(unitBox, aoPass.normalMaterial, 1) : null;
    if (aoPass) normals.add(new THREE.Mesh(unitBox, aoPass.normalMaterial), instanced);
    const keep = renderer.getRenderTarget();
    renderer.setRenderTarget(composer.readBuffer); // every pass but the last draws into a render target
    try {
      return Promise.all([renderer.compileAsync(passes, camera), renderer.compileAsync(normals, camera, scene)])
        .finally(() => { instanced?.dispose(); tri.dispose(); });
    } finally {
      renderer.setRenderTarget(keep);
    }
  }
  function firstPicture() {
    if (ready || warming || !group || lost) return;
    // The room's colour on the canvas while its shaders are built.
    const was = renderer.getClearColor(new THREE.Color());
    const wasAlpha = renderer.getClearAlpha();
    renderer.setRenderTarget(null);
    renderer.setClearColor(scene.background, 1);
    renderer.clear();
    renderer.setClearColor(was, wasAlpha);
    warming = Promise.all([warm(scene), warmPasses()])
      .catch(() => {}) // drawn anyway, building them the old way
      .then(() => {
        warming = null;
        if (lost || gone) return;
        ready = true;
        requestRender();
        later(warmStyles, 1500);
      });
  }
  const idle = typeof requestIdleCallback === "function" ? (fn) => requestIdleCallback(fn, { timeout: 1500 }) : (fn) => setTimeout(fn, 0);
  const later = (fn, ms) => setTimeout(() => idle(fn), ms);
  /**
   * Designs that between them show every door, handle and handle finish, finish, inside finish,
   * fitting and extra, of both kinds of unit, open, with the figure: built one at a time while the
   * page is idle, their shaders asked for, then dropped.
   */
  let styleQueue = null;
  function styleSamples() {
    const d = state.design;
    // Each finish as it looks (plain or with a grain): fluted reeds are drawn as one instanced
    // shape, which makes a shader of its own for every look they are made in.
    const looks = [];
    COLOURS.forEach((list, f) => {
      looks.push([f, 0]);
      const other = list.findIndex((c) => Boolean(c.grain) !== Boolean(list[0].grain));
      if (other > 0) looks.push([f, other]);
    });
    const sample = (unit, i, door, [finish, colour]) => normalise({
      ...(unit === d.unit ? d : { unit }),
      door,
      handle: HANDLES[i % HANDLES.length].id,
      handleFinish: HANDLE_FINISHES[i % HANDLE_FINISHES.length].id,
      insideFinish: INSIDE_FINISHES[i % INSIDE_FINISHES.length].id,
      finish,
      colour,
      inside: INSIDES.map((_, k) => INSIDES[(i + k) % INSIDES.length].id),
      extras: EXTRAS[unit].map((x) => x.id),
    });
    // First the design as it is, opened: the inside is the next thing most people look at.
    const out = [normalise(d)];
    looks.forEach((look, i) => out.push(sample(d.unit, i, "fluted", look)));
    for (const unit of d.unit === "alcove" ? ["alcove", "wardrobe"] : ["wardrobe", "alcove"]) {
      for (let i = 0; i < 6; i++) out.push(sample(unit, i + 1, DOORS[i % DOORS.length].id, looks[i % looks.length]));
    }
    return out;
  }
  function warmStyles() {
    if (gone || lost || !ready || !state.design) return;
    styleQueue ??= styleSamples();
    const next = styleQueue.shift();
    if (!next) return;
    let built = null;
    try {
      built = build(next, { inside: true, person: true });
    } catch {
      later(warmStyles, 50);
      return;
    }
    const parts = [built.g, built.figure].filter(Boolean);
    // Its own lights would count twice against the scene's (which decide each shader too).
    for (const root of parts) root.traverse((o) => { if (o.isLight) o.visible = false; });
    Promise.all(parts.map(warm))
      .catch(() => {})
      .then(() => {
        for (const root of parts) root.traverse((o) => { if (o.isInstancedMesh) o.dispose(); });
        later(warmStyles, 50);
      });
  }

  function turnFigure() {
    if (!figure) return;
    figure.rotation.y = Math.atan2(camera.position.x - figure.position.x, camera.position.z - figure.position.z);
  }

  function drawQuick() {
    if (!ready) return;
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
  /*
   * A slow graphics chip draws the picture at a lower resolution (20 Nov 2026: on a laptop's
   * own Intel graphics the full picture at twice its size made the page feel slow). The third
   * full picture is timed (the first two include compiling); over 70 ms it is drawn at 1.5
   * times its size, over 140 ms at 1.25. Once a session, so the picture never jumps about.
   */
  let fullCount = 0;
  let tierSet = small; // a phone already draws at its own pixel ratio
  function drawFull() {
    if (!ready) return;
    if (!composer) { drawQuick(); return; }
    const t0 = performance.now();
    composer.render();
    canvas.dataset.dyoDrawn = "full";
    if (!tierSet && ++fullCount === 3) {
      tierSet = true;
      renderer.getContext().finish();
      const ms = performance.now() - t0;
      canvas.dataset.dyoFrameMs = String(Math.round(ms));
      if (ms > 70) {
        const ratio = ms > 140 ? 1.25 : 1.5;
        renderer.setPixelRatio(ratio);
        composer.setPixelRatio(ratio);
        canvas.dataset.dyoPixelRatio = String(ratio);
        setTimeout(resize, 0); // sized again, then drawn again, at the new ratio
      }
    }
  }
  /** The full picture, on the next frame. */
  const requestRender = () => {
    if (lost) return;
    clearTimeout(fineTimer);
    if (!ready) { firstPicture(); return; }
    if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (!lost) { turnFigure(); drawFull(); schedulePhoto(); } });
  };
  /** The quick picture now, and the full one once things have been still for a moment. */
  const requestQuick = () => {
    if (lost) return;
    stopPhoto();
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
    /** Every LED strip drawn, for the photo, which lights each one as a real rectangle of light (photo.mjs). */
    const strips = [];
    const doorList = [];
    const finish = finishMaterial(s.finish, s.colour);
    const finishAcross = finishMaterial(s.finish, s.colour, true);
    const panel = finishMaterial(s.finish, s.colour, false, 0.93);
    // The inside of a carcass takes a dimmer share of the room's light, so it
    // is darker than the room and the LED strips read as the light (fix 1).
    // Its finish is chosen apart from the outside (a founder's review, 19 Nov 2026): white
    // melamine as standard, oak-effect melamine, lacquered oak veneer, or the outside's own.
    const insideWood = s.insideFinish === "oakeffect" ? { wood: true, hex: "#C8A77C", roughness: 0.5, clearcoat: 0, across: false, tint: 1, key: "inside-oakeffect" }
      : s.insideFinish === "oak" ? { wood: true, hex: "#C19A66", roughness: 0.5, clearcoat: 0.32, across: false, tint: 1, key: "inside-oak" }
      : s.insideFinish === "match" ? finish
      : null;
    const carcass = insideWood ?? inCarcass(flat("carcass", 0xece6da, 0.62));
    const carcassEdge = insideWood ?? inCarcass(flat("carcass-edge", 0xe2dbcd, 0.62));
    const drawerFront = insideWood ?? inCarcass(flat("drawer-front", 0xe6dfd1, 0.55));
    // A routed finger pull's recess, in the door's own colour (see handle()).
    const slot = mat(`slot-${s.finish}-${s.colour}`, () => new THREE.MeshStandardMaterial({ color: COLOURS[s.finish][s.colour].hex, map: slotMap, alphaTest: 0.5, roughness: 0.85 }));
    const wall = flat("wall", 0xefece5, 0.95);
    const trim = flat("trim", 0xf6f4ee, 0.5);
    const plinthMat = flat("plinth", 0x2a2622, 0.8);
    // Metals that reflect the room: polished chrome, soft brushed brass (fix 2).
    const chrome = flat("chrome", 0xdcdcda, 0.1, 1);
    const brass = flat("brass", 0xc09a5e, 0.26, 1);
    // The handles' own metal, as chosen; matt black is a powder coat, so barely metallic.
    // Handle chrome takes the room's light at full strength, not the room's dimmed
    // share: at the dimmed share a polished plate facing the camera mirrors one dark
    // patch of the room and reads as black, not silver.
    const handleMetal = s.handleFinish === "black" ? flat("matt-black", 0x1c1b1a, 0.5, 0.15)
      : s.handleFinish === "chrome" ? mat("handle-chrome", () => new THREE.MeshStandardMaterial({ color: 0xeeeff0, roughness: 0.22, metalness: 1, envMap: envTexture, envMapIntensity: 1.35 }))
      : brass;
    const channel = flat("led-channel", 0xc9c9c6, 0.35, 0.9);
    const glow = mat("glow", () => {
      const m = new THREE.MeshStandardMaterial({ color: 0xfff4de, emissive: 0xffe2b0, emissiveIntensity: 4.2, roughness: 1 });
      m.userData.photo = "glow"; // the photo dims it: its light there comes from an area light
      return m;
    });
    const mirror = flat("mirror", 0xffffff, 0.02, 1);
    // Unlit, a shade under the walls: a lit ceiling facing away from the window goes grey.
    const ceiling = mat("ceiling", () => new THREE.MeshBasicMaterial({ color: 0xe6e1d7 }));
    const darkInside = flat("dark-inside", 0x2a2521, 1);
    // A lacquered oak floor: a soft sheen of window light along the boards.
    const floor = mat("floor", () => new THREE.MeshPhysicalMaterial({ map: floorMap, roughness: 0.55, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.4 }));
    const cloth = inCarcass(mat("cloth", () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.94, bumpMap: foldMap, bumpScale: 1.6 })));
    // Hanging clothes: the fold bump much fainter, or their narrow edges read as stripes.
    const garmentCloth = inCarcass(mat("garment-cloth", () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, bumpMap: foldMap, bumpScale: 0.35 })));
    const paper = flat("paper", 0xffffff, 0.9);
    const hangerWood = inCarcass(flat("hanger", 0x6b4a32, 0.55));
    // Painted on for the real-time picture; the photo traces real shadows, so leaves it out.
    const shadowPatch = mat("contact", () => {
      const m = new THREE.MeshBasicMaterial({ map: contactMap, transparent: true, depthWrite: false, opacity: 0.6, polygonOffset: true, polygonOffsetFactor: -2 });
      m.userData.photo = "skip";
      return m;
    });
    /** A soft shadow on the floor under a unit, from its footprint (fix 3). */
    const contact = (x0, x1, z0, z1) => {
      const m = new THREE.Mesh(plane, shadowPatch);
      // The patch's soft edge runs past the footprint by about a seventh of the texture each side.
      m.scale.set((x1 - x0) / 0.72, (z1 - z0) / 0.72, 1);
      m.rotation.x = -Math.PI / 2;
      m.position.set((x0 + x1) / 2, 0.002, (z0 + z1) / 2);
      m.renderOrder = 1;
      g.add(m);
    };

    /** A part with eased edges, from its lower-left-back corner and its size. */
    const piece = (m, x0, y0, z0, w, h, d, { r = 0.002, cast = true, receive = true, parent = g, shift = 0 } = {}) => {
      const mesh = new THREE.Mesh(rounded(w, h, d, r), surface(m, w, h, d, shift));
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
    // Hanging clothes by kind, each kind one instanced shape, and the hangers they hang on.
    const garments = Object.fromEntries(GARMENTS.map((k) => [k, []]));
    const hangers = [];
    const wear = (kind, x, top, z, thick, len, depth, color, ry) => garments[kind].push([x, top, z, thick, len, depth, color, ry]);
    const hard = (x0, y0, z0, w, h, d, color, rz = 0) => hards.push([x0 + w / 2, y0 + h / 2, z0 + d / 2, w, h, d, color, rz]);

    /**
     * A handle on a door or drawer, in the door's own space when a parent is
     * given, in the metal chosen: a turned knob (rose, neck, domed head), a
     * bar with rounded ends on two posts (a long one, about 600mm, when
     * chosen), or an edge pull: a thin L of metal round the free edge with a
     * lip in front of the face that fingers hook behind.
     * `edge` is the free edge (a door's x, a drawer front's top y), `out` the
     * way it faces (+1 right, -1 left) and `span` the door's height, so a long
     * bar or an edge pull always fits on it.
     */
    const handle = (x, y, z, { vertical = true, parent = g, long = 0.24, edge = null, out = 1, span = 2 } = {}) => {
      if (s.handle === "none") return;
      const metal = handleMetal;
      const within = (c, len, margin) => Math.min(Math.max(c, len / 2 + margin), span - len / 2 - margin);
      if (s.handle === "knob") {
        const k = new THREE.Mesh(knobGeo, metal);
        k.position.set(x, y, z);
        k.castShadow = true;
        parent.add(k);
        return;
      }
      if (s.handle === "routed") {
        // A flat door has its pocket cut in its own geometry (door()). On other door styles and
        // on a drawer front (under its top edge) the recess is drawn as a shaded slot over the face.
        if (vertical && s.door === "flat") return;
        const m = new THREE.Mesh(plane, slot);
        m.receiveShadow = true;
        if (vertical) {
          const len = Math.min(0.32, span * 0.42);
          m.scale.set(0.024, len, 1);
          m.position.set((edge ?? x) - out * 0.032, within(y, len, 0.06), z + 0.0008);
        } else {
          const len = Math.min(0.3, long * 1.4);
          m.scale.set(0.024, len, 1);
          m.rotation.z = Math.PI / 2;
          m.position.set(x, (edge ?? y) - 0.03, z + 0.0008);
        }
        parent.add(m);
        return;
      }
      if (s.handle === "edge") {
        // A rounded lip, so it catches a line of light along each side as a real one does.
        const reach = DOOR_T + 0.014; // from the back of the door to the lip
        const fin = { parent, r: 0.0011 };
        const lip = { parent, r: 0.0024 };
        if (vertical) {
          const len = Math.min(0.3, span * 0.4);
          const cy = within(y, len, 0.05);
          const ex = edge ?? x;
          piece(metal, out > 0 ? ex - 0.0025 : ex - 0.0005, cy - len / 2, z - DOOR_T, 0.003, len, reach, fin);
          piece(metal, out > 0 ? ex - 0.0135 : ex - 0.0005, cy - len / 2, z + 0.011, 0.014, len, 0.0052, lip);
        } else {
          const len = Math.min(0.2, long);
          const ey = edge ?? y;
          piece(metal, x - len / 2, ey - 0.0025, z - DOOR_T, len, 0.003, reach, fin);
          piece(metal, x - len / 2, ey - 0.0135, z + 0.011, len, 0.014, 0.0052, lip);
        }
        return;
      }
      let L = long, cy = y;
      if (s.handle === "longbar") {
        L = vertical ? Math.min(0.6, span * 0.62) : Math.min(0.45, long * 1.9);
        if (vertical) cy = within(y, L, 0.06);
      }
      const bar = new THREE.Mesh(capsule(L), metal);
      bar.position.set(x, cy, z + 0.032);
      if (!vertical) bar.rotation.z = Math.PI / 2;
      bar.castShadow = true;
      parent.add(bar);
      for (const o of [-L / 2 + 0.03, L / 2 - 0.03]) {
        cylinder(metal, 0.0042, 0.03, vertical ? x : x + o, vertical ? cy + o : cy, z + 0.016, "z", parent);
      }
    };

    /**
     * A fine bevel round a Shaker panel, where the frame's inner edge turns
     * down into the recess and catches the light: four thin strips set at 45
     * degrees along the opening, in the door's own space.
     */
    const bevel = (parent, xa, ya, xb, yb, m) => {
      const size = 0.006;
      const strip = (len, x, y, alongX) => {
        const b = new THREE.Mesh(unitBox, surface(m, alongX ? len : size, alongX ? size : len, size));
        b.scale.set(alongX ? len : size, alongX ? size : len, size);
        b.rotation.set(alongX ? Math.PI / 4 : 0, alongX ? 0 : Math.PI / 4, 0);
        b.position.set(x, y, -0.0046);
        b.receiveShadow = true;
        parent.add(b);
      };
      strip(xb - xa, (xa + xb) / 2, ya, true);
      strip(xb - xa, (xa + xb) / 2, yb, true);
      strip(yb - ya, xa, (ya + yb) / 2, false);
      strip(yb - ya, xb, (ya + yb) / 2, false);
    };

    /** The outer face of an end panel, framed like the doors when they are Shaker or slim Shaker. */
    const shakerSide = (xFace, out, za, zb, ya, yb, midY) => {
      if (s.door !== "shaker" && s.door !== "slim") return;
      const t = 0.006, f = s.door === "slim" ? 0.05 : 0.085, x = out < 0 ? xFace - t : xFace;
      const opts = { r: 0.0015 };
      piece(finish, x, ya, za, t, yb - ya, f, opts);
      piece(finish, x, ya, zb - f, t, yb - ya, f, opts);
      piece(finish, x, ya, za + f, t, f, zb - za - 2 * f, opts);
      piece(finish, x, yb - f, za + f, t, f, zb - za - 2 * f, opts);
      if (midY) piece(finish, x, midY - f / 2, za + f, t, f, zb - za - 2 * f, opts);
    };

    /**
     * One door, hung on its hinge edge so it can swing: flat; tongue and
     * groove (boards about 100mm wide whose eased edges meet in a V, one
     * veneer's grain carried across them); fluted (rounded reeds about 26mm
     * wide on a thinner slab); or a Shaker frame, slim or standard, around a
     * set-back panel. `inner` adds a mirror to its inside face.
     */
    const door = ({ hinge, x, y0, w, h, z, handleY, inner = false, withHandle = true }) => {
      const pivot = new THREE.Group();
      pivot.position.set(x, y0, z);
      pivot.userData.swing = hinge === "left" ? -1 : 1;
      g.add(pivot);
      const x0 = hinge === "left" ? 0 : -w;
      const opts = { parent: pivot, r: 0.0022 };
      const plainBack = () => block(finish, x0 + 0.004, 0.004, -DOOR_T - 0.0006, w - 0.008, h - 0.008, 0.004, { parent: pivot, cast: false });
      if (s.door === "flat" && s.handle === "routed" && withHandle) {
        // A flat door with a routed finger pull: a real pocket, 24mm wide and 12mm deep, near
        // the free edge, so it shades as a recess. The face is built round it in four parts.
        const len = Math.min(0.32, h * 0.42);
        const cy = Math.min(Math.max(handleY - y0, len / 2 + 0.06), h - len / 2 - 0.06);
        const free = hinge === "left" ? x0 + w : x0;
        const px0 = hinge === "left" ? free - 0.044 : free + 0.02, px1 = px0 + 0.024;
        const py0 = cy - len / 2, py1 = cy + len / 2, sk = 0.012;
        const at = { parent: pivot };
        piece(finish, x0, 0, -DOOR_T, w, h, DOOR_T - sk, opts);
        block(finish, x0, 0, -sk, px0 - x0, h, sk, at);
        block(finish, px1, 0, -sk, x0 + w - px1, h, sk, at);
        block(finish, px0, 0, -sk, px1 - px0, py0, sk, at);
        block(finish, px0, py1, -sk, px1 - px0, h - py1, sk, at);
      } else if (s.door === "flat") {
        piece(finish, x0, 0, -DOOR_T, w, h, DOOR_T, opts);
      } else if (s.door === "tg") {
        const n = Math.max(2, Math.round(w / 0.1));
        const bw = w / n;
        for (let i = 0; i < n; i++) piece(finish, x0 + i * bw, 0, -DOOR_T, bw, h, DOOR_T, { parent: pivot, r: 0.0026, shift: i });
        plainBack();
      } else if (s.door === "fluted") {
        const slab = 0.012, rd = 0.016;
        piece(finish, x0, 0, -DOOR_T, w, h, slab, opts);
        const n = Math.max(6, Math.round(w / 0.026));
        const rw = w / n;
        // One instanced shape per door: a fluted run of eight doors is eight draws, not 170.
        const reeds = new THREE.InstancedMesh(rounded(rw, h, rd, rd / 2), surface(finish, rw, h, rd), n);
        const m4 = new THREE.Matrix4();
        for (let i = 0; i < n; i++) reeds.setMatrixAt(i, m4.makeTranslation(x0 + rw * (i + 0.5), h / 2, -rd / 2));
        reeds.castShadow = true;
        reeds.receiveShadow = true;
        pivot.add(reeds);
      } else {
        const f = s.door === "slim" ? Math.min(0.045, w * 0.2) : Math.max(0.055, Math.min(0.085, w * 0.2));
        // A tall door has a mid rail, as most Shaker wardrobe doors do, the small panel below it.
        const mid = h > 1.5 ? h * MID_RAIL : null;
        piece(finish, x0, 0, -DOOR_T, f, h, DOOR_T, opts);
        piece(finish, x0 + w - f, 0, -DOOR_T, f, h, DOOR_T, opts);
        piece(finishAcross, x0 + f, 0, -DOOR_T, w - 2 * f, f, DOOR_T, opts);
        piece(finishAcross, x0 + f, h - f, -DOOR_T, w - 2 * f, f, DOOR_T, opts);
        if (mid) piece(finishAcross, x0 + f, mid - f / 2, -DOOR_T, w - 2 * f, f, DOOR_T, opts);
        // The panels, set back, each with a fine bevel round it.
        const openings = mid ? [[f, mid - f / 2], [mid + f / 2, h - f]] : [[f, h - f]];
        for (const [ya, yb] of openings) {
          block(panel, x0 + f - 0.002, ya - 0.002, -DOOR_T + 0.004, w - 2 * f + 0.004, yb - ya + 0.004, 0.008, { parent: pivot });
          bevel(pivot, x0 + f, ya, x0 + w - f, yb, panel);
        }
        // The back of the door is one plain face.
        plainBack();
      }
      if (inner) block(mirror, x0 + 0.06, 0.12, -DOOR_T - 0.004, w - 0.12, h - 0.24, 0.004, { parent: pivot, cast: false });
      if (withHandle) {
        handle(hinge === "left" ? w - 0.042 : -w + 0.042, handleY - y0, 0,
          { parent: pivot, edge: hinge === "left" ? w : -w, out: hinge === "left" ? 1 : -1, span: h });
      }
      // Two hinge plates on the carcass side, seen once the door is open.
      for (const hy of [0.12, h - 0.12]) block(chrome, hinge === "left" ? 0.002 : -0.034, hy - 0.025, -DOOR_T - 0.014, 0.032, 0.05, 0.012, { parent: pivot, cast: false });
      doorList.push(pivot);
      return pivot;
    };

    /**
     * LED strips as fitted wardrobes have them (research 2026-11-19-ss-3d-realism,
     * note 05; a founder, 19 Nov: "the light should come around the inside, not
     * just the top"): an aluminium profile with an opal cover that reads as one
     * unbroken line, near the front, lighting the clothes from the front rather
     * than from behind. In the real-time picture a few point lights stand in for
     * the light they give (no more than LIGHT_BUDGET); the photo lights every
     * strip as a real rectangle of light.
     */
    const LIGHT_BUDGET = small ? 6 : 8;
    const pointLight = (x, y, z, intensity, reach) => {
      if (lights.length >= LIGHT_BUDGET) return;
      const p = new THREE.PointLight(0xffdcae, intensity, reach, 1.6);
      p.position.set(x, y, z);
      g.add(p);
      lights.push(p);
    };
    /** A strip under a top or a shelf, facing down. */
    const led = (x0, x1, y, z, { light = true, reach = 1.4 } = {}) => {
      block(channel, x0, y - 0.006, z - 0.009, x1 - x0, 0.006, 0.018, { cast: false, receive: false });
      block(glow, x0 + 0.004, y - 0.0085, z - 0.006, x1 - x0 - 0.008, 0.003, 0.012, { cast: false, receive: false });
      strips.push({ kind: "down", x0: x0 + 0.004, x1: x1 - 0.004, y: y - 0.0086, z });
      // Brighter than before: with the inside darker, these are what light it.
      if (light) pointLight((x0 + x1) / 2, y - 0.06, z + 0.02, 2.0, reach);
    };
    /**
     * A strip down the inside face of a side panel at its front edge, the full
     * height of the hanging space, shining across the section: what most
     * fitted-wardrobe guides describe as lighting the hanging along its whole
     * height. `x` is the panel's face, `dir` the way it shines (+1 right).
     */
    const ledSide = (x, dir, y0, y1, z, { light = true } = {}) => {
      block(channel, dir > 0 ? x : x - 0.006, y0, z - 0.009, 0.006, y1 - y0, 0.018, { cast: false, receive: false });
      block(glow, dir > 0 ? x + 0.0045 : x - 0.0075, y0 + 0.004, z - 0.006, 0.003, y1 - y0 - 0.008, 0.012, { cast: false, receive: false });
      strips.push({ kind: "side", x: x + dir * 0.0076, dir, y0: y0 + 0.004, y1: y1 - 0.004, z });
      // Set well into the section and softer, so the light washes the clothes rather than
      // making a bright spot beside the strip.
      if (light) pointLight(x + dir * 0.16, y0 + (y1 - y0) * 0.55, z - 0.06, 0.8, Math.min(1.8, (y1 - y0) * 1.1));
    };

    /** A rail in its sockets, with hangers and clothes on it. */
    const hanging = (rnd, ax, bx, yRail, length, zf) => {
      const cd = Math.min(0.44, zf - 0.07);
      const cz = 0.03 + (zf - 0.03 - cd) / 2 + cd / 2; // centre, front to back
      // An oval wardrobe rail, taller than it is deep.
      const rail = cylinder(chrome, 0.0125, bx - ax, (ax + bx) / 2, yRail, cz, "x");
      rail.scale.x = 0.015;
      rail.scale.z = 0.0078;
      for (const ex of [ax + 0.006, bx - 0.006]) cylinder(chrome, 0.02, 0.012, ex, yRail, cz, "x");
      let x = ax + 0.035 + rnd() * 0.02;
      while (x < bx - 0.05) {
        const thick = 0.026 + rnd() * 0.03;
        const len = Math.max(0.3, length * (0.62 + rnd() * 0.38));
        const depth = cd * (0.86 + rnd() * 0.14);
        const colour = CLOTH[Math.floor(rnd() * CLOTH.length)];
        // A long rail carries coats and dresses among the shirts; a short one shirts and trousers.
        const roll = rnd();
        const kind = length > 1.1 ? (roll < 0.3 ? "coat" : roll < 0.55 ? "dress" : "shirt") : (roll < 0.35 ? "trousers" : "shirt");
        const top = yRail - 0.038;
        wear(kind, x + thick / 2, top, cz + (rnd() - 0.5) * 0.02, thick, kind === "trousers" ? len * 0.8 : len,
          kind === "dress" ? depth * 0.92 : depth, colour, (rnd() - 0.5) * 0.12);
        hooks.push([x + thick / 2, yRail - 0.02, cz, 0.0028, 0.05]);
        hangers.push([x + thick / 2, top + 0.006, cz, 0.012, 0.24, depth * 0.94]);
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
          piece(inCarcass(flat("box", 0xd8ccb6, 0.9)), cx - 0.14, y, zf - 0.03 - deep, 0.28, bh, deep, { r: 0.006 });
          block(inCarcass(flat("box-lid", 0xcbbda3, 0.9)), cx - 0.145, y + bh - 0.03, zf - 0.035 - deep, 0.29, 0.03, deep + 0.01, { cast: false });
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

      // Fillers to a wall, or an end panel on an open side (framed like the doors when they
      // are Shaker); the strip under the ceiling, set back a little so a shadow line runs
      // above the doors; and the plinth in the door finish, set back, as fitted work has it.
      const midY = PLINTH + GAP + (doorH - 2 * GAP) * MID_RAIL;
      if (wallL) piece(finish, x0, 0, d - DOOR_T, WALL_FILL, h, DOOR_T);
      else { piece(finish, x0, 0, 0, T, h, d); shakerSide(x0, -1, 0, d, 0, h, midY); }
      if (wallR) piece(finish, x1 - WALL_FILL, 0, d - DOOR_T, WALL_FILL, h, DOOR_T);
      else { piece(finish, x1 - T, 0, 0, T, h, d); shakerSide(x1, 1, 0, d, 0, h, midY); }
      piece(finishAcross, x0 + mL, h - TOP_FILL, d - DOOR_T - 0.006, iw, TOP_FILL, DOOR_T);
      block(finishAcross, x0 + mL, 0, d - 0.03 - 0.018, iw, PLINTH, 0.018);
      contact(x0, x1, 0, d);

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
        const trousers = s.extras.includes("trousers");
        // The accessories go where wardrobes have them (a founder's review, 19 Nov 2026): the
        // jewellery drawer at waist height in the first section with shelves (or low in the first
        // section, if none has shelves); the tie and belt rack beside the first hanging space.
        const shelfAt = s.inside.findIndex((k) => k === "hang-shelves" || k === "shelves" || k === "shelves-drawers");
        const jewelleryAt = s.extras.includes("jewellery") ? Math.max(0, shelfAt) : -1;
        const tiesAt = s.extras.includes("ties") ? s.inside.findIndex((k) => k !== "shelves" && k !== "shelves-drawers") : -1;
        const ACC = 0.11; // the height a jewellery drawer takes, with its clearance
        const felt = inCarcass(flat("felt", 0x3b393e, 0.96));
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
              // Under each shelf, just behind its front edge, facing down (research 05).
              if (lit) led(ax + 0.02, bx - 0.02, y - 0.001, zf - 0.026, { light: false });
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
            if (trousers && top - yBot > 0.3) {
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
          /**
           * The jewellery drawer, pulled half out: a shallow box on runners with a felt-lined tray
           * divided into compartments, a few watches lying in it. `y` is its underside.
           */
          const jewelleryDrawer = (y) => {
            const dh = 0.085, out = 0.24, depth = Math.max(0.2, Math.min(0.42, zf - 0.06));
            const zb = zf - depth + out, x0 = ax + 0.014, x1 = bx - 0.014, wide = x1 - x0;
            for (const rx of [ax + 0.002, bx - 0.012]) block(chrome, rx, y + 0.014, zf - depth, 0.01, 0.012, depth + out * 0.7, { cast: false });
            block(carcass, x0, y, zb, wide, 0.012, depth);
            block(carcass, x0, y, zb, 0.012, dh, depth);
            block(carcass, x1 - 0.012, y, zb, 0.012, dh, depth);
            block(carcass, x0, y, zb, wide, dh, 0.012);
            piece(drawerFront, x0 - 0.002, y - 0.004, zb + depth - 0.019, wide + 0.004, dh + 0.012, 0.019, { r: 0.002 });
            block(felt, x0 + 0.012, y + 0.012, zb + 0.012, wide - 0.024, 0.008, depth - 0.031);
            const cols = Math.max(3, Math.round(wide / 0.13)), rows = 3;
            const cw = (wide - 0.024) / cols, cd2 = (depth - 0.031) / rows;
            for (let c = 1; c < cols; c++) block(felt, x0 + 0.012 + c * cw - 0.003, y + 0.02, zb + 0.012, 0.006, 0.034, depth - 0.031, { cast: false });
            for (let r = 1; r < rows; r++) block(felt, x0 + 0.012, y + 0.02, zb + 0.012 + r * cd2 - 0.003, wide - 0.024, 0.034, 0.006, { cast: false });
            // Watches in the front row, every other compartment: a dial on a dark strap.
            for (let c = 0; c < cols; c += 2) {
              const cx = x0 + 0.012 + (c + 0.5) * cw, cz = zb + 0.012 + 2.5 * cd2;
              block(flat("strap", 0x241f1c, 0.7), cx - 0.011, y + 0.021, cz - cd2 * 0.36, 0.022, 0.006, cd2 * 0.72, { cast: false });
              cylinder(c % 4 ? brass : chrome, 0.017, 0.009, cx, y + 0.029, cz, "y");
            }
          };
          /** The tie and belt rack, on the right-hand panel, pulled part way out, ties and belts hanging from its hooks. */
          const tieRack = (yRack) => {
            const x = bx - 0.032, len = Math.min(0.44, zf - 0.08), z0 = zf - len, out = 0.14;
            block(chrome, bx - 0.012, yRack + 0.026, z0, 0.01, 0.026, len, { cast: false });
            block(chrome, x - 0.004, yRack, z0 + out, 0.008, 0.012, len);
            for (let i = 0; i < 9; i++) {
              const z = z0 + out + 0.03 + (i * (len - 0.06)) / 8;
              cylinder(chrome, 0.0025, 0.022, x, yRack - 0.008, z, "x");
              const belt = i % 3 === 2;
              soft(x, yRack - 0.012 - (belt ? 0.29 : 0.21), z, 0.006, belt ? 0.56 : 0.4, belt ? 0.03 : 0.05,
                belt ? [0x2a2420, 0x5b3a26][i % 2] : CLOTH[Math.floor(rnd() * CLOTH.length)]);
            }
          };
          const tieHere = si === tiesAt;
          const gap = tieHere ? 0.1 : 0; // the hanging moves over for the tie rack

          if (kind === "hang") {
            shelf(ax, bx, yTop - 0.32);
            stacks(rnd, ax, bx, yTop - 0.32 + T, 0.3, zf);
            let low = floorKit(yTop - 0.4);
            if (si === jewelleryAt) { jewelleryDrawer(low + 0.012); low += ACC; }
            hanging(rnd, ax, bx - gap, yTop - 0.4, Math.min(1.35, yTop - 0.4 - low - 0.14), zf);
            if (tieHere) tieRack(yTop - 0.62);
          } else if (kind === "double") {
            let low = floorKit(yBot + H * 0.5);
            if (si === jewelleryAt) { jewelleryDrawer(low + 0.012); low += ACC; }
            hanging(rnd, ax, bx - gap, yTop - 0.09, Math.min(0.98, H * 0.5 - 0.2), zf);
            hanging(rnd, ax, bx - gap, yBot + H * 0.5, Math.min(0.98, yBot + H * 0.5 - low - 0.14), zf);
            if (tieHere) tieRack(yTop - 0.3);
          } else if (kind === "hang-shelves") {
            const mid = yBot + H * 0.44;
            shelf(ax, bx, mid);
            hanging(rnd, ax, bx - gap, yTop - 0.09, Math.min(1.05, yTop - 0.09 - mid - 0.16), zf);
            if (si === jewelleryAt) {
              // Just under the shelf the hanging stops at: about waist height.
              shelves(yBot, mid - ACC, 2);
              jewelleryDrawer(mid - ACC + 0.006);
            } else {
              shelves(yBot, mid, 2);
            }
            if (tieHere) tieRack(yTop - 0.36);
          } else if (kind === "shelves") {
            if (si === jewelleryAt) {
              const waist = Math.max(yBot + 0.45, Math.min(0.92, yTop - 0.7));
              shelves(yBot, waist, 2);
              jewelleryDrawer(waist + 0.006);
              shelf(ax, bx, waist + ACC);
              shelves(waist + ACC + T, yTop, 2);
            } else {
              shelves(yBot, yTop, 5);
            }
          } else if (kind === "hang-drawers") {
            let top = drawers();
            if (si === jewelleryAt) { jewelleryDrawer(top + 0.006); top += ACC; }
            hanging(rnd, ax, bx - gap, yTop - 0.09, Math.min(1.25, yTop - 0.09 - top - 0.14), zf);
            if (tieHere) tieRack(yTop - 0.36);
          } else {
            const top = drawers();
            if (si === jewelleryAt) {
              jewelleryDrawer(top + 0.006);
              shelf(ax, bx, top + ACC);
              shelves(top + ACC + T, yTop, 3);
            } else {
              shelves(top, yTop, 3);
            }
          }
          if (lit) {
            // Where there is hanging, a strip down each side as well as the one along the top
            // front, so the light comes round the clothes; the side strips stop above any drawers.
            const hangs = kind === "hang" || kind === "double" || kind === "hang-shelves" || kind === "hang-drawers";
            led(ax + 0.02, bx - 0.02, yTop - 0.001, zf - 0.004, { light: !hangs, reach: Math.min(2.4, H * 0.9) });
            if (hangs) {
              const from = kind === "hang-drawers" ? yBot + 0.6 + T + 0.01 : yBot + 0.01;
              ledSide(ax, 1, from, yTop - 0.01, zf + 0.003);
              ledSide(bx, -1, from, yTop - 0.01, zf + 0.003);
            }
          }
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
        block(finishAcross, ax, 0, baseD - 0.03 - 0.018, aw, PLINTH, 0.018);
        contact(ax, bx, 0, baseD);
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
          handle((ax + bx) / 2, doorTop - dh / 2, baseD, { vertical: false, long: Math.min(0.24, aw * 0.3), edge: doorTop });
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
          if (lit) led(ax + 0.03, bx - 0.03, y - 0.033, sd - 0.026, { reach: Math.max(0.7, step * 1.3) });
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
    // Hanging clothes, one instanced shape per kind, then the hangers (fix 4).
    const m4g = new THREE.Matrix4(), qg = new THREE.Quaternion(), cg = new THREE.Color(), upg = new THREE.Vector3(0, 1, 0);
    for (const kind of GARMENTS) {
      const list = garments[kind];
      if (!list.length) continue;
      const im = new THREE.InstancedMesh(garmentGeos[kind], garmentCloth, list.length);
      list.forEach(([x, top, z, thick, len, depth, color, ry], i) => {
        qg.setFromAxisAngle(upg, ry);
        m4g.compose(new THREE.Vector3(x, top, z), qg, new THREE.Vector3(thick, len, depth));
        im.setMatrixAt(i, m4g);
        im.setColorAt(i, cg.set(color));
      });
      im.castShadow = true;
      im.receiveShadow = true;
      g.add(im);
    }
    if (hangers.length) {
      const im = new THREE.InstancedMesh(hangerGeo, hangerWood, hangers.length);
      qg.identity();
      hangers.forEach(([x, top, z, thick, tall, depth], i) => {
        m4g.compose(new THREE.Vector3(x, top, z), qg, new THREE.Vector3(thick, tall, depth));
        im.setMatrixAt(i, m4g);
      });
      im.castShadow = true;
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
      // About 1.72m tall, always turned to face the viewer, with a soft patch of shade at the
      // feet. Solid, the way an architect's scale figure is, and hidden by whatever stands in
      // front of it: a see-through figure laid over the doors broke the photographic look (fix 5).
      fig = new THREE.Group();
      fig.position.set(personAt[0], 0, personAt[1]);
      const body = new THREE.Mesh(plane, mat("figure", () => new THREE.MeshBasicMaterial({ map: figureMap, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })));
      body.scale.set(0.688, 1.72, 1);
      body.position.y = 0.86;
      body.renderOrder = 1;
      const underfoot = new THREE.Mesh(plane, mat("figure-shade", () => {
        const m = new THREE.MeshBasicMaterial({ map: shadeMap, transparent: true, opacity: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
        m.userData.photo = "skip"; // the photo traces the figure's real shadow
        return m;
      }));
      underfoot.scale.set(0.62, 0.3, 1);
      underfoot.rotation.x = -Math.PI / 2;
      underfoot.position.y = 0.002;
      fig.add(underfoot, body);
    }

    // Always LIGHT_BUDGET point lights, the spare ones dark (20 Nov 2026): every shader is built
    // for the number of lights in the scene, so a design with fewer, or none (lighting not
    // chosen), had every shader built again, freezing the page on a laptop's own graphics.
    while (lights.length < LIGHT_BUDGET) {
      const p = new THREE.PointLight(0xffdcae, 0, 0.01, 1.6);
      p.position.set(0, -20, 0);
      g.add(p);
      lights.push(p);
    }

    return { g, bounds, side, doors: doorList, figure: fig, lit: strips.length > 0, strips };
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
    // Near enough to see a handle or a drawer close up once a spot is chosen (zoomOn).
    controls.minDistance = dist * 0.28;
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
    // The photo's window: a large, soft rectangle of daylight behind the viewer's left
    // shoulder, the side the sunlight here comes from, kept inside the room's walls.
    const kx = target.x - Math.max(1.6, (x1 - x0) * 0.55);
    keyLight = {
      position: new THREE.Vector3(side === "inside" ? Math.max(kx, x0 + 0.3) : kx, h * 0.62, target.z + dist * 0.8),
      target: new THREE.Vector3(target.x, h * 0.42, target.z * 0.5),
      width: 1.5, height: 1.9, intensity: PHOTO_KEY,
    };
    fit = { key: bounds.map((n) => n.toFixed(3)).join(), side, home, target: target.clone(), dist };
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    stopPhoto();
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (state.bounds) frameCamera(state.bounds, state.side);
    requestRender();
  }

  /* ---- Doors -------------------------------------------------------------- */

  function setDoors(amount) {
    sceneVersion++; // the doors moved: the photo's copy of the scene is out of date
    openAmount = amount;
    const eased = amount * amount * (3 - 2 * amount);
    for (const pivot of doors) pivot.rotation.y = pivot.userData.swing * eased * OPEN_ANGLE;
  }

  function animateDoors() {
    cancelAnimationFrame(anim);
    stopPhoto();
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
    if (figure) scene.remove(figure);
    group = built.g;
    figure = built.figure;
    doors = built.doors;
    scene.add(group);
    if (figure) scene.add(figure);
    for (const [key, geo] of geos) if (!used.has(key)) { geo.dispose(); geos.delete(key); }
    // Wood not in this design is kept for a while (20 Nov 2026): a shader goes with the last
    // material using it, and building it again froze the page whenever a finish came back.
    // Only past a few hundred are the oldest let go (their pictures are shared, so they cost little).
    if (woodMats.size > 400) {
      for (const [key, wood] of woodMats) {
        if (woodMats.size <= 300) break;
        if (!usedWood.has(key)) { wood.map?.dispose(); wood.dispose(); woodMats.delete(key); }
      }
    }
    state.lit = built.lit;
    state.strips = built.strips;
    sceneVersion++;
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

  /**
   * Zoom on a spot (a founder's review, 19 Nov 2026: "what if i want to zoom in on the
   * side?"): a double click, or a double tap, on the design turns the view round the point
   * it lands on and moves one step nearer; the + and - buttons then zoom on that point.
   */
  const ray = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function zoomOn(clientX, clientY) {
    if (!group || !state.bounds) return;
    const r = canvas.getBoundingClientRect();
    pointer.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObject(group, true)[0];
    if (!hit) return;
    const [x0, x1, h, d] = state.bounds;
    const clamp = THREE.MathUtils.clamp;
    const spot = new THREE.Vector3(clamp(hit.point.x, x0, x1), clamp(hit.point.y, 0.15, h - 0.1), clamp(hit.point.z, 0, d + 0.4));
    const offset = camera.position.clone().sub(controls.target);
    controls.target.copy(spot);
    camera.position.copy(spot).add(offset);
    zoom(1);
  }
  let lastPointer = "mouse";
  let lastTap = { at: 0, x: 0, y: 0 };
  const onPointerDown = (e) => { lastPointer = e.pointerType; };
  const onDoubleClick = (e) => { if (lastPointer !== "touch") zoomOn(e.clientX, e.clientY); };
  const onPointerUp = (e) => {
    if (e.pointerType !== "touch") return;
    const now = performance.now();
    if (now - lastTap.at < 320 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30) {
      lastTap = { at: 0, x: 0, y: 0 };
      zoomOn(e.clientX, e.clientY);
    } else {
      lastTap = { at: now, x: e.clientX, y: e.clientY };
    }
  };
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("dblclick", onDoubleClick);
  canvas.addEventListener("pointerup", onPointerUp);

  /** Nearer or further, in steps, within the limits the framing set. */
  function zoom(step) {
    const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
    const next = THREE.MathUtils.clamp(dir.length() * (step > 0 ? 0.85 : 1 / 0.85), controls.minDistance, controls.maxDistance);
    camera.position.copy(controls.target).add(dir.setLength(next));
    controls.update();
    requestRender();
  }

  /** Straight on, or the three-quarter view it opens with: the whole design again, after any spot zoomed on. */
  function look(view) {
    if (fit?.target) controls.target.copy(fit.target);
    const dist = fit?.dist ?? camera.position.distanceTo(controls.target);
    const az = view === "front" ? 0 : (fit?.home ?? HOME_AZ), pol = view === "front" ? 1.5 : HOME_POLAR;
    camera.position.set(
      controls.target.x + dist * Math.sin(pol) * Math.sin(az),
      controls.target.y + dist * Math.cos(pol),
      controls.target.z + dist * Math.sin(pol) * Math.cos(az),
    );
    controls.update();
    requestRender();
  }

  /** The current view as a picture (drawn afresh first, so it is never blank): the photo once it is showing. */
  function snapshot(type = "image/jpeg", quality = 0.88) {
    turnFigure();
    if (!photo?.redraw()) drawFull();
    return canvas.toDataURL(type, quality);
  }

  const onContextLost = (e) => {
    e.preventDefault();
    lost = true;
    cancelAnimationFrame(anim);
    stopPhoto();
    photo = null; // its GPU copies went with the context; a new one is made on the next still moment
    ready = false; // the shaders went too: built again, ahead of time, once it is back
    warming = null;
    styleQueue = null;
    onLost?.();
  };
  const onContextRestored = () => { lost = false; onRestored?.(); if (state.design) { rebuild(); requestRender(); } };
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

  const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  observer?.observe(canvas);
  resize();

  function dispose() {
    gone = true;
    cancelAnimationFrame(raf);
    cancelAnimationFrame(anim);
    clearTimeout(fineTimer);
    stopPhoto();
    photo?.dispose();
    observer?.disconnect();
    seen?.disconnect();
    clearTimeout(scrollTimer);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibility);
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("dblclick", onDoubleClick);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    canvas.removeEventListener("webglcontextrestored", onContextRestored);
    controls.dispose();
    for (const m of materials.values()) m.dispose();
    for (const wood of woodMats.values()) { wood.map?.dispose(); wood.dispose(); }
    for (const t of textures) t.dispose();
    for (const geo of geos.values()) geo.dispose();
    for (const geo of [unitBox, softBox, ball, rod, plane, hangerGeo, knobGeo, ...Object.values(garmentGeos), ...capsules.values()]) geo.dispose();
    aoPass?.dispose();
    bloomPass?.dispose();
    composer?.dispose();
    envTexture.dispose();
    pmrem.dispose();
    renderer.dispose();
  }

  return { update, resize, zoom, look, snapshot, dispose };
}
