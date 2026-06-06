import api from './axios';

export const uploadFile = async (url, formData) => {
  const response = await api.post(url, formData);
  return response.data;
};
