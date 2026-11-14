/**
 * The rules behind the enquiry form's picture cards (14 Nov 2026,
 * src/components/EnquiryForm.astro), kept as plain functions so
 * tests/enquiry-cards.test.mjs runs the same code the browser does. Nothing
 * here touches the page: src/components/enquiry-cards/client.ts wires them.
 */

/** What a card group sends when "Somewhere else" is picked and nothing is typed. */
export const OTHER_AREA = "Somewhere else";

/**
 * The value "Somewhere else" sends: what the visitor typed in its box, or the
 * card's own name if they typed nothing. One line, spaces squeezed, at most 80
 * characters, so the log's Area column holds one plain answer either way.
 */
export function otherAreaValue(typed) {
  const clean = String(typed ?? "")
    .replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return clean ? Array.from(clean).slice(0, 80).join("").trim() : OTHER_AREA;
}

/**
 * The prompts above the job box. Adds a starter such as "Room: " on a line of its own at
 * the end of the job box, or, if that line is already there, leaves the text
 * alone and puts the cursor at the end of it. Returns the text and where the
 * cursor goes.
 */
export function addStarter(text, starter) {
  const value = String(text ?? "");
  const head = starter.trimEnd();
  let offset = 0;
  for (const line of value.split("\n")) {
    if (line.trimStart().startsWith(head)) {
      return { text: value, caret: offset + line.length };
    }
    offset += line.length + 1;
  }
  const lead = value && !value.endsWith("\n") ? "\n" : "";
  const next = `${value}${lead}${starter}`;
  return { text: next, caret: next.length };
}

/**
 * A prompt tapped and never finished leaves a bare "Rough sizes:" line. Those
 * lines are dropped when the enquiry is sent, so the job description holds
 * only what the visitor actually wrote.
 */
export function dropEmptyStarters(text, starters) {
  const heads = starters.map((s) => s.trim());
  return String(text ?? "")
    .split("\n")
    .filter((line) => !heads.includes(line.trim()))
    .join("\n")
    .trim();
}

/**
 * The name a chosen card goes by in the "Chosen:" line: its label, or for
 * "Somewhere else" with something typed, "Somewhere else: Finchley".
 */
export function chosenName(label, value) {
  return label === OTHER_AREA && value && value !== OTHER_AREA ? `${OTHER_AREA}: ${value}` : label;
}

/**
 * What "What do you need?" sends: the ticked services as one plain line,
 * "Fitted wardrobes, Alcove units and shelving", in the cards' order, each
 * once. Sent as one value since 14 Nov 2026 because Netlify shows a field
 * sent several times as code in the notification email, ["Fitted wardrobes",
 * "Alcove units and shelving"]; a founder's test read that as the units not
 * coming through. Make scenario 7361484 already takes one line as well as a
 * list (its mapping is ifempty(join(service); service)), so the log is
 * unchanged.
 */
export function servicesLine(values) {
  return [...new Set(values.map((v) => String(v ?? "").trim()).filter(Boolean))].join(", ");
}

/** "Fitted wardrobes, Alcove units and shelving" under a row of cards, or "". */
export function chosenLine(labels) {
  const list = labels.filter(Boolean);
  return list.length ? `Chosen: ${list.join(", ")}` : "";
}
