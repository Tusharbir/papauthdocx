import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { documentApi } from '../../api/documentApi';
import useUIStore from '../../store/uiStore';

const VerifierDocumentsList = () => {
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const mode = useUIStore((state) => state.mode);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX', 'Documents']);
  }, [setBreadcrumbs]);

  const inputClass = mode === 'dark'
    ? 'border-white/10 bg-white/5 text-white'
    : 'border-slate-300 bg-white text-slate-900';

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.getAll,
  });

  const filtered = documents.filter((doc) => {
    const matchesSearch = search === '' || 
      doc.docId?.toLowerCase().includes(search.toLowerCase()) ||
      doc.type?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.latestVersionStatus === statusFilter;
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status) => {
    if (status === 'APPROVED') return <Badge tone="success">Approved</Badge>;
    if (status === 'PENDING') return <Badge tone="warning">Pending</Badge>;
    if (status === 'REVOKED') return <Badge tone="error">Revoked</Badge>;
    return <Badge tone="default">{status}</Badge>;
  };

  const documentTypes = [...new Set(documents.map(d => d.type).filter(Boolean))];

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle="Browse approved documents in your organization (read-only)"
      />
      
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          className={`w-full max-w-sm rounded-full border px-4 py-2 text-sm ${inputClass}`}
          placeholder="Search by ID or type"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={`rounded-full border px-4 py-2 text-sm ${inputClass}`}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="APPROVED">Approved</option>
          <option value="PENDING">Pending</option>
          <option value="REVOKED">Revoked</option>
        </select>
        {documentTypes.length > 0 && (
          <select
            className={`rounded-full border px-4 py-2 text-sm ${inputClass}`}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All types</option>
            {documentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        )}
      </div>

      {isLoading ? (
        <p className="text-slate-400">Loading documents...</p>
      ) : filtered.length === 0 ? (
        <EmptyState 
          title="No documents found" 
          description="No documents match your filters."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doc) => (
            <Card key={doc.docId} className="p-6 hover:border-blue-500/30 transition-colors cursor-pointer" onClick={() => navigate(`/dashboard/user/documents/${doc.docId}`)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-lg font-semibold text-white">{doc.docId}</p>
                  <p className="text-sm text-slate-400 capitalize">{doc.type || 'Document'}</p>
                </div>
                {getStatusBadge(doc.latestVersionStatus)}
              </div>
              
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span className="text-slate-500">Version:</span>
                  <span className="text-white">v{doc.currentVersion || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Created:</span>
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
                {doc.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Updated:</span>
                    <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-6 p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5">
        <p className="text-sm text-blue-400">
          ℹ️ <strong>Read-Only Access:</strong> You can view document metadata but cannot upload, modify, or delete documents. Contact your admin for write access.
        </p>
      </div>
    </div>
  );
};

export default VerifierDocumentsList;
