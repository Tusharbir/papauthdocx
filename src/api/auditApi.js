import axiosInstance from './axiosInstance';

export const auditApi = {
  // GET /api/audit/all - Get all audit logs (superadmin only)
  getAll: async (params = {}) => {
    const { limit = 100, offset = 0 } = params;
    const { data } = await axiosInstance.get('/api/audit/all', {
      params: { limit, offset }
    });
    return data;
  },

  // GET /api/audit/org/:orgId - Get audit logs for organization (admin/superadmin)
  getByOrg: async (orgId, params = {}) => {
    const { limit = 100, offset = 0 } = params;
    const { data } = await axiosInstance.get(`/api/audit/org/${orgId}`, {
      params: { limit, offset }
    });
    return data;
  },

  // GET /api/audit/document/:docId - Get audit logs for specific document
  getByDocument: async (docId, params = {}) => {
    const { limit = 50 } = params;
    const { data } = await axiosInstance.get(`/api/audit/document/${docId}`, {
      params: { limit }
    });
    return data;
  },

  // GET /api/audit/verify/:orgId/:docId - Verify audit chain integrity
  verifyChain: async (orgId, docId) => {
    const { data } = await axiosInstance.get(`/api/audit/verify/${orgId}/${docId}`);
    return data;
  }
};

export default auditApi;
