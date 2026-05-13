import api from '../lib/axios';

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data.data;
};

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data.data;
};
