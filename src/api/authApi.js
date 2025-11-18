import axiosInstance from './axiosInstance';

const authApi = {
  login: async (payload) => {
    const { data } = await axiosInstance.post('/api/auth/login', payload);
    return data;
  },
  register: async (payload) => {
    const { data } = await axiosInstance.post('/api/auth/register', payload);
    return data;
  },
  refresh: async (refreshToken) => {
    const { data } = await axiosInstance.post(
      '/api/auth/refresh',
      { refreshToken },
      {
        headers: {
          'x-skip-auth-refresh': 'true',
        },
      }
    );
    return data;
  },
  logout: async () => {
    const { data } = await axiosInstance.post('/api/auth/logout');
    return data;
  },
};

export default authApi;
