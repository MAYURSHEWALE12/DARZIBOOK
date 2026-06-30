import api from './axios.js';

export const listOrders = (params) => api.get('/orders', { params });
export const createOrder = (data) => api.post('/orders', data);
export const getOrder = (id) => api.get(`/orders/${id}`);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const deleteOrder = (id) => api.delete(`/orders/${id}`);
export const uploadOrderPhotos = (id, formData) => api.post(`/orders/${id}/photos`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteOrderPhoto = (orderId, photoId) => api.delete(`/orders/${orderId}/photos/${photoId}`);
