const admin = require("firebase-admin");
require("dotenv").config();

let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey) {
  // 🔥 This completely strips weird quotes and fixes Render's broken line breaks
  privateKey = privateKey.replace(/\\n/g, '\n').replace(/"/g, '');
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  })
});

module.exports = admin;