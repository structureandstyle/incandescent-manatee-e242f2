/**
 * THE ENQUIRY FORM ON CLOUDFLARE (15 Nov 2026): what Netlify Forms did, done
 * by the Worker.
 *
 * Netlify received every post of the form named "enquiry", kept it, emailed
 * it and sent it to Make scenario 7361484 (the shared enquiry log). Here:
 *   1. the post is read and checked (form name, honeypot, size);
 *   2. it is saved first, as JSON in S&S's own R2 bucket under submissions/,
 *      so a lead is never lost if Make is down (Netlify kept every
 *      submission in its dashboard for the same reason);
 *   3. it goes to Make's webhook in the shape Netlify sent, so the scenario's
 *      mapping (1.id, 1.created_at, 1.data.name ...) reads it unchanged;
 *   4. Make sends the notification email (a founder's choice, 15 Nov 2026:
 *      one Gmail step in the existing scenario, no new company to name in the
 *      data agreement). The email's subject and text are built here, as
 *      data.subject and email_text, so Make only copies them.
 *
 * The form keeps posting where it always has: a plain post to /thanks/ (no
 * JavaScript, or no files), answered with a 303 to the thank-you page, and
 * the script's post to / after the photos upload, answered with 200. Netlify
 * answered both the same way. docs/cloudflare-move.md has the whole move.
 */

export const FORM_NAME = "enquiry";
export const HONEYPOT = "company-website";
/** Text only: the photos go straight to R2, so a real enquiry is a few KB. */
export const MAX_BODY_BYTES = 1_000_000;

/** Fields kept out of what is stored and sent. */
const DROPPED = new Set(["form-name", HONEYPOT, "cf-turnstile-response", "g-recaptcha-response"]);

/**
 * An id in the shape Netlify's were (24 hex characters, the first eight the
 * time in seconds), so the shared log's Enquiry ID and CRM ref columns look
 * the same before and after the move and still sort by time.
 */
export function newSubmissionId(now = Date.now(), random = crypto.getRandomValues(new Uint8Array(8))) {
  const seconds = Math.floor(now / 1000).toString(16).padStart(8, "0").slice(-8);
  const rest = Array.from(random, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${seconds}${rest}`;
}

/**
 * The fields of one post, as Netlify recorded them: one string per field,
 * and a list where a name was sent more than once (the service cards without
 * JavaScript). Files are dropped: none should arrive, since uploads go to R2
 * directly, and an empty value is kept out like Netlify kept it out.
 */
export function readFields(formData) {
  const fields = {};
  for (const [name, value] of formData.entries()) {
    if (DROPPED.has(name) || typeof value !== "string") continue;
    if (Object.hasOwn(fields, name)) {
      fields[name] = [].concat(fields[name], value);
    } else {
      fields[name] = value;
    }
  }
  // The service cards' hidden email-heading box sends nothing, but a list can
  // still carry an empty entry: take empties out, and a one-item list back to
  // a string, which is what the form sends with JavaScript on.
  if (Array.isArray(fields.service)) {
    const list = fields.service.filter((v) => v.trim() !== "");
    fields.service = list.length > 1 ? list : list[0] ?? "";
  }
  return fields;
}

/** A filled honeypot, or a post with no way to reply: kept out, answered as if accepted. */
export function looksLikeSpam(formData, fields) {
  if (String(formData.get(HONEYPOT) ?? "").trim() !== "") return true;
  const reachable = ["name", "phone", "email"].some((k) => String(fields[k] ?? "").trim() !== "");
  return !reachable;
}

const LABELS = [
  ["name", "Your name"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["service", "Service"],
  ["area", "Area"],
  ["detail", "Tell us about the job"],
  ["source", "Source"],
  ["landing_page", "Landing page"],
  ["referrer", "Referrer"],
  ["utm_source", "Utm source"],
  ["utm_medium", "Utm medium"],
  ["utm_campaign", "Utm campaign"],
  ["utm_content", "Utm content"],
  ["utm_term", "Utm term"],
];

const asText = (value) => (Array.isArray(value) ? value.join(", ") : String(value ?? ""));

/**
 * The notification email's text: the same headings Netlify's email had, in
 * the form's order, and the services as one line. The last line says where
 * it came from, which is also what the team@ Gmail filter can match, since
 * the subject is now just "Name / Area / Service" (docs/cloudflare-move.md).
 */
export function emailText(fields) {
  const blocks = LABELS
    .filter(([key]) => asText(fields[key]).trim() !== "")
    .map(([key, label]) => `${label}:\n${asText(fields[key])}`);
  blocks.push("Sent from the enquiry form on structureandstyle.co.uk");
  return blocks.join("\n\n");
}

/**
 * What goes to Make: the top-level fields Netlify's webhook carried that the
 * scenario reads (id, created_at, data, form_name, name, email, site_url),
 * plus email_text for the new Gmail step.
 */
export function makePayload({ id, createdAt, fields, siteUrl }) {
  const data = { ...fields };
  // Netlify filled %{submissionId} in the fallback subject; so does this.
  if (typeof data.subject === "string") data.subject = data.subject.replaceAll("%{submissionId}", id);
  if (!data.subject) data.subject = `Website enquiry (${id})`;
  return {
    id,
    number: null,
    title: null,
    form_name: FORM_NAME,
    name: asText(data.name),
    email: asText(data.email),
    summary: `${asText(data.name)}: ${asText(data.detail).slice(0, 120)}`,
    body: asText(data.detail),
    data,
    created_at: createdAt,
    site_url: siteUrl,
    email_text: emailText(data),
  };
}

const thanks = (url) =>
  new Response(null, { status: 303, headers: { Location: new URL("/thanks/", url).toString(), "Cache-Control": "no-store" } });

/**
 * POST / or /thanks/ with form-name=enquiry. Anything else returns null and
 * the Worker answers as for any other request.
 */
export async function handleEnquiry(request, env, ctx) {
  const url = new URL(request.url);
  const type = request.headers.get("content-type") || "";
  if (!/^(multipart\/form-data|application\/x-www-form-urlencoded)/i.test(type)) return null;
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY_BYTES) {
    return new Response("Enquiry too large.", { status: 413 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return new Response("Could not read the enquiry.", { status: 400 });
  }
  if (formData.get("form-name") !== FORM_NAME) return null;

  // The plain post goes to /thanks/ and lands there; the script's post goes
  // to / and reads the status, then navigates itself (EnquiryForm.astro).
  const accepted = () => (url.pathname === "/thanks/" ? thanks(url) : new Response("ok", { status: 200, headers: { "Cache-Control": "no-store" } }));

  const fields = readFields(formData);
  if (looksLikeSpam(formData, fields)) return accepted();

  const id = newSubmissionId();
  const createdAt = new Date().toISOString();
  const payload = makePayload({ id, createdAt, fields, siteUrl: `https://${url.hostname}` });
  const key = `submissions/${createdAt.slice(0, 7)}/${id}.json`;

  // Saved before anything else, so a failure further on never loses the lead.
  try {
    await env.UPLOADS.put(key, JSON.stringify({ ...payload, forwarded: null }), {
      httpMetadata: { contentType: "application/json" },
    });
  } catch (error) {
    console.error("enquiry: could not save", id, String(error));
  }

  let forwarded = false;
  let status = 0;
  if (env.MAKE_WEBHOOK_URL) {
    try {
      const response = await fetch(env.MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });
      status = response.status;
      forwarded = response.ok;
    } catch (error) {
      console.error("enquiry: Make did not answer", id, String(error));
    }
  } else {
    console.error("enquiry: MAKE_WEBHOOK_URL is not set", id);
  }
  if (!forwarded) console.error("enquiry: not forwarded to Make", id, status);

  // The record says whether Make took it, so an unsent lead can be found in
  // the bucket and replayed (docs/cloudflare-move.md, "If Make is down").
  ctx?.waitUntil?.(
    env.UPLOADS.put(key, JSON.stringify({ ...payload, forwarded, make_status: status }), {
      httpMetadata: { contentType: "application/json" },
    }).catch(() => {}),
  );

  // The visitor sees the thank-you page either way: the lead is saved.
  return accepted();
}
