const LocalStrategy = require('passport-local').Strategy;

// Import database connection variable
const db = require('./database');

// Create reference to the users collection
let usersCollection = db.collection('users');

// Firebase Passport Strategy
module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Find user with matching email and password
      usersCollection
        .where('email', '=', email)
        .where('password', '==', password)
        .get()
        .then(snapshot => {
          // If user non existent or credentials incorrect
          if (snapshot.empty) {
            return done(null, false, {
              message: 'Email and Password Combination Invalid'
            });
          } else {
            console.log('Log in successful');
            snapshot.forEach(doc => {
              // console.log(doc.id, '=>', doc.data());
              // return user document to passport
              return done(null, doc);
            });
          }
        })
        .catch(err => console.log(err));
    })
  );

  passport.serializeUser(function(doc, done) {
    // Serialize user by user document id
    done(null, doc.id);
  });

  passport.deserializeUser((doc, done) => {
    done(null, doc);
  });
};

// OAuth Google Sign-In Passport Strategy
