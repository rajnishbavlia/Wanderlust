const express = require('express');

const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviews');
const { isLoggedIn } = require('../middleware');

// POST /listings/:id/reviews
router.post('/', isLoggedIn, reviews.create);

// DELETE /listings/:id/reviews/:reviewId
router.delete('/:reviewId', isLoggedIn, reviews.delete);

module.exports = router;
