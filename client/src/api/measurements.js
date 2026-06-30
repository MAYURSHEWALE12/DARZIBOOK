import api from './axios.js';

export const listMeasurements = () => api.get('/measurements');
export const listCustomerMeasurements = (customerId) => api.get(`/measurements/customer/${customerId}`);
export const createMeasurement = (data) => api.post('/measurements', data);
export const getMeasurement = (id) => api.get(`/measurements/${id}`);
export const updateMeasurement = (id, data) => api.put(`/measurements/${id}`, data);
