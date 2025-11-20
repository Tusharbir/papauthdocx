import axiosInstance from './axiosInstance';

export const metadataApi = {
  getDocumentTypes: async () => {
    const response = await axiosInstance.get('/api/metadata/document-types');
    return response.data;
  }
};
