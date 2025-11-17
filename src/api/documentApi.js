import axiosInstance from './axiosInstance';

const mockDocuments = [
  {
    id: 'DOC-2024-001',
    name: 'Vendor Agreement.pdf',
    owner: 'Operations',
    status: 'verified',
    lastUpdated: '2024-12-12',
    activity: 'Hash comparison succeeded',
  },
  {
    id: 'DOC-2024-002',
    name: 'Onboarding Checklist.pdf',
    owner: 'HR',
    status: 'pending',
    lastUpdated: '2024-12-05',
    activity: 'Awaiting verifier approval',
  },
  {
    id: 'DOC-2024-003',
    name: 'Cyber Risk Report.pdf',
    owner: 'Security',
    status: 'revoked',
    lastUpdated: '2024-11-29',
    activity: 'Revoked - tamper alert',
  },
];

const safeRequest = async (requestFn, mockData) => {
  try {
    const { data } = await requestFn();
    return data;
  } catch (error) {
    console.warn('PapDocAuthX+ document API fallback', error);
    return mockData;
  }
};

export const documentApi = {
  uploadVersion: (payload) =>
    safeRequest(
      () => axiosInstance.post('/documents/upload-version', payload),
      { id: `DOC-MOCK-${Date.now()}`, ...payload, status: 'pending' }
    ),
  getDetails: (documentId) =>
    safeRequest(
      () => axiosInstance.get(`/documents/${documentId}`),
      {
        id: documentId,
        name: 'Enterprise Security Playbook.pdf',
        hashes: {
          current: '0x4be52cf2d09570a3',
          previous: '0x2de4a1ab7d45bd11',
          merkleRoot: '0x94ff2d891c44de78',
        },
        metadata: {
          owner: 'Security',
          uploadedBy: 'ava.collins',
          uploadedAt: '2024-12-08T10:21:00Z',
          versions: 6,
        },
        versions: [
          { version: 'v6', hash: '0x4be52cf2d09570a3', author: 'ava.collins', date: '2024-12-08' },
          { version: 'v5', hash: '0xef2cc0f131562007', author: 'pl.infra', date: '2024-11-20' },
          { version: 'v4', hash: '0xb4c55221940db908', author: 'pl.infra', date: '2024-11-05' },
        ],
        activity: [
          { id: 1, action: 'Verifier approval', actor: 'Morgan Kent', time: '2h ago' },
          { id: 2, action: 'Hash comparison', actor: 'Automation', time: '4h ago' },
          { id: 3, action: 'Upload', actor: 'Ava Collins', time: '1d ago' },
        ],
      }
    ),
  listUserDocs: () => safeRequest(() => axiosInstance.get('/documents'), mockDocuments),
};
