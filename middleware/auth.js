module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error', 'Please log in to view this resource');
    res.redirect('/login');
  },
  ensureAdmin: function(req, res, next) {
    if (req.user && req.user.isAdmin) {
      return next();
    }
    req.flash('error', 'You do not have permission to view this resource');
    res.redirect('/dashboard');
  }
};
