const catchAsync = require('../../utils/catchAsync');
const sendResponse = require('../../utils/sendResponse');
const orderService = require('./order.service');

const create = catchAsync(async (req, res) => {
  const orders = await orderService.createOrder(req.user._id, req.body);
  sendResponse(res, 201, { orders }, 'Order placed successfully');
});

const getById = catchAsync(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user._id, req.user.role);
  sendResponse(res, 200, { order }, 'Order fetched');
});

const getMyOrders = catchAsync(async (req, res) => {
  const result = await orderService.getBuyerOrders(req.user._id, req.query);
  sendResponse(res, 200, result, 'Orders fetched');
});

const getShopOrders = catchAsync(async (req, res) => {
  const result = await orderService.getShopOrders(req.user._id, req.query);
  sendResponse(res, 200, result, 'Shop orders fetched');
});

const updateStatus = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderStatus(
    req.params.id, req.body.status, req.user._id, req.user.role, req.body.note
  );
  sendResponse(res, 200, { order }, 'Order status updated');
});

const getShopStats = catchAsync(async (req, res) => {
  const stats = await orderService.getShopOrderStats(req.user._id);
  sendResponse(res, 200, { stats }, 'Order stats fetched');
});

module.exports = { create, getById, getMyOrders, getShopOrders, updateStatus, getShopStats };
