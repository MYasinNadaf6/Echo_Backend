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
    const user = await User.findById(req.user._id)
      .populate("contacts", "name phone");

    res.json(user.contacts);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
