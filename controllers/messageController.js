const Message = require("../models/Message");

// Send Message
exports.sendMessage = async (req, res) => {
  const { receiverId, encryptedMessage } = req.body;
  const senderId = req.user._id;

  try {
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      encryptedMessage
    });

    // 🔥 GRAB IO AND ONLINE USERS FROM THE APP
    const io = req.app.get("io");
    const onlineUsers = req.app.get("onlineUsers");

    // 🔥 GET RECEIVER'S SOCKET ID
    const receiverSocketId = onlineUsers[receiverId.toString()];

    // 🔥 EMIT DIRECTLY TO RECEIVER IF THEY ARE ONLINE
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", message);
    }

    res.status(201).json(message);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Messages Between Two Users
exports.getMessages = async (req, res) => {
  const { userId } = req.params;
  const loggedInUser = req.user._id;

  try {
    const messages = await Message.find({
      $or: [
        { sender: loggedInUser, receiver: userId },
        { sender: userId, receiver: loggedInUser }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};