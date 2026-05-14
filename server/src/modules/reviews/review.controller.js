const reviewService = require('./review.service');
const sendResponse = require('../../utils/sendResponse');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Create a review for a completed booking
 * @route   POST /api/v1/reviews
 * @access  Private (seeker)
 */
const createReview = catchAsync(async (req, res) => {
  const review = await reviewService.createReview(req.body, req.user._id);
  sendResponse(res, 201, review, 'Review submitted successfully');
});

/**
 * @desc    Get reviews for a listing
 * @route   GET /api/v1/reviews/listing/:id
 * @access  Public
 */
const getListingReviews = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await reviewService.getListingReviews(req.params.id, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  sendResponse(res, 200, result, 'Listing reviews retrieved');
});

/**
 * @desc    Get reviews for a provider
 * @route   GET /api/v1/reviews/provider/:id
 * @access  Public
 */
const getProviderReviews = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const result = await reviewService.getProviderReviews(req.params.id, {
    page: parseInt(page),
    limit: parseInt(limit),
  });
  sendResponse(res, 200, result, 'Provider reviews retrieved');
});

module.exports = {
  createReview,
  getListingReviews,
  getProviderReviews,
};
