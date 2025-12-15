const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: { type: String, default: 'listingimage' },
    url: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60'
    }
  },
  price: Number,
  location: String,
  country: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
        {
            type: Schema.Types.ObjectId,        
            ref: "Review",
        },
    ],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

listingSchema.methods.markApproved = function(userId) {
  this.status = 'approved';
  this.approvedBy = userId || null;
  this.approvedAt = new Date();
  return this.save();
};

listingSchema.methods.markRejected = function(userId) {
  this.status = 'rejected';
  this.approvedBy = userId || null;
  this.approvedAt = new Date();
  return this.save();
};

listingSchema.post('findOneAndDelete', async function(doc) {
  if (doc && Array.isArray(doc.reviews) && doc.reviews.length > 0) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;