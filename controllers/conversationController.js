const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const crypto = require("crypto");
const Message = require("../models/Message");

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
exports.deleteConversation = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    // Delete conversation document
    await Conversation.findOneAndDelete({
      participants: { $all: [currentUserId, otherUserId] }
    });

    // Delete messages between users
    await Message.deleteMany({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    });

    res.json({ message: "Chat deleted successfully" });

  } catch (error) {
    console.error("Delete chat error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getUserConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate("participants", "name profileImage")
    .sort({ lastMessageTime: -1 });

    res.json(conversations);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};