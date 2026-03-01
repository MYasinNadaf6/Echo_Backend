const User = require("../models/User");

exports.addContact = async (req, res) => {
  const { phone } = req.body;
  const currentUser = req.user._id;

  try {
    const contactUser = await User.findOne({ phone });

    if (!contactUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (contactUser._id.equals(currentUser)) {
      return res.status(400).json({ message: "Cannot add yourself" });
    }

    // Add to both users (mutual)
    await User.findByIdAndUpdate(currentUser, {
      $addToSet: { contacts: contactUser._id }
    });

    await User.findByIdAndUpdate(contactUser._id, {
      $addToSet: { contacts: currentUser }
    });

    res.json({ message: "Contact added successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
  exports.getContacts = async (req, res) => {
  try {

    const user = await User.findById(req.user.id)
      .populate({
        path: "contacts",
        select: "name email profileImage"
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.contacts);

  } catch (error) {
    console.error("Get contacts error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
exports.deleteContact = async (req, res) => {
  try {
    const { contactId } = req.params;

    const user = await User.findById(req.user.id);

    user.contacts = user.contacts.filter(
      id => id.toString() !== contactId
    );

    await user.save();

    res.json({ message: "Contact removed" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.blockContact = async (req, res) => {
  try {
    const { contactId } = req.params;

    const user = await User.findById(req.user.id);

    // Remove from contacts
    user.contacts = user.contacts.filter(
      id => id.toString() !== contactId
    );

    // Add to blocked list if not already
    if (!user.blockedUsers.includes(contactId)) {
      user.blockedUsers.push(contactId);
    }

    await user.save();

    res.json({ message: "User blocked" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.unblockUser = async (req, res) => {
  try {
    const { contactId } = req.params;

    const user = await User.findById(req.user.id);

    user.blockedUsers = user.blockedUsers.filter(
      id => id.toString() !== contactId
    );

    await user.save();

    res.json({ message: "User unblocked" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("blockedUsers", "name email profileImage");

    res.json(user.blockedUsers);

  } catch (error) {
    console.error("Blocked users error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};