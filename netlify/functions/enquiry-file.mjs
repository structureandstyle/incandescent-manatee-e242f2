import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BUCKET, jsonResponse, r2Client, verifyDownloadLink } from "./lib/enquiry-uploads.mjs";

export default async function handler(request) {
  if (request.method !== "GET") return jsonResponse({ error: "Method not allowed." }, 405);
  if (!process.env.SS_UPLOAD_LINK_SECRET) {
    return jsonResponse({ error: "Downloads are not configured." }, 503);
  }

  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const signature = url.searchParams.get("sig");
  if (!key || !verifyDownloadLink(key, signature)) {
    return jsonResponse({ error: "File link is invalid." }, 403);
  }

  try {
    const extension = key.split(".").pop();
    const number = key.match(/\/(10|[1-9])\./)?.[1] ?? "file";
    const s3 = r2Client();
    const signedUrl = await getSignedUrl(s3, new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ResponseContentDisposition: `attachment; filename="structure-style-${number}.${extension}"`,
    }), { expiresIn: 60 });
    return new Response(null, {
      status: 302,
      headers: {
        Location: signedUrl,
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return jsonResponse({ error: "File is unavailable. Try again shortly." }, 502);
  }
}

export const config = { path: "/api/enquiry-file" };
