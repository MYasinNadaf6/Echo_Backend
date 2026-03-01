const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

// 🔥 Make sure to import your User model and Auth Middleware!
// (Adjust the paths if your folder structure is slightly different)
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

// NEW /me route for persistent login
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// FIXED: Replaced 'protect' with 'authMiddleware'
router.get("/blocked", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate("blockedUsers", "name email profileImage");

  res.json(user.blockedUsers);
});

module.exports = router;