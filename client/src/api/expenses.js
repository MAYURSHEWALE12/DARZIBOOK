import API from './axios.js';

export const listExpenses = (params) => API.get('/expenses', { params });
export const createExpense = (expenseData) => API.post('/expenses', expenseData);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);
