import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import auditApi from '../../api/auditApi';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';
import Pagination from '../../components/ui/Pagination';

const AllAuditLogs = () => {
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const mode = useUIStore((state) => state.mode);
  const user = useAuthStore((state) => state.user);
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(100);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX', 'Audit Logs', 'All Logs']);
  }, [setBreadcrumbs]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch all audit logs (superadmin only)
  const { data: logsData, isLoading, error } = useQuery({
    queryKey: ['audit-logs-all', page, pageSize, debouncedSearch, actionFilter],
    queryFn: async () => {
      const response = await auditApi.getAll({
        limit: pageSize,
        offset: (page - 1) * pageSize,
        search: debouncedSearch,
        action: actionFilter
      });
      setTotal(response.total || 0);
      return response;
    },
    enabled: user?.role === 'superadmin'
  });

  const logs = logsData?.logs || [];
  const uniqueActions = [...new Set(logs.map(log => log.action))];

  const inputClass = mode === 'dark'
    ? 'border-white/10 bg-white/5 text-white placeholder-slate-400'
    : 'border-slate-300 bg-white text-slate-900 placeholder-slate-500';

  const getActionBadge = (action) => {
    const badges = {
      UPLOAD: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      APPROVE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      REVOKE: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      VERIFIED: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    return badges[action] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  if (user?.role !== 'superadmin') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <p className="text-rose-400 text-lg font-semibold">Access Denied</p>
          <p className="text-slate-400 mt-2">Only superadmin can view all audit logs.</p>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <p className="text-rose-400 text-lg font-semibold">Error Loading Audit Logs</p>
          <p className="text-slate-400 mt-2">{error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader 
        title="System Audit Logs" 
        subtitle={`Tamper-proof chain tracking all system actions • ${logs.length} total entries`}
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-slate-400">Total Actions</p>
          <p className="text-2xl font-bold text-white mt-1">{logs.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-400">Uploads</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">
            {logs.filter(l => l.action === 'UPLOAD').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-400">Verifications</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">
            {logs.filter(l => l.action === 'CRYPTO_CHECK' || l.action === 'Verify').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-400">Revocations</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">
            {logs.filter(l => l.action === 'REVOKE').length}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Input
            placeholder="Search by document ID, user, or organization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClass}
          />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className={`rounded-2xl border px-4 py-3 text-sm transition-colors focus:border-blue-400 focus:ring-blue-400 ${inputClass}`}
          >
            <option value="all">All Actions</option>
            {uniqueActions.map((action) => (
              <option key={action} value={action}>{action === 'CRYPTO_CHECK' ? 'Verify' : (action === 'Verify' ? 'Verify' : action)}</option>
            ))}
          </select>
          <div className="flex items-center text-sm text-slate-400">
            {total === 0 ? (
              <>Showing 0 of 0 logs</>
            ) : (
              <>Showing {(pageSize * (page - 1) + 1)}-{Math.min(page * pageSize, total)} of {total} logs</>
            )}
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr className="text-left text-sm text-slate-400">
                <th className="p-4 font-semibold">Timestamp</th>
                <th className="p-4 font-semibold">Action</th>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Organization</th>
                <th className="p-4 font-semibold">Document ID</th>
                <th className="p-4 font-semibold">Chain Hash</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No audit logs found matching your filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 text-sm">
                      <div className="text-white">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getActionBadge(log.action)}`}>
                        {log.action === 'CRYPTO_CHECK' ? 'Verify' : log.action}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <div className="text-white">{log.userName}</div>
                      <div className="text-xs text-slate-400">{log.userEmail}</div>
                      <div className="text-xs text-blue-400">{log.userRole}</div>
                    </td>
                    <td className="p-4 text-sm text-slate-300">{log.orgName}</td>
                    <td className="p-4 text-sm">
                      <code className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                        {log.docId}
                      </code>
                    </td>
                    <td className="p-4 text-xs">
                      <div className="font-mono text-slate-400 truncate max-w-[150px]" title={log.auditHash}>
                        {log.auditHash.substring(0, 16)}...
                      </div>
                        <div className="font-mono text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap max-w-[150px]" title={log.auditHash}>
                          {log.auditHash}
                        </div>
                      {log.prevAuditHash && (
                        <div className="text-slate-500 text-[10px] mt-1">
                          ← {log.prevAuditHash.substring(0, 12)}...
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Chain Integrity Note */}
      <Card className="p-4 bg-blue-500/10 border-blue-500/20">
        <div className="flex items-start gap-3">
          <div className="text-blue-400 text-xl">🔗</div>
          <div>
            <p className="text-sm font-semibold text-blue-400">Tamper-Proof Chain</p>
            <p className="text-xs text-slate-300 mt-1">
              Each audit entry contains a cryptographic hash linking to the previous entry, 
              making it impossible to alter historical records without detection.
            </p>
          </div>
        </div>
      </Card>
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />
    </motion.div>
  );
};

export default AllAuditLogs;
