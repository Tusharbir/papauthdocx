import axiosInstance from './axiosInstance';

export const userApi = {
  // Get all users (superadmin, paginated)
  getAll: async ({ page = 1, limit = 50, search = '', role = '', orgId = '' } = {}) => {
    const offset = (page - 1) * limit;
    const params = { limit, offset };
    if (search) params.search = search;
    if (role && role !== 'all') params.role = role;
    if (orgId && orgId !== 'all') params.orgId = orgId;
    const { data } = await axiosInstance.get('/api/auth/users', { params });
    return { users: data.users, total: data.total };
  },
};

export default userApi;
