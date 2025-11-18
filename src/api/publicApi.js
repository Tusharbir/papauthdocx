import axiosInstance from './axiosInstance';

export const publicApi = {
  verify: async ({ docId, versionHash }) => {
    const { data } = await axiosInstance.get('/api/public/verify', { params: { docId, versionHash } });
    return data;
  },
  fetchQr: async (docId) => {
    const { data } = await axiosInstance.get(`/api/qr/generate/${docId}`);
    return data;
  },
};

export default publicApi;
