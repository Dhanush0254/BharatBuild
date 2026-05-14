import api from '../lib/axios';

export const createReview = async (data) => {
  const response = await api.post('/reviews', data);
  return response.data.data;
};

export const getListingReviews = async (listingId, params = {}) => {
  const query = new URLSearchParams(params);
  const response = await api.get(`/reviews/listing/${listingId}?${query.toString()}`);
  return response.data.data;
};

export const getProviderReviews = async (providerId, params = {}) => {
  const query = new URLSearchParams(params);
  const response = await api.get(`/reviews/provider/${providerId}?${query.toString()}`);
  return response.data.data;
};
