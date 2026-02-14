import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const generatePlan = async (profile = {}) => {
  const resp = await client.post('/generate-plan', profile);
  return resp.data;
};

export const getLatestPlan = async () => {
  const resp = await client.get('/plan/latest');
  return resp.data;
};

export default client;
