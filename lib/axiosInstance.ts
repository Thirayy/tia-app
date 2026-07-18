import axios from 'axios';
import { API_BASE_URL } from './api';
import { getAuthHeaders } from './auth';

const api = axios.create({
  baseURL: '/api', 
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 30000,
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
