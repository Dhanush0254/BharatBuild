import api from '../lib/axios';

export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data.data;
};

export const getAdminListings = async (params = {}) => {
  const query = new URLSearchParams(params);
  const response = await api.get(`/admin/listings?${query.toString()}`);
  return response.data.data;
};

export const getPendingListings = async (params = {}) => {
  const query = new URLSearchParams(params);
  const response = await api.get(`/admin/listings/pending?${query.toString()}`);
  return response.data.data;
};

export const moderateListing = async (id, action) => {
  const response = await api.patch(`/admin/listings/${id}/moderate`, { action });
  return response.data.data;
};

export const getAdminUsers = async (params = {}) => {
  const query = new URLSearchParams(params);
  const response = await api.get(`/admin/users?${query.toString()}`);
  return response.data.data;
};

export const toggleUserStatus = async (id) => {
  const response = await api.patch(`/admin/users/${id}/toggle-status`);
  return response.data.data;
};
