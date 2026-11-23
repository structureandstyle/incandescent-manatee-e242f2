/**
 * The enquiry form's picture cards in the browser (14 Nov 2026,
 * src/components/EnquiryForm.astro). Everything here is an enhancement:
 * without it every card is still a checkbox or radio in a plain grid, a line
 * under the areas says where to put one that is not listed, and the ticked
 * services go as a list, which Netlify and Make both still take.
 *
 * Sending is not done here. Netlify, the photo uploads, the link checks, the
 * email subject and the GA4 flag stay in the form's own inline script; this
 * file only keeps the cards, the services line, the Somewhere else box and
 * the prompts in step.
 * The rules it uses are in src/scripts/enquiry-cards.mjs, where the tests run
 * them.
 */
import {
  OTHER_AREA,
  addStarter,
  chosenLine,
  chosenName,
  dropEmptyStarters,
  otherAreaValue,
  servicesLine,
} from "../../scripts/enquiry-cards.mjs";

const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

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
  // A row inside the closed pop-up measures zero wide, so the arrows are
  // measured again whenever its size changes, which includes the pop-up
  // opening.
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
}

/* ---- "What do you need?": one plain line in the email ---------------------- */

/*
 * Netlify shows a field sent several times as code in the notification email,
 * ["Fitted wardrobes", "Walk-in wardrobes"], and a founder's test on 14 Nov
 * 2026 read that as the units not coming through. So the service cards hand
 * their name to one hidden field that carries what is ticked as a plain line
 * (servicesLine). It is still the field `service`, the one Netlify registered
 * from the cards at deploy and the one Make maps, so nothing downstream
 * changes. Nothing ticked: the field is switched off and sends nothing, as an
 * unticked list did. Without JavaScript the cards keep their name and send a
 * list, as before.
 */
function armServices(form: HTMLFormElement) {
  const boxes = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-field="service"]'));
  if (!boxes.length) return;
  const line = document.createElement("input");
  line.type = "hidden";
  line.name = "service";
  line.setAttribute("data-ec-services", "");
  boxes[0].closest("fieldset")?.append(line);
  for (const box of boxes) box.removeAttribute("name");
  const sync = () => {
    line.value = servicesLine(boxes.filter((b) => b.checked).map((b) => b.value));
    line.disabled = !line.value;
  };
  for (const box of boxes) box.addEventListener("change", sync);
  // Again on send, ahead of the form's own send script, which listens on the
  // document and builds the enquiry.
  form.addEventListener("submit", sync);
  sync();
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

/* ---- Prompts that start a line in the job box ------------------------------ */

function armPrompts(form: HTMLFormElement) {
  const list = form.querySelector<HTMLElement>("[data-ec-prompts]");
  const box = form.querySelector<HTMLTextAreaElement>('textarea[name="detail"]');
  if (!list || !box) return;
  const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>("[data-starter]"));
  const starters = buttons.map((b) => b.dataset.starter ?? "");
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
  // A prompt tapped and never finished leaves a bare "Rough sizes:" line, and
  // it goes before anything reads the box. This listener is on the form, so
  // it runs ahead of the form's own send script, which listens on the
  // document and checks the links and builds the enquiry from this box.
  form.addEventListener("submit", () => {
    const cleaned = dropEmptyStarters(box.value, starters);
    if (cleaned !== box.value) {
      box.value = cleaned;
      mark();
    }
  });
  list.hidden = false;
  mark();
}

export function initEnquiryCards() {
  document.querySelectorAll<HTMLFormElement>("form[data-ec-form]:not([data-ec-ready])").forEach((form) => {
    form.setAttribute("data-ec-ready", "");
    form.querySelectorAll<HTMLFieldSetElement>("fieldset[data-ec-group]").forEach(armGroup);
    armServices(form);
    armOtherArea(form);
    armPrompts(form);
  });
}
