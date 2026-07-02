import API from './axios.js';

export const getSummary = (params) => API.get('/reports/summary', { params });
export const getPendingDues = () => API.get('/reports/pending-dues');
export const getOrderReport = (params) => API.get('/reports/orders', { params });
export const getRevenueReport = (params) => API.get('/reports/revenue', { params });
export const getExpenseReport = (params) => API.get('/reports/expenses', { params });
export const getSalaryReport = (params) => API.get('/reports/salary', { params });
export const getDailyStitchingReport = () => API.get('/reports/daily-stitching');
