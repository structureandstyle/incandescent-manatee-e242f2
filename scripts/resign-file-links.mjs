#!/usr/bin/env node
/**
 * RE-SIGN OLD FILE LINKS (16 Nov 2026).
 *
 * The "Attached files" links already in the shared enquiry log were signed
 * with Netlify's link secret, which Netlify never shows again. Once the domain
 * moves to the Cloudflare Worker, which signs with its own SS_UPLOAD_LINK_SECRET,
 * those links stop opening. The files themselves are untouched in the bucket.
 * This makes each link again, for the same file or folder, with the Worker's
 * secret, so the old link in the log can be replaced with the new one.
 *
 *   node scripts/resign-file-links.mjs <file with the old links> > <output file>
 *
 * The secret comes from SS_UPLOAD_LINK_SECRET if it is set, otherwise the
 * script asks for it without showing what is typed. Never put the secret in a
 * file, in chat or in a command line. Every /api/enquiry-file and
 * /api/enquiry-files link found in the input is printed as one line,
 * "old link<TAB>new link". Nothing is sent anywhere, and a link that is not
 * a well-formed file or folder link is reported and left out.
 *
 * Keep the output outside this repository: the links open customers' photos.
 */
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { pathToFileURL } from "node:url";
import {
  downloadLink,
  folderLink,
  verifyDownloadLink,
  verifyFolderLink,
} from "../netlify/functions/lib/enquiry-uploads.mjs";

export const ORIGIN = "https://structureandstyle.co.uk";
const LINK = /https?:\/\/[^\s"'<>]+\/api\/enquiry-files?\?[^\s"'<>]+/g;
const FILE_KEY = /^enquiries\/[0-9a-f-]{36}\/[1-6]\.(?:jpg|jpeg|png|webp|heic|heif|pdf|doc|docx)$/;

/** The new link for one old one, or null if it is not a file or folder link. */
export function resign(oldLink, origin = ORIGIN) {
  let url;
  try { url = new URL(oldLink); } catch { return null; }
  if (url.pathname === "/api/enquiry-file") {
    const key = url.searchParams.get("key");
    if (!key || !FILE_KEY.test(key)) return null;
    const fresh = downloadLink(key, origin);
    const check = new URL(fresh);
    return verifyDownloadLink(check.searchParams.get("key"), check.searchParams.get("sig")) ? fresh : null;
  }
  if (url.pathname === "/api/enquiry-files") {
    const folder = url.searchParams.get("f");
    const list = url.searchParams.get("x");
    if (!folder || !list) return null;
    const fresh = folderLink(folder, list.split("."), origin);
    const check = new URL(fresh);
    return verifyFolderLink(check.searchParams.get("f"), check.searchParams.get("x"), check.searchParams.get("sig")) ? fresh : null;
  }
  return null;
}

/** Every distinct file or folder link in a block of text, in order. */
export function findLinks(text) {
  return [...new Set(String(text).match(LINK) || [])];
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stderr, terminal: true });
    let asked = false;
    rl._writeToOutput = (chunk) => {
      if (!asked) { process.stderr.write(chunk); asked = true; }
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stderr.write("\n");
      resolve(answer.trim());
    });
  });
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    process.stderr.write("Usage: node scripts/resign-file-links.mjs <file with the old links> > <output file>\n");
    process.exit(2);
  }
  if (!process.env.SS_UPLOAD_LINK_SECRET) {
    process.env.SS_UPLOAD_LINK_SECRET = await askHidden("Paste the Worker's SS_UPLOAD_LINK_SECRET (hidden), then Enter: ");
  }
  // The Worker's secret is 48 random bytes in Base64, 64 characters (15 Nov
  // 2026); Netlify's was hex. Either way it is long and has no spaces.
  if (!/^\S{32,}$/.test(process.env.SS_UPLOAD_LINK_SECRET)) {
    process.stderr.write("That does not look like the link secret (at least 32 characters, no spaces). Nothing written.\n");
    process.exit(1);
  }

  const links = findLinks(readFileSync(inputPath, "utf8"));
  let made = 0;
  for (const link of links) {
    const fresh = resign(link);
    if (fresh) {
      process.stdout.write(`${link}\t${fresh}\n`);
      made += 1;
    } else {
      process.stderr.write(`Left out, not a well-formed file or folder link: ${link.slice(0, 80)}...\n`);
    }
  }
  process.stderr.write(`${made} of ${links.length} links made again.\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) await main();
