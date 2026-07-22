import api from './axios.js';

export const listCustomerPayments = (customerId) => api.get(`/payments/customer/${customerId}`);
export const listOrderPayments = (orderId) => api.get(`/payments/order/${orderId}`);
export const createPayment = (data) => api.post('/payments', data);
