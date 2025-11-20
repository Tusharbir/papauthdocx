import axiosInstance from './axiosInstance';

const accessRequestApi = {
  // Public - submit access request
  submit: async (data) => {
    const response = await axiosInstance.post('/api/access-requests/submit', data);
    return response.data;
  },

  // Superadmin - get all requests
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/api/access-requests', { params });
    return response.data;
  },

  // Superadmin - update request status
  updateStatus: async (id, data) => {
    const response = await axiosInstance.patch(`/api/access-requests/${id}/status`, data);
    return response.data;
  },
};

export default accessRequestApi;
