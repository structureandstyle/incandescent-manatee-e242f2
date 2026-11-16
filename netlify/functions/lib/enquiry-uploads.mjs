import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

// Shared by the Netlify functions and the Cloudflare Worker (worker/uploads.mjs).
// Nothing here talks to the bucket: Netlify does that with S3 keys
// (./r2-client.mjs), the Worker through its binding, so this file stays free
// of the AWS SDK.

export const BUCKET = "structure-style-enquiry-uploads";
export const MAX_FILES = 6;
export const MAX_FILE_BYTES = 15_000_000;
export const MAX_TOTAL_BYTES = 60_000_000;
/** How long an upload ticket stays good, as Netlify's presigned PUT did. */
export const UPLOAD_LINK_SECONDS = 1800;

const contentTypes = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/** The type a file is stored and served as, from its extension alone. */
export function contentTypeFor(extension) {
  return Object.hasOwn(contentTypes, extension) ? contentTypes[extension] : "application/octet-stream";
}

/** One file of one enquiry: enquiries/<folder>/<1 to 6>.<allowed extension>. */
const OBJECT_KEY = /^enquiries\/[0-9a-f-]{36}\/[1-6]\.(?:jpg|jpeg|png|webp|heic|heif|pdf|doc|docx)$/;

// A message written for the visitor. The ticket function passes these
// through and replaces anything else, such as a JSON parse error, with a
// plain "Invalid upload request." (19 Oct 2026).
export class UploadRequestError extends Error {}

export function validateFiles(files) {
  if (!Array.isArray(files) || files.length < 1 || files.length > MAX_FILES) {
    throw new UploadRequestError(`Choose 1 to ${MAX_FILES} files.`);
  }

  let total = 0;
  return files.map((file, index) => {
    const name = String(file?.name ?? "");
    const extension = name.split(".").pop()?.toLowerCase();
    const size = Number(file?.size);
    if (!extension || !Object.hasOwn(contentTypes, extension)) {
      throw new UploadRequestError(`File ${index + 1} has an unsupported format.`);
    }
    if (!Number.isSafeInteger(size) || size < 1 || size > MAX_FILE_BYTES) {
      throw new UploadRequestError(`File ${index + 1} must be under 15 MB.`);
    }
    total += size;
    if (total > MAX_TOTAL_BYTES) {
      throw new UploadRequestError("Files must be under 60 MB combined.");
    }
    return { name, extension, size, contentType: contentTypes[extension] };
  });
}

export function newEnquiryFolder() {
  return randomUUID();
}

export function newObjectKey(folder, index, extension) {
  return `enquiries/${folder}/${index + 1}.${extension}`;
}

function signKey(key) {
  const secret = process.env.SS_UPLOAD_LINK_SECRET;
  if (!secret) throw new Error("Download link secret is not configured.");
  return createHmac("sha256", secret).update(key).digest("hex");
}

const sameSignature = (signature, text) =>
  typeof signature === "string" &&
  /^[0-9a-f]{64}$/.test(signature) &&
  timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(signKey(text), "hex"));

export function downloadLink(key, origin) {
  const url = new URL("/api/enquiry-file", origin);
  url.searchParams.set("key", key);
  url.searchParams.set("sig", signKey(key));
  return url.toString();
}

export function verifyDownloadLink(key, signature) {
  if (typeof key !== "string" || !OBJECT_KEY.test(key)) return false;
  return sameSignature(signature, key);
}

// THE WORKER'S UPLOAD TICKET, 15 Nov 2026. On Cloudflare the browser sends
// each file to the Worker, which writes it to the bucket through its binding,
// so no S3 keys are needed (worker/uploads.mjs). The ticket is a signed link
// to /api/enquiry-upload for one file name and one exact size, good for 30
// minutes, as the presigned PUT was. The signed text starts "upload:", which
// no file key ("enquiries/...") or folder link ("folder:...") does, so no
// signature can stand in for another kind.
export function uploadLink(key, size, origin, now = Date.now()) {
  const expires = Math.floor(now / 1000) + UPLOAD_LINK_SECONDS;
  const url = new URL("/api/enquiry-upload", origin);
  url.searchParams.set("key", key);
  url.searchParams.set("size", String(size));
  url.searchParams.set("exp", String(expires));
  url.searchParams.set("sig", signKey(`upload:${key}:${size}:${expires}`));
  return url.toString();
}

/** The link is one this site signed, for this file and size. The caller checks the time. */
export function verifyUploadLink(key, size, expires, signature) {
  if (typeof key !== "string" || !OBJECT_KEY.test(key)) return false;
  if (!Number.isSafeInteger(size) || size < 1 || size > MAX_FILE_BYTES) return false;
  if (!Number.isSafeInteger(expires) || expires < 1) return false;
  return sameSignature(signature, `upload:${key}:${size}:${expires}`);
}

// ONE LINK PER ENQUIRY, 19 Oct 2026. Netlify drops a form submission that
// carries more than five links: the visitor sees the thank-you page and no
// email or webhook follows. Tested that day with two text-only enquiries a
// minute apart, identical but for the links: five arrived, six vanished. One
// link per file therefore lost every six-file enquiry. The enquiry now carries
// a single link to a page listing all of its files.
//
// The link names the folder and each file's extension in order ("jpg.pdf.png"
// for 1.jpg, 2.pdf, 3.png), so the page needs no bucket listing. The signed
// text starts "folder:", which no file key does, so a folder signature can
// never pass as a file signature or the other way round.
const EXTENSION_LIST = /^(?:jpg|jpeg|png|webp|heic|heif|pdf|doc|docx)(?:\.(?:jpg|jpeg|png|webp|heic|heif|pdf|doc|docx)){0,5}$/;

export function folderLink(folder, extensions, origin) {
  const list = extensions.join(".");
  const url = new URL("/api/enquiry-files", origin);
  url.searchParams.set("f", folder);
  url.searchParams.set("x", list);
  url.searchParams.set("sig", signKey(`folder:${folder}:${list}`));
  return url.toString();
}

export function verifyFolderLink(folder, list, signature) {
  if (typeof folder !== "string" || !/^[0-9a-f-]{36}$/.test(folder)) return false;
  if (typeof list !== "string" || !EXTENSION_LIST.test(list)) return false;
  return sameSignature(signature, `folder:${folder}:${list}`);
}

/**
 * A request's body, read up to `maxBytes` and no further, or null if it is
 * longer. Checking Content-Length alone is not enough: a body sent in chunks
 * states no length, and reading it whole first (request.text(), formData())
 * lets anyone fill the Worker's memory before a single check runs, taking
 * page views down with it (review, 16 Nov 2026). Netlify capped bodies
 * itself; Cloudflare allows 100 MB per request.
 */
export async function readLimited(request, maxBytes) {
  if (!request.body) return new Uint8Array(0);
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export function jsonResponse(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

const TURNSTILE_ACTION = "ss_enquiry_upload";

/**
 * POST /api/enquiry-upload-tickets, for Netlify and the Worker alike: the
 * request checks, the Turnstile check, the file rules, one folder per enquiry,
 * and the links. Only the upload address differs, so the caller passes
 * `prepare`, which returns the function making it, or throws when uploads are
 * not configured: Netlify presigns a PUT straight to R2 with the bucket keys,
 * the Worker signs a link to itself (uploadLink above).
 */
export async function issueTickets(request, prepare) {
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") !== origin) {
    return jsonResponse({ error: "Request origin is not allowed." }, 403);
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return jsonResponse({ error: "Expected JSON." }, 415);
  }
  if (Number(request.headers.get("content-length")) > 10_000) {
    return jsonResponse({ error: "Request is too large." }, 413);
  }

  const turnstileSecret = process.env.SS_TURNSTILE_SECRET_KEY;
  if (!turnstileSecret || !process.env.SS_UPLOAD_LINK_SECRET) {
    return jsonResponse({ error: "Uploads are not configured." }, 503);
  }

  let uploadUrlFor;
  try {
    uploadUrlFor = prepare();
  } catch {
    return jsonResponse({ error: "Uploads are not configured." }, 503);
  }

  let files;
  let token;
  try {
    const bytes = await readLimited(request, 10_000);
    if (!bytes) throw new UploadRequestError("Request is too large.");
    const payload = JSON.parse(new TextDecoder().decode(bytes));
    if (!payload || typeof payload !== "object") throw new UploadRequestError("Invalid upload request.");
    files = validateFiles(payload.files);
    token = payload.turnstileToken;
    if (typeof token !== "string" || token.length < 1 || token.length > 2048) {
      throw new UploadRequestError("Complete the upload check and try again.");
    }
  } catch (error) {
    const message = error instanceof UploadRequestError ? error.message : "Invalid upload request.";
    return jsonResponse({ error: message }, 400);
  }

  let challenge;
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: turnstileSecret, response: token }),
    });
    if (!response.ok) throw new Error("Verification service unavailable.");
    challenge = await response.json();
  } catch {
    return jsonResponse({ error: "Upload check unavailable. Try again shortly." }, 502);
  }
  if (!challenge.success || challenge.action !== TURNSTILE_ACTION || challenge.hostname !== new URL(origin).hostname) {
    return jsonResponse({ error: "Upload check expired. Try again." }, 403);
  }

  try {
    const folder = newEnquiryFolder();
    const tickets = await Promise.all(files.map(async (file, index) => {
      const key = newObjectKey(folder, index, file.extension);
      return {
        name: file.name,
        size: file.size,
        contentType: file.contentType,
        uploadUrl: await uploadUrlFor(key, file, origin),
        downloadUrl: downloadLink(key, origin),
      };
    }));
    // filesUrl is the one link the enquiry carries; see folderLink.
    const filesUrl = folderLink(folder, files.map((file) => file.extension), origin);
    return jsonResponse({ tickets, filesUrl });
  } catch {
    return jsonResponse({ error: "Could not prepare uploads. Try again." }, 502);
  }
}
