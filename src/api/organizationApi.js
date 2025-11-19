import axiosInstance from './axiosInstance';

// All organization endpoints require superadmin role
export const organizationApi = {
  // GET /api/orgs - List all organizations (superadmin only)
  list: async (params = {}) => {
    const { data } = await axiosInstance.get('/api/orgs', { params });
    return data.organizations || [];
  },
  
  // POST /api/orgs - Create organization (superadmin only)
  create: async (payload) => {
    const { data } = await axiosInstance.post('/api/orgs', payload);
    return data;
  },
  
  // GET /api/orgs/:orgId/admins - List org admins (superadmin only)
  listAdmins: async (orgId) => {
    const { data } = await axiosInstance.get(`/api/orgs/${orgId}/admins`);
    return data.admins || [];
  },
  
  // POST /api/orgs/:orgId/admins - Create org admin (superadmin only)
  createAdmin: async (orgId, payload) => {
    const { data } = await axiosInstance.post(`/api/orgs/${orgId}/admins`, payload);
    return data;
  },
};

export default organizationApi;
