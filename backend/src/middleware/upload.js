const multer = require("multer");
const multerS3 = require("multer-s3");

const s3Client = require("../config/s3Client");

// Shared multer config that uploads directly to S3.
// No local disk writes.

// IMPORTANT:
// - Bucket must allow public reads if you rely on public URL access.
// - Prefer configuring bucket policy/CloudFront instead of using ACL.

const allowedPrefixes = [
  "image/", // jpg/png/gif
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain", // .txt
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/zip", // optional
];

function fileFilter(req, file, cb) {
  if (!file.mimetype) return cb(null, true);

  const isAllowed = allowedPrefixes.some((p) =>
    p.endsWith("/") ? file.mimetype.startsWith(p) : file.mimetype === p
  );

  if (!isAllowed) {
    return cb(new Error("Unsupported file type"), false);
  }

  cb(null, true);
}

/**
 * Creates a multer middleware that uploads to a given S3 folder.
 *
 * @param {Object} options
 * @param {string} options.folder S3 folder prefix (e.g. "faculty-profiles")
 */
function createUploadMiddleware({ folder }) {
  if (!folder) throw new Error("createUploadMiddleware: folder is required");

  return multer({
    storage: multerS3({
      s3: s3Client,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      // If your bucket is public via bucket policy/CloudFront,
      // you do NOT need ACL.
      // acl: "public-read",
      key: (req, file, cb) => {
        const ext = (file.originalname && file.originalname.includes("."))
          ? file.originalname.slice(file.originalname.lastIndexOf("."))
          : "";

        const safeField = (file.fieldname || "file").replace(/[^a-zA-Z0-9_-]/g, "");

        const key = `${folder}/${Date.now()}-${safeField}${ext}`;
        cb(null, key);
      },
    }),
   limits: {
      fileSize: 100 * 1024 * 1024,
    },
    fileFilter,
  });
}

// Match existing frontend field names
const profileImageUpload = createUploadMiddleware({ folder: "profiles" });
const facultyProfileImageUpload = createUploadMiddleware({ folder: "faculty-profiles" });
const studentProfileImageUpload = createUploadMiddleware({ folder: "student-profiles" });
const assignmentFileUpload = createUploadMiddleware({ folder: "assignments" });

// Export compatibility for both of these patterns:
//   const { upload } = require("../middleware/upload");
//   const upload = require("../middleware/upload"); upload.single(...)
//
// We export the multer middleware as the default, and also expose named props.
const uploadMiddleware = profileImageUpload;

module.exports = uploadMiddleware;
module.exports.upload = uploadMiddleware;
module.exports.facultyProfileImageUpload = facultyProfileImageUpload;
module.exports.studentProfileImageUpload = studentProfileImageUpload;
module.exports.assignmentFileUpload = assignmentFileUpload;
module.exports.createUploadMiddleware = createUploadMiddleware;


