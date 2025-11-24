import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Loader from '../../components/ui/Loader';
import useUIStore from '../../store/uiStore';
import { documentApi } from '../../api/documentApi';
import { WORKFLOW_STATUS, STATUS_BADGE_TONES } from '../../constants/enums';

const DocumentsList = () => {
  const mode = useUIStore((state) => state.mode);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const role = useAuthStore((state) => state.role);
  const isSuperadmin = role === 'superadmin';
  const basePath = `/dashboard/${isSuperadmin ? 'superadmin' : 'admin'}`;

  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.getAll,
  });

  const inputClass = mode === 'dark'
    ? 'border-white/10 bg-white/5 text-white placeholder-slate-400'
    : 'border-slate-300 bg-white text-slate-900 placeholder-slate-500';

  // Get logged-in user ID
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || user?.userId;

  // Admins see their own uploads; superadmin sees everything
  const filtered = documents.filter((doc) => {
    const matchesSearch = search === '' || 
      doc.docId?.toLowerCase().includes(search.toLowerCase()) ||
      doc.type?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    // Only show if createdBy matches userId (from latestVersionHash info)
    const matchesUser = isSuperadmin || !userId || doc.createdBy === userId || doc.createdByUserId === userId;
    return matchesSearch && matchesType && matchesUser;
  });

  // Get unique document types for filter
  const uniqueTypes = [...new Set(documents.map(d => d.type))];

  const getStatusBadge = (status) => {
    const tone = STATUS_BADGE_TONES[status] || 'info';
    const label = status === WORKFLOW_STATUS.APPROVED ? 'Active' 
      : status === WORKFLOW_STATUS.REVOKED ? 'Revoked' 
      : status === WORKFLOW_STATUS.PENDING ? 'Pending'
      : 'Unknown';
    return <Badge tone={tone}>{label}</Badge>;
  };

  if (isLoading) {
    return <Loader label="Loading documents..." />;
  }

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle="Manage and browse registered documents"
        action={
          <Link to={`${basePath}/upload`}>
            <Button>+ Upload Document</Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3">
        <input
          className={`w-full max-w-sm rounded-full border px-4 py-2 text-sm ${inputClass}`}
          placeholder="Search by document ID or type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={`rounded-full border px-4 py-2 text-sm ${inputClass}`}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All types</option>
          {uniqueTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="fixed top-6 left-1/2 z-50 -translate-x-1/2 w-full max-w-md px-4 flex justify-center pointer-events-none">
          <div className="p-4 rounded-xl bg-rose-500/90 border border-rose-500/40 flex items-center justify-between gap-4 shadow-lg w-full pointer-events-auto animate-fade-in">
            <p className="text-sm text-white flex-1 text-center">{error?.response?.data?.message || 'Failed to load documents'}</p>
            <button
              type="button"
              className="text-white bg-rose-600/80 hover:bg-rose-700/90 border border-white/20 shadow-lg rounded-full p-2 ml-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Close alert"
              onClick={() => window.location.reload()}
              style={{ lineHeight: 0 }}
            >
              <svg className="w-6 h-6 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState 
          title="No documents found" 
          description={documents.length === 0 
            ? "Upload your first document to get started" 
            : "No documents match your filters"
          }
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((doc, index) => (
              <motion.div
                key={doc.docId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`${basePath}/documents/${doc.docId}`}>
                  <Card className="p-6 transition-all hover:scale-[1.02] cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p
                          className={`text-lg font-semibold ${mode === 'dark' ? 'text-white' : 'text-slate-900'} overflow-hidden text-ellipsis whitespace-nowrap`}
                          title={doc.docId}
                          style={{ display: 'block', maxWidth: '16rem', minWidth: '6rem', width: '100%' }}
                        >
                          {doc.docId}
                        </p>
                        <p className={`text-sm ${mode === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                          {doc.type}
                        </p>
                      </div>
                      {getStatusBadge(doc.latestVersionStatus)}
                    </div>

                    <div className={`space-y-2 text-xs ${mode === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                      <div className="flex justify-between">
                        <span className={mode === 'dark' ? 'text-slate-500' : 'text-slate-400'}>Version:</span>
                        <span className="font-mono">v{doc.currentVersion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={mode === 'dark' ? 'text-slate-500' : 'text-slate-400'}>Org ID:</span>
                        <span>{doc.ownerOrgId}</span>
                      </div>
                      {doc.metadata?.holderName && (
                        <div className="flex justify-between">
                          <span className={mode === 'dark' ? 'text-slate-500' : 'text-slate-400'}>Holder:</span>
                          <span>{doc.metadata.holderName}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className={mode === 'dark' ? 'text-slate-500' : 'text-slate-400'}>Created:</span>
                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {doc.latestVersionHash && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className={`text-xs ${mode === 'dark' ? 'text-slate-500' : 'text-slate-400'} mb-1`}>
                          Latest Hash:
                        </p>
                        <p className={`font-mono text-xs ${mode === 'dark' ? 'text-slate-300' : 'text-slate-700'} overflow-hidden text-ellipsis whitespace-nowrap max-w-full`} title={doc.latestVersionHash}>
                          {doc.latestVersionHash}
                        </p>
                      </div>
                    )}
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className={`mt-6 text-sm ${mode === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
            Showing {filtered.length} of {documents.length} documents
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentsList;
