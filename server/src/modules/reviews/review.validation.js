const Joi = require('joi');

const createReviewSchema = Joi.object({
  bookingId: Joi.string().required().messages({
    'any.required': 'Booking ID is required',
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'any.required': 'Rating is required',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
  }),
  comment: Joi.string().min(5).max(1000).required().messages({
    'any.required': 'Review comment is required',
    'string.min': 'Comment must be at least 5 characters',
  }),
});

module.exports = {
  createReviewSchema,
};
