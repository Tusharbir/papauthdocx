import axios from 'axios';
import useAuthStore from '../store/authStore';

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'https://api.papdocauthx.local';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.headers?.['x-skip-auth-refresh']
    ) {
      originalRequest._retry = true;
      try {
        const newToken = await useAuthStore.getState().refreshSession();
        if (newToken) {
          const headers = originalRequest.headers || {};
          originalRequest.headers = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          };
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
