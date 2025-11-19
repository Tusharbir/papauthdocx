import axiosInstance from './axiosInstance';

// QR generation requires admin or superadmin role
export const qrApi = {
  // GET /api/qr/generate/:documentId - Generate QR code (admin/superadmin only)
  generate: async (documentId) => {
    const { data } = await axiosInstance.get(`/api/qr/generate/${documentId}`);
    return data;
  },
};

export default qrApi;
