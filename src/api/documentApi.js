import axiosInstance from './axiosInstance';

export const documentApi = {
  uploadVersion: async (payload) => {
    const { data } = await axiosInstance.post('/api/document/upload-version', payload);
    return data;
  },
  getDetails: async (documentId) => {
    const { data } = await axiosInstance.get(`/api/document/${documentId}`);
    return data;
  },
  listUserDocs: async () => {
    const { data } = await axiosInstance.get('/api/document');
    return data;
  },
  listVersions: async (documentId) => {
    const { data } = await axiosInstance.get(`/api/document/${documentId}/versions`);
    return data;
  },
  revokeVersion: async ({ documentId, versionNumber, reason }) => {
    const { data } = await axiosInstance.post('/api/document/revoke', { documentId, versionNumber, reason });
    return data;
  },
};
