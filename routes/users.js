const express = require('express');
const router = express.Router();
const passport = require('passport');

// Import database connection variable
const db = require('../config/database');

// Create reference to the users collection
let usersCollection = db.collection('users');

// Signin Route
router.get('/signin', (req, res) =>
  res.render('signin', {
    layout: false
  })
);

// Register Route
router.get('/register', (req, res) =>
  res.render('register', {
    layout: false
  })
);

// Register Handle Firebase
router.post('/register', (req, res) => {
  const { email, password, password2 } = req.body;
  let errors = [];

  // Check that all fields populated
  if (!email || !password || !password2) {
    errors.push({ text: 'Please fill in all fields' });
  }

  // Check that passwords match
  if (password !== password2) {
    errors.push({ text: 'Passwords do not match' });
  }

  // Check pass length
  if (password.length < 8) {
    errors.push({ text: 'Password should be at least 8 characters' });
  }

  // If error/s present, redirect and display error/s
  if (errors.length > 0) {
    res.render('register', {
      errors,
      email,
      password,
      password2,
      layout: false
    });
  } else {
    // Validation passed
    // Check if email exists in Firestore DB
    usersCollection
      .where('email', '=', email)
      .get()
      .then(snapshot => {
        if (!snapshot.empty) {
          // If email exists, rerender page with error
          errors.push({ text: 'Email already registered' });
          res.render('register', {
            errors,
            email,
            password,
            password2,
            layout: false
          });
        } else {
          // Add new user document to DB
          usersCollection
            .add({
              email: email,
              password: password
            })
            .then(ref => {
              console.log('Added user with ID: ', ref.id);
            })
            .then(user => {
              req.flash(
                'success_msg',
                'Registration Successful. You may log in.'
              );
              res.redirect('/signin');
            })
            .catch(err => console.log(err));
        }
      });
  }
});

// Signin Handle
router.post('/signin', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/user',
    failureRedirect: '/signin',
    failureFlash: true
  })(req, res, next);
});

// Signout Handle
router.get('/signout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/');
});

module.exports = router;
