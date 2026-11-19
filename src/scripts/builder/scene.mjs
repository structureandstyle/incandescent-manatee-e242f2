/**
 * THE 3D VIEW of the design-your-own builder (19 Nov 2026).
 *
 * Loaded only when a visitor opens the builder (the page imports this file on
 * demand), so no other page, and nothing above the builder on this one, waits
 * for a 3D library. The page works without it: the drawing in elevation.mjs
 * shows the same design, and the form, the price and the enquiry never touch
 * this file.
 *
 * Everything is boxes, sized from the same describe() the price and the
 * wording read (model.mjs). Nothing here knows a price.
 *
 * Kept small on purpose, for phones:
 *   - one shared box geometry, scaled per part; clothes and books are instanced;
 *   - it draws a frame only when something changed, never in a loop;
 *   - pixel ratio capped at 2; a lost graphics context is reported, not fatal.
 *
 * Units are metres. x runs left to right, y up from the floor, z out from the
 * back wall towards the viewer.
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { COLOURS, describe } from "./model.mjs";

const MM = 0.001;
const T = 0.018; // board
const PLINTH = 0.1;
const TOP_FILL = 0.06; // scribed strip under the ceiling
const WALL_FILL = 0.04; // scribed strip against a wall
const GAP = 0.004;
const DOOR_T = 0.02;

const INK = 0x221d18;
const WALL = 0xf4f0e6;
const INTERIOR = 0xe9e3d6;
const BRASS = 0xb08d57;

/** A small repeatable random source, so the clothes do not reshuffle on every change. */
const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const SOFT = [0x2c4a3a, 0x6e4b2a, 0xb28451, 0xd9d2c2, 0x8b9aa3, 0x3b3a39, 0xa3ae98, 0xc9b79c, 0x27344a, 0xe9e3d6];

function grainTexture(hex) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  g.fillStyle = hex;
  g.fillRect(0, 0, 256, 256);
  const rnd = seeded(7);
  for (let i = 0; i < 150; i++) {
    const x = rnd() * 256;
    g.strokeStyle = rnd() > 0.5 ? `rgba(0,0,0,${0.03 + rnd() * 0.07})` : `rgba(255,255,255,${0.03 + rnd() * 0.06})`;
    g.lineWidth = 0.6 + rnd() * 1.8;
    g.beginPath();
    g.moveTo(x, 0);
    g.bezierCurveTo(x + rnd() * 8 - 4, 85, x + rnd() * 8 - 4, 170, x + rnd() * 10 - 5, 256);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function floorTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d");
  const rnd = seeded(11);
  const rows = 6;
  const rh = 512 / rows;
  for (let r = 0; r < rows; r++) {
    let x = -rnd() * 300;
    while (x < 512) {
      const len = 220 + rnd() * 240;
      const shade = 0.92 + rnd() * 0.14;
      g.fillStyle = `rgb(${Math.round(196 * shade)},${Math.round(164 * shade)},${Math.round(122 * shade)})`;
      g.fillRect(x, r * rh, len, rh);
      g.fillStyle = "rgba(60,40,20,0.35)";
      g.fillRect(x + len - 1, r * rh, 1.5, rh);
      x += len;
    }
    g.fillStyle = "rgba(60,40,20,0.3)";
    g.fillRect(0, r * rh, 512, 1.5);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

export function createView(canvas, { onLost, onRestored } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "default" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2eee3);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  // The wheel scrolls the page and a vertical swipe scrolls it too: a 3D view
  // that swallows both traps a phone visitor above it. Zoom is on the buttons.
  controls.enableZoom = false;
  controls.rotateSpeed = 0.7;
  controls.minAzimuthAngle = -1.0;
  controls.maxAzimuthAngle = 1.0;
  controls.minPolarAngle = 1.05;
  controls.maxPolarAngle = 1.56;
  canvas.style.touchAction = "pan-y";

  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d2c2, 0.62));
  const sun = new THREE.DirectionalLight(0xfff4e2, 2.5);
  sun.castShadow = true;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.02;
  scene.add(sun, sun.target);
  const fill = new THREE.DirectionalLight(0xffffff, 0.45);
  scene.add(fill);

  const unitBox = new THREE.BoxGeometry(1, 1, 1);
  const ball = new THREE.SphereGeometry(1, 20, 14);
  const rod = new THREE.CylinderGeometry(1, 1, 1, 14);
  const plane = new THREE.PlaneGeometry(1, 1);
  const materials = new Map();
  const textures = [];
  const mat = (key, make) => {
    if (!materials.has(key)) materials.set(key, make());
    return materials.get(key);
  };
  const flat = (key, color, roughness = 0.85, metalness = 0) =>
    mat(key, () => new THREE.MeshStandardMaterial({ color, roughness, metalness }));

  const floorMap = floorTexture();
  textures.push(floorMap);

  /** The door and panel material for a finish and example colour. */
  const finishMaterial = (finish, colour) => mat(`finish-${finish}-${colour}`, () => {
    const c = COLOURS[finish][colour];
    // Melamine a soft sheen, hand-painted matt, sprayed smoother, veneer lacquered.
    const roughness = [0.55, 0.9, 0.42, 0.5][finish];
    const m = new THREE.MeshStandardMaterial({ color: c.hex, roughness, metalness: 0 });
    if (c.grain) {
      const t = grainTexture(c.hex);
      textures.push(t);
      m.map = t;
      m.color.set(0xffffff);
    }
    return m;
  });

  let group = null;
  let frame = 0;
  let fit = null; // { target, dist }
  let lost = false;

  const render = () => {
    frame = 0;
    if (lost) return;
    renderer.render(scene, camera);
  };
  const requestRender = () => { if (!frame) frame = requestAnimationFrame(render); };
  controls.addEventListener("change", requestRender);

  function build(design, { open = false, person = true } = {}) {
    const s = describe(design);
    const g = new THREE.Group();
    const finish = finishMaterial(s.finish, s.colour);
    const recess = mat(`recess-${s.finish}-${s.colour}`, () => {
      const m = finish.clone();
      m.color.multiplyScalar(0.86);
      return m;
    });
    const inside = flat("inside", INTERIOR, 0.8);
    const insideDark = flat("inside-dark", 0xd8d0bf, 0.8);
    const wall = flat("wall", WALL, 1);
    // Unlit, so the ceiling stays pale from below instead of going dark like the underside of a box.
    const ceiling = mat("ceiling", () => new THREE.MeshBasicMaterial({ color: 0xf1ede2 }));
    const metal = flat("metal", 0xa49a8a, 0.35, 0.85);
    const brass = flat("brass", BRASS, 0.34, 0.9);
    const glow = mat("glow", () => new THREE.MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffd9a0, emissiveIntensity: 2.2, roughness: 1 }));
    const floor = mat("floor", () => new THREE.MeshStandardMaterial({ map: floorMap, roughness: 0.75 }));

    /** A box from its lower-left-back corner and its size. */
    const slab = (m, x0, y0, z0, w, h, d, { cast = true, receive = true, parent = g } = {}) => {
      const mesh = new THREE.Mesh(unitBox, m);
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

    // Clothes, folded stacks and books: one instanced mesh for all of them.
    const softs = [];
    const soft = (x0, y0, z0, w, h, d, color) => softs.push([x0 + w / 2, y0 + h / 2, z0 + d / 2, w, h, d, color]);

    const handleAt = (x, y, z, vertical = true) => {
      if (s.handle === "none") return;
      if (s.handle === "knob") {
        const k = new THREE.Mesh(ball, brass);
        k.scale.setScalar(0.015);
        k.position.set(x, y, z + 0.02);
        k.castShadow = true;
        g.add(k);
        const stem = new THREE.Mesh(rod, brass);
        stem.scale.set(0.006, 0.014, 0.006);
        stem.rotation.x = Math.PI / 2;
        stem.position.set(x, y, z + 0.007);
        g.add(stem);
        return;
      }
      const len = 0.2;
      const bar = new THREE.Mesh(rod, brass);
      bar.scale.set(0.006, len, 0.006);
      if (!vertical) bar.rotation.z = Math.PI / 2;
      bar.position.set(x, y, z + 0.026);
      bar.castShadow = true;
      g.add(bar);
      for (const o of [-len / 2 + 0.03, len / 2 - 0.03]) {
        const post = new THREE.Mesh(rod, brass);
        post.scale.set(0.004, 0.026, 0.004);
        post.rotation.x = Math.PI / 2;
        post.position.set(vertical ? x : x + o, vertical ? y + o : y, z + 0.013);
        g.add(post);
      }
    };

    /** One door: a flat slab, or a Shaker frame around a set-back panel. */
    const door = (x0, y0, w, h, z) => {
      if (s.door === "flat") return slab(finish, x0, y0, z - DOOR_T, w, h, DOOR_T);
      const f = Math.min(0.075, w * 0.22);
      slab(finish, x0, y0, z - DOOR_T, f, h, DOOR_T);
      slab(finish, x0 + w - f, y0, z - DOOR_T, f, h, DOOR_T);
      slab(finish, x0 + f, y0, z - DOOR_T, w - 2 * f, f, DOOR_T);
      slab(finish, x0 + f, y0 + h - f, z - DOOR_T, w - 2 * f, f, DOOR_T);
      // The panel sits back from the frame and a shade darker, so the frame reads from across a room.
      slab(recess, x0 + f, y0 + f, z - DOOR_T, w - 2 * f, h - 2 * f, DOOR_T - 0.01);
    };

    const rail = (x0, x1, y, z) => {
      const r = new THREE.Mesh(rod, metal);
      r.scale.set(0.011, x1 - x0, 0.011);
      r.rotation.z = Math.PI / 2;
      r.position.set((x0 + x1) / 2, y, z);
      r.castShadow = true;
      g.add(r);
    };

    let bounds; // what the camera frames: [x0, x1, height, depth]

    if (s.unit === "wardrobe") {
      const w = s.w * MM, h = s.h * MM, d = s.d * MM;
      const wallL = s.fit === "both" || s.fit === "left";
      const wallR = s.fit === "both" || s.fit === "right";
      const mL = wallL ? WALL_FILL : T, mR = wallR ? WALL_FILL : T;
      const x0 = -w / 2, x1 = w / 2;
      const iw = w - mL - mR;
      const dw = iw / s.doors;
      const doorH = h - PLINTH - TOP_FILL;
      const padL = wallL ? 0 : 0.9, padR = wallR ? 0 : 0.9;

      // The room: back wall, the side walls it meets, and the floor.
      const roomW = w + padL + padR, roomX = (x0 - padL + x1 + padR) / 2;
      // The floor and side walls run well past the viewer, so no edge of the room shows in the frame.
      const run = d + 9;
      sheet(wall, roomW + 0.2, h, roomX, h / 2, 0);
      if (wallL) sheet(wall, run, h, x0, h / 2, run / 2, Math.PI / 2);
      if (wallR) sheet(wall, run, h, x1, h / 2, run / 2, -Math.PI / 2);
      const floorW = roomW + (wallL ? 0 : 5) + (wallR ? 0 : 5);
      const floorX = roomX + ((wallR ? 0 : 2.5) - (wallL ? 0 : 2.5));
      sheet(floor, floorW, run, floorX, 0, run / 2, 0, -Math.PI / 2);
      sheet(ceiling, floorW, run, floorX, h, run / 2, 0, Math.PI / 2);
      floorMap.repeat.set(floorW / 1.6, run / 1.6);

      // Fillers to a wall, or an end panel on an open side; the strip under the ceiling; the plinth.
      if (wallL) slab(finish, x0, 0, d - DOOR_T, WALL_FILL, h, DOOR_T); else slab(finish, x0, 0, 0, T, h, d);
      if (wallR) slab(finish, x1 - WALL_FILL, 0, d - DOOR_T, WALL_FILL, h, DOOR_T); else slab(finish, x1 - T, 0, 0, T, h, d);
      slab(finish, x0 + mL, h - TOP_FILL, d - DOOR_T, iw, TOP_FILL, DOOR_T);
      slab(flat("plinth", INK, 0.9), x0 + mL, 0, d - 0.06, iw, PLINTH, 0.02);

      // The carcass, seen once the doors come off.
      slab(inside, x0 + mL, PLINTH, 0.002, iw, doorH, 0.006, { cast: false });
      slab(inside, x0 + mL, PLINTH, 0.008, iw, T, d - DOOR_T - 0.012);
      slab(inside, x0 + mL, h - TOP_FILL - T, 0.008, iw, T, d - DOOR_T - 0.012);
      let cursor = x0 + mL;
      const sectionX = [];
      s.sections.forEach((n, i) => {
        const sw = n * dw;
        sectionX.push([cursor, cursor + sw]);
        slab(inside, cursor, PLINTH, 0.008, T, doorH, d - DOOR_T - 0.012);
        if (i === s.sections.length - 1) slab(inside, cursor + sw - T, PLINTH, 0.008, T, doorH, d - DOOR_T - 0.012);
        cursor += sw;
      });

      if (!open) {
        let i = 0;
        s.sections.forEach((n, si) => {
          const [sx0, sx1] = sectionX[si];
          for (let k = 0; k < n; k++, i++) {
            door(x0 + mL + i * dw + GAP / 2, PLINTH + GAP, dw - GAP, doorH - 2 * GAP, d);
          }
          const hy = PLINTH + Math.min(1.05, doorH * 0.48);
          if (n === 2) {
            const mid = (sx0 + sx1) / 2;
            handleAt(mid - 0.04, hy, d);
            handleAt(mid + 0.04, hy, d);
          } else {
            handleAt(sx0 + 0.045, hy, d);
          }
        });
      } else {
        const yBot = PLINTH + T, yTop = h - TOP_FILL - T, H = yTop - yBot;
        const zf = d - DOOR_T - 0.03; // how far forward the inside reaches
        const shelfAt = (ax, bx, y) => slab(inside, ax, y, 0.01, bx - ax, T, zf - 0.02);
        const lit = s.extras.includes("lighting");
        sectionX.forEach(([sx0, sx1], si) => {
          const rnd = seeded(31 + si * 17);
          const ax = sx0 + T + 0.004, bx = sx1 - (si === sectionX.length - 1 ? T : 0) - 0.004;
          const iwid = bx - ax;
          const kind = s.inside[si];
          const hang = (yRail, length) => {
            // Clothes hang front to back and never reach past a shallow carcass.
            const cd = Math.min(0.42, zf - 0.05);
            const cz = (zf - cd) / 2 + 0.012;
            rail(ax, bx, yRail, cz + cd / 2);
            const n = Math.max(2, Math.floor((iwid - 0.08) / 0.058));
            for (let k = 0; k < n; k++) {
              const cw = 0.03 + rnd() * 0.016;
              const len = length * (0.72 + rnd() * 0.28);
              soft(ax + 0.04 + k * 0.058 + rnd() * 0.008, yRail - 0.03 - len, cz, cw, len, cd, SOFT[Math.floor(rnd() * SOFT.length)]);
            }
          };
          const stacks = (y, room) => {
            const n = Math.max(1, Math.floor(iwid / 0.42));
            for (let k = 0; k < n; k++) {
              if (rnd() < 0.25) continue;
              const sh = Math.min(room - 0.05, 0.05 + rnd() * 0.12);
              soft(ax + 0.06 + k * (iwid - 0.12) / n, y + T, 0.08, Math.min(0.3, (iwid - 0.12) / n - 0.05), sh, 0.3, SOFT[Math.floor(rnd() * SOFT.length)]);
            }
          };
          const drawers = () => {
            for (let k = 0; k < 3; k++) {
              slab(insideDark, ax, yBot + k * 0.2 + 0.003, zf - 0.02, iwid, 0.194, 0.018);
              const pull = new THREE.Mesh(ball, metal);
              pull.scale.setScalar(0.012);
              pull.position.set((ax + bx) / 2, yBot + k * 0.2 + 0.1, zf + 0.008);
              g.add(pull);
            }
            shelfAt(ax, bx, yBot + 0.6);
            return yBot + 0.6 + T;
          };
          const shelves = (from, to, count) => {
            const step = (to - from) / (count + 1);
            for (let k = 1; k <= count; k++) { shelfAt(ax, bx, from + step * k); stacks(from + step * k, step); }
            stacks(from - T, step);
          };
          if (kind === "hang") {
            shelfAt(ax, bx, yTop - 0.3);
            stacks(yTop - 0.3, 0.3);
            hang(yTop - 0.36, Math.min(1.3, yTop - 0.36 - yBot - 0.12));
          } else if (kind === "double") {
            hang(yTop - 0.08, Math.min(0.95, H * 0.5 - 0.16));
            hang(yBot + H * 0.5, Math.min(0.95, H * 0.5 - 0.12));
          } else if (kind === "hang-shelves") {
            const mid = yBot + H * 0.44;
            shelfAt(ax, bx, mid);
            hang(yTop - 0.08, Math.min(1.0, yTop - 0.08 - mid - 0.14));
            shelves(yBot, mid, 2);
          } else if (kind === "shelves") {
            shelves(yBot, yTop, 5);
          } else if (kind === "hang-drawers") {
            const top = drawers();
            hang(yTop - 0.08, Math.min(1.2, yTop - 0.08 - top - 0.12));
          } else {
            const top = drawers();
            shelves(top, yTop, 3);
          }
          if (lit) slab(glow, ax + 0.03, yTop - 0.012, zf - 0.07, iwid - 0.06, 0.006, 0.02, { cast: false, receive: false });
        });
      }
      bounds = [x0 - Math.min(padL, 0.35), x1 + Math.min(padR, 0.35), h, d];
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

      // The chimney breast, with a plain fireplace so the room reads at a glance.
      slab(wall, -breast / 2, 0, 0, breast, h, d);
      const fw = Math.min(0.62, breast - 0.5), fh = 0.72;
      slab(flat("hearth-dark", 0x2a2622, 1), -fw / 2, 0, d - 0.01, fw, fh, 0.012, { cast: false });
      const stone = flat("stone", 0xe2dccd, 0.9);
      slab(stone, -fw / 2 - 0.14, 0, d, 0.14, fh + 0.12, 0.05);
      slab(stone, fw / 2, 0, d, 0.14, fh + 0.12, 0.05);
      slab(stone, -fw / 2 - 0.14, fh, d, fw + 0.28, 0.12, 0.05);
      slab(stone, -fw / 2 - 0.22, fh + 0.12, d, fw + 0.44, 0.045, 0.13);
      slab(stone, -fw / 2 - 0.22, 0, d, fw + 0.44, 0.025, 0.36);

      const lit = s.extras.includes("lighting");
      const withDrawers = s.extras.includes("drawers");
      const unit = (ax, bx, seed) => {
        const rnd = seeded(seed);
        const aw = bx - ax;
        const f = 0.02;
        const topT = 0.025;
        slab(flat("plinth", INK, 0.9), ax, 0, baseD - 0.06, aw, PLINTH, 0.02);
        slab(inside, ax, PLINTH, 0.004, aw, base - PLINTH - topT, baseD - DOOR_T - 0.008, { cast: false });
        slab(finish, ax, PLINTH, baseD - DOOR_T, f, base - PLINTH - topT, DOOR_T);
        slab(finish, bx - f, PLINTH, baseD - DOOR_T, f, base - PLINTH - topT, DOOR_T);
        slab(finish, ax, base - topT, 0, aw, topT, baseD + 0.015);
        const dw = (aw - 2 * f) / 2;
        let doorTop = base - topT - GAP;
        if (withDrawers) {
          const dh = 0.17;
          slab(finish, ax + f + GAP / 2, doorTop - dh, baseD - DOOR_T, aw - 2 * f - GAP, dh, DOOR_T);
          handleAt((ax + bx) / 2, doorTop - dh / 2, baseD, false);
          doorTop -= dh + GAP;
        }
        const doorH = doorTop - PLINTH - GAP;
        if (!open) {
          door(ax + f + GAP / 2, PLINTH + GAP, dw - GAP, doorH, baseD);
          door(ax + f + dw + GAP / 2, PLINTH + GAP, dw - GAP, doorH, baseD);
          const hy = PLINTH + GAP + doorH - 0.12;
          handleAt((ax + bx) / 2 - 0.04, hy, baseD);
          handleAt((ax + bx) / 2 + 0.04, hy, baseD);
        } else {
          slab(inside, ax + f, PLINTH + doorH * 0.5, 0.01, aw - 2 * f, T, baseD - 0.06);
        }
        // Open shelves above, the top one a hand's width under the ceiling.
        const sd = Math.max(0.16, Math.min(d - 0.02, 0.3));
        const step = s.shelves ? (h - base - 0.28) / s.shelves : 0;
        for (let k = 1; k <= s.shelves; k++) {
          const y = base + step * k;
          slab(finish, ax, y - 0.03, 0, aw, 0.03, sd);
          if (lit) slab(glow, ax + 0.03, y - 0.036, sd - 0.04, aw - 0.06, 0.005, 0.014, { cast: false, receive: false });
        }
        // Books and a few objects, so the shelves read as shelves.
        for (let k = 0; k <= s.shelves; k++) {
          const y = k === 0 ? base : base + step * k;
          const room = (k === s.shelves ? 0.28 : step) - 0.05;
          if (room < 0.1) continue;
          let x = ax + 0.05 + rnd() * 0.06;
          const end = ax + aw * (0.45 + rnd() * 0.3);
          while (x < end) {
            const bw = 0.02 + rnd() * 0.028;
            const bh = Math.min(room, 0.17 + rnd() * 0.1);
            soft(x, y, 0.03, bw, bh, Math.min(sd - 0.05, 0.14 + rnd() * 0.05), SOFT[Math.floor(rnd() * SOFT.length)]);
            x += bw + 0.002;
          }
          if (rnd() > 0.4 && aw > 0.6) {
            const vase = new THREE.Mesh(rod, flat("vase", 0xd9d2c2, 0.6));
            const vh = Math.min(room, 0.12 + rnd() * 0.1);
            vase.scale.set(0.045, vh, 0.045);
            vase.position.set(bx - 0.14 - rnd() * 0.08, y + vh / 2, sd * 0.5);
            vase.castShadow = true;
            g.add(vase);
          }
        }
      };
      unit(xL, -breast / 2, 5);
      if (s.count === 2) unit(breast / 2, xR, 9);
      bounds = [xL, xR, h, baseD];
    }

    if (softs.length) {
      const im = new THREE.InstancedMesh(unitBox, flat("soft", 0xffffff, 0.95), softs.length);
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), c = new THREE.Color();
      softs.forEach(([x, y, z, w, hh, dd, color], i) => {
        m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(w, hh, dd));
        im.setMatrixAt(i, m4);
        im.setColorAt(i, c.set(color));
      });
      im.castShadow = true;
      im.receiveShadow = true;
      g.add(im);
    }

    if (person) {
      // A plain figure about 1.7m tall, for scale: pale and see-through, standing
      // at one end close to the doors, so it measures the design without hiding it.
      const fig = mat("figure", () => new THREE.MeshStandardMaterial({ color: 0x6f6a61, roughness: 1, transparent: true, opacity: 0.42, depthWrite: false }));
      // By a wardrobe: at its right end. By alcoves: in front of the chimney breast, clear of both units.
      const px = s.unit === "alcove" ? (s.breast * MM) / 2 - 0.22 : bounds[1] - 0.3;
      const pz = (s.unit === "alcove" ? s.d * MM : bounds[3]) + 0.32;
      const part = (geo, sx, sy, sz, x, y, z) => {
        const mesh = new THREE.Mesh(geo, fig);
        mesh.scale.set(sx, sy, sz);
        mesh.position.set(px + x, y, pz + z);
        mesh.renderOrder = 2;
        g.add(mesh);
      };
      part(rod, 0.05, 0.82, 0.05, -0.07, 0.41, 0);
      part(rod, 0.05, 0.82, 0.05, 0.07, 0.41, 0);
      part(rod, 0.13, 0.58, 0.085, 0, 1.11, 0);
      part(ball, 0.13, 0.08, 0.085, 0, 1.4, 0);
      part(ball, 0.085, 0.105, 0.09, 0, 1.585, 0);
    }

    return { g, bounds };
  }

  function frameCamera(bounds, keepAngle) {
    const [x0, x1, h, d] = bounds;
    const aspect = camera.aspect || 1;
    const half = THREE.MathUtils.degToRad(camera.fov / 2);
    const tall = (h * 0.5) / Math.tan(half);
    const wide = ((x1 - x0) * 0.5) / (Math.tan(half) * aspect);
    const dist = Math.max(tall, wide) * 1.16 + d + 0.25;
    const target = new THREE.Vector3((x0 + x1) / 2, h * 0.49, d * 0.4);
    let az = 0.36, pol = 1.4;
    if (keepAngle && fit) { az = controls.getAzimuthalAngle(); pol = controls.getPolarAngle(); }
    controls.target.copy(target);
    controls.minDistance = dist * 0.5;
    controls.maxDistance = dist * 1.5;
    camera.position.set(
      target.x + dist * Math.sin(pol) * Math.sin(az),
      target.y + dist * Math.cos(pol),
      target.z + dist * Math.sin(pol) * Math.cos(az),
    );
    camera.lookAt(target);
    controls.update();
    sun.position.set(target.x - 3.4, h + 1.6, d + 3.2);
    sun.target.position.copy(target);
    const span = Math.max(x1 - x0, h) * 0.75 + 1.2;
    Object.assign(sun.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 0.5, far: 14 });
    sun.shadow.camera.updateProjectionMatrix();
    fill.position.set(target.x + 3, h * 0.7, d + 4);
    fit = { dist, key: bounds.map((n) => n.toFixed(3)).join() };
  }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (state.bounds) frameCamera(state.bounds, true);
    requestRender();
  }

  const state = { design: null, options: {}, bounds: null };

  function update(design, options = {}) {
    state.design = design;
    state.options = { ...state.options, ...options };
    const built = build(design, state.options);
    if (group) {
      // The boxes share one geometry; only the instanced clothes and books hold buffers of their own.
      group.traverse((o) => { if (o.isInstancedMesh) o.dispose(); });
      scene.remove(group);
    }
    group = built.g;
    scene.add(group);
    const key = built.bounds.map((n) => n.toFixed(3)).join();
    const changed = !fit || fit.key !== key;
    state.bounds = built.bounds;
    if (changed) frameCamera(built.bounds, true);
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
    const az = view === "front" ? 0 : 0.36, pol = view === "front" ? 1.5 : 1.4;
    camera.position.set(
      controls.target.x + dist * Math.sin(pol) * Math.sin(az),
      controls.target.y + dist * Math.cos(pol),
      controls.target.z + dist * Math.sin(pol) * Math.cos(az),
    );
    controls.update();
    requestRender();
  }

  /** The current view as a picture (drawn afresh first, so it is never blank). */
  function snapshot(type = "image/jpeg", quality = 0.86) {
    renderer.render(scene, camera);
    return canvas.toDataURL(type, quality);
  }

  const onContextLost = (e) => { e.preventDefault(); lost = true; onLost?.(); };
  const onContextRestored = () => { lost = false; onRestored?.(); if (state.design) update(state.design); };
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

  const observer = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  observer?.observe(canvas);
  resize();

  function dispose() {
    cancelAnimationFrame(frame);
    observer?.disconnect();
    canvas.removeEventListener("webglcontextlost", onContextLost);
    canvas.removeEventListener("webglcontextrestored", onContextRestored);
    controls.dispose();
    for (const m of materials.values()) m.dispose();
    for (const t of textures) t.dispose();
    for (const geo of [unitBox, ball, rod, plane]) geo.dispose();
    envTexture.dispose();
    pmrem.dispose();
    renderer.dispose();
  }

  return { update, resize, zoom, look, snapshot, dispose };
}
