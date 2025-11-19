import axiosInstance from './axiosInstance';

export const documentApi = {
  // Get all documents (org-filtered)
  getAll: async () => {
    const { data } = await axiosInstance.get('/api/documents');
    return data.documents;
  },

  // Get document details with all versions
  getDetails: async (docId) => {
    const { data } = await axiosInstance.get(`/api/documents/${docId}`);
    return data.document;
  },

  // Get all versions for a document
  listVersions: async (docId) => {
    const { data } = await axiosInstance.get(`/api/documents/${docId}/versions`);
    return data.versions;
  },

  // Upload new document version
  uploadVersion: async (payload) => {
    const { data } = await axiosInstance.post('/api/documents/upload-version', payload);
    return data;
  },
};
