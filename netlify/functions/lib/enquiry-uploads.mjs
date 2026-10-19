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
  if (typeof signature !== "string" || !/^[0-9a-f]{64}$/.test(signature)) return false;
  return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(signKey(`folder:${folder}:${list}`), "hex"));
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
