import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import VerificationResultCard from '../../components/verification/VerificationResultCard';
import { verificationApi } from '../../api/verificationApi';

const VerifyDocument = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [docId, setDocId] = useState('');
  const [file, setFile] = useState(null);
  const [hashes, setHashes] = useState(null);
  const [hashing, setHashing] = useState(false);
  const mutation = useMutation({
    mutationFn: (payload) => verificationApi.verifyHashes(payload),
    onSuccess: () => enqueueSnackbar('Verification completed.', { variant: 'success' }),
    onError: () => enqueueSnackbar('Verification failed.', { variant: 'error' }),
  });

  const computeHashHex = async (selectedFile) => {
    const arrayBuffer = await selectedFile.arrayBuffer();
    const digest = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleFileChange = async (event) => {
    const uploaded = event.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);
    setHashing(true);
    try {
      const digest = await computeHashHex(uploaded);
      const normalizedHash = `0x${digest}`;
      setHashes({
        textHash: normalizedHash,
        imageHash: normalizedHash,
        signatureHash: normalizedHash,
        stampHash: normalizedHash,
      });
      enqueueSnackbar('Hashes extracted from file.', { variant: 'info' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to read file.', { variant: 'error' });
      setHashes(null);
    } finally {
      setHashing(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!docId || !hashes) {
      enqueueSnackbar('Provide a document ID and upload a file.', { variant: 'warning' });
      return;
    }
    mutation.mutate({ documentId: docId, ...hashes });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm uppercase tracking-[0.4em] text-blue-400">Manual crypto-check</p>
          <h1 className="mt-2 text-4xl font-semibold">Verify document hashes</h1>
          <p className="mt-2 text-slate-300/80">Run multi-modal comparisons (text, layout, signature, stamp) across PapDocAuthX+.</p>
          <form className="mt-10 grid gap-8 lg:grid-cols-2" onSubmit={handleSubmit}>
            <Card className="space-y-5 p-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Document ID</label>
                <input
                  required
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  placeholder="DOC-2024-001"
                  value={docId}
                  onChange={(e) => setDocId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Upload document</label>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  className="w-full rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm"
                  onChange={handleFileChange}
                />
                {file && (
                  <p className="text-xs text-slate-400">
                    {file.name} • {(file.size / 1024).toFixed(1)} KB
                  </p>
                )}
                {hashing && <p className="text-xs text-blue-300">Extracting hashes…</p>}
              </div>
              {hashes && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs">
                  {Object.entries(hashes).map(([key, value]) => (
                    <p key={key} className="break-all font-mono">
                      <span className="text-slate-500">{key}:</span> {value}
                    </p>
                  ))}
                </div>
              )}
              {mutation.isError && <p className="text-xs text-rose-300">{mutation.error?.response?.data?.message || 'Verification failed'}</p>}
              <Button type="submit" className="w-full" disabled={mutation.isPending || hashing}>
                {mutation.isPending ? 'Verifying…' : 'Compare with backend'}
              </Button>
            </Card>
            <VerificationResultCard result={mutation.data} />
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default VerifyDocument;
