const userService = require('./user.service');
const sendResponse = require('../../utils/sendResponse');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
const getProfile = catchAsync(async (req, res) => {
  const user = await userService.getUserProfile(req.user._id);
  sendResponse(res, 200, user, 'Profile retrieved');
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/v1/users/profile
 * @access  Private
 */
const updateProfile = catchAsync(async (req, res) => {
  const user = await userService.updateUserProfile(req.user._id, req.body);
  sendResponse(res, 200, user, 'Profile updated');
});

/**
 * @desc    Save a worker/listing
 * @route   POST /api/v1/users/save-worker/:id
 * @access  Private (seeker)
 */
const saveWorker = catchAsync(async (req, res) => {
  const result = await userService.saveWorker(req.user._id, req.params.id);
  sendResponse(res, 200, result, 'Worker saved');
});

/**
 * @desc    Unsave a worker/listing
 * @route   DELETE /api/v1/users/save-worker/:id
 * @access  Private (seeker)
 */
const unsaveWorker = catchAsync(async (req, res) => {
  const result = await userService.unsaveWorker(req.user._id, req.params.id);
  sendResponse(res, 200, result, 'Worker removed from saved');
});

/**
 * @desc    Get saved workers
 * @route   GET /api/v1/users/saved-workers
 * @access  Private (seeker)
 */
const getSavedWorkers = catchAsync(async (req, res) => {
  const workers = await userService.getSavedWorkers(req.user._id);
  sendResponse(res, 200, workers, 'Saved workers retrieved');
});

/**
 * @desc    Get recently viewed listings
 * @route   GET /api/v1/users/recently-viewed
 * @access  Private (seeker)
 */
const getRecentlyViewed = catchAsync(async (req, res) => {
  const listings = await userService.getRecentlyViewed(req.user._id);
  sendResponse(res, 200, listings, 'Recently viewed retrieved');
});

/**
 * @desc    Submit verification request (material shop providers)
 * @route   POST /api/v1/users/verify-request
 * @access  Private (provider)
 */
const submitVerification = catchAsync(async (req, res) => {
  const user = await userService.submitVerification(req.user._id, req.body);
  sendResponse(res, 200, user, 'Verification request submitted — pending admin approval');
});

module.exports = {
  getProfile,
  updateProfile,
  saveWorker,
  unsaveWorker,
  getSavedWorkers,
  getRecentlyViewed,
  submitVerification,
};
