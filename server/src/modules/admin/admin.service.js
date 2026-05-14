const Listing = require('../listings/listing.model');
const User = require('../users/user.model');
const Inquiry = require('../inquiries/inquiry.model');
const Booking = require('../bookings/booking.model');
const Review = require('../reviews/review.model');
const ApiError = require('../../utils/ApiError');

/**
 * Get all listings with filters (admin view — includes pending/rejected).
 */
const getAllListings = async ({ status, category, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;

  const [listings, total] = await Promise.all([
    Listing.find(filter)
      .populate('provider', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Listing.countDocuments(filter),
  ]);

  return {
    listings,
    pagination: { total, page, pages: Math.ceil(total / limit) },
  };
};

/**
 * Get pending listings awaiting approval.
 */
const getPendingListings = async ({ page = 1, limit = 20 }) => {
  return getAllListings({ status: 'pending', page, limit });
};

/**
 * Approve or reject a listing.
 */
const moderateListing = async (listingId, action) => {
  if (!['approved', 'rejected'].includes(action)) {
    throw new ApiError(400, 'Action must be "approved" or "rejected"');
  }

  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ApiError(404, 'Listing not found');
  }

  listing.status = action;
  await listing.save();

  return listing;
};

/**
 * Get all users with filters.
 */
const getAllUsers = async ({ role, page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const filter = {};
  if (role) filter.role = role;

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: { total, page, pages: Math.ceil(total / limit) },
  };
};

/**
 * Toggle user active status.
 */
const toggleUserStatus = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  if (user.role === 'admin') {
    throw new ApiError(400, 'Cannot deactivate admin accounts');
  }

  user.isActive = !user.isActive;
  await user.save();

  return user;
};

/**
 * Get admin dashboard statistics (V2 — includes bookings & reviews).
 */
const getDashboardStats = async () => {
  const [
    totalUsers,
    totalProviders,
    totalSeekers,
    totalListings,
    pendingListings,
    approvedListings,
    totalInquiries,
    totalBookings,
    pendingBookings,
    completedBookings,
    totalReviews,
    pendingVerifications,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'provider' }),
    User.countDocuments({ role: 'seeker' }),
    Listing.countDocuments(),
    Listing.countDocuments({ status: 'pending' }),
    Listing.countDocuments({ status: 'approved' }),
    Inquiry.countDocuments(),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: 'completed' }),
    Review.countDocuments(),
    User.countDocuments({ verificationStatus: 'pending' }),
  ]);

  // Category breakdown
  const categoryBreakdown = await Listing.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // Recent activity
  const recentListings = await Listing.find()
    .populate('provider', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  return {
    users: { total: totalUsers, providers: totalProviders, seekers: totalSeekers },
    listings: { total: totalListings, pending: pendingListings, approved: approvedListings },
    inquiries: { total: totalInquiries },
    bookings: { total: totalBookings, pending: pendingBookings, completed: completedBookings },
    reviews: { total: totalReviews },
    verifications: { pending: pendingVerifications },
    categoryBreakdown,
    recentListings,
  };
};

/**
 * V2: Get pending verification requests.
 */
const getVerificationRequests = async ({ page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;
  const filter = { verificationStatus: 'pending' };

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: { total, page, pages: Math.ceil(total / limit) },
  };
};

/**
 * V2: Approve or reject a verification request.
 */
const handleVerification = async (userId, action) => {
  if (!['verified', 'unverified'].includes(action)) {
    throw new ApiError(400, 'Action must be "verified" or "unverified"');
  }

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  user.verificationStatus = action;
  await user.save();

  // If verified, also mark all their material listings as verified
  if (action === 'verified') {
    await Listing.updateMany(
      { provider: userId, category: 'materials' },
      { isVerified: true }
    );
  } else {
    await Listing.updateMany(
      { provider: userId },
      { isVerified: false }
    );
  }

  return user;
};

module.exports = {
  getAllListings,
  getPendingListings,
  moderateListing,
  getAllUsers,
  toggleUserStatus,
  getDashboardStats,
  getVerificationRequests,
  handleVerification,
};
