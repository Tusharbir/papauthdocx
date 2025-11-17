import axiosInstance from './axiosInstance';

const safeRequest = async (requestFn, mockData) => {
  try {
    const { data } = await requestFn();
    return data;
  } catch (error) {
    console.warn('PapDocAuthX+ verification API fallback', error);
    return mockData;
  }
};

export const verificationApi = {
  verifyHashes: (payload) =>
    safeRequest(
      () => axiosInstance.post('/verification/verify', payload),
      {
        status: 'verified',
        matchScore: 98,
        indicators: [
          { label: 'Structure hash', match: true },
          { label: 'Content hash', match: true },
          { label: 'Signature hash', match: true },
          { label: 'Merkle proof', match: false },
        ],
        backendHash: '0x4be52cf2d09570a3',
        providedHash: payload.hash || '0x4be52cf2d09570a3',
      }
    ),
};
