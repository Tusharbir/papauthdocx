import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { documentApi } from '../../api/documentApi';
import useUIStore from '../../store/uiStore';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';

const DocumentDetails = () => {
  const { docId } = useParams();
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const mode = useUIStore((state) => state.mode);

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX', 'Documents', docId || 'Details']);
  }, [docId, setBreadcrumbs]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['document-details', docId],
    queryFn: () => documentApi.getDetails(docId),
    enabled: !!docId,
  });

  if (isLoading) {
    return <Loader label="Fetching document" />;
  }

  if (error) {
    return <p className="text-center text-sm text-rose-300">{error.response?.data?.message || 'Unable to load document payload.'}</p>;
  }

  if (!data) {
    return <p className="text-center text-sm text-slate-500">Unable to load document payload.</p>;
  }

  const hashRows = [
    { label: 'Merkle Root', value: data.latestHashParts?.textHash ? data.versions?.[0]?.merkleRoot : null, tone: 'warning' },
    { label: 'Text Hash', value: data.latestHashParts?.textHash, tone: 'success' },
    { label: 'Image Hash', value: data.latestHashParts?.imageHash, tone: 'info' },
    { label: 'Signature Hash', value: data.latestHashParts?.signatureHash, tone: 'info' },
    { label: 'Stamp Hash', value: data.latestHashParts?.stampHash, tone: 'info' },
  ].filter((row) => row.value);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title={data.docId} subtitle={`Document Type: ${data.type}`} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-blue-300">Document ID</p>
              <p className={`text-lg font-semibold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{data.docId}</p>
            </div>
            <Badge tone="info">{data.currentVersion} version{data.currentVersion !== 1 ? 's' : ''}</Badge>
          </div>
          <div className={`mt-6 grid gap-4 md:grid-cols-3 text-sm ${mode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Type</p>
              <p className={`font-semibold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{data.type}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Org ID</p>
              <p>{data.ownerOrgId}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Created</p>
              <p>{new Date(data.createdAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {hashRows.map((row) => (
              <div key={row.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{row.label}</p>
                <p className="mt-2 break-all font-mono text-sm">{row.value}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center text-center">
          <p className={`text-sm ${mode === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Secure QR identity</p>
          <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
            <QRCodeCanvas value={`papdocauthx://${data.docId}`} size={180} bgColor="transparent" fgColor="#00e0ff" />
          </div>
          <p className={`mt-4 text-sm ${mode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>Document ID: {data.docId}</p>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <p className={`text-sm ${mode === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Version timeline</p>
          <div className="mt-4 space-y-4">
            {data.versions?.length > 0 ? (
              data.versions.map((version) => (
                <div key={version.versionNumber} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <p className={`font-semibold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>v{version.versionNumber}</p>
                    <p className="text-xs text-slate-400">{new Date(version.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge tone={version.workflowStatus === 'APPROVED' ? 'success' : 'error'}>
                    {version.workflowStatus}
                  </Badge>
                  <p className={`max-w-sm break-all font-mono text-xs ${mode === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{version.versionHash}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No versions found</p>
            )}
          </div>
        </Card>
        <Card className="p-6">
          <p className={`text-sm ${mode === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>Latest Merkle Root</p>
          <div className="mt-4 flex min-h-[12rem] items-center justify-center rounded-3xl border border-dashed border-emerald-400/40 bg-emerald-500/5 p-4 text-center text-xs text-emerald-200 break-all">
            {data.versions?.[0]?.merkleRoot || 'N/A'}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default DocumentDetails;
