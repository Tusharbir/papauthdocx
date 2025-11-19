import axiosInstance from './axiosInstance';

export const publicApi = {
  verify: async ({ docId, versionHash, textHash, imageHash, signatureHash, stampHash }) => {
    const { data } = await axiosInstance.post('/api/public/verify', { 
      docId, 
      versionHash, 
      textHash, 
      imageHash, 
      signatureHash, 
      stampHash 
    });
    return data;
  },
  fetchQr: async (docId) => {
    const { data } = await axiosInstance.get(`/api/qr/generate/${docId}`);
    return data;
  },
};

export default publicApi;
