import axiosInstance from './axiosInstance';

const safeRequest = async (requestFn, mockData) => {
  try {
    const { data } = await requestFn();
    return data;
  } catch (error) {
    console.warn('PapDocAuthX+ workflow API fallback', error);
    return mockData;
  }
};

export const workflowApi = {
  changeState: ({ documentId, state, reason }) =>
    safeRequest(
      () => axiosInstance.post('/workflow/change-state', { documentId, state, reason }),
      { documentId, state, reason, changedAt: new Date().toISOString(), actor: 'automation' }
    ),
  getWorkflowHistory: (documentId) =>
    safeRequest(
      () => axiosInstance.get(`/workflow/${documentId}`),
      [
        { state: 'Uploaded', actor: 'Ava Collins', timestamp: '2024-12-05T10:00:00Z', reason: 'Initial submission' },
        { state: 'Verifier review', actor: 'Noah Reese', timestamp: '2024-12-05T12:10:00Z', reason: 'Automated queue' },
        { state: 'Approved', actor: 'Noah Reese', timestamp: '2024-12-05T14:44:00Z', reason: 'Hashes aligned' },
      ]
    ),
};
