const admin = require("firebase-admin");

var serviceAccount = require("../feelme-88911-firebase-adminsdk-6ietr-ec7b4353dc.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://feelme-88911-default-rtdb.firebaseio.com",
});
const db = admin.firestore();

module.exports = db;
