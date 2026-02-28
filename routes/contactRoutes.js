const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { addContact, getContacts } = require("../controllers/contactController");

router.post("/add", protect, addContact);
router.get("/", protect, getContacts);
module.exports = router;