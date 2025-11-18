import axiosInstance from './axiosInstance';

export const organizationApi = {
  list: async (params = {}) => {
    const { data } = await axiosInstance.get('/api/orgs', { params });
    return data;
  },
  create: async (payload) => {
    const { data } = await axiosInstance.post('/api/orgs', payload);
    return data;
  },
  listAdmins: async (orgId) => {
    const { data } = await axiosInstance.get(`/api/orgs/${orgId}/admins`);
    return data;
  },
  createAdmin: async (orgId, payload) => {
    const { data } = await axiosInstance.post(`/api/orgs/${orgId}/admins`, payload);
    return data;
  },
};

export default organizationApi;
