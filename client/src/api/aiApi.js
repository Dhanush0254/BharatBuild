import api from '../lib/axios';

export const parseAISearch = async (query) => {
  const response = await api.post('/ai/parse-search', { query });
  return response.data.data;
};
