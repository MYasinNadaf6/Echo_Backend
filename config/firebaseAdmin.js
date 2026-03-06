const admin = require("firebase-admin");
require("dotenv").config();

try {
  // 1. Read the entire JSON block from Render
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  // 2. Initialize Firebase
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log("✅ Firebase Admin Initialized Successfully!");

} catch (error) {
  console.error("❌ Firebase Initialization Error:", error.message);
}

module.exports = admin;