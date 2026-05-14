import api from '../lib/axios';

export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data.data;
};

export const updateUserProfile = async (data) => {
  const response = await api.put('/users/profile', data);
  return response.data.data;
};

export const saveWorker = async (listingId) => {
  const response = await api.post(`/users/save-worker/${listingId}`);
  return response.data.data;
};

export const unsaveWorker = async (listingId) => {
  const response = await api.delete(`/users/save-worker/${listingId}`);
  return response.data.data;
};

export const getSavedWorkers = async () => {
  const response = await api.get('/users/saved-workers');
  return response.data.data;
};

export const getRecentlyViewed = async () => {
  const response = await api.get('/users/recently-viewed');
  return response.data.data;
};

export const submitVerification = async (docs) => {
  const response = await api.post('/users/verify-request', docs);
  return response.data.data;
};
