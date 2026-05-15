const express = require('express');
const router = express.Router();
const productCtrl = require('./product.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { createProductSchema, updateProductSchema } = require('./product.validation');

// Public routes
router.get('/search', productCtrl.search);
router.get('/categories', productCtrl.getCategories);
router.get('/featured', productCtrl.getFeatured);
router.get('/shop/:shopId', productCtrl.getShopProducts);
router.get('/:id', productCtrl.getById);

// Protected routes (providers/shops)
router.use(authenticate);
router.get('/my/products', authorize('provider'), productCtrl.getShopProducts);
router.get('/my/analytics', authorize('provider'), productCtrl.getAnalytics);
router.post('/', authorize('provider'), validate(createProductSchema), productCtrl.create);
router.patch('/:id', authorize('provider', 'admin'), validate(updateProductSchema), productCtrl.update);
router.delete('/:id', authorize('provider', 'admin'), productCtrl.remove);

module.exports = router;
