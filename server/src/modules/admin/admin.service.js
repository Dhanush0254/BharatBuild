const Listing = require('../listings/listing.model');
const User = require('../users/user.model');
const Inquiry = require('../inquiries/inquiry.model');
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
 * Get admin dashboard statistics.
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
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'provider' }),
    User.countDocuments({ role: 'seeker' }),
    Listing.countDocuments(),
    Listing.countDocuments({ status: 'pending' }),
    Listing.countDocuments({ status: 'approved' }),
    Inquiry.countDocuments(),
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
    categoryBreakdown,
    recentListings,
  };
};

module.exports = {
  getAllListings,
  getPendingListings,
  moderateListing,
  getAllUsers,
  toggleUserStatus,
  getDashboardStats,
};
