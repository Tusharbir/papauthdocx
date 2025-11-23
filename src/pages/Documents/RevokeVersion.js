import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { documentApi } from '../../api/documentApi';
import { useSnackbar } from 'notistack';

const RevokeVersion = () => {
  const { docId, versionNumber } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [reason, setReason] = useState('Tamper evidence detected');

  const mutation = useMutation({
    mutationFn: documentApi.revokeVersion,
    onSuccess: () => {
      enqueueSnackbar('Version revoked successfully.', { variant: 'warning' });
      navigate(`/documents/${docId}/versions`);
    },
    onError: () => enqueueSnackbar('Unable to revoke version.', { variant: 'error' }),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate({ documentId: docId, versionNumber, reason });
  };

  return (
    <div>
      <PageHeader
        title={`Revoke version ${versionNumber}`}
        subtitle={<span className="overflow-hidden text-ellipsis whitespace-nowrap inline-block align-bottom" style={{ maxWidth: '16rem', minWidth: '6rem', verticalAlign: 'bottom' }} title={docId}>{`Document ${docId}`}</span>}
      />
      <Card className="p-8">
        {mutation.isPending ? (
          <Loader label="Submitting" />
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="text-sm text-slate-300">Reason</label>
            <textarea
              className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex gap-3">
              <Button type="submit" className="flex-1">
                Confirm revocation
              </Button>
              <Button type="button" variant="secondary" className="flex-1" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default RevokeVersion;
