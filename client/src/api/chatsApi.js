import api from '../lib/axios';

export const getUserChats = async () => {
  const response = await api.get('/chats');
  return response.data.data;
};

export const getOrCreateChat = async (otherUserId, listingId) => {
  const response = await api.post('/chats', { otherUserId, listingId });
  return response.data.data;
};

export const getChatMessages = async (chatId, params = {}) => {
  const query = new URLSearchParams(params);
  const response = await api.get(`/chats/${chatId}/messages?${query.toString()}`);
  return response.data.data;
};

export const sendMessage = async (chatId, text) => {
  const response = await api.post(`/chats/${chatId}/messages`, { text });
  return response.data.data;
};

export const markChatAsRead = async (chatId) => {
  const response = await api.patch(`/chats/${chatId}/read`);
  return response.data.data;
};
