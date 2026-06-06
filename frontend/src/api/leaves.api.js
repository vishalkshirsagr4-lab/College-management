import api from './axios';

export const applyLeave = (payload) => api.post('/leaves', payload);
export const reviewLeave = (id, payload) => api.put(`/leaves/${id}/review`, payload);
