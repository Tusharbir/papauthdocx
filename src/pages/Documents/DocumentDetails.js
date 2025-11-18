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
  const { documentId = 'DOC-2024-001' } = useParams();
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX+', 'Documents', documentId]);
  }, [documentId, setBreadcrumbs]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['document-details', documentId],
    queryFn: () => documentApi.getDetails(documentId),
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
    { label: 'Current hash', value: data.hashes?.current, tone: 'success' },
    { label: 'Previous hash', value: data.hashes?.previous, tone: 'info' },
    { label: 'Merkle root', value: data.hashes?.merkleRoot, tone: 'warning' },
  ].filter((row) => row.value);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title={data.name} subtitle={`Document ${data.id}`} />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-blue-300">Owner</p>
              <p className="text-lg font-semibold">{data.metadata.owner}</p>
            </div>
            <Badge tone="info">{data.metadata.versions} versions</Badge>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3 text-sm text-slate-300">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Uploaded by</p>
              <p className="font-semibold text-white">{data.metadata.uploadedBy}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Uploaded at</p>
              <p>{new Date(data.metadata.uploadedAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Versions</p>
              <p>{data.metadata.versions ?? '--'}</p>
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
          <p className="text-sm text-slate-400">Secure QR identity</p>
          <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
            <QRCodeCanvas value={`papdocauthx://${data.id}`} size={180} bgColor="transparent" fgColor="#00e0ff" />
          </div>
          <p className="mt-4 text-sm text-slate-300">Document ID: {data.id}</p>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <p className="text-sm text-slate-400">Version timeline</p>
          <div className="mt-4 space-y-4">
            {data.versions?.map((version) => (
              <div key={version.version || version.versionNumber} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-semibold">{version.version || `v${version.versionNumber}`}</p>
                  <p className="text-xs text-slate-400">{version.date || (version.timestamp ? new Date(version.timestamp).toLocaleString() : '')}</p>
                </div>
                <p className="text-xs text-slate-400">{version.author}</p>
                <p className="max-w-sm break-all font-mono text-xs text-slate-300">{version.hash}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-400">Merkle root</p>
          <div className="mt-4 flex h-48 items-center justify-center rounded-3xl border border-dashed border-emerald-400/40 bg-emerald-500/5 p-4 text-center text-xs text-emerald-200">
            {data.hashes?.merkleRoot}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default DocumentDetails;
