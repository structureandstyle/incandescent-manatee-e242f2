/**
 * The picture-card enquiry form previews in the browser (options A and B,
 * 14 Nov 2026). Everything here is an enhancement: without it every card is
 * still a checkbox or radio in a plain grid, option B shows all its steps as
 * one form, and the preview's Send stays switched off.
 *
 * PREVIEW ONLY. Send never posts anything: it shows a table of exactly what
 * the enquiry would carry and where Make would put it. The rules it uses are
 * in src/scripts/enquiry-cards.mjs, where the tests run them.
 */
import {
  OTHER_AREA,
  addStarter,
  chosenLine,
  chosenName,
  dropEmptyStarters,
  otherAreaValue,
  previewRows,
  setWidthLine,
  subjectFor,
} from "../../scripts/enquiry-cards.mjs";
import { sourceForSubmit } from "../../scripts/enquiry-source.mjs";

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

type ConsentApi = { current?: () => string | null };
const consented = (): boolean => {
  try {
    return (window as unknown as { ssCookieConsent?: ConsentApi }).ssCookieConsent?.current?.() === "granted";
  } catch {
    return false;
  }
};

/* ---- Rows of cards: arrows, and what is chosen ----------------------------- */

function armGroup(group: HTMLFieldSetElement) {
  const track = group.querySelector<HTMLElement>("[data-ec-track]");
  const arrows = group.querySelector<HTMLElement>("[data-ec-arrows]");
  const chosen = group.querySelector<HTMLElement>("[data-ec-chosen]");
  if (!track) return;

  const update = () => {
    if (!arrows) return;
    const overflow = track.scrollWidth - track.clientWidth > 2;
    arrows.hidden = !overflow;
    if (!overflow) return;
    const [back, on] = arrows.querySelectorAll<HTMLButtonElement>("[data-ec-scroll]");
    back?.setAttribute("aria-disabled", String(track.scrollLeft <= 2));
    on?.setAttribute("aria-disabled", String(track.scrollLeft + track.clientWidth >= track.scrollWidth - 2));
  };
  arrows?.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("[data-ec-scroll]");
    if (!button || button.getAttribute("aria-disabled") === "true") return;
    const step = Number(button.dataset.ecScroll) * Math.max(track.clientWidth * 0.85, 140);
    track.scrollBy({ left: step, behavior: reducedMotion() ? "auto" : "smooth" });
  });
  track.addEventListener("scroll", update, { passive: true });
  // The browser only scrolls a focused box into view when the box itself is
  // hidden, so a card could still be cut off at the edge of the row.
  track.addEventListener("focusin", (event) => {
    (event.target as Element).closest(".ec-card")?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: reducedMotion() ? "auto" : "smooth",
    });
  });
  if ("ResizeObserver" in window) new ResizeObserver(update).observe(track);
  else window.addEventListener("resize", update);
  update();

  const showChosen = () => {
    if (!chosen) return;
    const labels = Array.from(group.querySelectorAll<HTMLInputElement>(".ec-input:checked"), (i) =>
      chosenName(i.dataset.label ?? i.value, i.value),
    );
    chosen.textContent = chosenLine(labels);
  };
  group.addEventListener("change", showChosen);
  group.addEventListener("input", showChosen);
  showChosen();
  (group as HTMLFieldSetElement & { ecUpdate?: () => void }).ecUpdate = update;
}

/* ---- "Somewhere else": what is typed becomes the card's value -------------- */

function armOtherArea(form: HTMLFormElement) {
  const box = form.querySelector<HTMLElement>("[data-ec-other]");
  const typed = form.querySelector<HTMLInputElement>("[data-ec-other-input]");
  const radio = form.querySelector<HTMLInputElement>(`input[name="area"][value="${OTHER_AREA}"]`);
  if (!box || !typed || !radio) return;
  const sync = () => {
    radio.value = otherAreaValue(typed.value);
  };
  const show = () => {
    box.hidden = !radio.checked;
  };
  typed.addEventListener("input", sync);
  radio.closest("fieldset")?.addEventListener("change", show);
  sync();
  show();
}

/* ---- Option A: prompts that start a line in the job box -------------------- */

function armPrompts(form: HTMLFormElement) {
  const list = form.querySelector<HTMLElement>("[data-ec-prompts]");
  const box = form.querySelector<HTMLTextAreaElement>('textarea[name="detail"]');
  if (!list || !box) return;
  const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>("[data-starter]"));
  const mark = () => {
    const lines = box.value.split("\n").map((l) => l.trimStart());
    for (const b of buttons) {
      const head = (b.dataset.starter ?? "").trimEnd();
      // A mark for the eye only: the button adds a line or goes to it, so it
      // is not a toggle and announces no pressed state.
      b.toggleAttribute("data-used", lines.some((l) => l.startsWith(head)));
    }
  };
  list.addEventListener("click", (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>("[data-starter]");
    if (!button) return;
    const { text, caret } = addStarter(box.value, button.dataset.starter ?? "");
    box.value = text;
    box.focus();
    box.setSelectionRange(caret, caret);
    box.dispatchEvent(new Event("input", { bubbles: true }));
  });
  box.addEventListener("input", mark);
  list.hidden = false;
  mark();
}

/* ---- Option B: the width picker writes its line into the job box ----------- */

function armWidth(form: HTMLFormElement) {
  const group = form.querySelector<HTMLElement>('[data-ec-group="width"]');
  const box = form.querySelector<HTMLTextAreaElement>('textarea[name="detail"]');
  if (!group || !box) return;
  group.closest<HTMLElement>("[data-ec-js-only]")?.removeAttribute("hidden");
  group.addEventListener("change", (event) => {
    const input = event.target as HTMLInputElement;
    if (!input.matches(".ec-input:checked") || !input.dataset.line) return;
    box.value = setWidthLine(box.value, input.dataset.line);
  });
}

/* ---- Photos: listed for the preview, never uploaded ------------------------ */

const picked = new WeakMap<HTMLFormElement, File[]>();

function armFiles(form: HTMLFormElement) {
  const input = form.querySelector<HTMLInputElement>("[data-ec-files]");
  const count = form.querySelector<HTMLElement>("[data-ec-file-count]");
  if (!input || !count) return;
  picked.set(form, []);
  input.addEventListener("change", () => {
    const files = picked.get(form) ?? [];
    for (const file of Array.from(input.files ?? [])) {
      if (files.length < 6 && !files.some((f) => f.name === file.name && f.size === file.size)) files.push(file);
    }
    input.value = "";
    const words = ["", "One", "Two", "Three", "Four", "Five", "Six"];
    count.textContent = files.length
      ? `${words[files.length]} file${files.length > 1 ? "s" : ""} added: ${files.map((f) => f.name).join(", ")}.`
      : "Nothing added yet.";
  });
}

/* ---- Option B: one question at a time -------------------------------------- */

function armSteps(form: HTMLFormElement) {
  if (!form.hasAttribute("data-ec-steps")) return null;
  const panels = Array.from(form.querySelectorAll<HTMLElement>("[data-ec-panel]"));
  const progress = form.querySelector<HTMLElement>("[data-ec-progress]");
  const countLine = form.querySelector<HTMLElement>("[data-ec-count]");
  if (!panels.length) return null;
  let current = 0;

  const goTo = (index: number, focus: boolean) => {
    current = Math.max(0, Math.min(panels.length - 1, index));
    panels.forEach((panel, i) => panel.classList.toggle("is-current", i === current));
    // Words, not numerals: the copy protocol spells out one to nine.
    const words = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
    if (countLine) {
      countLine.textContent = `Step ${words[current] ?? current + 1} of ${words[panels.length - 1] ?? panels.length}`;
    }
    progress?.style.setProperty("--ecb-done", `${((current + 1) / panels.length) * 100}%`);
    panels[current]
      .querySelectorAll<HTMLFieldSetElement & { ecUpdate?: () => void }>("[data-ec-group]")
      .forEach((g) => g.ecUpdate?.());
    if (focus) {
      const top = form.getBoundingClientRect().top;
      if (top < 0) form.scrollIntoView({ block: "start", behavior: reducedMotion() ? "auto" : "smooth" });
      panels[current].focus({ preventScroll: true });
    }
  };

  form.setAttribute("data-ec-stepping", "");
  if (progress) progress.hidden = false;
  panels.forEach((panel, i) => {
    const nav = panel.querySelector<HTMLElement>("[data-ec-nav]");
    if (nav) nav.hidden = false;
    const back = panel.querySelector<HTMLButtonElement>("[data-ec-back]");
    if (back) back.hidden = i === 0;
  });
  form.addEventListener("click", (event) => {
    const target = event.target as Element;
    if (target.closest("[data-ec-next]")) goTo(current + 1, true);
    else if (target.closest("[data-ec-back]")) goTo(current - 1, true);
  });
  // Enter in a one-line box moves on rather than trying to send a form whose
  // required boxes are still on a later step.
  form.addEventListener("keydown", (event) => {
    const el = event.target as HTMLElement;
    if (event.key !== "Enter" || current === panels.length - 1) return;
    if (el instanceof HTMLInputElement && !["checkbox", "radio", "file"].includes(el.type)) {
      event.preventDefault();
      goTo(current + 1, true);
    }
  });
  goTo(0, false);
  return { isLast: () => current === panels.length - 1, next: () => goTo(current + 1, true) };
}

/* ---- Send: show what would be sent, send nothing --------------------------- */

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function armDryRun(form: HTMLFormElement, steps: ReturnType<typeof armSteps>) {
  const panel = form.querySelector<HTMLElement>("[data-ec-dry]");
  form.querySelectorAll<HTMLButtonElement>("[data-ec-send]").forEach((b) => (b.disabled = false));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (steps && !steps.isLast()) {
      steps.next();
      return;
    }
    const data = new FormData(form);
    const starters = Array.from(form.querySelectorAll<HTMLElement>("[data-starter]"), (b) => b.dataset.starter ?? "");
    if (starters.length) data.set("detail", dropEmptyStarters(String(data.get("detail") ?? ""), starters));
    const source = sourceForSubmit({
      href: window.location.href,
      referrer: document.referrer,
      consented: consented(),
      getStorage: () => window.sessionStorage,
    });
    for (const [key, value] of Object.entries(source)) data.set(key, String(value ?? ""));
    const services = data.getAll("service").map(String).filter(Boolean);
    const subject = subjectFor({ name: String(data.get("name") ?? ""), services, area: String(data.get("area") ?? "") });
    if (subject) data.set("subject", subject);
    const files = picked.get(form) ?? [];
    if (files.length) {
      data.set(
        "attachment",
        `${files.map((f) => f.name).join(", ")} (uploaded and linked at the end of the job description, as now)`,
      );
    }
    if (!panel) return;
    const rows = previewRows(Array.from(data.entries()));
    panel.innerHTML =
      `<h3>Nothing was sent. This is what the enquiry would carry.</h3>` +
      `<p>Field names are the live form's. The last column is where Make puts each one in the shared enquiry log.</p>` +
      `<table><tbody>${rows
        .map(
          (r) =>
            `<tr><th scope="row">${escapeHtml(r.field)}</th>` +
            `<td class="${r.value ? "" : "is-empty"}">${r.value ? escapeHtml(r.value) : "(empty)"}</td>` +
            `<td class="ec-dry-to">${escapeHtml(r.goesTo)}</td></tr>`,
        )
        .join("")}</tbody></table>`;
    panel.hidden = false;
    panel.focus({ preventScroll: true });
    panel.scrollIntoView({ block: "nearest", behavior: reducedMotion() ? "auto" : "smooth" });
  });
}

export function initEnquiryCards() {
  document.querySelectorAll<HTMLFormElement>("form[data-ec-form]:not([data-ec-ready])").forEach((form) => {
    form.setAttribute("data-ec-ready", "");
    // Steps first: a group in a hidden step measures zero wide, so the arrows
    // are measured again whenever its step is shown.
    const steps = armSteps(form);
    form.querySelectorAll<HTMLFieldSetElement>("fieldset[data-ec-group]").forEach(armGroup);
    armOtherArea(form);
    armPrompts(form);
    armWidth(form);
    armFiles(form);
    armDryRun(form, steps);
  });
}
