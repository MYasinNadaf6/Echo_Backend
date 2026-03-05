const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    phone:{
      type: String,
      required: true,
      unique: true
    },
    profileImage: {
  type: String},
contacts: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
],// Add this inside your UserSchema
  fcmToken: {
    type: String,
    default: ""
  },
blockedUsers: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);