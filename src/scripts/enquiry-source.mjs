/**
 * Where an enquiry came from, 13 Oct 2026.
 *
 * The enquiry form used to record nothing about the visitor's route to the
 * site, so a lead that started from a Google Business Profile post could not be
 * traced back to it. The post links carry utm_ parameters; this file turns
 * those, plus the landing page and the referring site, into the seven hidden
 * fields the form submits (see FIELD_NAMES).
 *
 * Plain JavaScript with no DOM access, so node --test can run it
 * (tests/enquiry-source.test.mjs). The only browser objects it touches arrive as
 * arguments: the page address, the referrer, whether analytics cookies were
 * accepted, and a function that returns sessionStorage. EnquiryForm.astro wires
 * those up.
 *
 * CONSENT. Writing attribution to the device is not strictly necessary for the
 * form to work, so under PECR it needs a yes. Everything here that touches
 * storage is gated on `consented`, which the caller sets from the cookie
 * notice's own answer ("granted" only):
 *
 *   - Without consent nothing is written and nothing is read. The submitted
 *     values come from the page the visitor is on, which is the landing page
 *     itself, and from that page's utm_ parameters if it has any.
 *   - With consent, the first page of the visit is remembered in sessionStorage
 *     (gone when the tab closes), so an enquiry sent three pages later still
 *     carries the link that brought the visitor in.
 *
 * WHAT IS KEPT. Only the five utm_ parameters survive from a URL, and the
 * landing page keeps its own query string only when it has utm_ parameters, and
 * then only those. Anything else in a query string (an email address someone
 * pasted into a link, a click identifier) is dropped. The referrer is cut back
 * to the address of the page without its query string or fragment, and a
 * referrer on this site's own host is dropped, because moving between our pages
 * is not a source. Every value is clipped to MAX_LENGTH.
 */

export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
export const FIELD_NAMES = [...UTM_KEYS, "landing_page", "referrer"];
export const MAX_LENGTH = 200;
export const STORAGE_KEY = "ss_enquiry_source";

const emptySource = () => Object.fromEntries(FIELD_NAMES.map((name) => [name, ""]));

/** Trimmed, control characters turned to spaces, cut to `max` characters. */
export function clip(value, max = MAX_LENGTH) {
  const text = String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  // Do not leave half of a surrogate pair at the end.
  return /[\ud800-\udbff]$/.test(cut) ? cut.slice(0, -1) : cut;
}

function cleanReferrer(referrer, page) {
  if (!referrer) return "";
  let ref;
  try {
    ref = new URL(referrer);
  } catch {
    return "";
  }
  if (ref.host === page.host) return "";
  return clip(`${ref.protocol}//${ref.host}${ref.pathname}`);
}

/**
 * The seven fields for one page view. Always returns all seven keys, as strings.
 * `href` is the page address and `referrer` is document.referrer.
 */
export function readSource(href, referrer = "") {
  const source = emptySource();
  let page;
  try {
    page = new URL(href);
  } catch {
    return source;
  }

  const found = new Map();
  for (const [rawKey, rawValue] of page.searchParams) {
    const key = rawKey.toLowerCase();
    if (!UTM_KEYS.includes(key) || found.has(key)) continue;
    const value = clip(rawValue);
    if (value) found.set(key, value);
  }

  const query = new URLSearchParams();
  for (const key of UTM_KEYS) {
    if (!found.has(key)) continue;
    source[key] = found.get(key);
    query.set(key, found.get(key));
  }

  const queryText = query.toString();
  source.landing_page = clip(page.pathname + (queryText ? `?${queryText}` : ""));
  source.referrer = cleanReferrer(referrer, page);
  return source;
}

/** True when any of the five utm_ fields has a value. */
export function hasCampaign(source) {
  return Boolean(source) && UTM_KEYS.some((key) => Boolean(source[key]));
}

/**
 * Which values to submit. A page that carries utm_ parameters speaks for
 * itself. Otherwise the remembered first page of the visit is used, but only
 * with consent; with none, the current page is the answer.
 */
export function chooseSource({ current, remembered = null, consented = false }) {
  if (hasCampaign(current)) return current;
  if (consented && remembered) return remembered;
  return current;
}

/**
 * What, if anything, to write to session storage after this page view. A page
 * with utm_ parameters replaces whatever was there. A page without them only
 * fills an empty slot, so the first page of the visit stays the landing page.
 * Returns null when the stored value should be left alone.
 */
export function sourceToRemember({ current, remembered = null }) {
  if (hasCampaign(current)) return current;
  return remembered ? null : current;
}

export function serialiseSource(source) {
  return JSON.stringify(Object.fromEntries(FIELD_NAMES.map((name) => [name, clip(source?.[name])])));
}

/**
 * Reads back what serialiseSource wrote. Session storage can be edited by the
 * visitor, so this trusts nothing: only the seven known keys, only strings,
 * each clipped again. Returns null for anything unusable.
 */
export function parseStored(raw) {
  if (typeof raw !== "string" || !raw) return null;
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const source = emptySource();
  for (const name of FIELD_NAMES) {
    if (typeof data[name] === "string") source[name] = clip(data[name]);
  }
  return source.landing_page || hasCampaign(source) ? source : null;
}

/* Storage glue. `getStorage` is a function, not the object, because merely
   reading window.sessionStorage can throw when site data is blocked. Every
   access sits in try/catch and a failure means "nothing stored". */

function open(getStorage) {
  try {
    return getStorage() || null;
  } catch {
    return null;
  }
}

function readStored(store) {
  try {
    return parseStored(store.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

/**
 * Remembers this page view for the rest of the visit. Does nothing unless
 * `consented` is true. Returns true when something was written.
 */
export function rememberSource({ href, referrer = "", consented = false, getStorage }) {
  if (!consented) return false;
  const store = open(getStorage);
  if (!store) return false;
  const next = sourceToRemember({
    current: readSource(href, referrer),
    remembered: readStored(store),
  });
  if (!next) return false;
  try {
    store.setItem(STORAGE_KEY, serialiseSource(next));
    return true;
  } catch {
    return false;
  }
}

/** Deletes the remembered source: consent was refused, withdrawn or reset. */
export function forgetSource(getStorage) {
  const store = open(getStorage);
  if (!store) return;
  try {
    store.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to do: it was never readable either */
  }
}

/**
 * The seven values to put in the form when it is submitted. Without consent
 * session storage is neither read nor written.
 */
export function sourceForSubmit({ href, referrer = "", consented = false, getStorage }) {
  const current = readSource(href, referrer);
  if (!consented) return current;
  const store = open(getStorage);
  return chooseSource({ current, remembered: store ? readStored(store) : null, consented });
}
