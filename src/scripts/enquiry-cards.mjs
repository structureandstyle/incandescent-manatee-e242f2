/**
 * The rules behind the picture-card enquiry form previews (options A and B,
 * 14 Nov 2026), kept as plain functions so tests/enquiry-cards.test.mjs runs
 * the same code the browser does. Nothing here touches the page.
 *
 * Preview only. The live form is src/components/EnquiryForm.astro; when a
 * founder picks an option, these move into its submit path with it.
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
 * Option A's prompts. Adds a starter such as "Room: " on a line of its own at
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
 * Option B's width picker. Puts its line, "Rough width: 2 to 3m", at the top
 * of the job box, replacing an earlier pick rather than stacking them. The
 * rest of what the visitor wrote is left exactly as it was.
 */
export const WIDTH_PREFIX = "Rough width:";

export function setWidthLine(text, line) {
  const lines = String(text ?? "").split("\n");
  const at = lines.findIndex((l) => l.trimStart().startsWith(WIDTH_PREFIX));
  if (at !== -1) {
    lines[at] = line;
    return lines.join("\n");
  }
  const rest = lines.join("\n");
  return rest ? `${line}\n${rest}` : line;
}

/**
 * The notification email's subject, built the way the live form's setSubject
 * builds it (EnquiryForm.astro, 8 Oct 2026): "Website enquiry from Nuno:
 * Alcove units and shelving, Hendon". Invisible characters go, links go, line
 * breaks become spaces, and it is cut at 150 characters without splitting an
 * emoji. Returns "" with no name, where the live form keeps its fallback.
 */
const LINK = /(?:https?:\/\/|\bwww\.)\S*/gi;

export function cleanLine(text) {
  return String(text ?? "")
    .replace(/[­؜᠎​-‏‪-‮⁠-⁤⁦-⁯﻿]/g, "")
    .replace(LINK, " ")
    .replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function subjectFor({ name, services = [], area = "" }) {
  const who = cleanLine(name);
  if (!who) return "";
  const about = [services.map(cleanLine).filter(Boolean).join(", "), cleanLine(area)].filter(Boolean).join(", ");
  const subject = Array.from(`Website enquiry from ${who}${about ? `: ${about}` : ""}`);
  return subject.length > 150 ? `${subject.slice(0, 147).join("").trimEnd()}...` : subject.join("");
}

/**
 * The name a chosen card goes by in the "Chosen:" line: its label, or for
 * "Somewhere else" with something typed, "Somewhere else: Finchley".
 */
export function chosenName(label, value) {
  return label === OTHER_AREA && value && value !== OTHER_AREA ? `${OTHER_AREA}: ${value}` : label;
}

/** "Fitted wardrobes, Alcove units and shelving" under a row of cards, or "". */
export function chosenLine(labels) {
  const list = labels.filter(Boolean);
  return list.length ? `Chosen: ${list.join(", ")}` : "";
}

/**
 * Where each field goes, read from Make scenario 7361484 on 14 Nov 2026
 * ("Structure & Style - website enquiries to CRM"), for the preview's
 * "what this would send" table. Column names are the shared enquiry log's own.
 */
export const DESTINATION = {
  subject: "Email subject",
  name: "Log: Customer",
  phone: "Log: Contact",
  email: "Log: Contact",
  area: "Log: Area",
  service: "Log: What they want",
  detail: "Log: What they want",
  source: "Log: Lead source",
  landing_page: "Log: notes",
  referrer: "Log: notes",
  utm_source: "Log: notes",
  utm_medium: "Log: notes",
  utm_campaign: "Log: notes",
  utm_content: "Log: notes",
  attachment: "Log: notes (files link)",
};

/**
 * The rows the preview shows after Send: each field the form would post, in
 * the order Netlify lists them, repeated fields (service) joined the way Make
 * joins them. Honeypot and empty source fields are left out; empty visible
 * fields stay in, so a founder can see that an unanswered question sends
 * nothing.
 */
const ORDER = ["subject", "name", "phone", "email", "service", "area", "detail", "attachment", "source",
  "landing_page", "referrer", "utm_source", "utm_medium", "utm_campaign", "utm_content"];
const SOURCE_FIELDS = new Set(["landing_page", "referrer", "utm_source", "utm_medium", "utm_campaign", "utm_content"]);

export function previewRows(entries) {
  const values = new Map();
  for (const [key, value] of entries) {
    if (key === "company-website" || key === "form-name") continue;
    const text = typeof value === "string" ? value : value?.name ?? "";
    if (!values.has(key)) values.set(key, []);
    if (text !== "") values.get(key).push(text);
  }
  const rows = [];
  for (const key of ORDER) {
    const list = values.get(key) ?? [];
    if (SOURCE_FIELDS.has(key) && !list.length) continue;
    rows.push({ field: key, value: list.join(", "), goesTo: DESTINATION[key] ?? "" });
  }
  return rows;
}
