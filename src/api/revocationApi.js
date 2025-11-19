import axiosInstance from './axiosInstance';

export const revocationApi = {
  revoke: async ({ documentId, version, reason }) => {
    const { data } = await axiosInstance.post('/api/revocation/revoke', { documentId, version, reason });
    return data;
  },
  getStatus: async (documentId) => {
    const { data } = await axiosInstance.get(`/api/revocation/${documentId}`);
    return data;
  },
};
