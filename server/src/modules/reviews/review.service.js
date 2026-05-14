const Review = require('./review.model');
const Booking = require('../bookings/booking.model');
const Listing = require('../listings/listing.model');
const ApiError = require('../../utils/ApiError');

/**
 * Create a review (only for completed bookings).
 */
const createReview = async (data, reviewerId) => {
  const booking = await Booking.findById(data.bookingId);
  if (!booking) throw new ApiError(404, 'Booking not found');

  if (booking.seeker.toString() !== reviewerId.toString()) {
    throw new ApiError(403, 'Only the booking seeker can leave a review');
  }

  if (booking.status !== 'completed') {
    throw new ApiError(400, 'You can only review completed bookings');
  }

  // Check for existing review
  const existingReview = await Review.findOne({
    booking: booking._id,
    reviewer: reviewerId,
  });
  if (existingReview) {
    throw new ApiError(400, 'You have already reviewed this booking');
  }

  const review = await Review.create({
    listing: booking.listing,
    booking: booking._id,
    reviewer: reviewerId,
    provider: booking.provider,
    rating: data.rating,
    comment: data.comment,
  });

  // Update the listing's aggregate rating
  await updateListingRating(booking.listing);

  return review;
};

/**
 * Get reviews for a specific listing.
 */
const getListingReviews = async (listingId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ listing: listingId })
      .populate('reviewer', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ listing: listingId }),
  ]);

  return {
    reviews,
    pagination: { total, page, pages: Math.ceil(total / limit) },
  };
};

/**
 * Get reviews for a specific provider (all their listings).
 */
const getProviderReviews = async (providerId, { page = 1, limit = 10 }) => {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ provider: providerId })
      .populate('reviewer', 'name profileImage')
      .populate('listing', 'title category subCategory')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ provider: providerId }),
  ]);

  return {
    reviews,
    pagination: { total, page, pages: Math.ceil(total / limit) },
  };
};

/**
 * Recalculate and update listing aggregate rating.
 */
const updateListingRating = async (listingId) => {
  const result = await Review.aggregate([
    { $match: { listing: listingId } },
    {
      $group: {
        _id: '$listing',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const ratings = result[0]
    ? { average: Math.round(result[0].average * 10) / 10, count: result[0].count }
    : { average: 0, count: 0 };

  await Listing.findByIdAndUpdate(listingId, { ratings });
};

module.exports = {
  createReview,
  getListingReviews,
  getProviderReviews,
};
