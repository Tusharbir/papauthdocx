import axiosInstance from './axiosInstance';

export const workflowApi = {
  changeState: async ({ documentId, state, reason }) => {
    const { data } = await axiosInstance.post('/api/workflow/change-state', { documentId, state, reason });
    return data;
  },
  getWorkflowHistory: async (documentId) => {
    const { data } = await axiosInstance.get(`/api/workflow/${documentId}`);
    return data;
  },
};
