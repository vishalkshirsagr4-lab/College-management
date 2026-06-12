const { S3Client } = require("@aws-sdk/client-s3");

// AWS SDK v3 S3 client.
// Best practice: prefer IAM roles / env-based credentials.

const region = process.env.AWS_REGION;
if (!region) {
  throw new Error("Missing env var: AWS_REGION");
}

const bucket = process.env.AWS_S3_BUCKET_NAME;
if (!bucket) {
  throw new Error("Missing env var: AWS_S3_BUCKET_NAME");
}

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = s3Client;

