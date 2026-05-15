const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const cartService = require('./cart.service');

const getCart = catchAsync(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  sendResponse(res, 200, { cart }, 'Cart fetched');
});

const addItem = catchAsync(async (req, res) => {
  const cart = await cartService.addItem(req.user._id, req.body);
  sendResponse(res, 200, { cart }, 'Item added to cart');
});

const updateItem = catchAsync(async (req, res) => {
  const cart = await cartService.updateItem(req.user._id, req.params.itemId, req.body.quantity);
  sendResponse(res, 200, { cart }, 'Cart updated');
});

const removeItem = catchAsync(async (req, res) => {
  const cart = await cartService.removeItem(req.user._id, req.params.itemId);
  sendResponse(res, 200, { cart }, 'Item removed');
});

const clearCart = catchAsync(async (req, res) => {
  const cart = await cartService.clearCart(req.user._id);
  sendResponse(res, 200, { cart }, 'Cart cleared');
});

const setDeliveryMethod = catchAsync(async (req, res) => {
  const cart = await cartService.setDeliveryMethod(req.user._id, req.body.method);
  sendResponse(res, 200, { cart }, 'Delivery method updated');
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, setDeliveryMethod };
