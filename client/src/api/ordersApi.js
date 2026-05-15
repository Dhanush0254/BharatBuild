import api from '../lib/axios';

export const createOrder = async (data) => {
  const res = await api.post('/orders', data);
  return res.data.data;
};

export const getMyOrders = async (params = {}) => {
  const query = new URLSearchParams(params);
  const res = await api.get(`/orders/my?${query.toString()}`);
  return res.data.data;
};

export const getOrderById = async (id) => {
  const res = await api.get(`/orders/${id}`);
  return res.data.data;
};

export const getShopOrders = async (params = {}) => {
  const query = new URLSearchParams(params);
  const res = await api.get(`/orders/shop/orders?${query.toString()}`);
  return res.data.data;
};

export const getShopOrderStats = async () => {
  const res = await api.get('/orders/shop/stats');
  return res.data.data;
};

export const updateOrderStatus = async (id, status, note = '') => {
  const res = await api.patch(`/orders/${id}/status`, { status, note });
  return res.data.data;
};
