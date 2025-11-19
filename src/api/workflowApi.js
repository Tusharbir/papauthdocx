import axiosInstance from './axiosInstance';

export const workflowApi = {
  // Change document workflow state (admin/superadmin only)
  changeState: async ({ documentId, versionNumber, state, reason }) => {
    const { data } = await axiosInstance.post('/api/workflow/change-state', { 
      documentId, 
      versionNumber, 
      state, 
      reason 
    });
    return data;
  },

  // Get workflow history for a document (admin/superadmin only)
  getWorkflowHistory: async (documentId) => {
    const { data } = await axiosInstance.get(`/api/workflow/${documentId}`);
    return data.history || [];
  },
};
