const express = require('express');
const router = express.Router();
const cartCtrl = require('./cart.controller');
const authenticate = require('../../middleware/authenticate');

// All cart routes require authentication
router.use(authenticate);

router.get('/', cartCtrl.getCart);
router.post('/items', cartCtrl.addItem);
router.patch('/items/:itemId', cartCtrl.updateItem);
router.delete('/items/:itemId', cartCtrl.removeItem);
router.delete('/', cartCtrl.clearCart);
router.patch('/delivery-method', cartCtrl.setDeliveryMethod);

module.exports = router;
