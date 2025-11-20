import axiosInstance from './axiosInstance';
import qrApi from './qrApi';

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
  // fetchQr is intentionally proxied to `qrApi.generate` which enforces auth/role checks.
  fetchQr: async (docId) => {
    // Note: QR generation requires admin/superadmin on the backend; this call will fail for public users.
    return qrApi.generate(docId);
  },
};

export default publicApi;
