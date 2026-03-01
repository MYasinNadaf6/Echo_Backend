const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");

// 1️⃣ FIXED: Imported ALL the missing controller functions here
const { 
  addContact, 
  getContacts, 
  blockContact, 
  deleteContact, 
  unblockUser,
  getBlockedUsers,
  


} = require("../controllers/contactController");

router.post("/add", protect, addContact);
router.get("/", protect, getContacts);

// 2️⃣ Moved these up above the export
router.post("/block/:contactId", protect, blockContact);
router.delete("/:contactId", protect, deleteContact);
router.get("/blocked", protect, getBlockedUsers);
router.post("/unblock/:contactId", protect, unblockUser);

// 3️⃣ FIXED: Export must always be at the very bottom!
module.exports = router;