const Order = require('./order.model');
const Cart = require('../carts/cart.model');
const Product = require('../products/product.model');
const ApiError = require('../../utils/ApiError');

/**
 * Create order from cart
 */
const createOrder = async (userId, orderData) => {
  const { deliveryMethod, deliveryAddress, deliveryLocation, buyerNotes } = orderData;

  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  // Group items by shop
  const shopGroups = {};
  for (const item of cart.items) {
    const shopId = item.shop.toString();
    if (!shopGroups[shopId]) shopGroups[shopId] = [];
    shopGroups[shopId].push(item);
  }

  // Create one order per shop
  const orders = [];
  for (const [shopId, items] of Object.entries(shopGroups)) {
    const orderItems = items.map((item) => ({
      product: item.product._id || item.product,
      title: item.product.title || 'Product',
      price: item.priceAtAdd,
      unit: item.unit,
      quantity: item.quantity,
      subtotal: item.priceAtAdd * item.quantity,
    }));

    const itemsTotal = orderItems.reduce((sum, i) => sum + i.subtotal, 0);
    const deliveryCharge = deliveryMethod === 'self_pickup' ? 0 :
      deliveryMethod === 'shop_delivery' ? Math.round(itemsTotal * 0.05) : 0; // 5% for shop delivery

    const order = await Order.create({
      buyer: userId,
      shop: shopId,
      items: orderItems,
      itemsTotal,
      deliveryCharge,
      totalAmount: itemsTotal + deliveryCharge,
      deliveryMethod: deliveryMethod || cart.deliveryMethod || 'self_pickup',
      deliveryAddress: deliveryAddress || {},
      deliveryLocation: deliveryLocation || undefined,
      buyerNotes: buyerNotes || '',
      statusHistory: [{ status: 'pending', timestamp: new Date() }],
    });

    orders.push(order);

    // Update product order counts
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product._id || item.product, {
        $inc: { orderCount: 1 },
      });
    }
  }

  // Clear cart after ordering
  cart.items = [];
  await cart.save();

  return orders;
};

/**
 * Get order by ID
 */
const getOrderById = async (orderId, userId, userRole) => {
  const order = await Order.findById(orderId)
    .populate('buyer', 'name email phone address')
    .populate('shop', 'name email phone address profileImage')
    .populate('items.product', 'title images category')
    .populate('transportBooking');

  if (!order) throw new ApiError(404, 'Order not found');

  // Authorization check
  if (
    userRole !== 'admin' &&
    order.buyer._id.toString() !== userId.toString() &&
    order.shop._id.toString() !== userId.toString()
  ) {
    throw new ApiError(403, 'Not authorized to view this order');
  }

  return order;
};

/**
 * Get buyer's orders
 */
const getBuyerOrders = async (userId, { page = 1, limit = 10, status }) => {
  const skip = (page - 1) * limit;
  const filter = { buyer: userId };
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('shop', 'name address profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return { orders, pagination: { total, page, pages: Math.ceil(total / limit) } };
};

/**
 * Get shop's orders
 */
const getShopOrders = async (shopId, { page = 1, limit = 10, status }) => {
  const skip = (page - 1) * limit;
  const filter = { shop: shopId };
  if (status) filter.status = status;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('buyer', 'name phone address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return { orders, pagination: { total, page, pages: Math.ceil(total / limit) } };
};

/**
 * Update order status (shop or admin)
 */
const updateOrderStatus = async (orderId, newStatus, userId, userRole, note = '') => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  // Authorization
  const isShop = order.shop.toString() === userId.toString();
  const isBuyer = order.buyer.toString() === userId.toString();

  if (userRole !== 'admin' && !isShop && !isBuyer) {
    throw new ApiError(403, 'Not authorized');
  }

  // Validate transitions
  const validTransitions = {
    pending: ['accepted', 'cancelled'],
    accepted: ['preparing', 'cancelled'],
    preparing: ['out_for_delivery', 'completed', 'cancelled'],
    out_for_delivery: ['completed'],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[order.status]?.includes(newStatus)) {
    throw new ApiError(400, `Cannot transition from ${order.status} to ${newStatus}`);
  }

  // Only buyer can cancel pending, only shop can cancel accepted/preparing
  if (newStatus === 'cancelled') {
    if (order.status === 'pending' && !isBuyer && userRole !== 'admin') {
      throw new ApiError(403, 'Only buyer can cancel pending orders');
    }
  }

  order.status = newStatus;
  order.statusHistory.push({ status: newStatus, timestamp: new Date(), note });
  await order.save();

  return order;
};

/**
 * Get order stats for shop dashboard
 */
const getShopOrderStats = async (shopId) => {
  const [total, pending, accepted, completed, cancelled, revenue] = await Promise.all([
    Order.countDocuments({ shop: shopId }),
    Order.countDocuments({ shop: shopId, status: 'pending' }),
    Order.countDocuments({ shop: shopId, status: 'accepted' }),
    Order.countDocuments({ shop: shopId, status: 'completed' }),
    Order.countDocuments({ shop: shopId, status: 'cancelled' }),
    Order.aggregate([
      { $match: { shop: require('mongoose').Types.ObjectId.createFromHexString(shopId.toString()), status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ]);

  return {
    total, pending, accepted, completed, cancelled,
    revenue: revenue[0]?.total || 0,
  };
};

module.exports = {
  createOrder, getOrderById, getBuyerOrders,
  getShopOrders, updateOrderStatus, getShopOrderStats,
};
