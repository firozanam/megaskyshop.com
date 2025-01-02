const User = require('../models/User');

router.post('/login', async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('error', 'Invalid username or password.');
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash('success', 'You have successfully logged in.');
      // Check if the user is an admin and redirect accordingly
      if (user.isAdmin) {
        return res.redirect('/admin');
      }
      return res.redirect('/dashboard');
    });
  })(req, res, next);
});
