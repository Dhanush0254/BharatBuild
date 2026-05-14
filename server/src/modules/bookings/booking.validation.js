const Joi = require('joi');

const createBookingSchema = Joi.object({
  listingId: Joi.string().required().messages({
    'any.required': 'Listing ID is required',
  }),
  startDate: Joi.date().iso().required().messages({
    'any.required': 'Start date is required',
    'date.format': 'Start date must be a valid ISO date',
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
    'any.required': 'End date is required',
    'date.min': 'End date must be after start date',
  }),
  notes: Joi.string().max(500).allow('').optional(),
  totalAmount: Joi.number().min(0).required().messages({
    'any.required': 'Total amount is required',
  }),
});

const updateBookingStatusSchema = Joi.object({
  status: Joi.string()
    .valid('accepted', 'rejected', 'completed', 'cancelled')
    .required()
    .messages({
      'any.only': 'Status must be accepted, rejected, completed, or cancelled',
    }),
  completionNote: Joi.string().max(500).allow('').optional(),
});

const rebookSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  notes: Joi.string().max(500).allow('').optional(),
  totalAmount: Joi.number().min(0).required(),
});

module.exports = {
  createBookingSchema,
  updateBookingStatusSchema,
  rebookSchema,
};
