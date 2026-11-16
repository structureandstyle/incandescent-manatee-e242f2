/**
 * PHOTO UPLOADS ON CLOUDFLARE, WITHOUT BUCKET KEYS (15 Nov 2026).
 *
 * On Netlify the visitor's browser sent each file straight to the R2 bucket,
 * on an address presigned with the bucket's S3 keys, and a file link
 * redirected to another presigned address. The Worker lives in the same
 * Cloudflare account as the bucket and reaches it through its binding
 * (UPLOADS in wrangler.jsonc), so here:
 *   - each file's ticket is a signed link to this Worker, /api/enquiry-upload,
 *     for that one file and its exact size, good for 30 minutes;
 *   - the browser PUTs the file there and the Worker writes it to the bucket;
 *   - a file link streams the file back from the bucket.
 * No S3 keys, no CORS rule on the bucket, nothing to rotate. Why: the R2 keys
 * had to be pasted into the Worker by hand, and on 15 Nov the wrong value went
 * in three times, each time breaking every photo upload with nothing on screen
 * to say why. A binding cannot be pasted wrong.
 *
 * The checks, the file rules and the signed links are the ones Netlify's
 * functions use (netlify/functions/lib/enquiry-uploads.mjs). The form's script
 * is unchanged: it PUTs each file to whatever address its ticket gives, with
 * the ticket's type. A preview build binds UPLOADS to the empty preview
 * bucket, so a test upload on a preview never lands beside real enquiries.
 */
import {
  contentTypeFor,
  issueTickets,
  jsonResponse,
  uploadLink,
  verifyDownloadLink,
  verifyUploadLink,
} from "../netlify/functions/lib/enquiry-uploads.mjs";

const notAllowed = (allow) => {
  const response = jsonResponse({ error: "Method not allowed." }, 405);
  response.headers.set("Allow", allow);
  return response;
};

const extensionOf = (key) => key.slice(key.lastIndexOf(".") + 1);

/** POST /api/enquiry-upload-tickets: the shared checks, with links to this Worker. */
export function handleTickets(request, env) {
  return issueTickets(request, () => {
    if (!env?.UPLOADS) throw new Error("The UPLOADS bucket binding is missing.");
    return (key, file, origin) => uploadLink(key, file.size, origin);
  });
}

/** PUT /api/enquiry-upload: one file, on its ticket, into the bucket. */
export async function handleUpload(request, env) {
  if (request.method !== "PUT") return notAllowed("PUT");
  if (!process.env.SS_UPLOAD_LINK_SECRET || !env?.UPLOADS) {
    return jsonResponse({ error: "Uploads are not configured." }, 503);
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const size = Number(url.searchParams.get("size"));
  const expires = Number(url.searchParams.get("exp"));
  if (!verifyUploadLink(key, size, expires, url.searchParams.get("sig"))) {
    return jsonResponse({ error: "Upload link is invalid." }, 403);
  }
  if (expires * 1000 < Date.now()) {
    return jsonResponse({ error: "Upload link has expired. Try again." }, 403);
  }

  // The type comes from the file's extension, as the ticket named it, and the
  // browser must send the same, as R2 required of the presigned address.
  const type = contentTypeFor(extensionOf(key));
  const sent = (request.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (sent !== type) return jsonResponse({ error: "File type does not match its ticket." }, 415);

  const declared = request.headers.get("content-length");
  if (declared !== null && Number(declared) !== size) {
    return jsonResponse({ error: "File size does not match its ticket." }, 400);
  }
  if (!request.body) return jsonResponse({ error: "No file was sent." }, 400);

  // FixedLengthStream holds the body to the signed size, whatever the
  // headers say, and gives the bucket the length it needs before it starts.
  let stored;
  try {
    stored = await env.UPLOADS.put(key, request.body.pipeThrough(new FixedLengthStream(size)), {
      httpMetadata: { contentType: type },
    });
  } catch (error) {
    console.error("upload: not saved", key, String(error));
    return jsonResponse({ error: "The file did not upload. Try again." }, 502);
  }
  if (stored?.size !== size) {
    console.error("upload: wrong size stored", key, stored?.size, size);
    await env.UPLOADS.delete(key).catch(() => {});
    return jsonResponse({ error: "The file did not upload. Try again." }, 502);
  }
  return new Response(null, { status: 200, headers: { "Cache-Control": "no-store" } });
}

/** GET /api/enquiry-file: one file, streamed from the bucket to whoever holds its link. */
export async function handleFile(request, env) {
  if (request.method !== "GET" && request.method !== "HEAD") return notAllowed("GET, HEAD");
  if (!process.env.SS_UPLOAD_LINK_SECRET || !env?.UPLOADS) {
    return jsonResponse({ error: "Downloads are not configured." }, 503);
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  if (!verifyDownloadLink(key, url.searchParams.get("sig"))) {
    return jsonResponse({ error: "File link is invalid." }, 403);
  }

  let object;
  try {
    object = request.method === "HEAD" ? await env.UPLOADS.head(key) : await env.UPLOADS.get(key);
  } catch (error) {
    console.error("file: could not read", key, String(error));
    return jsonResponse({ error: "File is unavailable. Try again shortly." }, 502);
  }
  if (!object) return jsonResponse({ error: "File not found." }, 404);

  const extension = extensionOf(key);
  const number = key.match(/\/([1-6])\./)[1];
  return new Response(request.method === "HEAD" ? null : object.body, {
    status: 200,
    headers: {
      // From the extension the link signs, never from what was stored.
      "Content-Type": contentTypeFor(extension),
      // As Netlify's redirect said: opened directly, a file downloads. The
      // files page still shows photos inline, which this does not affect.
      "Content-Disposition": `attachment; filename="structure-style-${number}.${extension}"`,
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      // A file is never a page: nothing in one can run, even opened directly.
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
