import api from './axios';

const toFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return formData;
};

export const getTeacherProfile = () => api.get('/teacher/profile');
export const getTeacherSubjects = () => api.get('/teacher/subjects');
export const markAttendance = (payload) => api.post('/teacher/attendance', payload);
export const uploadMarks = (payload) => api.post('/teacher/marks', payload);
export const updateTeacherProfile = (payload) => {
  const formData = payload instanceof FormData ? payload : toFormData(payload);
  return api.put('/teacher/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const getStudentAttendance = (studentId) => api.get(`/teacher/attendance/${studentId}`);
export const getTeacherDashboard = () => api.get('/teacher/dashboard');
