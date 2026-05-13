const Joi = require('joi');

const createInquirySchema = Joi.object({
  listingId: Joi.string().required(),
  message: Joi.string().min(10).max(1000).required(),
  contactPhone: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Please provide a valid 10-digit Indian mobile number',
  }),
});

const updateInquiryStatusSchema = Joi.object({
  status: Joi.string().valid('responded', 'closed').required(),
});

module.exports = {
  createInquirySchema,
  updateInquiryStatusSchema,
};
