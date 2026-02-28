const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { createOrGetConversation } = require("../controllers/conversationController");

router.post("/", protect, createOrGetConversation);

module.exports = router;