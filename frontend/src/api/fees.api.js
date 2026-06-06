import api from './axios';

export const getFees = () => api.get('/fees');
export const getFee = (feeId) => api.get(`/fees/${feeId}`);
export const createFee = (payload) => api.post('/fees', payload);
export const updateFee = (feeId, payload) => api.put(`/fees/${feeId}`, payload);
export const deleteFee = (feeId) => api.delete(`/fees/${feeId}`);
