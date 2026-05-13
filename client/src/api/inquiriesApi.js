import api from '../lib/axios';

export const createInquiry = async (data) => {
  const response = await api.post('/inquiries', data);
  return response.data.data;
};

export const getMySentInquiries = async (params = {}) => {
  const query = new URLSearchParams(params);
  const response = await api.get(`/inquiries/sent?${query.toString()}`);
  return response.data.data;
};

export const getReceivedInquiries = async (params = {}) => {
  const query = new URLSearchParams(params);
  const response = await api.get(`/inquiries/received?${query.toString()}`);
  return response.data.data;
};

export const updateInquiryStatus = async (id, status) => {
  const response = await api.patch(`/inquiries/${id}/status`, { status });
  return response.data.data;
};
