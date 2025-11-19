import axiosInstance from './axiosInstance';

const safeRequest = async (requestFn, mockData) => {
  try {
    const { data } = await requestFn();
    return data;
  } catch (error) {
    console.warn('PapDocAuthX revocation API fallback', error);
    return mockData;
  }
};

export const revocationApi = {
  revoke: ({ documentId, version, reason }) =>
    safeRequest(
      () => axiosInstance.post('/revocation/revoke', { documentId, version, reason }),
      { status: 'revoked', documentId, version, reason }
    ),
  getStatus: (documentId) =>
    safeRequest(
      () => axiosInstance.get(`/revocation/${documentId}`),
      {
        documentId,
        status: 'revoked',
        revokedBy: 'Security Automation',
        revokedAt: '2024-12-02T09:21:00Z',
      }
    ),
};
