const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary"); // 🔥 Import Cloudinary

router.post(
  "/profile-image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.id);

      // 🔥 Cloudinary returns the full live URL in req.file.path
      user.profileImage = req.file.path;
      await user.save();

      res.json({
        message: "Image uploaded",
        image: req.file.path
      });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

module.exports = router;