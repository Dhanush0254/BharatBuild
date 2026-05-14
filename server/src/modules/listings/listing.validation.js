const Joi = require('joi');

const createListingSchema = Joi.object({
  category: Joi.string().valid('workers', 'machinery', 'materials', 'repairs').required(),
  subCategory: Joi.string().required(),
  title: Joi.string().trim().min(5).max(200).required(),
  description: Joi.string().min(20).max(2000).required(),
  pricing: Joi.object({
    amount: Joi.number().positive().required(),
    unit: Joi.string().required(),
  }).required(),
  location: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
  }).required(),
  address: Joi.object({
    street: Joi.string().optional(),
    area: Joi.string().required(),
    city: Joi.string().default('Hyderabad'),
    district: Joi.string().optional(),
    state: Joi.string().default('Telangana'),
    pincode: Joi.string().optional(),
  }).required(),
  metadata: Joi.object().optional(),
  availability: Joi.boolean().default(true),
});

const updateListingSchema = Joi.object({
  title: Joi.string().trim().min(5).max(200),
  description: Joi.string().min(20).max(2000),
  pricing: Joi.object({
    amount: Joi.number().positive().required(),
    unit: Joi.string().required(),
  }),
  location: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
  }),
  address: Joi.object({
    street: Joi.string().optional(),
    area: Joi.string().required(),
    city: Joi.string().default('Hyderabad'),
    district: Joi.string().optional(),
    state: Joi.string().default('Telangana'),
    pincode: Joi.string().optional(),
  }),
  metadata: Joi.object().optional(),
  availability: Joi.boolean(),
}).min(1);

const searchQuerySchema = Joi.object({
  category: Joi.string().valid('workers', 'machinery', 'materials', 'repairs').allow('').optional(),
  subCategory: Joi.string().allow('').optional(),
  area: Joi.string().allow('').optional(),
  district: Joi.string().allow('').optional(),
  search: Joi.string().allow('').optional(),
  lng: Joi.any().optional(),
  lat: Joi.any().optional(),
  radius: Joi.number().positive().max(200).default(50).optional(),
  minPrice: Joi.any().optional(),
  maxPrice: Joi.any().optional(),
  isVerified: Joi.string().valid('true', 'false').optional(),
  isAvailable: Joi.string().valid('true', 'false').optional(),
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().positive().max(200).default(12),
  sort: Joi.string().valid('newest', 'price_asc', 'price_desc', 'nearest').default('newest'),
});

module.exports = {
  createListingSchema,
  updateListingSchema,
  searchQuerySchema,
};
