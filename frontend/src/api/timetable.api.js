import api from './axios';

export const getTodaysClasses = (params) => api.get('/timetable/today', { params });
export const createTimetable = (payload) => api.post('/timetable', payload);
export const getTimetable = (params) => api.get('/timetable', { params });
