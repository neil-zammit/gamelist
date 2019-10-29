module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      // Console log current user id
      console.log(req.user);
      return next();
    }
    req.flash('error_msg', 'Please log in to view this resource');
    res.redirect('/signin');
  }
};
