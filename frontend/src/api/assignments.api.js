import api from './axios';

export const getAssignments = () => api.get('/assignments');
export const getAssignment = (assignmentId) => api.get(`/assignments/${assignmentId}`);
export const createAssignment = (payload) => {
  if (payload instanceof FormData) {
    return api.post('/assignments', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return api.post('/assignments', payload);
};
export const updateAssignment = (assignmentId, payload) => {
  if (payload instanceof FormData) {
    return api.put(`/assignments/${assignmentId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return api.put(`/assignments/${assignmentId}`, payload);
};
export const deleteAssignment = (assignmentId) => api.delete(`/assignments/${assignmentId}`);
