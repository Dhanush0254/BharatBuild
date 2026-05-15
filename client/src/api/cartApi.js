import api from '../lib/axios';

export const getCart = async () => {
  const res = await api.get('/cart');
  return res.data.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const res = await api.post('/cart/items', { productId, quantity });
  return res.data.data;
};

export const updateCartItem = async (itemId, quantity) => {
  const res = await api.patch(`/cart/items/${itemId}`, { quantity });
  return res.data.data;
};

export const removeCartItem = async (itemId) => {
  const res = await api.delete(`/cart/items/${itemId}`);
  return res.data.data;
};

export const clearCart = async () => {
  const res = await api.delete('/cart');
  return res.data.data;
};

export const setDeliveryMethod = async (method) => {
  const res = await api.patch('/cart/delivery-method', { method });
  return res.data.data;
};
