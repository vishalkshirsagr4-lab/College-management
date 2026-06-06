const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (buffer, folder, filename) => {
  try {
    const randomId = Math.random().toString(36).substring(2, 8);
    const key = `${folder}/${Date.now()}-${randomId}-${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'application/octet-stream',
    });

    await s3Client.send(command);
    
    const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    
    return {
      url: fileUrl,
      key: key,
    };
  } catch (error) {
    console.error('S3 upload error:', error.message);
    throw error;
  }
};

const deleteFromS3 = async (key) => {
  if (!key) return;
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });
    await s3Client.send(command);
  } catch (error) {
    console.error('S3 delete error:', error.message);
  }
};

module.exports = {
  uploadToS3,
  deleteFromS3,
};
