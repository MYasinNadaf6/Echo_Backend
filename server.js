const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const Message = require("./models/Message");
const jwt = require("jsonwebtoken");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/conversations", require("./routes/conversationRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/contacts", require("./routes/contactRoutes"));
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

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("registerUser", (userId) => {
    onlineUsers[userId] = socket.id;
  });


const User = require("./models/User");
const Conversation = require("./models/Conversation");

socket.on("sendMessage", async (data) => {
  const { senderId, receiverId, encryptedMessage } = data;

  try {
    // 1️⃣ Validate sender exists
    const sender = await User.findById(senderId);
    if (!sender) return;

    // 2️⃣ Validate receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) return;

    // 3️⃣ Validate mutual contact
    if (!sender.contacts.includes(receiver._id)) {
      console.log("Unauthorized message attempt");
      return;
    }

    // 4️⃣ Validate conversation exists
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if (!conversation) return;

    // 5️⃣ Save message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      encryptedMessage
    });

    // 6️⃣ Emit to receiver
    const receiverSocket = onlineUsers[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", message);
    }

  } catch (error) {
    console.error("Secure message error:", error.message);
  }
});
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});