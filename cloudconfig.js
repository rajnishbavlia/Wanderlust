const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check if Cloudinary is properly configured
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
  console.warn('⚠️  Cloudinary not configured. File uploads will not work.');
  console.warn('Add CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY to .env file');
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'wanderlust',
    allowedFormats: ['jpeg', 'png', 'jpg', 'gif', 'webp']
  }
});

const upload = multer({ storage });

module.exports = { cloudinary, storage, upload };
