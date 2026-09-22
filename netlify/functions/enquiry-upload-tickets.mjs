import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  BUCKET,
  downloadLink,
  jsonResponse,
  newObjectKey,
  r2Client,
  validateFiles,
} from "./lib/enquiry-uploads.mjs";

const ACTION = "ss_enquiry_upload";

export default async function handler(request) {
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

  let s3;
  try {
    s3 = r2Client();
  } catch {
    return jsonResponse({ error: "Uploads are not configured." }, 503);
  }

  let files;
  let token;
  try {
    const body = await request.text();
    if (body.length > 10_000) throw new Error("Request is too large.");
    const payload = JSON.parse(body);
    files = validateFiles(payload.files);
    token = payload.turnstileToken;
    if (typeof token !== "string" || token.length < 1 || token.length > 2048) {
      throw new Error("Complete the upload check and try again.");
    }
  } catch (error) {
    return jsonResponse({ error: error.message || "Invalid upload request." }, 400);
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
  if (!challenge.success || challenge.action !== ACTION || challenge.hostname !== new URL(origin).hostname) {
    return jsonResponse({ error: "Upload check expired. Try again." }, 403);
  }

  try {
    const tickets = await Promise.all(files.map(async (file, index) => {
      const key = newObjectKey(index, file.extension);
      const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: file.contentType,
        ContentLength: file.size,
      });
      const uploadUrl = await getSignedUrl(s3, command, {
        expiresIn: 1800,
        signableHeaders: new Set(["content-type", "content-length"]),
      });
      return {
        name: file.name,
        size: file.size,
        contentType: file.contentType,
        uploadUrl,
        downloadUrl: downloadLink(key, origin),
      };
    }));
    return jsonResponse({ tickets });
  } catch {
    return jsonResponse({ error: "Could not prepare uploads. Try again." }, 502);
  }
}

export const config = { path: "/api/enquiry-upload-tickets" };
