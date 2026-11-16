/**
 * Photo uploads on the Cloudflare Worker, without bucket keys (15 Nov 2026,
 * worker/uploads.mjs): tickets point at the Worker, the Worker writes each file
 * to the bucket through its binding, and the file links stream it back.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { downloadLink, uploadLink, verifyDownloadLink } from "../netlify/functions/lib/enquiry-uploads.mjs";
import worker from "../worker/index.mjs";

const site = "https://structureandstyle.co.uk";

process.env.SS_UPLOAD_LINK_SECRET = "test-link-secret";
process.env.SS_TURNSTILE_SECRET_KEY = "test-turnstile-secret";
// The point of the change: none of these exist on the Worker.
for (const name of ["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY"]) delete process.env[name];

// FixedLengthStream is Cloudflare's; this stand-in keeps its rule: exactly
// the expected bytes, or the stream fails.
globalThis.FixedLengthStream ??= class FixedLengthStream extends TransformStream {
  constructor(expected) {
    let seen = 0;
    super({
      transform(chunk, controller) {
        seen += chunk.byteLength;
        if (seen > expected) controller.error(new TypeError("Too many bytes for FixedLengthStream."));
        else controller.enqueue(chunk);
      },
      flush(controller) {
        if (seen !== expected) controller.error(new TypeError("Too few bytes for FixedLengthStream."));
      },
    });
  }
};

/** A stand-in for the R2 binding: put, get, head and delete, as the Worker uses them. */
function fakeBucket() {
  const objects = new Map();
  return {
    objects,
    async put(key, body, options) {
      const bytes = new Uint8Array(await new Response(body).arrayBuffer());
      objects.set(key, { bytes, contentType: options?.httpMetadata?.contentType });
      return { key, size: bytes.byteLength };
    },
    async get(key) {
      const object = objects.get(key);
      return object ? { size: object.bytes.byteLength, body: new Blob([object.bytes]).stream() } : null;
    },
    async head(key) {
      const object = objects.get(key);
      return object ? { size: object.bytes.byteLength } : null;
    },
    async delete(key) { objects.delete(key); },
  };
}

const workerEnv = (overrides = {}) => ({
  UPLOADS: fakeBucket(),
  ASSETS: { fetch: async () => new Response("page", { status: 200 }) },
  ...overrides,
});
const ctx = { waitUntil() {} };
const call = (request, env) => worker.fetch(request, env, ctx);

async function withTurnstile(fn) {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /turnstile\/v0\/siteverify/);
    return Response.json({ success: true, action: "ss_enquiry_upload", hostname: "structureandstyle.co.uk" });
  };
  try { return await fn(); } finally { globalThis.fetch = realFetch; }
}

const ticketRequest = (files) => new Request(`${site}/api/enquiry-upload-tickets`, {
  method: "POST",
  headers: { Origin: site, "Content-Type": "application/json" },
  body: JSON.stringify({ files, turnstileToken: "test-token" }),
});

async function ticketsFor(env, files) {
  const response = await withTurnstile(() => call(ticketRequest(files), env));
  assert.equal(response.status, 200);
  return response.json();
}

const bytesOf = (size, seed = 7) => Uint8Array.from({ length: size }, (_, i) => (i * 31 + seed) % 256);
const put = (url, body, headers = { "Content-Type": "image/jpeg" }) =>
  new Request(url, { method: "PUT", headers, body });

test("on the Worker each ticket is a signed link to the Worker itself, with no bucket keys", async () => {
  const env = workerEnv();
  const before = Math.floor(Date.now() / 1000);
  const files = [{ name: "room.jpg", size: 1234 }, { name: "plan.pdf", size: 99 }];
  const { tickets, filesUrl } = await ticketsFor(env, files);
  assert.equal(tickets.length, 2);
  for (const [i, ticket] of tickets.entries()) {
    const url = new URL(ticket.uploadUrl);
    assert.equal(url.origin, site);
    assert.equal(url.pathname, "/api/enquiry-upload");
    assert.deepEqual([...url.searchParams.keys()], ["key", "size", "exp", "sig"]);
    assert.equal(url.searchParams.get("size"), String(files[i].size));
    assert.equal(url.searchParams.get("key"), new URL(ticket.downloadUrl).searchParams.get("key"));
    assert.doesNotMatch(ticket.uploadUrl, /X-Amz|r2\.cloudflarestorage/);
    const expires = Number(url.searchParams.get("exp"));
    assert.ok(expires >= before + 1800 && expires <= before + 1810, `expiry ${expires - before}s`);
  }
  assert.equal(tickets[1].contentType, "application/pdf");
  assert.equal(new URL(filesUrl).pathname, "/api/enquiry-files");
});

test("a file sent on its ticket lands in the bucket, and its links bring it back intact", async () => {
  const env = workerEnv();
  const photo = bytesOf(2048);
  const plan = bytesOf(300, 3);
  const { tickets, filesUrl } = await ticketsFor(env, [{ name: "room.jpg", size: photo.length }, { name: "plan.pdf", size: plan.length }]);

  assert.equal((await call(put(tickets[0].uploadUrl, photo), env)).status, 200);
  assert.equal((await call(put(tickets[1].uploadUrl, plan, { "Content-Type": "application/pdf" }), env)).status, 200);

  const key = new URL(tickets[0].uploadUrl).searchParams.get("key");
  const stored = env.UPLOADS.objects.get(key);
  assert.deepEqual(stored.bytes, photo);
  assert.equal(stored.contentType, "image/jpeg");

  const file = await call(new Request(tickets[0].downloadUrl), env);
  assert.equal(file.status, 200);
  assert.equal(file.headers.get("content-type"), "image/jpeg");
  assert.equal(file.headers.get("content-disposition"), 'attachment; filename="structure-style-1.jpg"');
  assert.equal(file.headers.get("x-content-type-options"), "nosniff");
  assert.equal(file.headers.get("content-security-policy"), "default-src 'none'; sandbox");
  assert.equal(file.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(new Uint8Array(await file.arrayBuffer()), photo);

  const head = await call(new Request(tickets[0].downloadUrl, { method: "HEAD" }), env);
  assert.equal(head.status, 200);
  assert.equal((await head.arrayBuffer()).byteLength, 0);

  // The enquiry's one link: its page lists both, and every link on it opens.
  const page = await call(new Request(filesUrl), env);
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.match(html, /Two files sent with one website enquiry/);
  const hrefs = [...new Set([...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1].replaceAll("&amp;", "&")))];
  assert.equal(hrefs.length, 2);
  const opened = await Promise.all(hrefs.map(async (href) => new Uint8Array(await (await call(new Request(href), env)).arrayBuffer())));
  assert.deepEqual(opened, [photo, plan]);
});

test("an upload link works for its own file, size and time only", async () => {
  const env = workerEnv();
  const photo = bytesOf(500);
  const { tickets } = await ticketsFor(env, [{ name: "room.jpg", size: photo.length }]);
  const good = new URL(tickets[0].uploadUrl);
  const key = good.searchParams.get("key");
  const changed = (name, value) => { const url = new URL(good); url.searchParams.set(name, value); return url.toString(); };
  const status = async (request) => (await call(request, env)).status;

  assert.equal(await status(put(changed("key", key.replace("/1.jpg", "/2.jpg")), photo)), 403);
  // Another folder: the first character always changes (a random folder id
  // starts with "0" one time in sixteen).
  const otherFolder = key.replace(/^enquiries\/(.)/, (_, c) => `enquiries/${c === "0" ? "1" : "0"}`);
  assert.notEqual(otherFolder, key);
  assert.equal(await status(put(changed("key", otherFolder), photo)), 403);
  assert.equal(await status(put(changed("key", "enquiries/../secrets"), photo)), 403);
  assert.equal(await status(put(changed("size", String(photo.length + 1)), photo)), 403);
  assert.equal(await status(put(changed("exp", String(Number(good.searchParams.get("exp")) + 60)), photo)), 403);
  assert.equal(await status(put(changed("sig", "0".repeat(64)), photo)), 403);

  // Thirty-one minutes after it was issued, a genuine link has expired.
  const old = uploadLink(key, photo.length, site, Date.now() - 31 * 60 * 1000);
  const expired = await call(put(old, photo), env);
  assert.equal(expired.status, 403);
  assert.equal((await expired.json()).error, "Upload link has expired. Try again.");

  // The type the ticket named, and only that.
  assert.equal(await status(put(good.toString(), photo, { "Content-Type": "image/png" })), 415);
  assert.equal(await status(put(good.toString(), photo, { "Content-Type": "text/html" })), 415);
  assert.equal(await status(put(good.toString(), photo, {})), 415);

  // The size the ticket named, and only that: a stated length, then the bytes themselves.
  assert.equal(await status(put(good.toString(), photo, { "Content-Type": "image/jpeg", "Content-Length": "499" })), 400);
  assert.equal(await status(put(good.toString(), bytesOf(499))), 502);
  assert.equal(await status(put(good.toString(), bytesOf(501))), 502);
  assert.equal(env.UPLOADS.objects.size, 0, "nothing is kept from a refused upload");

  const get = await call(new Request(good), env);
  assert.equal(get.status, 405);
  assert.equal(get.headers.get("allow"), "PUT");

  // And the genuine send still works after all that.
  assert.equal(await status(put(good.toString(), photo)), 200);
  assert.equal(env.UPLOADS.objects.size, 1);
});

test("no signature stands in for another kind: upload, file and folder links are separate", async () => {
  const env = workerEnv();
  const photo = bytesOf(64);
  const { tickets } = await ticketsFor(env, [{ name: "room.jpg", size: photo.length }]);
  const upload = new URL(tickets[0].uploadUrl);
  const key = upload.searchParams.get("key");
  // The upload ticket's signature does not open the file...
  assert.equal(verifyDownloadLink(key, upload.searchParams.get("sig")), false);
  // ...and the file link's signature does not take an upload.
  const asUpload = new URL(upload);
  asUpload.searchParams.set("sig", new URL(downloadLink(key, site)).searchParams.get("sig"));
  assert.equal((await call(put(asUpload.toString(), photo), env)).status, 403);
});

test("a file link opens its own file only, and a missing file says so", async () => {
  const env = workerEnv();
  const key = "enquiries/12345678-1234-1234-1234-123456789abc/1.jpg";
  const link = new URL(downloadLink(key, site));
  assert.equal((await call(new Request(link), env)).status, 404);
  link.searchParams.set("sig", "f".repeat(64));
  assert.equal((await call(new Request(link), env)).status, 403);
  const post = await call(new Request(downloadLink(key, site), { method: "POST" }), env);
  assert.equal(post.status, 405);
});

test("without the bucket binding the photo routes say they are not configured", async () => {
  const env = workerEnv({ UPLOADS: undefined });
  const tickets = await withTurnstile(() => call(ticketRequest([{ name: "room.jpg", size: 10 }]), env));
  assert.equal(tickets.status, 503);
  const key = "enquiries/12345678-1234-1234-1234-123456789abc/1.jpg";
  assert.equal((await call(put(uploadLink(key, 10, site), bytesOf(10)), env)).status, 503);
  assert.equal((await call(new Request(downloadLink(key, site)), env)).status, 503);
});

/** Every file the Worker loads, following its relative imports from worker/index.mjs, and the packages they name. */
function workerImports() {
  const files = new Map();
  const packages = new Set();
  const visit = (url) => {
    if (files.has(url.href)) return;
    const text = readFileSync(url, "utf8");
    files.set(url.href, text);
    const specs = text.matchAll(/(?:^|\n)\s*(?:import|export)\b[^;]*?\bfrom\s*["']([^"']+)["']|(?:^|\n)\s*import\s*["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/g);
    for (const m of specs) {
      const spec = m[1] || m[2] || m[3];
      if (spec.startsWith(".")) visit(new URL(spec, url));
      else packages.add(spec);
    }
  };
  visit(new URL("../worker/index.mjs", import.meta.url));
  return { files, packages };
}

test("nothing the Worker loads brings in the AWS SDK or the bucket keys", () => {
  const { files, packages } = workerImports();
  const paths = [...files.keys()].map((href) => href.split("/").slice(-2).join("/"));
  assert.ok(files.size >= 5, `followed only ${files.size} files: ${paths.join(", ")}`);
  for (const pkg of packages) assert.doesNotMatch(pkg, /^@aws-sdk\//, `the Worker loads ${pkg}`);
  for (const [href, text] of files) {
    assert.doesNotMatch(href, /r2-client\.mjs$|enquiry-upload-tickets\.mjs$|enquiry-file\.mjs$/, `the Worker loads ${href}`);
    assert.doesNotMatch(text, /R2_ACCESS_KEY_ID|R2_SECRET_ACCESS_KEY|R2_ACCOUNT_ID/, `${href} reads bucket keys`);
  }
  // Netlify keeps its own key-based route until it is switched off.
  const netlify = readFileSync(new URL("../netlify/functions/enquiry-upload-tickets.mjs", import.meta.url), "utf8");
  assert.match(netlify, /from "\.\/lib\/r2-client\.mjs"/);
});

// SHA-256 of S&S's Cloudflare account ID, so the ID itself is never written here.
const ACCOUNT_ID_SHA256 = "1a3e93031739f05f9cca9e0dc4b943523771105c1fb52ac4781bc6802c9036e8";
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", ".wrangler", ".astro", ".claude", ".netlify", "preview-build"]);
const TEXT_FILE = /\.(?:mjs|cjs|js|ts|astro|md|mdx|json|jsonc|toml|txt|html|css|ya?ml|xml|svg|csv|py|sh|ps1|env|example)$/i;

test("the account ID is in no file of the repository", () => {
  // Netlify's secrets scan fails every build while a value it holds as a
  // secret, such as R2_ACCOUNT_ID, appears in any file (docs/enquiry-uploads.md).
  const root = fileURLToPath(new URL("..", import.meta.url));
  const found = [];
  let scanned = 0;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(join(dir, entry.name));
      } else if (TEXT_FILE.test(entry.name) || entry.name.startsWith(".")) {
        const path = join(dir, entry.name);
        if (statSync(path).size > 5_000_000) continue;
        scanned += 1;
        for (const token of readFileSync(path, "utf8").match(/\b[0-9a-f]{32}\b/gi) || []) {
          if (createHash("sha256").update(token.toLowerCase()).digest("hex") === ACCOUNT_ID_SHA256) found.push(path);
        }
      }
    }
  };
  walk(root);
  assert.ok(scanned > 50, `scanned only ${scanned} files`);
  assert.deepEqual(found, [], "the account ID is written in these files");
});

test("the form sends each file to its ticket's address, with its ticket's type and the site's cookies", () => {
  const page = readFileSync(new URL("../src/components/EnquiryForm.astro", import.meta.url), "utf8");
  assert.match(page, /fetch\(ticket\.uploadUrl, \{\s*method: "PUT",\s*headers: \{ "Content-Type": ticket\.contentType \},\s*body: file,\s*credentials: "same-origin",/);
});

/** A body sent in chunks, which states no length, as an attacker would send it. */
const chunkedRequest = (url, init, totalBytes, chunkBytes = 64 * 1024) => {
  let sent = 0;
  const body = new ReadableStream({
    pull(controller) {
      if (sent >= totalBytes) { controller.close(); return; }
      const size = Math.min(chunkBytes, totalBytes - sent);
      controller.enqueue(new Uint8Array(size).fill(0x7b));
      sent += size;
    },
  });
  return { request: new Request(url, { ...init, body, duplex: "half" }), read: () => sent };
};

test("an oversized ticket request is refused without reading it all, length stated or not", async () => {
  const env = workerEnv();
  const { request, read } = chunkedRequest(`${site}/api/enquiry-upload-tickets`, {
    method: "POST",
    headers: { Origin: site, "Content-Type": "application/json" },
  }, 50_000_000);
  const response = await call(request, env);
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, "Request is too large.");
  assert.ok(read() < 1_000_000, `read ${read()} bytes of a 50 MB body`);
});

test("an oversized enquiry post is refused without reading it all, length stated or not", async () => {
  const env = workerEnv();
  const { request, read } = chunkedRequest(`${site}/thanks/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  }, 50_000_000);
  const response = await call(request, env);
  assert.equal(response.status, 413);
  assert.ok(read() < 3_000_000, `read ${read()} bytes of a 50 MB body`);
});
