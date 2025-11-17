import axiosInstance from './axiosInstance';

const safeRequest = async (requestFn, mockData) => {
  try {
    const { data } = await requestFn();
    return data;
  } catch (error) {
    console.warn('PapDocAuthX+ QR API fallback', error);
    return mockData;
  }
};

export const qrApi = {
  generate: (documentId) =>
    safeRequest(
      () => axiosInstance.post('/qr/generate', { documentId }),
      {
        documentId,
        qrValue: `papdocauthx://${documentId}`,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      }
    ),
  resolve: (payload) =>
    safeRequest(
      () => axiosInstance.post('/qr/resolve', payload),
      {
        documentId: payload?.qrValue?.replace('papdocauthx://', '') || 'DOC-2024-001',
        status: 'verified',
      }
    ),
};
