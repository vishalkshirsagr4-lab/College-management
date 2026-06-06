import api from './axios';

export const getStudentProfile = () => api.get('/students/me');
export const getAttendance = (studentId) => api.get(`/attendance/student/${studentId}`);
export const getResults = () => api.get('/results');
export const getNotices = () => api.get('/notices');
export const getFees = () => api.get('/fees');
export const getAssignments = () => api.get('/assignments');
