const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const User = require('../modules/users/user.model');

/**
 * Authentication middleware.
 * Extracts JWT from Authorization header, verifies it,
 * and attaches the user document to req.user.
 */
const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized — no token provided');
    }

    // Verify token
    const decoded = jwt.verify(token, env.jwtSecret);

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new ApiError(401, 'Not authorized — user no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Not authorized — invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Not authorized — token expired'));
    }
    next(error);
  }
};

module.exports = authenticate;
