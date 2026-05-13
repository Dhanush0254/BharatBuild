const Joi = require('joi');

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).messages({
    'string.pattern.base': 'Phone must be a valid 10-digit Indian mobile number',
  }),
  address: Joi.object({
    area: Joi.string(),
    city: Joi.string().default('Hyderabad'),
    district: Joi.string(),
    state: Joi.string().default('Telangana'),
  }),
}).min(1);

module.exports = {
  updateProfileSchema,
};
