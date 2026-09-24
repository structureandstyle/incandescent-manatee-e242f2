import test from "node:test";
import assert from "node:assert/strict";
import {
  downloadLink,
  validateFiles,
  verifyDownloadLink,
} from "../netlify/functions/lib/enquiry-uploads.mjs";
import ticketsHandler from "../netlify/functions/enquiry-upload-tickets.mjs";
import fileHandler from "../netlify/functions/enquiry-file.mjs";

const site = "https://structureandstyle.co.uk";
const key = "enquiries/12345678-1234-1234-1234-123456789abc/1.jpg";

process.env.R2_ACCOUNT_ID = "0123456789abcdef0123456789abcdef";
process.env.R2_ACCESS_KEY_ID = "test-access-key";
process.env.R2_SECRET_ACCESS_KEY = "test-secret-key";
process.env.SS_UPLOAD_LINK_SECRET = "test-download-secret";
process.env.SS_TURNSTILE_SECRET_KEY = "test-turnstile-secret";

test("file rules reject unsafe formats and oversize batches", () => {
  assert.throws(() => validateFiles([{ name: "plan.svg", size: 100 }]), /unsupported/);
  assert.throws(() => validateFiles([{ name: "photo.jpg", size: 15_000_001 }]), /15 MB/);
  assert.throws(() => validateFiles(Array.from({ length: 5 }, (_, i) => ({
    name: `${i}.jpg`, size: 15_000_000,
  }))), /60 MB/);
  assert.equal(validateFiles([{ name: "room.HEIC", size: 10_000_000 }])[0].contentType, "image/heic");
});

test("file rules allow six files and refuse a seventh", () => {
  const files = (count) => Array.from({ length: count }, (_, i) => ({ name: `${i}.jpg`, size: 1_000_000 }));
  assert.equal(validateFiles(files(6)).length, 6);
  assert.throws(() => validateFiles(files(7)), /1 to 6 files/);
});

test("download links reject tampering", () => {
  const url = new URL(downloadLink(key, site));
  assert.equal(verifyDownloadLink(url.searchParams.get("key"), url.searchParams.get("sig")), true);
  assert.equal(verifyDownloadLink(key.replace("1.jpg", "2.jpg"), url.searchParams.get("sig")), false);
  assert.equal(verifyDownloadLink("enquiries/../../secrets", url.searchParams.get("sig")), false);
});

test("download links stop at the sixth file", () => {
  const linkFor = (name) => new URL(downloadLink(key.replace("1.jpg", name), site));
  const sixth = linkFor("6.jpg");
  assert.equal(verifyDownloadLink(sixth.searchParams.get("key"), sixth.searchParams.get("sig")), true);
  for (const name of ["7.jpg", "10.jpg"]) {
    const link = linkFor(name);
    assert.equal(verifyDownloadLink(link.searchParams.get("key"), link.searchParams.get("sig")), false);
  }
});

test("ticket issue checks challenge and binds file size and type", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (url) => {
    assert.match(String(url), /turnstile\/v0\/siteverify/);
    return Response.json({ success: true, action: "ss_enquiry_upload", hostname: "structureandstyle.co.uk" });
  };

  const request = new Request(`${site}/api/enquiry-upload-tickets`, {
    method: "POST",
    headers: { Origin: site, "Content-Type": "application/json" },
    body: JSON.stringify({ files: [{ name: "room.jpg", size: 12_345_678 }], turnstileToken: "test-token" }),
  });
  const response = await ticketsHandler(request);
  assert.equal(response.status, 200);
  const { tickets } = await response.json();
  assert.equal(tickets.length, 1);
  assert.equal(new URL(tickets[0].uploadUrl).searchParams.get("X-Amz-SignedHeaders"), "content-length;content-type;host");
  assert.equal(new URL(tickets[0].downloadUrl).host, "structureandstyle.co.uk");

  const fileResponse = await fileHandler(new Request(tickets[0].downloadUrl));
  assert.equal(fileResponse.status, 302);
  assert.match(fileResponse.headers.get("Location"), /r2\.cloudflarestorage\.com/);
});

test("ticket issue refuses another origin", async () => {
  const response = await ticketsHandler(new Request(`${site}/api/enquiry-upload-tickets`, {
    method: "POST",
    headers: { Origin: "https://other.example", "Content-Type": "application/json" },
    body: "{}",
  }));
  assert.equal(response.status, 403);
});
