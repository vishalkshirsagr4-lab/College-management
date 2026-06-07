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

export const getStudentProfile = () => api.get('/students/me');
export const getStudentById = (studentId) => api.get(`/students/${studentId}`);
export const getAttendance = (studentId) => api.get(`/attendance/student/${studentId}`);
export const getResults = () => api.get('/results');
export const getNotices = () => api.get('/notices');
export const getFees = () => api.get('/fees');
export const getAssignments = () => api.get('/assignments');
export const getSubjects = () => api.get('/subjects');
export const getExams = () => api.get('/exams');
export const getStudentDashboard = () => api.get('/students/me/dashboard');
export const getMyTeachers = () => api.get('/students/me/teachers');
export const getMySubjects = () => api.get('/students/me/subjects');
export const getMyAssignments = () => api.get('/students/me/assignments');
export const getMyMaterials = () => api.get('/students/me/materials');
export const getMyAttendance = () => api.get('/students/me/attendance');
export const getMyNotices = () => api.get('/students/me/notices');
export const getMyExams = () => api.get('/students/me/exams');
export const getMyResults = () => api.get('/students/me/results');
export const submitAssignment = (payload) => api.post('/assignments', payload);
export const fetchResults = () => api.get('/results');
export const createStudentProfile = (payload) => {
  const formData = payload instanceof FormData ? payload : toFormData(payload);
  return api.post('/students', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const updateStudentProfile = (studentId, payload) => {
  const formData = payload instanceof FormData ? payload : toFormData(payload);
  return api.put(`/students/${studentId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const updateMyProfile = (payload) => {
  const formData = payload instanceof FormData ? payload : toFormData(payload);
  return api.put('/students/profile/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const deleteStudentProfile = (studentId) => api.delete(`/students/${studentId}`);
export const updateStudentSubjects = (studentId, subjects) => api.put(`/students/${studentId}/subjects`, { subjects });

