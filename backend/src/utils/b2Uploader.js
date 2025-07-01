const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const path = require('path');

// B2 Configuration
const B2_KEY_ID = process.env.B2_KEY_ID;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY;
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME;
const B2_ENDPOINT = process.env.B2_ENDPOINT;
const B2_REGION = process.env.B2_REGION;

let s3Client;
if (B2_KEY_ID && B2_APPLICATION_KEY && B2_BUCKET_NAME && B2_ENDPOINT && B2_REGION) {
  s3Client = new S3Client({
    endpoint: `https://${B2_ENDPOINT}`,
    region: B2_REGION,
    credentials: {
      accessKeyId: B2_KEY_ID,
      secretAccessKey: B2_APPLICATION_KEY,
    },
    forcePathStyle: true,
  });
  s3Client.middlewareStack.remove('flexibleChecksumsMiddleware');
} else {
  console.error('Backblaze B2 environment variables are not fully configured for S3 client in b2Uploader.');
}

/**
 * Uploads a file buffer to Backblaze B2.
 * @param {Buffer} buffer The file buffer to upload.
 * @param {string} originalFilename The original name of the file.
 * @param {string} mimeType The MIME type of the file.
 * @param {string} destinationFolder The folder within the bucket to upload to (e.g., 'worksheets', 'previews').
 * @returns {Promise<{fileUrl: string, fileKey: string}>} A promise that resolves with the file URL and key.
 */
async function uploadToB2(buffer, originalFilename, mimeType, destinationFolder) {
  if (!s3Client) {
    throw new Error('B2 client is not initialized. Check your environment variables.');
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = path.extname(originalFilename);
  const fileKey = `${destinationFolder}/${uniqueSuffix}${ext}`;

  const params = {
    Bucket: B2_BUCKET_NAME,
    Key: fileKey,
    Body: buffer,
    ContentType: mimeType,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    const fileUrl = `https://${B2_ENDPOINT}/${B2_BUCKET_NAME}/${fileKey}`;
    console.log(`Successfully uploaded ${fileKey} to B2.`);
    return { fileUrl, fileKey };
  } catch (error) {
    console.error(`Error uploading ${fileKey} to B2:`, error);
    throw new Error('Failed to upload file to B2.');
  }
}

module.exports = { uploadToB2 };
