// Require firebase and Service Account Key
const admin = require('firebase-admin');
// const serviceAccount = require('./config/ServiceAccountKey.json');
const serviceAccount = require('./ServiceAccountKey.json');

// Initialize App using Service Account Key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Initialize Using OAuth 2.0
// var refreshToken; // Get refresh token from OAuth2 flow

// admin.initializeApp({
//   credential: admin.credential.refreshToken(refreshToken),
//   databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
// });

const db = admin.firestore();

// Allow for connection variable to be exported
module.exports = db;
