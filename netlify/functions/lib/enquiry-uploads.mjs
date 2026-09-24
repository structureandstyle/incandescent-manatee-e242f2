import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { S3Client } from "@aws-sdk/client-s3";

export const BUCKET = "structure-style-enquiry-uploads";
export const MAX_FILES = 6;
export const MAX_FILE_BYTES = 15_000_000;
export const MAX_TOTAL_BYTES = 60_000_000;

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

export function validateFiles(files) {
  if (!Array.isArray(files) || files.length < 1 || files.length > MAX_FILES) {
    throw new Error(`Choose 1 to ${MAX_FILES} files.`);
  }

  let total = 0;
  return files.map((file, index) => {
    const name = String(file?.name ?? "");
    const extension = name.split(".").pop()?.toLowerCase();
    const size = Number(file?.size);
    if (!extension || !Object.hasOwn(contentTypes, extension)) {
      throw new Error(`File ${index + 1} has an unsupported format.`);
    }
    if (!Number.isSafeInteger(size) || size < 1 || size > MAX_FILE_BYTES) {
      throw new Error(`File ${index + 1} must be under 15 MB.`);
    }
    total += size;
    if (total > MAX_TOTAL_BYTES) {
      throw new Error("Files must be under 60 MB combined.");
    }
    return { name, extension, size, contentType: contentTypes[extension] };
  });
}

export function newObjectKey(index, extension) {
  return `enquiries/${randomUUID()}/${index + 1}.${extension}`;
}

function signKey(key) {
  const secret = process.env.SS_UPLOAD_LINK_SECRET;
  if (!secret) throw new Error("Download link secret is not configured.");
  return createHmac("sha256", secret).update(key).digest("hex");
}

export function downloadLink(key, origin) {
  const url = new URL("/api/enquiry-file", origin);
  url.searchParams.set("key", key);
  url.searchParams.set("sig", signKey(key));
  return url.toString();
}

export function verifyDownloadLink(key, signature) {
  if (!/^enquiries\/[0-9a-f-]{36}\/[1-6]\.(?:jpg|jpeg|png|webp|heic|heif|pdf|doc|docx)$/.test(key)) {
    return false;
  }
  if (typeof signature !== "string" || !/^[0-9a-f]{64}$/.test(signature)) {
    return false;
  }
  return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(signKey(key), "hex"));
}

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

export function jsonResponse(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
