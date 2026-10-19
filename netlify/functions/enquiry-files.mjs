import { downloadLink, verifyFolderLink } from "./lib/enquiry-uploads.mjs";

// The one page an enquiry's link opens: every file sent with that enquiry, in
// the order the job description lists their names. Photos show inline; each
// file also has a download link through /api/enquiry-file, so access still
// goes through the same signed, one-minute R2 redirect. See folderLink in
// lib/enquiry-uploads.mjs for why an enquiry carries one link, not one per file.

const PREVIEWS = new Set(["jpg", "jpeg", "png", "webp"]);
// Small numbers in words, as everywhere else on the site.
const WORDS = ["one", "two", "three", "four", "five", "six"];

const escapeHtml = (text) => String(text)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  // Photos load through /api/enquiry-file, which redirects to the R2 bucket.
  "Content-Security-Policy": "default-src 'none'; img-src 'self' https://*.r2.cloudflarestorage.com; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
};

const page = (title, body, status = 200) => new Response(`<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escapeHtml(title)} | Structure &amp; Style</title>
<style>
  body { margin: 0; background: #f2ede4; color: #2b2a27; font: 16px/1.6 system-ui, sans-serif; }
  main { max-width: 760px; margin: 0 auto; padding: 32px 16px 48px; }
  h1 { font: 400 32px/1.2 Georgia, serif; margin: 0 0 12px; }
  ol { list-style: none; padding: 0; margin: 24px 0; }
  li { border-top: 1px solid #c9c1b3; padding: 16px 0; }
  img { display: block; max-width: 100%; height: auto; margin-bottom: 8px; background: #e6dfd3; }
  a { color: #2f4a3a; }
  .note { color: #5c574f; font-size: 14px; }
</style>
</head>
<body>
<main>
${body}
</main>
</body>
</html>`, { status, headers: HEADERS });

export default async function handler(request) {
  if (request.method !== "GET") return page("Not available", "<h1>Not available</h1>", 405);
  if (!process.env.SS_UPLOAD_LINK_SECRET) {
    return page("Not available", "<h1>Files are not available</h1><p>Try again shortly.</p>", 503);
  }

  const url = new URL(request.url);
  const folder = url.searchParams.get("f");
  const list = url.searchParams.get("x");
  if (!verifyFolderLink(folder, list, url.searchParams.get("sig"))) {
    return page("Link not valid", "<h1>This link is not valid</h1><p>Open it from the enquiry email or the CRM, without changing it.</p>", 403);
  }

  const origin = url.origin;
  const extensions = list.split(".");
  const items = extensions.map((extension, index) => {
    const number = index + 1;
    const href = escapeHtml(downloadLink(`enquiries/${folder}/${number}.${extension}`, origin));
    const preview = PREVIEWS.has(extension)
      ? `<a href="${href}"><img src="${href}" alt="File ${number}" decoding="async"></a>`
      : "";
    return `<li>${preview}<a href="${href}">Download file ${number} (${extension.toUpperCase()})</a></li>`;
  });
  const count = extensions.length;
  const summary = `${WORDS[count - 1] ?? count} ${count === 1 ? "file" : "files"}`;

  return page("Enquiry files", `<h1>Enquiry files</h1>
<p>${summary[0].toUpperCase()}${summary.slice(1)} sent with one website enquiry, in the order its job description lists their names.</p>
<ol>
${items.join("\n")}
</ol>
<p class="note">Anyone with this page's link can open these files. Keep the link inside the enquiry record.</p>`);
}

export const config = { path: "/api/enquiry-files" };
