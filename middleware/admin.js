module.exports.isAdmin = (req, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    if (req && req.session) req.session.redirectUrl = req.originalUrl;
    if (req && req.flash) req.flash('error', 'You must be signed in first!');
    return res.redirect('/users/login');
  }
  if (!req.user || req.user.role !== 'admin') {
    if (req && req.flash) req.flash('error', 'Admins only');
    return res.redirect('/');
  }
  next();
};
