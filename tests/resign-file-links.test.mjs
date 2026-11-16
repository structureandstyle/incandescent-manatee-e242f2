/**
 * Re-signing the old "Attached files" links for the Worker's secret
 * (scripts/resign-file-links.mjs, 16 Nov 2026).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// Shaped like the Worker's: 48 random bytes in Base64.
const SECRET = "Zm9yIHRlc3RzIG9ubHk6IG5vdCB0aGUgV29ya2VyJ3Mgc2VjcmV0LCBuZXZlciB1c2Vk";
process.env.SS_UPLOAD_LINK_SECRET = SECRET;
const { findLinks, ORIGIN, resign } = await import("../scripts/resign-file-links.mjs");
const { downloadLink, folderLink, verifyDownloadLink, verifyFolderLink } = await import("../netlify/functions/lib/enquiry-uploads.mjs");

const folder = "12345678-1234-1234-1234-123456789abc";
const oldFile = `${ORIGIN}/api/enquiry-file?key=enquiries%2F${folder}%2F2.jpeg&sig=${"d".repeat(64)}`;
const oldFolder = `${ORIGIN}/api/enquiry-files?f=${folder}&x=jpeg.jpeg.png&sig=${"9".repeat(64)}`;

test("an old file link is made again for the same file, and opens with the new secret", () => {
  const fresh = resign(oldFile);
  assert.equal(fresh, downloadLink(`enquiries/${folder}/2.jpeg`, ORIGIN));
  const url = new URL(fresh);
  assert.equal(url.origin, ORIGIN);
  assert.equal(verifyDownloadLink(url.searchParams.get("key"), url.searchParams.get("sig")), true);
});

test("an old folder link is made again for the same files, in the same order", () => {
  const fresh = resign(oldFolder);
  assert.equal(fresh, folderLink(folder, ["jpeg", "jpeg", "png"], ORIGIN));
  const url = new URL(fresh);
  assert.equal(verifyFolderLink(url.searchParams.get("f"), url.searchParams.get("x"), url.searchParams.get("sig")), true);
});

test("anything that is not a well-formed file or folder link is left out", () => {
  assert.equal(resign("https://d33wubrfki0l68.cloudfront.net/f4dc1284/8dd878b4.jpeg"), null);
  assert.equal(resign(`${ORIGIN}/api/enquiry-file?key=enquiries%2F..%2Fsecrets&sig=x`), null);
  assert.equal(resign(`${ORIGIN}/api/enquiry-file?key=enquiries%2F${folder}%2F7.jpeg&sig=x`), null);
  assert.equal(resign(`${ORIGIN}/api/enquiry-files?f=not-a-folder&x=jpg&sig=x`), null);
  assert.equal(resign(`${ORIGIN}/api/enquiry-files?f=${folder}&x=jpg.svg&sig=x`), null);
  assert.equal(resign("not a link"), null);
});

test("links are found in job descriptions as the log holds them, once each", () => {
  const text = `Desk and shelf.\r\n\r\nAttached files:\r\nPROJECT.jpeg: ${oldFile}\r\nPLAN.jpeg: ${oldFile}\r\n\r\nAttached files: ${oldFolder}\r\n1. IMG_1.jpeg`;
  assert.deepEqual(findLinks(text), [oldFile, oldFolder]);
});

test("the command: secret from the environment, one 'old<TAB>new' line per link, nothing else on stdout", () => {
  const dir = mkdtempSync(join(tmpdir(), "resign-"));
  const input = join(dir, "old-links.txt");
  writeFileSync(input, `Attached files: ${oldFolder}\nPROJECT.jpeg: ${oldFile}\nhttps://d33wubrfki0l68.cloudfront.net/x/y.png\n`);
  const script = fileURLToPath(new URL("../scripts/resign-file-links.mjs", import.meta.url));
  const out = execFileSync(process.execPath, [script, input], { env: { ...process.env, SS_UPLOAD_LINK_SECRET: SECRET }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const lines = out.trim().split("\n").map((line) => line.split("\t"));
  assert.deepEqual(lines, [[oldFolder, resign(oldFolder)], [oldFile, resign(oldFile)]]);

  const refused = spawnSync(process.execPath, [script, input], { env: { ...process.env, SS_UPLOAD_LINK_SECRET: "too short" }, encoding: "utf8" });
  assert.equal(refused.status, 1);
  assert.equal(refused.stdout, "");
});
