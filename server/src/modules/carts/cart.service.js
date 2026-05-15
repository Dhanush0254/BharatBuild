const Cart = require('./cart.model');
const Product = require('../products/product.model');
const ApiError = require('../../utils/ApiError');

/**
 * Get user's cart (create if doesn't exist)
 */
const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId })
    .populate({
      path: 'items.product',
      select: 'title price unit images inStock status category shop',
      populate: { path: 'shop', select: 'name address' },
    });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  return cart;
};

/**
 * Add item to cart
 */
const addItem = async (userId, { productId, quantity = 1 }) => {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, 'Product not found');
  if (!product.inStock || product.status !== 'active') {
    throw new ApiError(400, 'Product is not available');
  }
  if (quantity < product.minOrderQty) {
    throw new ApiError(400, `Minimum order quantity is ${product.minOrderQty}`);
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  // Check if product already in cart
  const existingIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += quantity;
    cart.items[existingIndex].priceAtAdd = product.price; // refresh price
  } else {
    cart.items.push({
      product: productId,
      shop: product.shop,
      quantity,
      priceAtAdd: product.price,
      unit: product.unit,
    });
  }

  await cart.save();
  return getCart(userId);
};

/**
 * Update item quantity
 */
const updateItem = async (userId, itemId, quantity) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, 'Cart not found');

  const item = cart.items.id(itemId);
  if (!item) throw new ApiError(404, 'Item not found in cart');

  if (quantity <= 0) {
    cart.items.pull(itemId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  return getCart(userId);
};

/**
 * Remove item from cart
 */
const removeItem = async (userId, itemId) => {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, 'Cart not found');

  cart.items.pull(itemId);
  await cart.save();
  return getCart(userId);
};

/**
 * Clear cart
 */
const clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  return cart;
};

/**
 * Set delivery method
 */
const setDeliveryMethod = async (userId, method) => {
  const valid = ['self_pickup', 'shop_delivery', 'bharatbuild_delivery'];
  if (!valid.includes(method)) throw new ApiError(400, 'Invalid delivery method');

  let cart = await Cart.findOne({ user: userId });
  if (!cart) throw new ApiError(404, 'Cart not found');

  cart.deliveryMethod = method;
  await cart.save();
  return getCart(userId);
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, setDeliveryMethod };
