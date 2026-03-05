const admin = require("../config/firebaseAdmin");
const User = require("../models/User");

const sendPushNotification = async (receiverId, senderName) => {
  try {
    // 1. Find the user receiving the message to get their token
    const receiver = await User.findById(receiverId);

    // 2. If they have a token saved, send the notification!
    if (receiver && receiver.fcmToken) {
      const message = {
        notification: {
          title: `New message from ${senderName || "someone"}`,
          body: "You have received a new encrypted message on Echo.",
          // The icon will use the logo.png you put in the public folder!
        },
        token: receiver.fcmToken,
      };

      await admin.messaging().send(message);
      console.log(`✅ Push notification sent to ${receiver.name}`);
    } else {
      console.log(`⚠️ No FCM token found for ${receiver.name}`);
    }
  } catch (error) {
    console.error("❌ Error sending push notification:", error);
  }
};

module.exports = sendPushNotification;