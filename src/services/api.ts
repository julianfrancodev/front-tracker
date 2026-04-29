import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Request Interceptor: Add Authorization header
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No cerrar sesión automáticamente si el error 401 viene del endpoint de login
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
