const jwt = require('jsonwebtoken');
const User = require('../users/user.model');
const ApiError = require('../../utils/ApiError');
const env = require('../../config/env');

/**
 * Generate JWT token for a user.
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

/**
 * Register a new user.
 */
const register = async ({ name, email, password, role, phone }) => {
  // Check for existing email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password, role, phone });
  const token = generateToken(user);

  return { user, token };
};

/**
 * Login an existing user.
 */
const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user);

  // Remove password from returned object
  user.password = undefined;

  return { user, token };
};

/**
 * Get current logged-in user profile.
 */
const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

module.exports = {
  register,
  login,
  getMe,
};
