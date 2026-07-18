import axios, { AxiosHeaders } from 'axios';
import { API_BASE_URL } from './api';
import { getAuthHeaders } from './auth';

const api = axios.create({
  baseURL: API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const headers = AxiosHeaders.from(config.headers);
  Object.entries(getAuthHeaders()).forEach(([key, value]) => headers.set(key, value));
  config.headers = headers;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('user_session');
    }
    return Promise.reject(error);
  }
);

export default api;
