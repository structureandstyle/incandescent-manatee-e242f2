/**
 * The Cloudflare Worker that replaces Netlify (15 Nov 2026, worker/).
 *
 * The rules netlify.toml gave Netlify (redirects, headers, caching), and the
 * enquiry form Netlify Forms received: what is kept out, what is saved, and
 * that Make gets the fields its scenario maps, in the shape Netlify sent.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { cacheControlFor, isProductionHost, redirectFor, SECURITY_HEADERS } from "../worker/site-rules.mjs";
import {
  emailText,
  handleEnquiry,
  spamReason,
  makePayload,
  newSubmissionId,
  readFields,
} from "../worker/enquiry.mjs";
import worker from "../worker/index.mjs";

/* ---- netlify.toml, carried over ------------------------------------------- */

test("www goes to the apex, and the retired addresses forward", () => {
  assert.equal(redirectFor("https://www.structureandstyle.co.uk/contact/?a=1"), "https://structureandstyle.co.uk/contact/?a=1");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-hampstead-design/"), "https://structureandstyle.co.uk/areas/hampstead/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-hampstead-design"), "https://structureandstyle.co.uk/areas/hampstead/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-camden/x"), "https://structureandstyle.co.uk/areas/camden/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-maida-vale/"), "https://structureandstyle.co.uk/areas/maida-vale/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-maida-vale"), "https://structureandstyle.co.uk/areas/maida-vale/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-west-hampstead/"), "https://structureandstyle.co.uk/areas/west-hampstead/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-west-hampstead"), "https://structureandstyle.co.uk/areas/west-hampstead/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-highgate/"), "https://structureandstyle.co.uk/areas/highgate/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-highgate"), "https://structureandstyle.co.uk/areas/highgate/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-swiss-cottage/"), "https://structureandstyle.co.uk/areas/swiss-cottage/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-swiss-cottage"), "https://structureandstyle.co.uk/areas/swiss-cottage/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-kentish-town/"), "https://structureandstyle.co.uk/areas/kentish-town/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-kentish-town"), "https://structureandstyle.co.uk/areas/kentish-town/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-belsize-park/"), "https://structureandstyle.co.uk/areas/belsize-park/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-belsize-park"), "https://structureandstyle.co.uk/areas/belsize-park/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-islington/"), "https://structureandstyle.co.uk/areas/islington/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-islington"), "https://structureandstyle.co.uk/areas/islington/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-primrose-hill/"), "https://structureandstyle.co.uk/areas/primrose-hill/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-primrose-hill"), "https://structureandstyle.co.uk/areas/primrose-hill/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/carpenter-hampstead/"), "https://structureandstyle.co.uk/areas/hampstead/");
  assert.equal(redirectFor("https://structureandstyle.co.uk/"), null);
});

test("http goes to https in one hop, as Netlify forced it; wrangler dev on this machine is left alone", () => {
  assert.equal(redirectFor("http://structureandstyle.co.uk/contact/?a=1"), "https://structureandstyle.co.uk/contact/?a=1");
  assert.equal(redirectFor("http://www.structureandstyle.co.uk/contact/"), "https://structureandstyle.co.uk/contact/");
  assert.equal(redirectFor("http://structureandstyle.co.uk/carpenter-camden/x"), "https://structureandstyle.co.uk/areas/camden/");
  assert.equal(redirectFor("http://structureandstyle.co.uk/api/enquiry-upload?key=a"), "https://structureandstyle.co.uk/api/enquiry-upload?key=a");
  assert.equal(redirectFor("http://structureandstyle-site.example.workers.dev/"), "https://structureandstyle-site.example.workers.dev/");
  // Cloudflare serves plain http on 8080 but no https there: the target drops the port.
  assert.equal(redirectFor("http://structureandstyle.co.uk:8080/a"), "https://structureandstyle.co.uk/a");
  assert.equal(redirectFor("http://www.structureandstyle.co.uk:8080/a"), "https://structureandstyle.co.uk/a");
  assert.equal(redirectFor("https://structureandstyle.co.uk/contact/"), null);
  assert.equal(redirectFor("http://127.0.0.1:8799/contact/"), null);
  assert.equal(redirectFor("http://localhost:8787/"), null);
});

test("every redirect in netlify.toml has its rule here", () => {
  const toml = readFileSync(new URL("../netlify.toml", import.meta.url), "utf8");
  const froms = [...toml.matchAll(/^\s*from = "([^"]+)"/gm)].map((m) => m[1]);
  assert.ok(froms.length >= 5);
  for (const from of froms) {
    const path = from.replace(/^https:\/\/[^/]+/, "").replace("/*", "/x");
    const host = from.startsWith("https://") ? new URL(from.replace("/*", "/")).hostname : "structureandstyle.co.uk";
    assert.ok(redirectFor(`https://${host}${path}`), `no rule for ${from}`);
  }
});

test("the security headers match netlify.toml", () => {
  const toml = readFileSync(new URL("../netlify.toml", import.meta.url), "utf8");
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    assert.ok(toml.includes(`${name} = "${value}"`), `${name} differs from netlify.toml`);
  }
});

test("caching follows netlify.toml", () => {
  assert.equal(cacheControlFor("/_astro/index.abc123.css"), "public, max-age=31536000, immutable");
  assert.equal(cacheControlFor("/fonts/serif.woff2"), "public, max-age=31536000, immutable");
  assert.equal(cacheControlFor("/images/work/alcove.webp"), "public, max-age=2592000, must-revalidate");
  assert.equal(cacheControlFor("/og-default.jpg"), "public, max-age=2592000, must-revalidate");
  assert.equal(cacheControlFor("/favicon.ico"), "public, max-age=2592000");
  assert.equal(cacheControlFor("/contact/"), null);
  assert.equal(isProductionHost("structureandstyle.co.uk"), true);
  assert.equal(isProductionHost("structureandstyle-site.example.workers.dev"), false);
});

/* ---- The enquiry form ------------------------------------------------------ */

const form = (entries) => {
  const fd = new FormData();
  for (const [k, v] of entries) fd.append(k, v);
  return fd;
};

const BASIC = [
  ["form-name", "enquiry"],
  ["subject", "Denis / Hampstead / Fitted wardrobes +1"],
  ["company-website", ""],
  ["name", "Denis"],
  ["phone", "07700 900123"],
  ["email", "denis@example.com"],
  ["service", "Fitted wardrobes, Flooring"],
  ["area", "Hampstead"],
  ["detail", "Bedroom wall about 3m wide."],
  ["source", "Google Maps"],
  ["landing_page", "/contact/"],
  ["referrer", ""],
  ["ec_e", "41237"],
];

test("ids look like Netlify's: 24 hex characters that sort by time", () => {
  const a = newSubmissionId(1_794_673_458_000, new Uint8Array(8));
  const b = newSubmissionId(1_794_673_459_000, new Uint8Array(8));
  assert.match(a, /^[0-9a-f]{24}$/);
  assert.ok(a < b);
  assert.equal(a.slice(0, 8), Math.floor(1_794_673_458).toString(16));
});

test("fields: names, honeypot and form name out; a repeated service becomes a list", () => {
  const fields = readFields(form([...BASIC, ["service-extra", "x"]]));
  assert.equal(fields.name, "Denis");
  assert.equal(fields.service, "Fitted wardrobes, Flooring");
  assert.ok(!("form-name" in fields) && !("company-website" in fields));
  // Without JavaScript the cards send one value each, plus the empty heading box.
  const nojs = readFields(form([["form-name", "enquiry"], ["service", ""], ["service", "Flooring"], ["service", "Something else"]]));
  assert.deepEqual(nojs.service, ["Flooring", "Something else"]);
  const one = readFields(form([["form-name", "enquiry"], ["service", ""], ["service", "Flooring"]]));
  assert.equal(one.service, "Flooring");
});

test("spam: honeypot, no way to reply, no script, too fast, too many links", () => {
  const reason = (entries) => { const fd = form(entries); return spamReason(fd, readFields(fd)); };
  const swap = (key, value) => BASIC.map(([k, v]) => [k, k === key ? value : v]);
  assert.equal(reason(BASIC), null);
  assert.equal(reason(swap("company-website", "http://spam")), "honeypot filled");
  assert.equal(reason([["form-name", "enquiry"], ["detail", "buy now"], ["ec_e", "9000"]]), "no way to reply");
  // The bots in Netlify's spam folder never ran the form's script.
  assert.equal(reason(BASIC.filter(([k]) => k !== "ec_e")), "form script did not run");
  assert.equal(reason(swap("ec_e", "")), "form script did not run");
  assert.equal(reason(swap("ec_e", "900")), "sent too fast");
  assert.equal(reason(swap("ec_e", "soon")), "sent too fast");
  const links = Array.from({ length: 6 }, (_, i) => `https://example.com/${i}`).join(" ");
  assert.equal(reason(swap("detail", links)), "too many links");
  assert.equal(reason(swap("detail", links.split(" ").slice(0, 5).join(" "))), null);
  // The script's field is a signal, never part of the enquiry.
  assert.ok(!("ec_e" in readFields(form(BASIC))));
});

test("the family Netlify caught most is spam: placeholder subject, no script", () => {
  const bot = [
    ["form-name", "enquiry"], ["subject", "Website enquiry (%{submissionId})"], ["company-website", ""],
    ["name", "Robertdialm"], ["phone", "82973297234"], ["email", "bot@example.com"],
    ["detail", "Hola, volia saber el seu preu."], ["source", "Referral"],
  ];
  const fd = form(bot);
  assert.equal(spamReason(fd, readFields(fd)), "form script did not run");
});

test("Make gets every field its scenario maps, where it maps them", () => {
  const p = makePayload({ id: "6af88b6bb580aeda289063e2", createdAt: "2026-11-15T10:00:00.000Z", fields: readFields(form(BASIC)), siteUrl: "https://structureandstyle.co.uk" });
  // Scenario 7361484 reads 1.id, 1.created_at and these under 1.data.
  assert.equal(p.id, "6af88b6bb580aeda289063e2");
  assert.equal(p.created_at, "2026-11-15T10:00:00.000Z");
  for (const k of ["name", "phone", "email", "area", "service", "detail", "source", "landing_page", "referrer"]) {
    assert.ok(k in p.data, `data.${k} missing`);
  }
  assert.equal(p.form_name, "enquiry");
  assert.equal(p.data.subject, "Denis / Hampstead / Fitted wardrobes +1");
  assert.match(p.email_text, /^Your name:\nDenis\n\nPhone:\n07700 900123/);
  assert.match(p.email_text, /Service:\nFitted wardrobes, Flooring/);
  assert.match(p.email_text, /Sent from the enquiry form on structureandstyle\.co\.uk$/);
});

test("the fallback subject gets the id, as Netlify filled %{submissionId}", () => {
  const p = makePayload({ id: "abc", createdAt: "x", fields: { subject: "Website enquiry (%{submissionId})", name: "A" }, siteUrl: "" });
  assert.equal(p.data.subject, "Website enquiry (abc)");
  assert.equal(emailText({ name: "A", referrer: "" }).includes("Referrer"), false);
});

/* ---- The handler, with a stand-in bucket and Make ------------------------- */

function fakeEnv({ makeOk = true } = {}) {
  const saved = new Map();
  const sent = [];
  const env = {
    MAKE_WEBHOOK_URL: "https://hook.example.test/abc",
    UPLOADS: { put: async (key, body) => { saved.set(key, JSON.parse(body)); } },
    ASSETS: { fetch: async () => new Response("<h1>page</h1>", { status: 200, headers: { "Content-Type": "text/html" } }) },
  };
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    sent.push({ url: String(url), body: JSON.parse(init.body) });
    return new Response("Accepted", { status: makeOk ? 200 : 500 });
  };
  const waits = [];
  const ctx = { waitUntil: (p) => waits.push(p) };
  const restore = () => { globalThis.fetch = realFetch; };
  return { env, ctx, saved, sent, waits, restore };
}

const post = (path, entries) => new Request(`https://structureandstyle.co.uk${path}`, { method: "POST", body: form(entries) });

test("a plain post to /thanks/ is saved, sent to Make, and lands on the thank-you page", async () => {
  const t = fakeEnv();
  try {
    const res = await handleEnquiry(post("/thanks/", BASIC), t.env, t.ctx);
    await Promise.all(t.waits);
    assert.equal(res.status, 303);
    assert.equal(res.headers.get("location"), "https://structureandstyle.co.uk/thanks/");
    assert.equal(t.sent.length, 1);
    assert.equal(t.sent[0].body.data.name, "Denis");
    const [key, record] = [...t.saved.entries()][0];
    assert.match(key, /^submissions\/\d{4}-\d{2}\/[0-9a-f]{24}\.json$/);
    assert.equal(record.forwarded, true);
  } finally { t.restore(); }
});

test("the script's post to / gets 200, and a Make failure still keeps the lead", async () => {
  const t = fakeEnv({ makeOk: false });
  try {
    const res = await handleEnquiry(post("/", BASIC), t.env, t.ctx);
    await Promise.all(t.waits);
    assert.equal(res.status, 200);
    const record = [...t.saved.values()][0];
    assert.equal(record.forwarded, false);
    assert.equal(record.make_status, 500);
  } finally { t.restore(); }
});

test("spam is answered as accepted, kept under spam/ with its reason, and not sent", async () => {
  const t = fakeEnv();
  try {
    const res = await handleEnquiry(post("/thanks/", BASIC.filter(([k]) => k !== "ec_e")), t.env, t.ctx);
    assert.equal(res.status, 303);
    assert.equal(t.sent.length, 0);
    const [key, record] = [...t.saved.entries()][0];
    assert.match(key, /^spam\/\d{4}-\d{2}\/[0-9a-f]{24}\.json$/);
    assert.equal(record.reason, "form script did not run");
    assert.equal(record.data.name, "Denis");
    assert.equal([...t.saved.keys()].some((k) => k.startsWith("submissions/")), false);
  } finally { t.restore(); }
});

test("the Worker: redirects first, then a page with the site's headers, noindex off the real domain", async () => {
  const t = fakeEnv();
  try {
    const r1 = await worker.fetch(new Request("https://www.structureandstyle.co.uk/contact/"), t.env, t.ctx);
    assert.equal(r1.status, 301);
    assert.equal(r1.headers.get("location"), "https://structureandstyle.co.uk/contact/");
    const r2 = await worker.fetch(new Request("https://structureandstyle.co.uk/contact/"), t.env, t.ctx);
    assert.equal(r2.headers.get("x-frame-options"), "DENY");
    assert.equal(r2.headers.get("x-robots-tag"), null);
    const r3 = await worker.fetch(new Request("https://structureandstyle-site.example.workers.dev/"), t.env, t.ctx);
    assert.equal(r3.headers.get("x-robots-tag"), "noindex");
    const r4 = await worker.fetch(new Request("https://structureandstyle.co.uk/contact/", { method: "POST", body: "x=1", headers: { "content-type": "text/plain" } }), t.env, t.ctx);
    assert.equal(r4.status, 405);
    // The static files' 307 to the slash form becomes a 301, as on Netlify.
    t.env.ASSETS.fetch = async () => new Response(null, { status: 307, headers: { Location: "/contact/" } });
    const r5 = await worker.fetch(new Request("https://structureandstyle.co.uk/contact"), t.env, t.ctx);
    assert.equal(r5.status, 301);
    assert.equal(r5.headers.get("location"), "/contact/");
  } finally { t.restore(); }
});

test("the form's script adds the field the spam check reads", async () => {
  const { SENT_AFTER } = await import("../worker/enquiry.mjs");
  const page = readFileSync(new URL("../src/components/EnquiryForm.astro", import.meta.url), "utf8");
  assert.ok(page.includes(`field.name = "${SENT_AFTER}"`), "markSent no longer names the field the Worker reads");
  assert.match(page, /setSubject\(form\);\s*markSent\(form\);/);
});

test("the email HTML for Make escapes what a visitor typed and keeps line breaks", async () => {
  const { emailHtml, makePayload: mp } = await import("../worker/enquiry.mjs");
  const html = emailHtml('Name:\n<script>x</script> & "quotes"');
  assert.ok(html.includes("Name:<br>&lt;script&gt;x&lt;/script&gt; &amp; &quot;quotes&quot;"));
  assert.doesNotMatch(html, /<script>/);
  const p = mp({ id: "a", createdAt: "b", fields: { name: "Sam <b>", detail: "Line 1\nLine 2" }, siteUrl: "" });
  assert.ok(p.email_html.includes("Sam &lt;b&gt;"));
  assert.ok(p.email_html.includes("Line 1<br>Line 2"));
});
