import api from './axios';

export const getStudents = () => api.get('/admin/students');
export const getTeachers = () => api.get('/admin/teachers');
export const getSubjects = () => api.get('/admin/subjects');
export const createTeacher = (payload) => api.post('/admin/create-teacher', payload);
export const createSubject = (payload) => api.post('/admin/create-subject', payload);
export const assignTeacher = (payload) => api.put('/admin/assign-teacher', payload);
