/**
 * THE BUILDER ON THE PAGE (19 Nov 2026, src/pages/design-your-own.astro).
 *
 * Reads the form, asks model.mjs what that design is, and shows the answer in
 * four places: the picture, the guide price, the design in words, and the
 * address bar (so a link reopens it). The rules live in model.mjs; nothing
 * here decides a price or a door count.
 *
 * WHAT THE PAGE NEVER WAITS FOR. The flat drawing (elevation.mjs) is on the
 * page from the first paint. The 3D view (scene.mjs, and the 3D library with
 * it) is fetched only once the builder is on screen, and if it cannot run the
 * drawing stays. Sending never depends on either.
 *
 * SENDING. One form per page (site PR #41), so the builder has none of its
 * own: it opens the site's Get a quote pop-up with the services ticked and the
 * job box filled in. Same form, same field names, so the email, Make and the
 * shared enquiry log see an ordinary enquiry with a fuller description.
 */
import {
  COLOURS,
  DEFAULTS,
  INSIDES,
  LIMITS,
  decode,
  describe,
  encode,
  guidePrice,
  money,
  normalise,
  projectText,
  quotedItems,
  servicesFor,
  specLines,
  title,
} from "./model.mjs";
import { elevationSvg } from "./elevation.mjs";

const STORE = "ss-dyo-project-v1";
const $ = (root, sel) => root.querySelector(sel);
const $$ = (root, sel) => [...root.querySelectorAll(sel)];

/** Which form field holds each number, per unit. Alcove depth and height have their own fields. */
const NUMBERS = {
  wardrobe: { w: "w", h: "h", d: "d" },
  alcove: { wl: "wl", wr: "wr", d: "ad", breast: "breast", h: "ah", base: "base", shelves: "shelves" },
};
const RANGE = {
  w: LIMITS.wardrobe.w, h: LIMITS.wardrobe.h, d: LIMITS.wardrobe.d,
  wl: LIMITS.alcove.w, wr: LIMITS.alcove.w, ad: LIMITS.alcove.d, breast: LIMITS.alcove.breast,
  ah: LIMITS.alcove.h, base: LIMITS.alcove.base, shelves: LIMITS.alcove.shelves,
};

export function initBuilder(root) {
  if (!root || root.dataset.dyoReady) return;
  root.dataset.dyoReady = "1";
  const cfg = JSON.parse($(root, "[data-dyo-config]").textContent);
  const copy = cfg.copy;
  const form = $(root, "[data-dyo-form]");
  const drawing = $(root, "[data-dyo-drawing]");
  const canvas = $(root, "[data-dyo-canvas]");
  const status = $(root, "[data-dyo-status]");
  const toast = $(root, "[data-dyo-toast]");

  // The address this page is being read at, so a link made on a preview opens the preview.
  const linkFor = (design) => `${location.origin}${location.pathname}#d=${encode(design)}`;
  const fromHash = () => {
    const m = /[#&]d=([A-Za-z0-9_-]+)/.exec(location.hash);
    return m ? decode(m[1]) : null;
  };

  let design = fromHash() || normalise(DEFAULTS.wardrobe);
  /** The last design of each kind, so switching unit and back keeps the work. */
  const kept = { wardrobe: normalise(DEFAULTS.wardrobe), alcove: normalise(DEFAULTS.alcove) };
  kept[design.unit] = design;
  let open = false;
  let person = true;
  let mode = "drawing";
  let view = null;
  let loading3d = null;
  let editing = -1;
  let project = loadProject();

  function loadProject() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || "null");
      const items = Array.isArray(saved?.items) ? saved.items.map(decode).filter(Boolean).slice(0, 12) : [];
      const known = cfg.others.map((o) => o.value);
      const others = Array.isArray(saved?.others) ? saved.others.filter((v) => known.includes(v)) : [];
      return { items, others };
    } catch {
      return { items: [], others: [] };
    }
  }
  function saveProject() {
    try {
      localStorage.setItem(STORE, JSON.stringify({ items: project.items.map(encode), others: project.others }));
    } catch { /* private browsing: the project lasts as long as the page */ }
  }

  /* ---- The form ---------------------------------------------------------- */

  const field = (name) => form.elements.namedItem(name);
  const radio = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value;

  function readForm() {
    const unit = radio("dyo-unit") === "alcove" ? "alcove" : "wardrobe";
    const finish = Number(radio("dyo-finish") ?? 1);
    const out = {
      unit,
      finish,
      colour: Number(radio(`dyo-colour-${finish}`) ?? 0),
      door: radio("dyo-door"),
      handle: radio("dyo-handle"),
      extras: $$(form, `input[name="dyo-extra-${unit}"]:checked`).map((el) => el.value),
    };
    for (const [key, name] of Object.entries(NUMBERS[unit])) out[key] = field(name).value;
    if (unit === "wardrobe") {
      out.fit = radio("dyo-fit");
      out.inside = $$(form, "[data-dyo-inside] select").map((el) => el.value);
    } else {
      out.count = radio("dyo-count");
    }
    return normalise(out);
  }

  const check = (name, value) => {
    const el = form.querySelector(`input[name="${name}"][value="${value}"]`);
    if (el) el.checked = true;
  };

  function writeForm(d) {
    check("dyo-unit", d.unit);
    check("dyo-finish", d.finish);
    check(`dyo-colour-${d.finish}`, d.colour);
    check("dyo-door", d.door);
    check("dyo-handle", d.handle);
    for (const el of $$(form, `input[name="dyo-extra-${d.unit}"]`)) el.checked = d.extras.includes(el.value);
    for (const [key, name] of Object.entries(NUMBERS[d.unit])) field(name).value = d[key];
    if (d.unit === "wardrobe") check("dyo-fit", d.fit);
    else check("dyo-count", d.count);
  }

  /** One layout chooser per section. Rebuilt only when the number of sections changes. */
  function drawInside(d) {
    const box = $(form, "[data-dyo-inside]");
    const info = describe(d);
    const selects = $$(box, "select");
    if (selects.length !== info.sections.length) {
      box.textContent = "";
      info.sections.forEach((doors, i) => {
        const label = document.createElement("label");
        label.className = "dyo-select";
        const name = document.createElement("span");
        name.textContent = `${copy.section} ${i + 1}`;
        const select = document.createElement("select");
        select.setAttribute("aria-label", `${copy.section} ${i + 1}, ${doors === 2 ? "two doors" : "one door"}`);
        for (const x of INSIDES) {
          const o = document.createElement("option");
          o.value = x.id;
          o.textContent = x.label;
          select.append(o);
        }
        label.append(name, select);
        box.append(label);
      });
    }
    $$(box, "select").forEach((el, i) => { el.value = d.inside[i]; });
  }

  /* ---- What the visitor sees --------------------------------------------- */

  const WHY = {
    "wider than 2.4m": copy.quotedWide,
    "a single alcove": copy.quotedOneAlcove,
    "an alcove wider than 1m": copy.quotedWideAlcove,
  };

  function drawPrice(d) {
    const p = guidePrice(d, cfg.prices);
    const quoted = quotedItems(d);
    for (const el of $$(root, "[data-dyo-figure]")) {
      el.textContent = p.from ? `${copy.from} ${money(p.from)}` : copy.quoted;
      el.classList.toggle("is-quoted", !p.from);
    }
    for (const el of $$(root, "[data-dyo-price-note]")) {
      el.textContent = p.from ? (d.unit === "alcove" ? copy.includesAlcove : copy.includesWardrobe) : (WHY[p.why] || "");
    }
    for (const el of $$(root, "[data-dyo-extras-note]")) {
      el.textContent = quoted.length ? copy.extras.replace("{items}", quoted.join(", ")) : "";
      el.hidden = !quoted.length;
    }
    // Each finish shows what it would cost at this size, so the choice is a real one.
    for (const el of $$(form, "[data-dyo-finish-price]")) {
      const f = guidePrice({ ...d, finish: Number(el.dataset.dyoFinishPrice) }, cfg.prices);
      el.textContent = f.from ? `${copy.from} ${money(f.from)}` : copy.quoted;
    }
  }

  function drawWords(d) {
    const lines = specLines(d, cfg.finishes);
    const list = $(root, "[data-dyo-words]");
    list.textContent = "";
    for (const text of lines) {
      const li = document.createElement("li");
      li.textContent = text;
      list.append(li);
    }
    const label = `${title(d, cfg.finishes)}. ${lines.join(" ")}`;
    $(root, "[data-dyo-picture]").setAttribute("aria-label", label);
    const doors = describe(d).doors;
    for (const el of $$(root, "[data-dyo-doors-count]")) el.textContent = String(doors);
  }

  function drawPicture(d) {
    if (mode === "3d" && view) view.update(d, { open, person });
    else drawing.innerHTML = elevationSvg(d, { open });
  }

  let hashTimer = 0;
  function saveToAddress(d) {
    clearTimeout(hashTimer);
    hashTimer = setTimeout(() => {
      try { history.replaceState(null, "", `#d=${encode(d)}`); } catch { /* the design still works without it */ }
    }, 350);
  }

  function showPanels(d) {
    for (const el of $$(root, "[data-dyo-for]")) el.hidden = el.dataset.dyoFor !== d.unit;
    for (const el of $$(form, "[data-dyo-colours]")) el.hidden = Number(el.dataset.dyoColours) !== d.finish;
    const one = d.unit === "alcove" && d.count === 1;
    for (const el of $$(form, "[data-dyo-right-alcove]")) el.hidden = one;
    for (const el of $$(form, "[data-dyo-left-label]")) el.textContent = one ? copy.oneWidth : copy.leftWidth;
    const name = COLOURS[d.finish][d.colour].name;
    for (const el of $$(form, "[data-dyo-colour-name]")) el.textContent = name;
  }

  function refresh({ fromForm = true } = {}) {
    if (fromForm) design = readForm();
    kept[design.unit] = design;
    showPanels(design);
    if (design.unit === "wardrobe") drawInside(design);
    drawPrice(design);
    drawWords(design);
    drawPicture(design);
    saveToAddress(design);
    drawActions();
  }

  /* ---- Numbers: typed freely, corrected when the field is left ------------ */

  function rangeNote(el) {
    const [min, max] = RANGE[el.name];
    const typed = Number(el.value);
    const note = form.querySelector(`[data-dyo-range="${el.name}"]`);
    const out = el.value !== "" && (!Number.isFinite(typed) || typed < min || typed > max);
    if (note) {
      note.textContent = out ? copy.outOfRange.replace("{min}", min).replace("{max}", max) : "";
      note.hidden = !out;
    }
    el.setAttribute("aria-invalid", out ? "true" : "false");
    return out;
  }

  form.addEventListener("input", (e) => {
    const el = e.target;
    if (el.matches?.('input[type="number"]')) rangeNote(el);
    if (el.name === "dyo-unit") {
      // Switching unit brings back the last design of that kind.
      const unit = el.value === "alcove" ? "alcove" : "wardrobe";
      design = kept[unit];
      editing = -1;
      writeForm(design);
      refresh({ fromForm: false });
      return;
    }
    refresh();
  });
  form.addEventListener("change", (e) => {
    const el = e.target;
    if (!el.matches?.('input[type="number"]')) return;
    // Leaving a field: show the size actually drawn, and clear the warning.
    const key = Object.entries(NUMBERS[design.unit]).find(([, name]) => name === el.name)?.[0];
    if (key) el.value = design[key];
    rangeNote(el);
  });
  form.addEventListener("submit", (e) => e.preventDefault());

  /* ---- The picture's controls --------------------------------------------- */

  function setStatus(text) {
    status.textContent = text || "";
    status.hidden = !text;
  }

  function setMode(next) {
    mode = next === "3d" && view ? "3d" : "drawing";
    canvas.hidden = mode !== "3d";
    drawing.hidden = mode === "3d";
    root.dataset.dyoMode = mode;
    for (const el of $$(root, "[data-dyo-mode]")) el.setAttribute("aria-pressed", String(el.dataset.dyoMode === mode));
    for (const el of $$(root, "[data-dyo-3d-only]")) el.hidden = mode !== "3d";
    setStatus(mode === "3d" ? copy.drag : "");
    drawPicture(design);
    if (mode === "3d") view.resize();
  }

  function canRun3d() {
    try {
      const c = document.createElement("canvas");
      return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      return false;
    }
  }

  function load3d() {
    if (view) return Promise.resolve(view);
    if (loading3d) return loading3d;
    if (!canRun3d()) {
      setStatus(copy.unavailable);
      for (const el of $$(root, '[data-dyo-mode="3d"]')) el.disabled = true;
      return Promise.resolve(null);
    }
    setStatus(copy.loading);
    loading3d = import("./scene.mjs")
      .then(({ createView }) => {
        canvas.hidden = false; // sized before the first frame
        view = createView(canvas, {
          onLost: () => { setMode("drawing"); setStatus(copy.unavailable); },
          onRestored: () => setMode("3d"),
        });
        setMode("3d");
        return view;
      })
      .catch(() => {
        canvas.hidden = true;
        view = null;
        loading3d = null;
        setStatus(copy.unavailable);
        return null;
      });
    return loading3d;
  }

  root.addEventListener("click", (e) => {
    const el = e.target.closest?.("button, a");
    if (!el || !root.contains(el)) return;
    if (el.dataset.dyoMode) {
      if (el.dataset.dyoMode === "3d") load3d().then((v) => v && setMode("3d"));
      else setMode("drawing");
    } else if (el.hasAttribute("data-dyo-doors")) {
      open = !open;
      for (const b of $$(root, "[data-dyo-doors]")) {
        b.textContent = open ? copy.doorsOn : copy.doorsOff;
        b.setAttribute("aria-pressed", String(open));
      }
      drawPicture(design);
    } else if (el.dataset.dyoLook) {
      view?.look(el.dataset.dyoLook);
    } else if (el.dataset.dyoZoom) {
      view?.zoom(Number(el.dataset.dyoZoom));
    } else if (el.hasAttribute("data-dyo-add")) {
      addToProject();
    } else if (el.hasAttribute("data-dyo-send")) {
      openEnquiry([design], project.others);
    } else if (el.hasAttribute("data-dyo-send-project")) {
      openEnquiry(project.items, project.others);
    } else if (el.hasAttribute("data-dyo-copy")) {
      copyLink();
    } else if (el.dataset.dyoEdit) {
      editItem(Number(el.dataset.dyoEdit));
    } else if (el.dataset.dyoRemove) {
      removeItem(Number(el.dataset.dyoRemove));
    }
  });

  const personBox = $(root, "[data-dyo-person]");
  personBox?.addEventListener("change", () => { person = personBox.checked; drawPicture(design); });

  /* ---- A link to this design ---------------------------------------------- */

  let toastTimer = 0;
  function say(text) {
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3200);
  }

  async function copyLink() {
    const link = linkFor(design);
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      const input = document.createElement("input");
      input.value = link;
      document.body.append(input);
      input.select();
      try { document.execCommand("copy"); } catch { /* nothing more to try */ }
      input.remove();
    }
    say(copy.copied);
  }

  /* ---- My project ---------------------------------------------------------- */

  function addToProject() {
    if (editing >= 0 && editing < project.items.length) project.items[editing] = design;
    else if (project.items.length < 12) project.items.push(design);
    editing = -1;
    saveProject();
    drawProject();
    drawActions();
    say(copy.added);
  }

  function editItem(i) {
    const item = project.items[i];
    if (!item) return;
    design = item;
    editing = i;
    writeForm(design);
    refresh({ fromForm: false });
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function removeItem(i) {
    project.items.splice(i, 1);
    if (editing === i) editing = -1;
    else if (editing > i) editing -= 1;
    saveProject();
    drawProject();
    drawActions();
  }

  function drawActions() {
    const has = project.items.length > 0;
    for (const el of $$(root, "[data-dyo-add]")) el.textContent = editing >= 0 ? copy.update : copy.add;
    // With a project under way, sending happens from the project, all at once.
    for (const el of $$(root, "[data-dyo-send]")) el.hidden = has;
  }

  function drawProject() {
    const list = $(root, "[data-dyo-project]");
    const empty = $(root, "[data-dyo-project-empty]");
    list.textContent = "";
    let known = 0;
    let unpriced = 0;
    project.items.forEach((item, i) => {
      const p = guidePrice(item, cfg.prices);
      if (p.from) known += p.from; else unpriced += 1;
      const li = document.createElement("li");
      li.className = "dyo-item";
      const name = document.createElement("span");
      name.className = "dyo-item-name";
      name.textContent = title(item, cfg.finishes);
      const price = document.createElement("span");
      price.className = "dyo-item-price";
      price.textContent = p.from ? `${copy.from} ${money(p.from)}` : copy.quoted;
      const tools = document.createElement("span");
      tools.className = "dyo-item-tools";
      for (const [label, attr] of [[copy.edit, "dyoEdit"], [copy.remove, "dyoRemove"]]) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "dyo-text-button";
        b.textContent = label;
        b.dataset[attr] = String(i);
        b.setAttribute("aria-label", `${label}: ${name.textContent}`);
        tools.append(b);
      }
      li.append(name, price, tools);
      list.append(li);
    });
    empty.hidden = project.items.length > 0;
    const total = $(root, "[data-dyo-total]");
    total.hidden = project.items.length < 2 || !known;
    $(root, "[data-dyo-total-figure]").textContent = known ? money(known) : "";
    $(root, "[data-dyo-total-note]").hidden = !unpriced;
    const send = $(root, "[data-dyo-send-project]");
    send.disabled = !project.items.length && !project.others.length;
    for (const el of $$(root, "[data-dyo-count]")) {
      el.textContent = String(project.items.length);
      el.hidden = !project.items.length;
    }
  }

  for (const box of $$(root, 'input[name="dyo-other"]')) {
    box.checked = project.others.includes(box.value);
    box.addEventListener("change", () => {
      project.others = $$(root, 'input[name="dyo-other"]:checked').map((el) => el.value);
      saveProject();
      drawProject();
    });
  }

  /* ---- Sending: the site's own enquiry form, filled in --------------------- */

  function openEnquiry(items, others) {
    const modal = document.getElementById("enquiry-modal");
    const target = modal?.querySelector("form") || document.querySelector("form[data-ec-form]");
    const text = projectText({ items, others, prices: cfg.prices, finishes: cfg.finishes, linkFor });
    if (!target) {
      // No form on this page: carry the words to the contact page instead.
      try { sessionStorage.setItem("ss-dyo-enquiry", text); } catch { /* the visitor can still describe it */ }
      location.href = "/contact/";
      return;
    }
    const want = servicesFor({ items, others }, cfg.labels);
    // The form's script moves each card's name to data-field and sends one
    // joined line instead (site PR #46), so the cards are found either way.
    const cards = target.querySelectorAll('input[type="checkbox"][data-field="service"], input[type="checkbox"][name="service"]');
    for (const box of cards) {
      if (!box.value) continue; // the unlabelled first input that keeps the email heading
      const on = want.includes(box.value);
      if (box.checked !== on) {
        box.checked = on;
        box.dispatchEvent(new Event("input", { bubbles: true }));
        box.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    const detail = target.querySelector('textarea[name="detail"]');
    if (detail) {
      detail.value = text;
      detail.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (modal && typeof modal.showModal === "function") {
      if (!modal.open) modal.showModal();
      modal.scrollTop = 0;
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /* ---- The picture sticks just under the site's header ---------------------- */

  // Wherever that header really ends: it is not the same height on every
  // screen, and on a preview link the comment bar pushes it down the page.
  const header = document.querySelector("[data-site-header]");
  let placing = 0;
  function placeStage() {
    placing = 0;
    if (!header) return;
    const pos = getComputedStyle(header).position;
    const stuck = pos === "sticky" || pos === "fixed";
    const bottom = stuck ? Math.max(0, Math.round(header.getBoundingClientRect().bottom)) : 0;
    root.style.setProperty("--dyo-top", `${bottom + (window.innerWidth >= 940 ? 16 : 0)}px`);
  }
  const queuePlace = () => { if (!placing) placing = requestAnimationFrame(placeStage); };
  window.addEventListener("scroll", queuePlace, { passive: true });
  window.addEventListener("resize", queuePlace);
  placeStage();

  /* ---- Start ---------------------------------------------------------------- */

  writeForm(design);
  for (const b of $$(root, "[data-dyo-doors]")) b.setAttribute("aria-pressed", "false");
  for (const el of $$(root, "[data-dyo-3d-only]")) el.hidden = true;
  refresh({ fromForm: false });
  drawProject();
  root.classList.add("is-live");

  // The 3D view is fetched once the builder is on screen, unless the visitor
  // has asked their browser to save data: then it waits for the 3D button.
  const saver = navigator.connection?.saveData === true;
  if (!saver && "IntersectionObserver" in window) {
    const seen = new IntersectionObserver((entries) => {
      if (entries.some((x) => x.isIntersecting)) {
        seen.disconnect();
        load3d();
      }
    }, { rootMargin: "200px" });
    seen.observe($(root, "[data-dyo-picture]"));
  }

  window.addEventListener("hashchange", () => {
    const next = fromHash();
    if (!next || encode(next) === encode(design)) return;
    design = next;
    editing = -1;
    writeForm(design);
    refresh({ fromForm: false });
  });
}
