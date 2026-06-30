import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 && 
      (error.response?.data?.error === 'TOKEN_EXPIRED' || error.response?.data?.error === 'Authentication required') && 
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
        return api(originalRequest);
      } catch {
        if (window.location.pathname !== '/login' && window.location.pathname !== '/superadmin/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
