import axiosInstance from './axiosInstance';

export const documentApi = {
  // Get all documents (org-filtered, paginated)
  getAll: async ({ page = 1, limit = 10, search = '', type = '' } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (type && type !== 'all') params.type = type;
    const { data } = await axiosInstance.get('/api/documents', { params });
    return { documents: data.documents, total: data.total };
  },

  // Alias for getAll - used by SuperAdminDashboard
  listUserDocs: async () => {
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
