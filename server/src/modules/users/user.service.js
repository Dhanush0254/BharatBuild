const User = require('./user.model');
const ApiError = require('../../utils/ApiError');

/**
 * Get user profile by ID.
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

/**
 * Update user profile.
 */
const updateProfile = async (userId, updateData) => {
  // Prevent role changes through profile update
  delete updateData.role;
  delete updateData.password;
  delete updateData.email;
  delete updateData.isActive;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return user;
};

module.exports = {
  getUserById,
  updateProfile,
};
