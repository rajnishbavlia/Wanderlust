const Review = require('../models/review');
const Listing = require('../models/listing');

module.exports = {
  create: async (req, res, next) => {
    try {
      const { id } = req.params;
      const listing = await Listing.findById(id);
      if (!listing) {
        req.flash('error', 'Listing not found');
        return res.redirect('/listings');
      }
      const reviewData = req.body.review || {};
      const review = new Review(reviewData);
      await review.save();
      listing.reviews.push(review);
      await listing.save();
      req.flash('success', 'Review added successfully!');

      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({ success: true, review });
      }
      res.redirect(`/listings/${id}`);
    } catch (e) {
      next(e);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id, reviewId } = req.params;
      await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
      await Review.findByIdAndDelete(reviewId);
      req.flash('success', 'Review deleted successfully!');
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({ success: true, reviewId });
      }
      res.redirect(`/listings/${id}`);
    } catch (e) {
      next(e);
    }
  }
};
