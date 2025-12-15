const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const listings = require('../controllers/listings');
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { listingSchema } = require('../schema');
const { isLoggedIn } = require('../middleware');
const { isAdmin } = require('../middleware/admin');
const { upload } = require('../cloudconfig');

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400, errMsg);
  }
  next();
};

// Validate any :id param to avoid ObjectId cast errors
router.param('id', (req, res, next, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash('error', 'Invalid listing id');
    return res.redirect('/listings');
  }
  next();
});

// Index & Create
router.get('/', wrapAsync(listings.index));
router.get('/new', isLoggedIn, listings.newForm);
router.post('/', isLoggedIn, (req, res, next) => {
  // Handle upload errors gracefully
  upload.single('listing[image]')(req, res, (err) => {
    if (err) {
      // Upload failed - continue without image (user can use Image URL instead)
    }
    next();
  });
}, validateListing, wrapAsync(listings.createListing));

// Pending approval dashboard
router.get('/pending', isAdmin, wrapAsync(listings.pendingList));
router.get('/pendings', (req, res) => res.redirect('/listings/pending'));
router.post('/:id/approve', isAdmin, wrapAsync(listings.approveListing));
router.post('/:id/reject', isAdmin, wrapAsync(listings.rejectListing));

// Show / Edit / Update / Delete
router.get('/:id', wrapAsync(listings.show));
router.get('/:id/edit', isAdmin, wrapAsync(listings.editForm));
router.put('/:id', isAdmin, (req, res, next) => {
  // Handle upload errors gracefully
  upload.single('listing[image]')(req, res, (err) => {
    if (err) {
      // Upload failed - continue without image (user can use Image URL instead)
    }
    next();
  });
}, validateListing, wrapAsync(listings.updateListing));
router.delete('/:id', isAdmin, wrapAsync(listings.deleteListing));

module.exports = router;
