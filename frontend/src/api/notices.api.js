import api from './axios';

export const getNotices = () => api.get('/notices');
export const getNotice = (noticeId) => api.get(`/notices/${noticeId}`);
export const createNotice = (payload) => {
  if (payload instanceof FormData) {
    return api.post('/notices', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return api.post('/notices', payload);
};
export const updateNotice = (noticeId, payload) => {
  if (payload instanceof FormData) {
    return api.put(`/notices/${noticeId}`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return api.put(`/notices/${noticeId}`, payload);
};
export const deleteNotice = (noticeId) => api.delete(`/notices/${noticeId}`);
