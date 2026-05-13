import api from '../lib/axios';

export const searchListings = async (searchParams) => {
  const params = new URLSearchParams(searchParams);
  const response = await api.get(`/listings/search?${params.toString()}`);
  return response.data.data;
};

export const getListingDetails = async (id) => {
  const response = await api.get(`/listings/${id}`);
  return response.data.data;
};

export const getFeaturedListings = async () => {
  const response = await api.get('/listings/featured');
  return response.data.data;
};

export const getMarketplaceStats = async () => {
  const response = await api.get('/listings/stats');
  return response.data.data;
};

export const createListing = async (data) => {
  const response = await api.post('/listings', data);
  return response.data.data;
};

export const updateListing = async (id, data) => {
  const response = await api.put(`/listings/${id}`, data);
  return response.data.data;
};

export const deleteListing = async (id) => {
  const response = await api.delete(`/listings/${id}`);
  return response.data.data;
};

export const getMyListings = async (params = {}) => {
  const query = new URLSearchParams(params);
  const response = await api.get(`/listings/my-listings?${query.toString()}`);
  return response.data.data;
};

export const uploadListingImages = async (id, formData) => {
  const response = await api.post(`/listings/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};
