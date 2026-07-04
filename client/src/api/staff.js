import api from './axios.js';

// Staff
export const listStaff = (params) => api.get('/staff', { params });
export const getStaff = (id) => api.get(`/staff/${id}`);
export const createStaff = (data) => api.post('/staff', data);
export const updateStaff = (id, data) => api.put(`/staff/${id}`, data);
export const deleteStaff = (id) => api.delete(`/staff/${id}`);

// Work Assignments
export const listWorkAssignments = (staffId) => api.get(`/work-assignments/staff/${staffId}`);
export const listWorkAssignmentsByOrder = (orderId) => api.get(`/work-assignments/order/${orderId}`);
export const createWorkAssignment = (data) => api.post('/work-assignments', data);
export const updateWorkAssignment = (id, data) => api.put(`/work-assignments/${id}`, data);
export const deleteWorkAssignment = (id) => api.delete(`/work-assignments/${id}`);

// Salary Transactions
export const listSalaryTransactions = (staffId) => api.get(`/salary/staff/${staffId}`);
export const createSalaryTransaction = (data) => api.post('/salary', data);
export const deleteSalaryTransaction = (id) => api.delete(`/salary/${id}`);
