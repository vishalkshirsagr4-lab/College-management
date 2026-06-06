import api from './axios';

export const uploadFile = async (url, formData) => {
  const response = await api.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
