const User = require('./user.model');
const Listing = require('../listings/listing.model');
const ApiError = require('../../utils/ApiError');

/**
 * Get user profile by ID.
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

/**
 * Update user profile.
 */
const updateUserProfile = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const allowedFields = ['name', 'phone', 'address', 'location'];
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) user[field] = data[field];
  });

  await user.save();
  return user;
};

/**
 * Save a worker/listing to user's saved list (seeker).
 */
const saveWorker = async (userId, listingId) => {
  const listing = await Listing.findById(listingId);
  if (!listing) throw new ApiError(404, 'Listing not found');

  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  if (user.savedWorkers.includes(listingId)) {
    throw new ApiError(400, 'Already saved');
  }

  user.savedWorkers.push(listingId);
  await user.save();
  return { savedWorkers: user.savedWorkers };
};

/**
 * Remove a worker/listing from saved list (seeker).
 */
const unsaveWorker = async (userId, listingId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  user.savedWorkers = user.savedWorkers.filter(
    (id) => id.toString() !== listingId.toString()
  );
  await user.save();
  return { savedWorkers: user.savedWorkers };
};

/**
 * Get saved workers (seeker).
 */
const getSavedWorkers = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'savedWorkers',
    select: 'title category subCategory pricing address images ratings workerStatus availability provider',
    populate: { path: 'provider', select: 'name profileImage' },
  });
  if (!user) throw new ApiError(404, 'User not found');
  return user.savedWorkers;
};

/**
 * Add to recently viewed (seeker).
 */
const addRecentlyViewed = async (userId, listingId) => {
  const user = await User.findById(userId);
  if (!user) return;

  // Remove if already in list
  user.recentlyViewed = user.recentlyViewed.filter(
    (rv) => rv.listing.toString() !== listingId.toString()
  );

  // Add to front
  user.recentlyViewed.unshift({ listing: listingId, viewedAt: new Date() });

  // Keep only last 20
  if (user.recentlyViewed.length > 20) {
    user.recentlyViewed = user.recentlyViewed.slice(0, 20);
  }

  await user.save();
};

/**
 * Get recently viewed listings (seeker).
 */
const getRecentlyViewed = async (userId) => {
  const user = await User.findById(userId).populate({
    path: 'recentlyViewed.listing',
    select: 'title category subCategory pricing address images ratings workerStatus availability provider',
    populate: { path: 'provider', select: 'name profileImage' },
  });
  if (!user) throw new ApiError(404, 'User not found');

  return user.recentlyViewed
    .filter((rv) => rv.listing) // Filter out deleted listings
    .map((rv) => ({ ...rv.listing.toObject(), viewedAt: rv.viewedAt }));
};

/**
 * Submit verification request (provider — material shops).
 */
const submitVerification = async (userId, docs) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role !== 'provider') throw new ApiError(400, 'Only providers can submit verification');
  if (user.verificationStatus === 'verified') throw new ApiError(400, 'Already verified');
  if (user.verificationStatus === 'pending') throw new ApiError(400, 'Verification already pending');

  user.verificationDocs = {
    gst: docs.gst || '',
    shopLicense: docs.shopLicense || '',
    shopPhotos: docs.shopPhotos || [],
    addressProof: docs.addressProof || '',
    govPermissions: docs.govPermissions || '',
  };
  user.verificationStatus = 'pending';
  await user.save();

  return user;
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  saveWorker,
  unsaveWorker,
  getSavedWorkers,
  addRecentlyViewed,
  getRecentlyViewed,
  submitVerification,
};
