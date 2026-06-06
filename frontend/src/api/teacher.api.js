import api from './axios';

export const getTeacherProfile = () => api.get('/teacher/profile');
export const getTeacherSubjects = () => api.get('/teacher/subjects');
export const markAttendance = (payload) => api.post('/teacher/attendance', payload);
export const uploadMarks = (payload) => api.post('/teacher/marks', payload);
export const getStudentAttendance = (studentId) => api.get(`/teacher/attendance/${studentId}`);
