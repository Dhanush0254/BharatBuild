import api from '../lib/axios';

export const searchNearbyVehicles = async (params) => {
  const query = new URLSearchParams(params);
  const res = await api.get(`/vehicles/search?${query.toString()}`);
  return res.data.data;
};

export const getVehicleById = async (id) => {
  const res = await api.get(`/vehicles/${id}`);
  return res.data.data;
};

export const registerVehicle = async (data) => {
  const res = await api.post('/vehicles', data);
  return res.data.data;
};

export const getMyVehicles = async () => {
  const res = await api.get('/vehicles/my/vehicles');
  return res.data.data;
};

export const updateVehicle = async (id, data) => {
  const res = await api.patch(`/vehicles/${id}`, data);
  return res.data.data;
};

export const toggleVehicleAvailability = async (id) => {
  const res = await api.patch(`/vehicles/${id}/toggle`);
  return res.data.data;
};

export const deleteVehicle = async (id) => {
  const res = await api.delete(`/vehicles/${id}`);
  return res.data.data;
};

// Transport bookings
export const getNearbyDrivers = async (params) => {
  const query = new URLSearchParams(params);
  const res = await api.get(`/transport/nearby-drivers?${query.toString()}`);
  return res.data.data;
};

export const estimateTransportPrice = async (params) => {
  const query = new URLSearchParams(params);
  const res = await api.get(`/transport/estimate?${query.toString()}`);
  return res.data.data;
};

export const createTransportBooking = async (data) => {
  const res = await api.post('/transport', data);
  return res.data.data;
};

export const getMyTransportBookings = async (params = {}) => {
  const query = new URLSearchParams(params);
  const res = await api.get(`/transport/my?${query.toString()}`);
  return res.data.data;
};

export const getTransportBookingById = async (id) => {
  const res = await api.get(`/transport/${id}`);
  return res.data.data;
};

export const updateTransportStatus = async (id, status, note = '') => {
  const res = await api.patch(`/transport/${id}/status`, { status, note });
  return res.data.data;
};
