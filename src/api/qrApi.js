import axiosInstance from './axiosInstance';

export const qrApi = {
  generate: async (documentId) => {
    const { data } = await axiosInstance.get(`/api/qr/generate/${documentId}`);
    return data;
  },
  resolve: async (payload) => {
    const { data } = await axiosInstance.post('/api/qr/resolve', payload);
    return data;
  },
};
