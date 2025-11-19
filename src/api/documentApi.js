import axiosInstance from './axiosInstance';

export const documentApi = {
  uploadVersion: async (payload) => {
    const { data } = await axiosInstance.post('/api/documents/upload-version', payload);
    return data;
  },
};
