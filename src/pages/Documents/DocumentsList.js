import { useState } from 'react';
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

  const { data: documents = [], isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.getAll,
  });

  const inputClass = mode === 'dark'
    ? 'border-white/10 bg-white/5 text-white placeholder-slate-400'
    : 'border-slate-300 bg-white text-slate-900 placeholder-slate-500';

  const filtered = documents.filter((doc) => {
    const matchesSearch = search === '' || 
      doc.docId?.toLowerCase().includes(search.toLowerCase()) ||
      doc.type?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type === typeFilter;
    return matchesSearch && matchesType;
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
          <Link to="/dashboard/admin/upload">
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
        <p className={`text-sm ${mode === 'dark' ? 'text-rose-300' : 'text-rose-600'}`}>
          {error?.response?.data?.message || 'Failed to load documents'}
        </p>
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
                <Link to={`/dashboard/admin/documents/${doc.docId}`}>
                  <Card className="p-6 transition-all hover:scale-[1.02] cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className={`text-lg font-semibold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
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
                        <p className={`font-mono text-xs ${mode === 'dark' ? 'text-slate-300' : 'text-slate-700'} truncate`}>
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
