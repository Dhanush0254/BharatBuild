const authService = require('./auth.service');
const sendResponse = require('../../utils/sendResponse');
const catchAsync = require('../../utils/catchAsync');

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = catchAsync(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  sendResponse(res, 201, { user, token }, 'Registration successful');
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.login(email, password);
  sendResponse(res, 200, { user, token }, 'Login successful');
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = catchAsync(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  sendResponse(res, 200, user, 'User profile retrieved');
});

module.exports = {
  register,
  login,
  getMe,
};
