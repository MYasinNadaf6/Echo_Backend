const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up the storage engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "echo_uploads", // All files will go into this folder in Cloudinary
    resource_type: "auto",  // Automatically detect if it's an image, video, or raw file
    allowed_formats: ["jpg", "png", "jpeg", "gif", "pdf", "mp4", "mp3"], // Add any file types you want to support
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };