/**
 * THE PHOTO: the design traced with real light (19 Nov 2026, a founder: "the
 * rendering still not good enough").
 *
 * Once the 3D view has been still for a moment on a computer, the same scene
 * is path traced: light from a window and from every LED strip bounces round
 * the room and into the wardrobe, so the picture gains what a real-time one
 * cannot fake: light that fills the inside from the strips, soft shadows in
 * every corner and gap, colour carried from wall to floor, and true
 * reflections in lacquer, chrome and the mirror. It builds up over a few
 * seconds, fades in over the real-time picture, and stops; any move goes
 * straight back to the real-time picture (scene.mjs).
 *
 * Built on three-gpu-pathtracer (MIT; pinned at 0.0.28, which needs three
 * 0.187) and its WebGL tracer. Research: F2F research/2026-11-19-ss-3d-realism,
 * "Heavier routes". Two limits of that tracer shape this file: it cannot read
 * instanced meshes, so the clothes, hooks, hangers, books and fluted reeds
 * are copied out as plain geometry; and it reads only standard and physical
 * materials, so the few unlit ones are swapped and the painted-on shadows are
 * left out (the tracer makes real ones). Area lights are never seen directly
 * by the camera in this tracer, only in reflections, which is what a window
 * behind the viewer and an LED behind its opal cover should do.
 */
import * as THREE from "three";
import { WebGLPathTracer, DenoiseMaterial } from "three-gpu-pathtracer";
import { ClampedInterpolationMaterial } from "three-gpu-pathtracer/src/materials/fullscreen/ClampedInterpolationMaterial.js";
import { FullScreenQuad } from "three/addons/postprocessing/Pass.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/**
 * Samples before the photo starts to show, how long it takes to fade in, and when it stops.
 * Measured 19 Nov 2026 on an Intel HD 630 (a five-year-old laptop's own graphics): about one
 * to two samples a second at these settings, so the photo shows after some twenty seconds of
 * stillness and finishes in two or three minutes; a newer laptop is several times quicker.
 */
const SHOW_AT = 32;
const FADE_MS = 650;
const ENOUGH = 200;
/** The smoothing eases off as samples add up, but stays on: this few samples leave some grain. */
const SMOOTH_UNTIL = ENOUGH * 1.6;
/** The picture on screen is refreshed at most this often while it builds: drawing it costs samples. */
const REFRESH_MS = 280;

/** Warm white LED light, about 3000K (research 05: UK designers choose warm, 2700K to 3000K). */
const LED_COLOUR = 0xffd9a8;

/**
 * The rest of the bedroom, as the open side of the room sees it: a warm
 * ceiling, pale walls, a wooden floor and one tall window on the left, towards
 * the viewer (the real-time picture's window room, scene.mjs). Drawn in code
 * as a small panorama, which is the form this tracer reads (it cannot convert
 * three 0.187's cube environments), so there is still no picture to download.
 */
function roomPanorama(width = 256, height = 128) {
  const data = new Float32Array(width * height * 4);
  const win = new THREE.Vector3(-0.85, 0.36, 0.38).normalize();
  const d = new THREE.Vector3();
  const wall = [0.62, 0.6, 0.56], ceiling = [0.82, 0.8, 0.76], floor = [0.3, 0.23, 0.17];
  for (let y = 0; y < height; y++) {
    const theta = ((y + 0.5) / height - 0.5) * Math.PI; // three's equirect: v = asin(dir.y) / pi + 0.5
    for (let x = 0; x < width; x++) {
      const phi = ((x + 0.5) / width - 0.5) * 2 * Math.PI; // u = atan2(dir.z, dir.x) / 2pi + 0.5
      d.set(Math.cos(theta) * Math.cos(phi), Math.sin(theta), Math.cos(theta) * Math.sin(phi));
      const up = d.y;
      const k = up >= 0 ? Math.min(1, up * 1.6) : Math.min(1, -up * 3);
      const to = up >= 0 ? ceiling : floor;
      let r = wall[0] + (to[0] - wall[0]) * k, g = wall[1] + (to[1] - wall[1]) * k, b = wall[2] + (to[2] - wall[2]) * k;
      // The window: a soft-edged patch of daylight, a touch cool.
      const near = d.dot(win);
      if (near > 0.94) {
        const s = Math.min(1, (near - 0.94) / 0.02) * 5;
        r += 0.95 * s; g += 0.97 * s; b += 1.0 * s;
      }
      if (up > 0.985) { r += 2; g += 1.9; b += 1.7; } // a ceiling light
      const i = (y * width + x) * 4;
      data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 1;
    }
  }
  const t = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.magFilter = THREE.LinearFilter;
  t.minFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  t.needsUpdate = true;
  return t;
}

/**
 * @param {object} o
 * @param {THREE.WebGLRenderer} o.renderer
 * @param {THREE.Camera} o.camera
 * @param {() => void} o.drawRaster  draws the real-time picture to the canvas
 * @param {(state: "tracing"|"photo"|"done", samples: number, progress: number) => void} [o.onState]
 */
export function createPhoto({ renderer, camera, drawRaster, onState }) {
  const environment = roomPanorama();
  const tracer = new WebGLPathTracer(renderer);
  tracer.renderToCanvas = false; // this file decides what reaches the canvas, and when
  tracer.rasterizeScene = false;
  tracer.renderDelay = 0;
  tracer.minSamples = 0;
  tracer.fadeDuration = 0;
  // A room needs several bounces for light to reach the back of a carcass; five is enough.
  tracer.bounces = 5;
  tracer.filterGlossyFactor = 0.5; // fewer sparkles off lacquer and chrome while it builds
  // The canvas is drawn at twice its size on a computer: trace at a little under its own size,
  // which a photograph's softness hides and which a laptop's own graphics can manage.
  tracer.renderScale = 0.4;
  // A quarter of the picture a frame keeps the page answering while it traces.
  tracer.tiles.set(2, 2);
  // No fog volumes and no depth of field here: leaving their code out of the tracer's
  // very large shader shortens the wait the first time it is compiled.
  tracer._pathTracer.material.setDefine("FEATURE_FOG", 0);
  tracer._pathTracer.material.setDefine("FEATURE_DOF", 0);

  // The traced picture is smoothed at its own size into `clean`, then stretched onto the
  // canvas; the real-time picture is kept as a copy for the photo to fade in over.
  const smooth = new FullScreenQuad(new DenoiseMaterial({ map: null, blending: THREE.NoBlending }));
  const clean = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false });
  const toCanvas = new FullScreenQuad(new ClampedInterpolationMaterial({
    map: null, transparent: true, blending: THREE.NoBlending, premultipliedAlpha: renderer.getContextAttributes().premultipliedAlpha,
  }));
  const before = new FullScreenQuad(new THREE.ShaderMaterial({
    uniforms: { map: { value: null } },
    vertexShader: "varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: "uniform sampler2D map; varying vec2 vUv; void main() { gl_FragColor = texture2D(map, vUv); }",
    toneMapped: false,
    depthTest: false,
    depthWrite: false,
  }));
  let beforeTex = null;
  const owned = { geometries: [], materials: [] };
  let version = -1;
  let running = false;
  let raf = 0;
  let fadeFrom = 0;
  let shown = false;
  let lastRefresh = 0;
  let lastWhole = -1;
  let steps = 1; // quarters of the picture traced in each batch
  const gl = renderer.getContext();
  let fence = null; // the batch the graphics chip is still working on
  let batchFrom = 0;

  /* ---- The scene the tracer can read ------------------------------------- */

  const swapped = new Map();
  const tinted = new Map();
  /** A material the tracer reads; null for what it should leave out. */
  const forPhoto = (m) => {
    if (!m || m.userData?.photo === "skip") return null;
    if (m.userData?.photo === "glow") {
      // The strip's own glowing face: still bright to look at, but its light comes from its
      // area light. Left at full glow, every bounce that happened to hit a strip left a white
      // speck all over the inside.
      if (!swapped.has(m)) {
        const out = m.clone();
        out.emissiveIntensity = 1.4;
        swapped.set(m, out);
        owned.materials.push(out);
      }
      return swapped.get(m);
    }
    if (m.isMeshStandardMaterial) return m;
    if (!swapped.has(m)) {
      const out = new THREE.MeshStandardMaterial({
        color: m.color ? m.color.clone() : 0xffffff,
        map: m.map ?? null,
        roughness: 0.95,
        metalness: 0,
        alphaTest: m.alphaTest || 0,
        side: m.side,
      });
      swapped.set(m, out);
      owned.materials.push(out);
    }
    return swapped.get(m);
  };
  const withColours = (m) => {
    const base = forPhoto(m);
    if (!base) return null;
    if (!tinted.has(base)) {
      const out = base.clone();
      out.vertexColors = true;
      tinted.set(base, out);
      owned.materials.push(out);
    }
    return tinted.get(base);
  };

  /** One instanced mesh as one plain mesh in world space, each copy's colour kept as vertex colour. */
  function expand(im) {
    const parts = [];
    const m4 = new THREE.Matrix4();
    const c = new THREE.Color();
    const tint = Boolean(im.instanceColor);
    for (let i = 0; i < im.count; i++) {
      im.getMatrixAt(i, m4);
      m4.premultiply(im.matrixWorld);
      const g = im.geometry.clone();
      g.applyMatrix4(m4);
      if (tint) {
        // Red, green, blue and alpha: the tracer pads every other mesh's colour to four, so these match.
        im.getColorAt(i, c);
        const n = g.attributes.position.count;
        const colour = new Float32Array(n * 4);
        for (let k = 0; k < n; k++) { colour[k * 4] = c.r; colour[k * 4 + 1] = c.g; colour[k * 4 + 2] = c.b; colour[k * 4 + 3] = 1; }
        g.setAttribute("color", new THREE.BufferAttribute(colour, 4));
      }
      parts.push(g);
    }
    const material = tint ? withColours(im.material) : forPhoto(im.material);
    const merged = parts.length && material ? mergeGeometries(parts, false) : null;
    for (const g of parts) g.dispose();
    if (!merged) return null;
    owned.geometries.push(merged);
    return new THREE.Mesh(merged, material);
  }

  /** A rectangle of light: `along` is its long side, `facing` the way it shines. */
  function strip(length, thick, at, facing) {
    const l = new THREE.RectAreaLight(LED_COLOUR, 1, 1, 1);
    // A tracer's area light shines along its own -z: turn that to `facing`.
    l.position.copy(at);
    l.lookAt(at.clone().add(facing));
    return { light: l, length, thick };
  }

  /**
   * The lights the photo is lit by: one large, soft window behind the viewer's
   * left shoulder (where the real-time picture's sunlight comes from), and a
   * rectangle of light for every LED strip the design has, each the size of
   * the strip's opal cover.
   */
  function lightsFor({ key, strips = [] }) {
    const out = [];
    if (key) {
      const w = new THREE.RectAreaLight(0xfff4e6, key.intensity, key.width, key.height);
      w.position.copy(key.position);
      w.lookAt(key.target);
      out.push(w);
    }
    // Each strip's light is a little wider than its 12mm cover, at the same total output: a
    // wider light is found by more of the tracer's rays, so the inside clears of grain sooner.
    const WIDE = 0.05;
    for (const s of strips) {
      let made;
      if (s.kind === "side") {
        made = strip(s.y1 - s.y0, WIDE, new THREE.Vector3(s.x, (s.y0 + s.y1) / 2, s.z), new THREE.Vector3(s.dir, 0, 0));
        made.light.width = made.thick;   // across the panel edge
        made.light.height = made.length; // down the panel
        // lookAt along x leaves the light's height on world y and its width on z.
      } else {
        made = strip(s.x1 - s.x0, WIDE, new THREE.Vector3((s.x0 + s.x1) / 2, s.y, s.z), new THREE.Vector3(0, -1, 0));
        // Facing straight down, lookAt has no up to go by: set the turn directly.
        made.light.rotation.set(-Math.PI / 2, 0, 0);
        made.light.width = made.length;
        made.light.height = made.thick;
      }
      // A warm strip behind an opal cover, in this scene's units (tuned by eye, 19 Nov 2026).
      made.light.intensity = s.intensity ?? 34;
      out.push(made.light);
    }
    return out;
  }

  function buildScene(live, extras) {
    for (const g of owned.geometries) g.dispose();
    owned.geometries = [];
    const out = new THREE.Scene();
    live.updateMatrixWorld(true);
    live.traverseVisible((o) => {
      if (!o.isMesh) return;
      if (o.isInstancedMesh) {
        const m = expand(o);
        if (m) out.add(m);
        return;
      }
      const material = forPhoto(o.material);
      if (!material) return;
      const mesh = new THREE.Mesh(o.geometry, material);
      mesh.matrixAutoUpdate = false;
      mesh.matrix.copy(o.matrixWorld);
      out.add(mesh);
    });
    for (const l of lightsFor(extras)) out.add(l);
    out.environment = environment;
    out.environmentIntensity = extras.environmentIntensity ?? 0.5;
    out.background = live.background;
    return out;
  }

  /* ---- Drawing --------------------------------------------------------------- */

  /** A copy of the real-time picture as it is now, for the photo to fade in over. */
  function keepBefore() {
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    if (!beforeTex || beforeTex.image.width !== size.x || beforeTex.image.height !== size.y) {
      beforeTex?.dispose();
      beforeTex = new THREE.FramebufferTexture(size.x, size.y);
    }
    drawRaster();
    renderer.copyFramebufferToTexture(beforeTex);
  }

  /** The traced picture on the canvas: smoothed of grain while it is young, over the real-time one while it fades in. */
  function present(opacity) {
    const src = tracer.target;
    let pic = src.texture;
    const n = tracer.samples;
    if (n < SMOOTH_UNTIL) {
      if (clean.width !== src.width || clean.height !== src.height) clean.setSize(src.width, src.height);
      // Strong at first, easing off as the samples add up and the grain goes by itself.
      const young = 1 - n / SMOOTH_UNTIL;
      smooth.material.map = src.texture;
      smooth.material.sigma = 1.5 + 2.5 * young;
      smooth.material.threshold = 0.01 + 0.03 * young;
      renderer.setRenderTarget(clean);
      smooth.render(renderer);
      pic = clean.texture;
    }
    renderer.setRenderTarget(null);
    const auto = renderer.autoClear;
    renderer.autoClear = false;
    if (opacity < 1 && beforeTex) {
      before.material.uniforms.map.value = beforeTex;
      before.render(renderer);
    }
    const m = toCanvas.material;
    m.map = pic;
    m.opacity = opacity;
    m.blending = opacity < 1 ? THREE.NormalBlending : THREE.NoBlending;
    toCanvas.render(renderer);
    renderer.autoClear = auto;
  }

  function frame(now) {
    raf = 0;
    if (!running) return;
    // Never more than one batch of tracing waiting on the graphics chip. The tracer counts a
    // sample when it is handed over, not when it is done, and a page that only draws off screen
    // is not slowed by the browser: without this the work piles up until the page freezes
    // (found 19 Nov 2026 on an Intel HD 630). So a batch is handed over only once the last is
    // finished, and the batch grows while batches finish quickly and shrinks when they do not.
    if (fence) {
      if (gl.getSyncParameter(fence, gl.SYNC_STATUS) !== gl.SIGNALED) {
        raf = requestAnimationFrame(frame);
        return;
      }
      gl.deleteSync(fence);
      fence = null;
      const took = now - batchFrom;
      if (took < 14) steps = Math.min(8, steps + 1);
      else if (took > 40) steps = Math.max(1, steps - 1);
    }
    if (tracer.samples < ENOUGH) {
      batchFrom = now;
      for (let i = 0; i < steps && tracer.samples < ENOUGH; i++) tracer.renderSample();
      fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
    }
    const n = tracer.samples;
    if (n >= SHOW_AT) {
      if (!fadeFrom) fadeFrom = now;
      const t = Math.min(1, (now - fadeFrom) / FADE_MS);
      const whole = Math.floor(n);
      const finished = n >= ENOUGH && t >= 1;
      // Each refresh of the screen costs tracing time, so only on a whole new sample, and not too often.
      if (t < 1 || finished || (whole !== lastWhole && now - lastRefresh >= REFRESH_MS)) {
        present(t);
        lastRefresh = now;
        lastWhole = whole;
      }
      shown = true;
      onState?.(finished ? "done" : "photo", n, Math.min(1, n / ENOUGH));
      if (finished) {
        running = false; // enough: stop, and leave the GPU alone
        return;
      }
    } else {
      onState?.("tracing", n, Math.min(1, n / ENOUGH));
    }
    raf = requestAnimationFrame(frame);
  }

  return {
    /**
     * Start (or carry on) tracing the live scene as it stands. `extras.version`
     * changes whenever the scene does (a design, the doors); only then is the
     * tracer's copy rebuilt. A camera move alone just restarts the samples.
     */
    show(live, extras) {
      if (extras.version !== version) {
        tracer.setScene(buildScene(live, extras), camera);
        version = extras.version;
      } else {
        tracer.updateCamera();
      }
      keepBefore();
      fadeFrom = 0;
      lastWhole = -1;
      steps = 1;
      shown = false;
      running = true;
      if (!raf) raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      fadeFrom = 0;
      shown = false;
    },
    /** Puts the finished photo back on the canvas (after a snapshot redrew it, say). */
    redraw() {
      if (shown) present(1);
      return shown;
    },
    get shown() { return shown; },
    dispose() {
      this.stop();
      if (fence) { gl.deleteSync(fence); fence = null; }
      for (const g of owned.geometries) g.dispose();
      for (const m of owned.materials) m.dispose();
      environment.dispose();
      for (const q of [smooth, toCanvas, before]) { q.material.dispose(); q.dispose(); }
      clean.dispose();
      beforeTex?.dispose();
      tracer.dispose();
    },
  };
}
