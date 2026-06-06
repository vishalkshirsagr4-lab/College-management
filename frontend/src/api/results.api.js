import api from './axios';

export const getResults = () => api.get('/results');
export const getResult = (resultId) => api.get(`/results/${resultId}`);
export const createResult = (payload) => api.post('/results', payload);
export const updateResult = (resultId, payload) => api.put(`/results/${resultId}`, payload);
export const deleteResult = (resultId) => api.delete(`/results/${resultId}`);
