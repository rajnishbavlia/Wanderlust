const mongoose = require('mongoose');
const Listing = require('../models/listing');

module.exports = {
  index: async (req, res, next) => {
    try {
      const q = (req.query.q || '').trim();
      let filter = {};
      if (q) {
        const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter = {
          $or: [
            { title: regex },
            { location: regex },
            { country: regex },
            { description: regex }
          ]
        };
      }

      const statusFilter = [{ status: 'approved' }, { status: { $exists: false } }];
      filter = { $and: [filter, { $or: statusFilter }] };
      const allListings = await Listing.find(filter).sort({ createdAt: -1 });
      res.render('listings/index', { allListings, q });
    } catch (e) {
      next(e);
    }
  },

  newForm: (req, res) => {
    res.render('listings/new');
  },

  createListing: async (req, res, next) => {
    try {
      const data = req.body.listing || {};
      if (req.file) {
        try {
          data.image = {
            url: req.file.path,
            filename: req.file.filename
          };
        } catch (uploadErr) {
          console.log('Image upload skipped/failed, continuing without image');
        }
      } else if (data.image_url) {
        // Handle direct image URL input
        data.image = { url: data.image_url, filename: 'user-provided' };
      } else if (data.image && typeof data.image === 'string') {
        // normalize image input: accept either nested object or plain string
        data.image = { url: data.image, filename: data.image_filename || 'listingimage' };
      }
      // remove empty image objects
      if (data.image && !data.image.url) delete data.image;
      // attach author if user is logged in
      if (req.user) data.author = req.user._id;

      const listing = new Listing({
        ...data,
        status: (req.user && req.user.role === 'admin') ? 'approved' : 'pending',
        approvedBy: (req.user && req.user.role === 'admin') ? req.user._id : null,
        approvedAt: (req.user && req.user.role === 'admin') ? new Date() : null
      });

      await listing.save();
      const message = (req.user && req.user.role === 'admin')
        ? 'Listing created and published!'
        : 'Listing submitted for admin approval.';
      req.flash('success', message);
      res.redirect('/listings');
    } catch (e) {
      next(e);
    }
  },

  show: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid listing id');
        return res.redirect('/listings');
      }
      const listing = await Listing.findById(id)
        .populate('author')
        .populate({ path: 'reviews', options: { sort: { createdAt: -1 } } });
      if (!listing) {
        const err = new Error('Listing not found');
        err.statusCode = 404;
        throw err;
      }

      const isAdmin = req.user && req.user.role === 'admin';
      const isAuthor = req.user && listing.author && listing.author._id && listing.author._id.equals(req.user._id);
      const isApproved = !listing.status || listing.status === 'approved';
      if (!isApproved && !isAdmin && !isAuthor) {
        req.flash('error', 'Listing is awaiting admin approval');
        return res.redirect('/listings');
      }

      res.render('listings/show', { listing });
    } catch (e) {
      next(e);
    }
  },

  editForm: async (req, res, next) => {
    try {
      const { id } = req.params;
      const listing = await Listing.findById(id);
      if (!listing) return res.redirect('/listings');
      res.render('listings/edit', { listing });
    } catch (e) {
      next(e);
    }
  },

  updateListing: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body.listing || {};
      // Handle Cloudinary file upload
      if (req.file) {
        updateData.image = {
          url: req.file.path,
          filename: req.file.filename
        };
      } else if (updateData.image_url) {
        // Handle direct image URL input
        updateData.image = { url: updateData.image_url, filename: 'user-provided' };
      } else if (updateData.image && typeof updateData.image === 'string') {
        // normalize image input
        updateData.image = { url: updateData.image, filename: updateData.image_filename || 'listingimage' };
      }
      // if no image URL provided, don't overwrite existing image
      if (updateData.image && !updateData.image.url) delete updateData.image;

      await Listing.findByIdAndUpdate(id, { ...updateData });
      req.flash('success', 'Listing updated successfully!');
      res.redirect(`/listings/${id}`);
    } catch (e) {
      next(e);
    }
  },

  deleteListing: async (req, res, next) => {
    try {
      const { id } = req.params;
      await Listing.findByIdAndDelete(id);
      req.flash('success', 'Listing deleted successfully!');
      // If client expects JSON (AJAX), return JSON instead of redirect
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.json({ success: true });
      }
      res.redirect('/listings');
    } catch (e) {
      next(e);
    }
  },

  pendingList: async (req, res, next) => {
    try {
      const pendingListings = await Listing.find({ status: 'pending' })
        .populate('author')
        .sort({ createdAt: -1 });
      res.render('listings/pending', { pendingListings });
    } catch (e) {
      next(e);
    }
  },

  approveListing: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid listing id');
        return res.redirect('/listings/pending');
      }
      const listing = await Listing.findById(id);
      if (!listing) {
        req.flash('error', 'Listing not found');
        return res.redirect('/listings/pending');
      }
      await listing.markApproved(req.user ? req.user._id : null);
      req.flash('success', 'Listing approved and published');
      res.redirect('/listings/pending');
    } catch (e) {
      next(e);
    }
  },

  rejectListing: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid listing id');
        return res.redirect('/listings/pending');
      }
      const listing = await Listing.findById(id);
      if (!listing) {
        req.flash('error', 'Listing not found');
        return res.redirect('/listings/pending');
      }
      await listing.markRejected(req.user ? req.user._id : null);
      req.flash('success', 'Listing rejected');
      res.redirect('/listings/pending');
    } catch (e) {
      next(e);
    }
  }
};
