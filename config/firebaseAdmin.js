const admin = require("firebase-admin");
require("dotenv").config();

// 1. Grab the raw key from Render
let cleanPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

// 2. Clean up the formatting
if (cleanPrivateKey) {
  // Remove any accidental quote marks from the beginning or end
  cleanPrivateKey = cleanPrivateKey.replace(/^"|"$/g, '');
  
  // Convert any literal "\n" text back into actual line breaks
  cleanPrivateKey = cleanPrivateKey.replace(/\\n/g, '\n');
}

// 3. Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: cleanPrivateKey,
  })
});

module.exports = admin;