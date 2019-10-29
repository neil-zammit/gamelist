const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth');

// Import Firebase db
const db = require('../config/database');

// Create reference to the games collection
const gamesCollection = db.collection('games');
// Create reference to the userGames collection
const userGamesCollection = db.collection('userGames');

// User Wishlist Route
router.get('/user', ensureAuthenticated, (req, res) => {
  // console.log(req.user)
  // Empty array to store userId and gameId from userGames collection
  const userGames = [];

  // Empty array to store user games to be displayed
  const games = [];

  // Var to store user game
  // let game;

  userGamesCollection
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        console.log('No matching documents.');
        return;
      }

      snapshot.forEach(doc => {
        // Store each userGames collection userId document field in var
        let user = doc.data().userId;
        // if userId in db is the current authenticated user
        if (user == req.user) {
          // Add gameId for that user to userGames array
          userGames.push(doc.data().gameId);
          console.log(`User games: ${userGames}`);
        } else {
          // console.log(user);
          console.log('no match');
        }
      });
    })

    .then(game => {
      gamesCollection.get().then(snapshot => {
        if (snapshot.empty) {
          console.log('No matching documents.');
          return;
        }
        snapshot.forEach(doc => {
          // console.log(userGames);
          // Store each userGames collection gameId document field in var
          game = doc.id;
          // If games array includes userGames gameID
          if (userGames.includes(game)) {
            // console.log('match');
            // Add game documents from db to games array
            games.push(doc.data());
          } else {
            // console.log('no match');
          }
        });
        console.log(`games: ${games}`);
        // Retrieve data from userGames array and render in template engine
        res.render('user', {
          // render games in template
          games,
          layout: false
        });
      });
    })
    .catch(err => console.log(err));
});

// Add Game Form Route
router.get('/add', ensureAuthenticated, (req, res) =>
  res.render('add', {
    layout: false
  })
);

// Add game to wishlist Route Firebase
router.post('/add', ensureAuthenticated, (req, res) => {
  // Retrieve data from form
  let { title } = req.body;
  // Retrieve current user
  const userID = req.user;
  // Create array to store errors for form validation
  let errors = [];
  // Create array to store success message
  let success = [];

  // Create var to store newly added game
  let gameID;

  // Form Validation
  if (!title) {
    errors.push({ text: 'Add game title ' });
  }

  // If error in errors array, display error
  if (errors.length > 0) {
    res.render('add', {
      errors,
      title,
      layout: false
    });
  } else {
    // Retrieve game data
    gamesCollection
      .where('title', '==', req.body.title)
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          console.log('No matching game.');
          return;
        }

        snapshot.forEach(doc => {
          // Assign game id from db to gameID var
          gameID = doc.id;
          // console.log(gameID);
        });
      })
      .catch(err => {
        console.log('Error getting game', err);
      })

      .then(game => {
        // Add userID and gameID to userGames collection
        userGamesCollection
          .add({
            userId: userID,
            gameId: gameID
          })
          .then(
            ref => console.log('Added doc with ID: ', ref.id),
            success.push({ text: 'Game Added Successfully ' }),
            res.render('add', {
              success,
              layout: false
            })
          )
          .catch(err => {
            console.log('Error finding games : ', err);
          });
      });
  }
});

// Remove Game Form Route
router.get('/remove', ensureAuthenticated, (req, res) =>
  res.render('remove', {
    layout: false
  })
);

// Remove game from wishlist Route Firebase
router.post('/remove', ensureAuthenticated, (req, res) => {
  // Retrieve data from form
  let { title } = req.body;
  // Retrieve current user
  const userID = req.user;
  // Var to store game id retrieved from games collection
  let gameID;
  // Create array to store errors for form validation
  let errors = [];
  // Create array to store success message
  let success = [];

  // Form Validation
  if (!title) {
    errors.push({ text: 'Add game title ' });
  }

  // If error in errors array, display error
  if (errors.length > 0) {
    res.render('remove', {
      errors,
      title,
      layout: false
    });
  } else {
    // Retrieve game data from games collection
    gamesCollection
      .where('title', '==', req.body.title)
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          console.log('No matching documents.');
          return;
        }

        snapshot.forEach(doc => {
          // Store game id for game user wants to delete
          gameID = doc.id;
        });
        // Remove game from usergames Collection
        userGamesCollection
          .get()
          .then(snapshot => {
            if (snapshot.empty) {
              console.log('No matching documents.');
              return;
            }

            snapshot.forEach(doc => {
              // if document fields match user input
              if (doc.data().gameId == gameID && doc.data().userId == userID) {
                // console.log(doc.id);
                // Delete document
                userGamesCollection.doc(doc.id).delete();
              }
            });
          })
          // Rerender page with success message
          .then(game => {
            success.push({ text: 'Game Removed Successfully ' });
            res.render('remove', {
              success,
              layout: false
            });
          });
      });
  }
});

module.exports = router;
