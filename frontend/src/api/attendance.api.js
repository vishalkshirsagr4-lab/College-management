import api from './axios';

export const createAttendance = (payload) => api.post('/attendance', payload);
export const getAttendance = (params) => api.get('/attendance', { params });
export const getAttendanceByStudent = (studentId) => api.get(`/attendance/student/${studentId}`);
export const getStudentStats = (studentId) => api.get(`/attendance/student/${studentId}/stats`);
export const updateAttendance = (attendanceId, payload) => api.put(`/attendance/${attendanceId}`, payload);
export const deleteAttendance = (attendanceId) => api.delete(`/attendance/${attendanceId}`);
