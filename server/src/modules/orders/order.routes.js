const express = require('express');
const router = express.Router();
const orderCtrl = require('./order.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');

router.use(authenticate);

// Buyer routes
router.post('/', orderCtrl.create);
router.get('/my', orderCtrl.getMyOrders);
router.get('/:id', orderCtrl.getById);

// Shop provider routes
router.get('/shop/orders', authorize('provider', 'admin'), orderCtrl.getShopOrders);
router.get('/shop/stats', authorize('provider', 'admin'), orderCtrl.getShopStats);
router.patch('/:id/status', authorize('provider', 'admin', 'seeker'), orderCtrl.updateStatus);

module.exports = router;
