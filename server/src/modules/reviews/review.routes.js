const express = require('express');
const reviewController = require('./review.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { createReviewSchema } = require('./review.validation');

const router = express.Router();

// Public routes
router.get('/listing/:id', reviewController.getListingReviews);
router.get('/provider/:id', reviewController.getProviderReviews);

// Protected routes
router.post('/', authenticate, authorize('seeker'), validate(createReviewSchema), reviewController.createReview);

module.exports = router;
