const multer = require('multer');
const ApiError = require('../utils/ApiError');

/**
 * Multer config for handling file uploads.
 * Stores files in memory (buffer) for Cloudinary streaming upload.
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 5, // Max 5 images per request
  },
});

module.exports = upload;
