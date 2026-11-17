import { S3Client } from "@aws-sdk/client-s3";

// NETLIFY ONLY. The bucket's S3 keys, for the presigned uploads and downloads
// the Netlify functions make. The Cloudflare Worker reaches the same bucket
// through its binding (worker/uploads.mjs) and never loads this file, which
// keeps the AWS SDK and the keys out of it (15 Nov 2026).
export function r2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials are not configured.");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}
