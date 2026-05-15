import api from '../lib/axios';

export const searchProducts = async (params) => {
  const query = new URLSearchParams(params);
  const res = await api.get(`/products/search?${query.toString()}`);
  return res.data.data;
};

export const getProductById = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data.data;
};

export const getProductCategories = async (params = {}) => {
  const query = new URLSearchParams(params);
  const res = await api.get(`/products/categories?${query.toString()}`);
  return res.data.data;
};

export const getFeaturedProducts = async (limit = 8) => {
  const res = await api.get(`/products/featured?limit=${limit}`);
  return res.data.data;
};

export const getShopProducts = async (shopId, params = {}) => {
  const query = new URLSearchParams(params);
  const res = await api.get(`/products/shop/${shopId}?${query.toString()}`);
  return res.data.data;
};

export const getMyProducts = async (params = {}) => {
  const query = new URLSearchParams(params);
  const res = await api.get(`/products/my/products?${query.toString()}`);
  return res.data.data;
};

export const getMyShopAnalytics = async () => {
  const res = await api.get('/products/my/analytics');
  return res.data.data;
};

export const createProduct = async (data) => {
  const res = await api.post('/products', data);
  return res.data.data;
};

export const updateProduct = async (id, data) => {
  const res = await api.patch(`/products/${id}`, data);
  return res.data.data;
};

export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/${id}`);
  return res.data.data;
};
