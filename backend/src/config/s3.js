const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const mime = require("mime-types");

/**
 * DEPRECATED: This module is kept for backward compatibility.
 * New uploads should be handled by multer-s3 in `src/middleware/upload.js`.
 */

// Track S3 delete failures for diagnostics
const deleteFailures = [];
const MAX_TRACKED_FAILURES = 100;

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (filePath, folder = "uploads") => {
  if (!filePath) throw new Error("uploadToS3: filePath is required");

  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  if (!bucket) throw new Error("Missing env var: AWS_S3_BUCKET_NAME");
  if (!region) throw new Error("Missing env var: AWS_REGION");

  const fileStream = fs.createReadStream(filePath);
  const ext = path.extname(filePath) || "";
  const key = `${folder}/${Date.now()}-${uuidv4()}${ext}`;

  const contentType = mime.lookup(ext) || "application/octet-stream";

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileStream,
    ContentType: contentType,
  });

  try {
    await s3.send(command);

    const url = process.env.S3_PUBLIC_BASE_URL
      ? `${process.env.S3_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`
      : `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return { url, key };
  } catch (error) {
    console.error("✗ S3 Upload Error:", {
      message: error?.message,
      name: error?.name,
      code: error?.$metadata?.httpStatusCode,
      bucket,
      key,
    });
    throw error;
  }
};

const extractS3KeyFromUrl = (url, bucket, region) => {
  if (!url) return null;

  const normalizedBucket = bucket || process.env.AWS_S3_BUCKET_NAME;
  const normalizedRegion = region || process.env.AWS_REGION;
  const baseUrl = normalizedBucket && normalizedRegion
    ? `https://${normalizedBucket}.s3.${normalizedRegion}.amazonaws.com`
    : null;

  if (baseUrl && url.startsWith(baseUrl)) {
    return url.replace(`${baseUrl}/`, "");
  }

  const idx = url.indexOf("amazonaws.com/");
  if (idx !== -1) {
    return url.substring(idx + "amazonaws.com/".length);
  }

  const segments = url.split("/").filter(Boolean);
  return segments.slice(-2).join("/");
};

const deleteFromS3 = async (keyOrUrl) => {
  try {
    if (!keyOrUrl) return;
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    if (!bucket) throw new Error("Missing env var: AWS_S3_BUCKET_NAME");

    const key = extractS3KeyFromUrl(keyOrUrl) || keyOrUrl;

    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    return true;
  } catch (error) {
    const message = error?.message || error;
    const code = error?.Code || error?.name || error?.$metadata?.httpStatusCode;
    const key = extractS3KeyFromUrl(keyOrUrl) || keyOrUrl;

    console.warn("⚠️ S3 Delete Warning:", {
      message,
      code,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      key,
    });

    if (code === "AccessDenied" || error?.name === "AccessDenied") {
      deleteFailures.push({
        timestamp: new Date().toISOString(),
        key,
        reason: message,
        code,
      });
      if (deleteFailures.length > MAX_TRACKED_FAILURES) deleteFailures.shift();
    }

    if (
      error?.Code === "AccessDenied" ||
      error?.Code === "AllAccessDisabled" ||
      error?.Code === "NoSuchKey" ||
      error?.name === "AccessDenied"
    ) {
      return false;
    }

    throw error;
  }
};

const getS3DeleteFailures = () => deleteFailures;
const clearS3DeleteFailures = () => {
  const count = deleteFailures.length;
  deleteFailures.length = 0;
  return count;
};

module.exports = {
  // uploadToS3 is kept for backward compatibility but is NOT used by the multer-s3 upload flow.
  uploadToS3,
  deleteFromS3,
  getS3DeleteFailures,
  clearS3DeleteFailures,
};


