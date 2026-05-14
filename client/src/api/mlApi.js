import axios from 'axios';

let mlHost = import.meta.env.VITE_ML_URL || 'http://localhost:8000';
if (mlHost && !mlHost.startsWith('http')) {
  mlHost = `https://${mlHost}`;
}
const ML_BASE_URL = mlHost;

const mlApi = axios.create({ baseURL: ML_BASE_URL });

export const predictMaterials = async (data) => {
  const response = await mlApi.post('/predict/materials', data);
  return response.data;
};

export const predictPrice = async (data) => {
  const response = await mlApi.post('/predict/price', data);
  return response.data;
};

export const getMarketRates = async () => {
  const response = await mlApi.get('/market-rates');
  return response.data;
};
