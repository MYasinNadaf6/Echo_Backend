const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const crypto = require("crypto");

exports.createOrGetConversation = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user._id;

  try {
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid receiver ID" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    }).populate("participants", "name email");

    if (!conversation) {
      const secretKey = crypto.randomBytes(32).toString("hex");

      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        secretKey
      });

      conversation = await conversation.populate("participants", "name email");
    }

    res.status(200).json(conversation);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};