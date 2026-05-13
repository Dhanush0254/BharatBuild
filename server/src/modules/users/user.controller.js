const userService = require('./user.service');
const sendResponse = require('../../utils/sendResponse');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/profile
 * @access  Private
 */
const getProfile = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  sendResponse(res, 200, user, 'Profile retrieved');
});

/**
 * @desc    Update current user profile
 * @route   PUT /api/v1/users/profile
 * @access  Private
 */
const updateProfile = catchAsync(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  sendResponse(res, 200, user, 'Profile updated successfully');
});

module.exports = {
  getProfile,
  updateProfile,
};
