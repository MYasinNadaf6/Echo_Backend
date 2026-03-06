const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const Message = require("./models/Message");
const jwt = require("jsonwebtoken");
const path = require("path");
const sendPushNotification = require("./utils/pushNotification");
const User = require("./models/User"); // You might need this to get the sender's name
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/chat-upload", require("./routes/chatUploadRoutes"));
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/conversations", require("./routes/conversationRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/contacts", require("./routes/contactRoutes"));
app.get("/", (req, res) => {
  res.status(200).send("Echo Backend is awake and running!");
});
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const onlineUsers = {};

// 🔥 EXPOSE IO AND ONLINE USERS TO EXPRESS APP
app.set("io", io);
app.set("onlineUsers", onlineUsers);

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});
app.get("/api/download/:fileUrl", (req, res) => {
  const { fileUrl } = req.params;
  const filePath = path.join(__dirname, "uploads", fileUrl);

  // Send the file with Content-Disposition header to guarantee download
  res.download(filePath, (err) => {
    if (err) {
      console.error("Error downloading file:", err.message);
      res.status(404).send({ message: "File not found" });
    }
  });
});
io.on("connection", (socket) => {

  console.log("User connected:", socket.userId);

  // ✅ Auto register user from JWT
  onlineUsers[socket.userId] = socket.id;

  const User = require("./models/User");
  const Conversation = require("./models/Conversation");

 socket.on("sendMessage", async (data) => {
    const {
      senderId,
      receiverId,
      encryptedMessage,
      messageType,
      fileUrl,
      fileName
    } = data;

    try {
      const sender = await User.findById(senderId);
      const receiver = await User.findById(receiverId);
      if (!sender || !receiver) return;

      const conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] }
      });

      if (!conversation) return;

      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        encryptedMessage: encryptedMessage || "",
        messageType: messageType || "text",
        fileUrl: fileUrl || "",
        fileName: fileName || ""
      });

      // 🔥 update last message properly
      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessage:
          messageType === "text"
            ? encryptedMessage
            : messageType === "image"
            ? "📷 Image"
            : "📎 File",
        lastMessageTime: new Date()
      });

      const receiverSocket = onlineUsers[receiverId];

      if (receiverSocket) {
        io.to(receiverSocket).emit("receiveMessage", message);
      }
 
      
      // ==========================================
      // 🔥 NEW: TRIGGER THE PUSH NOTIFICATION HERE
      // ==========================================
      try {
        const senderName = sender ? sender.name : "A Contact";
        await sendPushNotification(receiverId, senderName);
      } catch (err) {
        console.error("Failed to trigger notification:", err);
      }

    } catch (error) {
      console.error("Message error:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.userId);
    delete onlineUsers[socket.userId];
  });

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});