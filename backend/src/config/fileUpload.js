const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// Load environment variables for B2 configuration
const B2_KEY_ID = process.env.B2_KEY_ID;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY;
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME;
const B2_ENDPOINT = process.env.B2_ENDPOINT;
const B2_REGION = process.env.B2_REGION;

if (!B2_KEY_ID || !B2_APPLICATION_KEY || !B2_BUCKET_NAME || !B2_ENDPOINT || !B2_REGION) {
  console.error('Backblaze B2 environment variables are not fully configured.');
  // Optionally, throw an error to prevent the app from starting without proper config
  // throw new Error('Backblaze B2 environment variables are not fully configured.');
}

// Configure the S3 client for Backblaze B2
// Middleware to remove the unsupported checksum header
const b2FileUploadChecksumMiddleware = (next, context) => (args) => {
  // This middleware is now a fallback. The primary fix is removing the SDK's checksum middleware.
  // It handles any lingering checksum headers that might be added.
  if (args.request && args.request.headers) {
    if (args.request.headers['x-amz-checksum-crc32']) {
      console.log('[B2 COMPATIBILITY FALLBACK] Found and removing x-amz-checksum-crc32 header.');
      delete args.request.headers['x-amz-checksum-crc32'];
    }
    if (args.request.headers['x-amz-sdk-checksum-algorithm']) {
      console.log('[B2 COMPATIBILITY FALLBACK] Found and removing x-amz-sdk-checksum-algorithm header.');
      delete args.request.headers['x-amz-sdk-checksum-algorithm'];
    }
  }
  return next(args);
};

const s3Client = new S3Client({
  endpoint: `https://${B2_ENDPOINT}`,
  region: B2_REGION,
  credentials: {
    accessKeyId: B2_KEY_ID,
    secretAccessKey: B2_APPLICATION_KEY,
  },
  forcePathStyle: true,
});

// The primary fix: explicitly remove the middleware that adds the unsupported checksum header.
// The `disableFlexibleChecksums` flag is not always sufficient with `@aws-sdk/lib-storage`.
s3Client.middlewareStack.remove('flexibleChecksumsMiddleware');
console.log('[B2 COMPATIBILITY] Removed flexibleChecksumsMiddleware from S3 client stack.');

// We keep our custom middleware as a fallback, just in case.
s3Client.middlewareStack.add(b2FileUploadChecksumMiddleware, {
  step: 'build',
  priority: 'low',
  name: 'b2FileUploadChecksumMiddleware',
});

// Define allowed MIME types and file extensions
const allowedMimeTypes = [
  'application/pdf',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
];

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: B2_BUCKET_NAME,
    acl: 'private', // Files will be private, accessed via pre-signed URLs
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname);
      // Sanitize filename if necessary, here we just use a unique prefix + original extension
      cb(null, `worksheets/${uniqueSuffix}${extension}`);
    },
    // metadata: function (req, file, cb) { // Optional: add custom metadata to S3 object
    //   cb(null, { fieldName: file.fieldname });
    // }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
    }
  },
});

module.exports = upload;
