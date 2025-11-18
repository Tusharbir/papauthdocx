import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import HashInputGrid from '../../components/admin/HashInputGrid';
import VerificationResultCard from '../../components/verification/VerificationResultCard';
import { verificationApi } from '../../api/verificationApi';

const VerifyDocument = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [docId, setDocId] = useState('');
  const [hashes, setHashes] = useState({ textHash: '', imageHash: '', signatureHash: '', stampHash: '' });
  const mutation = useMutation({
    mutationFn: (payload) => verificationApi.verifyHashes(payload),
    onSuccess: () => enqueueSnackbar('Verification completed.', { variant: 'success' }),
    onError: () => enqueueSnackbar('Verification failed.', { variant: 'error' }),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
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
              <div>
                <p className="text-sm font-semibold">Multi-modal hashes</p>
                <HashInputGrid hashes={hashes} onChange={setHashes} wrap={false} />
              </div>
              {mutation.isError && <p className="text-xs text-rose-300">{mutation.error?.response?.data?.message || 'Verification failed'}</p>}
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
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
