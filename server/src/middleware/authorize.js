const ApiError = require('../utils/ApiError');

/**
 * Role-based authorization middleware.
 * Usage: authorize('admin', 'provider')
 * Must be used AFTER authenticate middleware.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authorized — please login first'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Role '${req.user.role}' is not authorized to access this resource`)
      );
    }

    next();
  };
};

module.exports = authorize;
