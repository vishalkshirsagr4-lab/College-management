import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;
    if (status !== 401) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      // refresh token uses httpOnly cookie on backend
      const refreshResponse = await api.post('/auth/refresh');
      const newToken = refreshResponse?.data?.token;
      if (newToken) {
        localStorage.setItem('token', newToken);
        api.defaults.headers.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
      return Promise.reject(error);
    } catch (refreshErr) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return Promise.reject(refreshErr);
    }
  }
);

export default api;
