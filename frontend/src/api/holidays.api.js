import api from './axios';

export const createHoliday = (payload) => api.post('/holidays', payload);
export const getHolidays = () => api.get('/holidays');
