import api from './axios.js';

export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);
export const uploadLogo = (formData) => api.post('/profile/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
