module.exports.isLoggedIn = (req, res, next) => {
   if (!req.isAuthenticated()) {
     req.session.redirectUrl = req.originalUrl;
     req.flash('error', 'You must be signed in first!');
     return res.redirect('/users/login');
   } 
   next();
};

module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.returnTo = req.session.redirectUrl;
  } 
    next();
};

const Listing = require('./models/listing');

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  if (!req.isAuthenticated()) {
    req.flash('error', 'You must be signed in first!');
    return res.redirect('/users/login');
  }
  try {
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash('error', 'Listing not found');
      return res.redirect('/listings');
    }
    if (!listing.author || listing.author.toString() !== req.user._id.toString()) {
      req.flash('error', 'You do not have permission to do that');
      return res.redirect(`/listings/${id}`);
    }
    next();
  } catch (e) {
    next(e);
  }
};