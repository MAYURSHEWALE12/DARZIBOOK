import api from './axios.js';

export const getCurrentSubscription = () => api.get('/subscriptions/current');
export const createSubscriptionOrder = (data) => api.post('/subscriptions/create-order', data);
export const verifyPayment = (data) => api.post('/subscriptions/verify', data);
export const cancelSubscription = () => api.post('/subscriptions/cancel');
