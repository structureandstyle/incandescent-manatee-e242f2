import test from "node:test";
import assert from "node:assert/strict";
import {
  FIELD_NAMES,
  MAX_LENGTH,
  STORAGE_KEY,
  chooseSource,
  clip,
  forgetSource,
  hasCampaign,
  parseStored,
  readSource,
  rememberSource,
  serialiseSource,
  sourceForSubmit,
  sourceToRemember,
} from "../src/scripts/enquiry-source.mjs";

const site = "https://structureandstyle.co.uk";
const gbp =
  `${site}/alcove-units/?utm_source=google&utm_medium=organic&utm_campaign=gbp-post&utm_content=2026-10-16-alcove-south-kensington`;

/** A stand-in for sessionStorage that records every call made to it. */
function fakeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  const calls = [];
  return {
    calls,
    data,
    getItem(key) { calls.push(["getItem", key]); return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { calls.push(["setItem", key]); data.set(key, String(value)); },
    removeItem(key) { calls.push(["removeItem", key]); data.delete(key); },
  };
}

test("a Google Business Profile link yields every utm field, the landing page and the referrer", () => {
  const source = readSource(gbp, "https://www.google.com/");
  assert.deepEqual(source, {
    utm_source: "google",
    utm_medium: "organic",
    utm_campaign: "gbp-post",
    utm_content: "2026-10-16-alcove-south-kensington",
    utm_term: "",
    landing_page:
      "/alcove-units/?utm_source=google&utm_medium=organic&utm_campaign=gbp-post&utm_content=2026-10-16-alcove-south-kensington",
    referrer: "https://www.google.com/",
  });
  assert.equal(hasCampaign(source), true);
  assert.deepEqual(Object.keys(source), FIELD_NAMES);
});

test("a page with no utm parameters gives only the path, with all seven keys present", () => {
  const source = readSource(`${site}/alcove-units/`, "");
  assert.deepEqual(source, {
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
    landing_page: "/alcove-units/",
    referrer: "",
  });
  assert.equal(hasCampaign(source), false);
});

test("non-utm parameters are dropped, from the fields and from the landing page", () => {
  const source = readSource(
    `${site}/contact/?email=someone%40example.com&gclid=abc123&utm_source=newsletter&fbclid=zzz&ref=x#top`,
    "",
  );
  assert.equal(source.utm_source, "newsletter");
  assert.equal(source.landing_page, "/contact/?utm_source=newsletter");
  assert.doesNotMatch(JSON.stringify(source), /example\.com|gclid|fbclid|abc123|zzz|top/);

  const noUtm = readSource(`${site}/contact/?email=someone%40example.com&gclid=abc123#top`, "");
  assert.equal(noUtm.landing_page, "/contact/");
  assert.equal(hasCampaign(noUtm), false);
});

test("utm names are matched without regard to case, first value wins, empty values are ignored", () => {
  const source = readSource(`${site}/?UTM_Source=First&utm_source=Second&utm_medium=&utm_term=%20%20`, "");
  assert.equal(source.utm_source, "First");
  assert.equal(source.utm_medium, "");
  assert.equal(source.utm_term, "");
  assert.equal(source.landing_page, "/?utm_source=First");
});

test("overlong values are cut to 200 characters in every field", () => {
  const long = "a".repeat(500);
  const source = readSource(
    `${site}/${long}/?utm_source=${long}&utm_medium=${long}&utm_campaign=${long}&utm_content=${long}&utm_term=${long}`,
    `https://${long}.example/${long}`,
  );
  for (const name of FIELD_NAMES) {
    assert.ok(source[name].length <= MAX_LENGTH, `${name} is ${source[name].length} characters`);
  }
  assert.equal(source.utm_source.length, 200);
  assert.equal(source.landing_page.length, 200);
  assert.equal(clip("x".repeat(250)).length, 200);
  // Half a surrogate pair is not left at the cut.
  assert.equal(clip("a".repeat(199) + "\u{1F600}"), "a".repeat(199));
});

test("control characters and line breaks are turned into spaces", () => {
  assert.equal(clip("one\r\ntwo\u0000three  four"), "one two three four");
  const source = readSource(`${site}/?utm_source=a%0D%0Ab`, "");
  assert.equal(source.utm_source, "a b");
});

test("a referrer keeps its address but not its query string, and our own site is not a source", () => {
  assert.equal(
    readSource(gbp, "https://l.instagram.com/some/path?u=https%3A%2F%2Fexample.com&e=token#frag").referrer,
    "https://l.instagram.com/some/path",
  );
  assert.equal(readSource(gbp, `${site}/process/`).referrer, "");
  assert.equal(readSource(gbp, "not a url").referrer, "");
  assert.equal(
    readSource(gbp, "android-app://com.google.android.googlequicksearchbox/").referrer,
    "android-app://com.google.android.googlequicksearchbox/",
  );
});

test("an unusable address gives an empty record rather than an error", () => {
  const source = readSource("not a url", "https://example.com/");
  assert.deepEqual(Object.values(source), ["", "", "", "", "", "", ""]);
});

test("without consent the current page is used and storage is never touched", () => {
  const storage = fakeStorage({
    [STORAGE_KEY]: serialiseSource(readSource(gbp, "https://www.google.com/")),
  });
  const getStorage = () => storage;

  assert.equal(rememberSource({ href: gbp, referrer: "", consented: false, getStorage }), false);
  const submitted = sourceForSubmit({
    href: `${site}/process/`,
    referrer: "",
    consented: false,
    getStorage,
  });
  assert.equal(submitted.landing_page, "/process/");
  assert.equal(submitted.utm_source, "");
  assert.deepEqual(storage.calls, []);
});

test("with consent the first page of the visit is remembered and used on a later page", () => {
  const storage = fakeStorage();
  const getStorage = () => storage;

  assert.equal(
    rememberSource({ href: gbp, referrer: "https://www.google.com/", consented: true, getStorage }),
    true,
  );
  // Later pages without utm_ parameters leave the landing page alone.
  assert.equal(
    rememberSource({ href: `${site}/process/`, referrer: `${site}/alcove-units/`, consented: true, getStorage }),
    false,
  );

  const submitted = sourceForSubmit({
    href: `${site}/contact/`,
    referrer: `${site}/process/`,
    consented: true,
    getStorage,
  });
  assert.equal(submitted.utm_campaign, "gbp-post");
  assert.equal(submitted.utm_content, "2026-10-16-alcove-south-kensington");
  assert.match(submitted.landing_page, /^\/alcove-units\/\?utm_source=google/);
  assert.equal(submitted.referrer, "https://www.google.com/");
});

test("with consent but no earlier utm_ visit, the first page of the visit is the landing page", () => {
  const storage = fakeStorage();
  const getStorage = () => storage;
  rememberSource({ href: `${site}/`, referrer: "https://www.bing.com/", consented: true, getStorage });
  rememberSource({ href: `${site}/materials/`, referrer: `${site}/`, consented: true, getStorage });
  const submitted = sourceForSubmit({ href: `${site}/contact/`, referrer: "", consented: true, getStorage });
  assert.equal(submitted.landing_page, "/");
  assert.equal(submitted.referrer, "https://www.bing.com/");
  assert.equal(hasCampaign(submitted), false);
});

test("a page that carries utm_ parameters beats what was remembered, and replaces it", () => {
  const storage = fakeStorage();
  const getStorage = () => storage;
  rememberSource({ href: `${site}/`, referrer: "https://www.bing.com/", consented: true, getStorage });

  const newer = `${site}/media-walls/?utm_source=google&utm_medium=organic&utm_campaign=gbp-post&utm_content=other-post`;
  const submitted = sourceForSubmit({ href: newer, referrer: "", consented: true, getStorage });
  assert.equal(submitted.utm_content, "other-post");

  assert.equal(rememberSource({ href: newer, referrer: "", consented: true, getStorage }), true);
  const later = sourceForSubmit({ href: `${site}/contact/`, referrer: "", consented: true, getStorage });
  assert.equal(later.utm_content, "other-post");
});

test("withdrawing consent deletes the remembered source and it is no longer read", () => {
  const storage = fakeStorage();
  const getStorage = () => storage;
  rememberSource({ href: gbp, referrer: "", consented: true, getStorage });
  assert.ok(storage.data.has(STORAGE_KEY));
  forgetSource(getStorage);
  assert.equal(storage.data.has(STORAGE_KEY), false);
});

test("storage that throws never breaks the form", () => {
  const blocked = () => { throw new Error("SecurityError"); };
  const broken = {
    getItem() { throw new Error("denied"); },
    setItem() { throw new Error("quota"); },
    removeItem() { throw new Error("denied"); },
  };
  for (const getStorage of [blocked, () => broken, () => null]) {
    assert.equal(rememberSource({ href: gbp, referrer: "", consented: true, getStorage }), false);
    assert.doesNotThrow(() => forgetSource(getStorage));
    const submitted = sourceForSubmit({ href: `${site}/contact/`, referrer: "", consented: true, getStorage });
    assert.equal(submitted.landing_page, "/contact/");
  }
});

test("stored values are not trusted: unknown keys, non-strings, junk and long values", () => {
  assert.equal(parseStored(null), null);
  assert.equal(parseStored(""), null);
  assert.equal(parseStored("{not json"), null);
  assert.equal(parseStored("[]"), null);
  assert.equal(parseStored("{}"), null);

  const parsed = parseStored(
    JSON.stringify({
      utm_source: "x".repeat(900),
      utm_medium: 7,
      landing_page: "/a/",
      referrer: "https://example.com/",
      injected: "<script>",
    }),
  );
  assert.equal(parsed.utm_source.length, 200);
  assert.equal(parsed.utm_medium, "");
  assert.equal("injected" in parsed, false);
  assert.deepEqual(Object.keys(parsed), FIELD_NAMES);
});

test("choosing and remembering follow the rules directly", () => {
  const campaign = readSource(gbp, "");
  const plain = readSource(`${site}/process/`, "");
  const stored = readSource(`${site}/`, "https://www.bing.com/");

  assert.equal(chooseSource({ current: campaign, remembered: stored, consented: true }), campaign);
  assert.equal(chooseSource({ current: plain, remembered: stored, consented: true }), stored);
  assert.equal(chooseSource({ current: plain, remembered: stored, consented: false }), plain);
  assert.equal(chooseSource({ current: plain, remembered: null, consented: true }), plain);

  assert.equal(sourceToRemember({ current: campaign, remembered: stored }), campaign);
  assert.equal(sourceToRemember({ current: plain, remembered: stored }), null);
  assert.equal(sourceToRemember({ current: plain, remembered: null }), plain);
});
