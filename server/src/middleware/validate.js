const ApiError = require('../utils/ApiError');

/**
 * Generic Joi validation middleware factory.
 * Validates req.body, req.query, or req.params against a Joi schema.
 *
 * Usage:
 *   validate(registerSchema)                  → validates req.body
 *   validate(searchSchema, 'query')           → validates req.query
 *   validate(idSchema, 'params')              → validates req.params
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return next(new ApiError(400, message));
    }

    // Replace with validated (and stripped) values
    req[source] = value;
    next();
  };
};

module.exports = validate;
