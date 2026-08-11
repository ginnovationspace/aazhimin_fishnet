const express = require('express');
/** @type {import('express').Router} */
const router = express.Router();

const { getProductReviews, createReview, getUserReviews } = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

// Get reviews for a product
router.get('/products/:productId/reviews', getProductReviews);

// Create a review for an order item (verified purchase only)
router.post('/', authenticate, createReview);

// Get reviews by a user (for buyer's review history)
router.get('/user/reviews', authenticate, getUserReviews);

module.exports = router;