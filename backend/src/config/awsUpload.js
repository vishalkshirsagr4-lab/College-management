const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const memoryStorage = multer.memoryStorage();

const uploadProfileImage = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('photo');

 const uploadAssignmentFile = multer({
   storage: memoryStorage,
   limits: { fileSize: 50 * 1024 * 1024 },
 }).single('file');
 
 const uploadNoticeAttachment = multer({
   storage: memoryStorage,
   limits: { fileSize: 50 * 1024 * 1024 },
 }).single('attachment');

module.exports = {
  uploadAssignmentFile,
  uploadNoticeAttachment,
  s3Client,
  uploadProfileImage,
};
