import axiosInstance from './axiosInstance';

// All organization endpoints require superadmin role (except createVerifier which allows admin)
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

  // GET /api/orgs/:orgId/users - List org users (admin/superadmin)
  listUsers: async (orgId) => {
    const { data } = await axiosInstance.get(`/api/orgs/${orgId}/users`);
    return data.users || [];
  },

  // POST /api/orgs/:orgId/users - Create org verifier (admin can create in their org, superadmin in any org)
  createVerifier: async (orgId, payload) => {
    const { data } = await axiosInstance.post(`/api/orgs/${orgId}/users`, payload);
    return data;
  },
};

export default organizationApi;
