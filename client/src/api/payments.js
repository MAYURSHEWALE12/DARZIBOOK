import api from './axios.js';

export const listCustomerPayments = (customerId) => api.get(`/payments/customer/${customerId}`);
export const createPayment = (data) => api.post('/payments', data);
