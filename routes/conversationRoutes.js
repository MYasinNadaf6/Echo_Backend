const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

// 🔥 FIXED: Added deleteConversation to the import list!
const { createOrGetConversation, deleteConversation,getUserConversations } = require("../controllers/conversationController");

router.post("/", protect, createOrGetConversation);
router.delete("/:userId", protect, deleteConversation);
router.get("/", protect, getUserConversations);
module.exports = router;