import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import useUIStore from '../../store/uiStore';
import accessRequestApi from '../../api/accessRequestApi';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const AccessRequests = () => {
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX', 'Access Requests']);
  }, [setBreadcrumbs]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['access-requests', statusFilter],
    queryFn: async () => {
      const response = await accessRequestApi.getAll({ status: statusFilter });
      return response;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, reviewNotes }) => 
      accessRequestApi.updateStatus(id, { status, reviewNotes }),
    onSuccess: (data) => {
      enqueueSnackbar(data.message, { variant: 'success' });
      queryClient.invalidateQueries(['access-requests']);
      setSelectedRequest(null);
      setReviewNotes('');
    },
    onError: (error) => {
      const details = error.response?.data?.details;
      if (Array.isArray(details) && details.length > 0) {
        details.forEach(d => enqueueSnackbar(`${d.field}: ${d.message}`, { variant: 'error' }));
        return;
      }
      enqueueSnackbar(error.response?.data?.error || 'Failed to update request', { variant: 'error' });
    },
  });

  const requests = data?.requests || [];

  const handleReview = (request, status) => {
    updateMutation.mutate({
      id: request.id,
      status,
      reviewNotes,
    });
  };

  const getStatusBadge = (status) => {
    const tones = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
    };
    return <Badge tone={tones[status] || 'default'}>{status.toUpperCase()}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading access requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center max-w-md">
          <p className="text-rose-400 text-lg font-semibold">Error</p>
          <p className="text-slate-400 mt-2">{error.message}</p>
        </Card>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader 
        title="Access Requests" 
        subtitle={`Manage organization access requests • ${requests.length} total`}
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-sm text-slate-400">Total Requests</p>
          <p className="text-2xl font-bold text-white mt-1">{requests.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-400">Pending</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {requests.filter(r => r.status === 'pending').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-400">Approved</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {requests.filter(r => r.status === 'approved').length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-400">Rejected</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">
            {requests.filter(r => r.status === 'rejected').length}
          </p>
        </Card>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </Card>

      {/* Requests Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr className="text-left text-sm text-slate-400">
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Organization</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Submitted</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400">
                    No access requests found.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr 
                    key={request.id} 
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 text-sm text-white">{request.name}</td>
                    <td className="p-4 text-sm text-white">{request.organization}</td>
                    <td className="p-4 text-sm text-slate-400">{request.email}</td>
                    <td className="p-4 text-sm text-slate-400">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">{getStatusBadge(request.status)}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRequest(request)}
                        >
                          View
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(request);
                                handleReview(request, 'approved');
                              }}
                              disabled={updateMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                setSelectedRequest(request);
                                handleReview(request, 'rejected');
                              }}
                              disabled={updateMutation.isPending}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Request Details Modal */}
      <Modal open={!!selectedRequest} onClose={() => setSelectedRequest(null)}>
        {selectedRequest && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Request Details</h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-400">Name</p>
                <p className="text-white">{selectedRequest.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-400">Organization</p>
                <p className="text-white">{selectedRequest.organization}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-400">Email</p>
                <p className="text-white">{selectedRequest.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-400">Message</p>
                <p className="text-white">{selectedRequest.message || 'No message provided'}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-400">Status</p>
                {getStatusBadge(selectedRequest.status)}
              </div>
              
              {selectedRequest.reviewedBy && (
                <>
                  <div>
                    <p className="text-sm text-slate-400">Reviewed By</p>
                    <p className="text-white">{selectedRequest.reviewer?.fullName || 'Unknown'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-slate-400">Review Notes</p>
                    <p className="text-white">{selectedRequest.reviewNotes || 'No notes'}</p>
                  </div>
                </>
              )}
            </div>

            {selectedRequest.status === 'pending' && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <textarea
                  placeholder="Review notes (optional)"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white resize-none"
                  rows={3}
                />
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleReview(selectedRequest, 'approved')}
                    disabled={updateMutation.isPending}
                    className="flex-1"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleReview(selectedRequest, 'rejected')}
                    disabled={updateMutation.isPending}
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default AccessRequests;
