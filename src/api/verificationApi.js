import axiosInstance from './axiosInstance';

// Verification endpoints require authentication (any authenticated user)
export const verificationApi = {
  // POST /api/verification/crypto-check - Verify document hashes (any authenticated user)
  verifyHashes: async (payload) => {
    const { data } = await axiosInstance.post('/api/verification/crypto-check', payload);
    return data;
  },
};

export default verificationApi;
