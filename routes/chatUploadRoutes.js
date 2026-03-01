const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary"); // 🔥 Import Cloudinary

router.post("/", protect, upload.single("file"), (req, res) => {
  res.json({
    // 🔥 Cloudinary returns the full live URL in req.file.path
    fileUrl: req.file.path, 
    fileName: req.file.originalname
  });
});

module.exports = router;