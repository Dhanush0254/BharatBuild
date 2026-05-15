const Joi = require('joi');

const createProductSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  category: Joi.string().valid(
    'cement', 'sand', 'bricks', 'steel', 'tiles',
    'paint', 'gravel', 'hardware', 'plumbing',
    'electrical', 'wood', 'glass', 'waterproofing',
    'adhesives', 'pipes', 'tools', 'safety', 'other'
  ).required(),
  subcategory: Joi.string().trim().allow(''),
  description: Joi.string().max(2000).required(),
  price: Joi.number().min(0).required(),
  unit: Joi.string().required(),
  stockQuantity: Joi.number().integer().default(-1),
  inStock: Joi.boolean().default(true),
  deliveryAvailable: Joi.boolean().default(false),
  pickupAvailable: Joi.boolean().default(true),
  estimatedDeliveryTime: Joi.string().allow(''),
  deliveryRadius: Joi.number().min(0).default(10),
  location: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2).required(),
  }).required(),
  address: Joi.object({
    area: Joi.string().allow(''),
    city: Joi.string().default('Hyderabad'),
    district: Joi.string().allow(''),
    state: Joi.string().default('Telangana'),
  }),
  tags: Joi.array().items(Joi.string().trim().lowercase()),
  brand: Joi.string().trim().allow(''),
  specifications: Joi.object().default({}),
  minOrderQty: Joi.number().integer().min(1).default(1),
  bulkPricing: Joi.array().items(
    Joi.object({ minQty: Joi.number(), price: Joi.number() })
  ),
});

const updateProductSchema = Joi.object({
  title: Joi.string().trim().max(200),
  category: Joi.string().valid(
    'cement', 'sand', 'bricks', 'steel', 'tiles',
    'paint', 'gravel', 'hardware', 'plumbing',
    'electrical', 'wood', 'glass', 'waterproofing',
    'adhesives', 'pipes', 'tools', 'safety', 'other'
  ),
  subcategory: Joi.string().trim().allow(''),
  description: Joi.string().max(2000),
  price: Joi.number().min(0),
  unit: Joi.string(),
  stockQuantity: Joi.number().integer(),
  inStock: Joi.boolean(),
  deliveryAvailable: Joi.boolean(),
  pickupAvailable: Joi.boolean(),
  estimatedDeliveryTime: Joi.string().allow(''),
  deliveryRadius: Joi.number().min(0),
  tags: Joi.array().items(Joi.string().trim().lowercase()),
  brand: Joi.string().trim().allow(''),
  specifications: Joi.object(),
  status: Joi.string().valid('active', 'inactive', 'out_of_stock'),
  minOrderQty: Joi.number().integer().min(1),
  bulkPricing: Joi.array().items(
    Joi.object({ minQty: Joi.number(), price: Joi.number() })
  ),
}).min(1);

module.exports = { createProductSchema, updateProductSchema };
