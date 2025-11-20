import axiosInstance from './axiosInstance';

const authApi = {
  login: async (payload) => {
    const { data } = await axiosInstance.post('/api/auth/login', payload);
    return data;
  },
  registerSuperadmin: async (payload) => {
    const { data } = await axiosInstance.post('/api/auth/register-superadmin', payload, {
      headers: {
        'x-setup-key': payload.setupKey
      }
    });
    return data;
  },
  checkSuperadminStatus: async () => {
    const { data } = await axiosInstance.get('/api/auth/superadmin-status');
    return data;
  },
};

export default authApi;
