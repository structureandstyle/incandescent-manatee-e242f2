import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { BUCKET, issueTickets, UPLOAD_LINK_SECONDS } from "./lib/enquiry-uploads.mjs";
import { r2Client } from "./lib/r2-client.mjs";

// On Netlify each file goes straight to R2, on a PUT presigned with the
// bucket's S3 keys. The Cloudflare Worker signs a link to itself instead
// (worker/uploads.mjs) and needs no keys. Everything else, the checks and the
// links, is shared: issueTickets in lib/enquiry-uploads.mjs (15 Nov 2026).
export default function handler(request) {
  return issueTickets(request, () => {
    const s3 = r2Client();
    return (key, file) => getSignedUrl(s3, new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: file.contentType,
      ContentLength: file.size,
    }), {
      expiresIn: UPLOAD_LINK_SECONDS,
      signableHeaders: new Set(["content-type", "content-length"]),
    });
  });
}

export const config = { path: "/api/enquiry-upload-tickets" };
