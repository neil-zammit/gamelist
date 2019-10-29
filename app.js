// Require Packages
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

// Init app with express
const app = express();

// Passport config
require('./config/passport')(passport);

// Import database connection variable
const db = require('./config/database');

// Set handlebars as view engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Body Parser
app.use(express.urlencoded({ extended: false }));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// Global Variables for Flash Messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
// Home and Welcome Routes
app.use('/', require('./routes/index'));

// Login and Register Routes
app.use('/', require('./routes/users'));

// userGames Route
app.use('/', require('./routes/userGames'));

// PORT variable
const PORT = process.env.PORT || 5000;

// Start Server
app.listen(PORT, console.log(`Server running on port ${PORT}`));

// Connection to db successful
