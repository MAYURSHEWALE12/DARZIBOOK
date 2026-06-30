import api from './axios.js';

export const getSummary = (params) => api.get('/reports/summary', { params });
export const getPendingDues = () => api.get('/reports/pending-dues');
export const getOrderReport = (params) => api.get('/reports/orders', { params });
export const getRevenueReport = (params) => api.get('/reports/revenue', { params });
