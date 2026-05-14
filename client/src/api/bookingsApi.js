import api from '../lib/axios';

export const createBooking = async (data) => {
  const response = await api.post('/bookings', data);
  return response.data.data;
};

export const getSeekerBookings = async (params = {}) => {
  const query = new URLSearchParams(params);
  const response = await api.get(`/bookings/my-bookings?${query.toString()}`);
  return response.data.data;
};

export const getProviderBookings = async (params = {}) => {
  const query = new URLSearchParams(params);
  const response = await api.get(`/bookings/provider?${query.toString()}`);
  return response.data.data;
};

export const getBookingById = async (id) => {
  const response = await api.get(`/bookings/${id}`);
  return response.data.data;
};

export const updateBookingStatus = async (id, status, completionNote = '') => {
  const response = await api.patch(`/bookings/${id}/status`, { status, completionNote });
  return response.data.data;
};

export const cancelBooking = async (id) => {
  const response = await api.patch(`/bookings/${id}/cancel`);
  return response.data.data;
};

export const rebookWorker = async (id, data) => {
  const response = await api.post(`/bookings/${id}/rebook`, data);
  return response.data.data;
};
