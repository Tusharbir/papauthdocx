import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { verificationApi } from '../../api/verificationApi';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const defaultIndicators = [
  { label: 'Structure hash', description: 'Layout, fonts and spacing fingerprint.', match: null },
  { label: 'Content hash', description: 'Normalized text content signature.', match: null },
  { label: 'Signature hash', description: 'Ink, stamps and ROIs.', match: null },
  { label: 'Merkle proof', description: 'Version lineage validation.', match: null },
];

const VerifyDocument = () => {
  const [payload, setPayload] = useState({ documentId: '', hash: '' });
  const { enqueueSnackbar } = useSnackbar();

  const mutation = useMutation({
    mutationFn: verificationApi.verifyHashes,
    onSuccess: () => enqueueSnackbar('Hashes analyzed.', { variant: 'success' }),
    onError: () => enqueueSnackbar('Verification failed.', { variant: 'error' }),
  });

  const handleExtract = () => {
    const simulatedHash = `0x${`${Math.random().toString(16).slice(2, 10)}${Date.now().toString(16)}`.slice(0, 16)}`;
    setPayload((prev) => ({ ...prev, hash: simulatedHash }));
    enqueueSnackbar('Local hashing complete.', { variant: 'info' });
  };

  const handleVerify = () => {
    if (!payload.documentId || !payload.hash) {
      enqueueSnackbar('Provide a document ID and hash to verify.', { variant: 'warning' });
      return;
    }
    mutation.mutate(payload);
  };

  const indicatorMeta = useMemo(() => {
    if (!mutation.data?.indicators) return defaultIndicators;
    return mutation.data.indicators.map((indicator) => ({
      ...indicator,
      description:
        defaultIndicators.find((item) => item.label === indicator.label)?.description ??
        'Automated comparison signal.',
    }));
  }, [mutation.data]);

  const statusColor =
    mutation.data?.status === 'verified'
      ? 'text-emerald-300 bg-emerald-400/10 border-emerald-300/30'
      : mutation.data?.status === 'mismatch'
      ? 'text-rose-300 bg-rose-400/10 border-rose-300/30'
      : 'text-slate-200 bg-white/5 border-white/10';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />
      <main className="max-w-[1400px] mx-auto px-6 py-16">
        <motion.section
          className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-[1px]">
            <div className="rounded-3xl bg-slate-950/80 p-8 space-y-6">
              <div>
                <p className="text-sm text-emerald-300 uppercase tracking-[0.35em] mb-3">Verification</p>
                <h1 className="text-3xl font-semibold">AI-assisted intake</h1>
                <p className="text-slate-300/80 text-sm mt-2">
                  Upload locally, auto generate hashes, and send a comparison request without exposing document content.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExtract}
                className="w-full rounded-2xl border border-white/15 py-3 text-sm font-semibold flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 transition"
              >
                <span>Upload & auto extract hash</span>
                <span className="text-emerald-300">↺</span>
              </button>
              <label className="text-xs uppercase tracking-[0.25em] text-slate-400">Document ID</label>
              <input
                type="text"
                value={payload.documentId}
                onChange={(e) => setPayload((prev) => ({ ...prev, documentId: e.target.value }))}
                className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                placeholder="DOC-2024-001"
              />
              <label className="text-xs uppercase tracking-[0.25em] text-slate-400">Extracted hash</label>
              <input
                type="text"
                value={payload.hash}
                readOnly
                className="w-full rounded-2xl bg-white/5 border border-dashed border-white/10 px-4 py-3 font-mono text-sm text-slate-200"
                placeholder="Run extraction first"
              />
              <button
                type="button"
                onClick={handleVerify}
                disabled={!payload.hash || mutation.isPending}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-emerald-400 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? 'Verifying hash…' : 'Compare with backend'}
              </button>
              <p className="text-[12px] text-slate-400">
                Hashing runs inside the browser. Only cryptographic fingerprints leave the device.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Result surface</p>
                <h2 className="text-2xl font-semibold">Integrity panel</h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs border ${statusColor}`}>
                {mutation.data?.status ? mutation.data.status : 'Awaiting input'}
              </span>
            </div>

            <div className="grid gap-4">
              {indicatorMeta.map((indicator) => {
                const style =
                  indicator.match === null
                    ? 'border-white/10 bg-white/5 text-slate-200'
                    : indicator.match
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                    : 'border-rose-400/30 bg-rose-500/10 text-rose-200';
                const labelText =
                  indicator.match === null ? 'waiting' : indicator.match ? 'match' : 'mismatch';
                return (
                  <motion.div
                    key={indicator.label}
                    whileHover={{ y: -4 }}
                    className={`rounded-2xl border px-5 py-4 ${style}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold">{indicator.label}</p>
                      <span className="text-xs uppercase tracking-[0.4em]">
                        {labelText}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200/80">{indicator.description}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 space-y-2 font-mono text-xs text-slate-300">
              <p>
                Backend hash:{' '}
                <span className="text-slate-50">
                  {mutation.data?.backendHash || '— awaiting verification —'}
                </span>
              </p>
              <p>
                Provided hash:{' '}
                <span className="text-slate-50">
                  {mutation.data?.providedHash || payload.hash || '—'}
                </span>
              </p>
              {mutation.data?.matchScore && (
                <p>
                  Match score:{' '}
                  <span className="text-emerald-300">{mutation.data.matchScore}%</span>
                </p>
              )}
            </div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyDocument;

