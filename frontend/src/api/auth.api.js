import api from './axios';

export const register = (payload) => api.post('/auth/register', payload);
export const verifyRegister = (payload) => api.post('/auth/verify-register', payload);
export const login = (payload) => api.post('/auth/login', payload);
export const verifyLogin = (payload) => api.post('/auth/verify-login', payload);
export const getProfile = () => api.get('/auth/me');
export const refreshToken = () => api.post('/auth/refresh');
