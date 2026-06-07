import api from './axios';

export const getTodaysClasses = (params) => api.get('/timetable/today', { params });
export const createTimetable = (payload) => api.post('/timetable', payload);
export const getTimetable = (params) => api.get('/timetable', { params });
export const getTimetableById = (id) => api.get(`/timetable/${id}`);
export const updateTimetable = (id, payload) => api.put(`/timetable/${id}`, payload);
export const deleteTimetable = (id) => api.delete(`/timetable/${id}`);
export const getTeacherTimetable = () => api.get('/teacher/timetable');
