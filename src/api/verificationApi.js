import axiosInstance from './axiosInstance';

export const verificationApi = {
  verifyHashes: async (payload) => {
    const { data } = await axiosInstance.post('/api/verification/crypto-check', payload);
    return data;
  },
};
