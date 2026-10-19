import test from "node:test";
import assert from "node:assert/strict";
import {
  downloadLink,
  folderLink,
  validateFiles,
  verifyDownloadLink,
  verifyFolderLink,
} from "../netlify/functions/lib/enquiry-uploads.mjs";
import ticketsHandler from "../netlify/functions/enquiry-upload-tickets.mjs";
import fileHandler from "../netlify/functions/enquiry-file.mjs";
import filesHandler from "../netlify/functions/enquiry-files.mjs";

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

test("one enquiry's files share one folder, and the next enquiry gets its own", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => Response.json({
    success: true, action: "ss_enquiry_upload", hostname: "structureandstyle.co.uk",
  });

  const keysFor = async (names) => {
    const response = await ticketsHandler(new Request(`${site}/api/enquiry-upload-tickets`, {
      method: "POST",
      headers: { Origin: site, "Content-Type": "application/json" },
      body: JSON.stringify({ files: names.map((name) => ({ name, size: 1_000 })), turnstileToken: "test-token" }),
    }));
    assert.equal(response.status, 200);
    const { tickets } = await response.json();
    return tickets.map((ticket) => new URL(ticket.downloadUrl).searchParams.get("key").split("/"));
  };

  const first = await keysFor(["room.jpg", "plan.pdf", "wall.png"]);
  assert.equal(new Set(first.map(([, folder]) => folder)).size, 1);
  assert.deepEqual(first.map(([, , file]) => file), ["1.jpg", "2.pdf", "3.png"]);

  const second = await keysFor(["hall.jpg"]);
  assert.notEqual(second[0][1], first[0][1]);
});

test("ticket issue refuses another origin", async () => {
  const response = await ticketsHandler(new Request(`${site}/api/enquiry-upload-tickets`, {
    method: "POST",
    headers: { Origin: "https://other.example", "Content-Type": "application/json" },
    body: "{}",
  }));
  assert.equal(response.status, 403);
});

test("an enquiry's one link names its folder and files, and rejects tampering", () => {
  const folder = "12345678-1234-1234-1234-123456789abc";
  const url = new URL(folderLink(folder, ["jpg", "pdf", "png"], site));
  const [f, x, sig] = ["f", "x", "sig"].map((name) => url.searchParams.get(name));
  assert.equal(url.pathname, "/api/enquiry-files");
  assert.equal(x, "jpg.pdf.png");
  assert.equal(verifyFolderLink(f, x, sig), true);
  assert.equal(verifyFolderLink(f, "jpg.pdf.png.jpg", sig), false);
  assert.equal(verifyFolderLink(f.replace("1", "2"), x, sig), false);
  assert.equal(verifyFolderLink(f, x, sig.replace(/^./, (c) => (c === "0" ? "1" : "0"))), false);
  assert.equal(verifyFolderLink(f, "jpg.svg", sig), false);
  assert.equal(verifyFolderLink(f, Array(7).fill("jpg").join("."), sig), false);
  // A file signature never opens a folder page.
  const file = new URL(downloadLink(`enquiries/${folder}/1.jpg`, site));
  assert.equal(verifyFolderLink(f, x, file.searchParams.get("sig")), false);
});

test("six files give one link, and its page lists all six", async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => Response.json({
    success: true, action: "ss_enquiry_upload", hostname: "structureandstyle.co.uk",
  });

  const names = ["a.jpg", "b.JPEG", "c.png", "plan.pdf", "d.webp", "e.heic"];
  const response = await ticketsHandler(new Request(`${site}/api/enquiry-upload-tickets`, {
    method: "POST",
    headers: { Origin: site, "Content-Type": "application/json" },
    body: JSON.stringify({ files: names.map((name) => ({ name, size: 1_000 })), turnstileToken: "test-token" }),
  }));
  assert.equal(response.status, 200);
  const { tickets, filesUrl } = await response.json();
  assert.equal(tickets.length, 6);
  const folder = new URL(tickets[0].downloadUrl).searchParams.get("key").split("/")[1];
  const link = new URL(filesUrl);
  assert.equal(link.searchParams.get("f"), folder);
  assert.equal(link.searchParams.get("x"), "jpg.jpeg.png.pdf.webp.heic");

  const pageResponse = await filesHandler(new Request(filesUrl));
  assert.equal(pageResponse.status, 200);
  assert.match(pageResponse.headers.get("Content-Type"), /text\/html/);
  assert.equal(pageResponse.headers.get("Cache-Control"), "no-store");
  assert.match(pageResponse.headers.get("X-Robots-Tag"), /noindex/);
  const html = await pageResponse.text();
  assert.match(html, /Six files sent with one website enquiry/);
  for (let n = 1; n <= 6; n += 1) assert.ok(html.includes(`Download file ${n} (`));
  // Photos preview inline; the PDF and HEIC files are links only.
  assert.equal((html.match(/<img /g) || []).length, 4);
  // Every link on the page is a signed file link that the file endpoint accepts.
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replaceAll("&amp;", "&"));
  assert.ok(hrefs.length >= 6);
  for (const href of hrefs) {
    const fileUrl = new URL(href);
    assert.equal(verifyDownloadLink(fileUrl.searchParams.get("key"), fileUrl.searchParams.get("sig")), true);
    assert.ok(fileUrl.searchParams.get("key").startsWith(`enquiries/${folder}/`));
  }
});

test("a changed enquiry link opens nothing", async () => {
  const good = new URL(folderLink("12345678-1234-1234-1234-123456789abc", ["jpg", "jpg"], site));
  good.searchParams.set("x", "jpg.jpg.jpg");
  const response = await filesHandler(new Request(good));
  assert.equal(response.status, 403);
  assert.doesNotMatch(await response.text(), /enquiry-file/);
});
