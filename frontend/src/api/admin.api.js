import api from './axios';

export const getStudents = (params) => api.get('/admin/students', { params });
export const getTeachers = (params) => api.get('/admin/teachers', { params });
export const getSubjects = (params) => api.get('/admin/subjects', { params });
export const getAllStudents = (params) => api.get('/students', { params });
export const getAllUsers = () => api.get('/admin/users');
export const createTeacher = (payload) => api.post('/admin/create-teacher', payload);
export const createSubject = (payload) => api.post('/admin/create-subject', payload);
export const assignTeacher = (payload) => api.put('/admin/assign-teacher', payload);
export const blockUser = (userId) => api.put(`/admin/block-user/${userId}`);
export const searchUsers = (q) => api.get(`/admin/users/search?q=${encodeURIComponent(q || '')}`);
export const convertUserToTeacher = (payload) => api.post('/admin/convert-to-teacher', payload);
export const updateTeacherById = (teacherId, payload) => api.put(`/admin/teachers/${teacherId}`, payload);
export const adminGlobalSearch = (params) => api.get('/admin/search', { params });
export const getAdminDashboardStats = () => api.get('/admin/dashboard-stats');
