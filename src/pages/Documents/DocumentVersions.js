import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import { documentApi } from '../../api/documentApi';
import { useState } from 'react';

const statusTone = {
  APPROVED: 'success',
  REVOKED: 'danger',
  PENDING: 'info',
};

const DocumentVersions = () => {
  const { docId } = useParams();
  const { data, isLoading, error } = useQuery({ queryKey: ['document-versions', docId], queryFn: () => documentApi.listVersions(docId) });
  const [activeHash, setActiveHash] = useState(null);

  return (
    <div>
      <PageHeader
        title={<span className="overflow-hidden text-ellipsis whitespace-nowrap inline-block align-bottom" style={{ maxWidth: '16rem', minWidth: '6rem', verticalAlign: 'bottom' }} title={docId}>{`Versions for ${docId}`}</span>}
        subtitle="Version lineage & workflow state"
      />
      {isLoading && <Loader />}
      {error && <p className="text-sm text-rose-300">{error.response?.data?.message || 'Unable to load versions.'}</p>}
      {!isLoading && !error && (
        <div className="space-y-4">
          {data?.map((version) => (
            <Card key={version.versionNumber || version.version} className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Version #{version.versionNumber || version.version}</p>
                  <p className="text-xs text-slate-500">{version.timestamp ? new Date(version.timestamp).toLocaleString() : ''}</p>
                </div>
                <Badge tone={statusTone[version.workflowStatus] || 'neutral'}>
                  {version.workflowStatus}
                </Badge>
                <div className="flex gap-2">
                  {version.hashes && (
                    <Button
                      variant="ghost"
                      className="text-sm"
                      onClick={() => setActiveHash(version.hashes)}
                    >
                      View hashes
                    </Button>
                  )}
                  <Button variant="secondary" className="text-sm" onClick={() => window.location.assign(`/documents/${docId}/revoke/${version.versionNumber || version.version}`)}>
                    Revoke
                  </Button>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                <p>Workflow: {version.workflowStatus} • Updated by {version.author || 'automation'}</p>
                {version.reason && <p>Reason: {version.reason}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-6 text-center text-sm text-slate-400">
        Need raw metadata? <Link to={`/documents/${docId}`} className="text-blue-300">Open document insights</Link>
      </div>
      <Modal open={Boolean(activeHash)} onClose={() => setActiveHash(null)}>
        {activeHash && (
          <div className="space-y-3 text-xs text-slate-300">
            <h3 className="text-lg font-semibold text-white">Hash breakdown</h3>
            {Object.entries(activeHash || {}).map(([key, value]) => (
              <p key={key} className="break-all font-mono text-sm text-white">
                <span className="text-slate-500">{key}:</span> {value}
              </p>
            ))}
            <Button className="w-full" onClick={() => setActiveHash(null)}>
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentVersions;
