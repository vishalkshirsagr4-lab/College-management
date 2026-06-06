import api from './axios';

export const getExams = () => api.get('/exams');
export const getExam = (examId) => api.get(`/exams/${examId}`);
export const createExam = (payload) => api.post('/exams', payload);
export const updateExam = (examId, payload) => api.put(`/exams/${examId}`, payload);
export const deleteExam = (examId) => api.delete(`/exams/${examId}`);
