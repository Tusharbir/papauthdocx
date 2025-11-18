import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import { publicApi } from '../../api/publicApi';

const statusTone = {
  APPROVED: 'success',
  REVOKED: 'danger',
  'NOT FOUND': 'warning',
};

const statusDescriptions = {
  APPROVED: 'All hashes match the PapDocAuthX+ ledger. Document is authentic.',
  REVOKED: 'This version was revoked. Contact the issuer for the latest copy.',
  'NOT FOUND': 'No record exists for the provided ID/hash combination.',
};

const PublicVerifyPage = () => {
  const [form, setForm] = useState({ docId: '', versionHash: '' });
  const mutation = useMutation({
    mutationFn: publicApi.verify,
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.docId || !form.versionHash) return;
    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm uppercase tracking-[0.4em] text-blue-400">Public Verification</p>
          <h1 className="mt-2 text-4xl font-semibold">Check a document&apos;s cryptographic status</h1>
          <p className="mt-3 text-slate-300/80">Provide the Document ID and version hash to verify across the PapDocAuthX+ trust fabric.</p>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <Card className="p-8">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <label className="block text-sm font-semibold text-white">Document ID</label>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-blue-400"
                  placeholder="DOC-2024-001"
                  value={form.docId}
                  onChange={(e) => setForm((prev) => ({ ...prev, docId: e.target.value }))}
                />
                <label className="block text-sm font-semibold text-white">Version hash</label>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm outline-none focus:border-blue-400"
                  placeholder="0x4be52cf2d09570a3"
                  value={form.versionHash}
                  onChange={(e) => setForm((prev) => ({ ...prev, versionHash: e.target.value }))}
                />
                <Button type="submit" className="w-full">
                  Verify document
                </Button>
              </form>
            </Card>
            <Card className="p-8 space-y-4">
              {!mutation.data && mutation.isIdle && (
                <div className="text-sm text-slate-300">
                  <p className="font-semibold text-white">Awaiting lookup</p>
                  <p className="mt-2 text-slate-400">
                    Status will appear here once the verification service completes its audit chain traversal.
                  </p>
                </div>
              )}
              {mutation.isPending && <Loader label="Verifying" />}
              {mutation.isError && (
                <p className="text-sm text-rose-300">{mutation.error?.response?.data?.message || 'Unable to verify document.'}</p>
              )}
              {mutation.data && !mutation.isPending && !mutation.isError && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">Workflow status</p>
                    <Badge tone={statusTone[mutation.data.status] || 'info'}>{mutation.data.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-400">
                    {statusDescriptions[mutation.data.status] || 'Status returned by verification service.'}
                  </p>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm">
                    <p className="text-slate-400">Document ID</p>
                    <p className="font-mono text-white">{mutation.data.docId || form.docId}</p>
                    <p className="mt-3 text-slate-400">Version hash</p>
                    <p className="font-mono text-white break-all">{mutation.data.versionHash || form.versionHash}</p>
                  </div>
                  {mutation.data.verifiedAt && (
                    <p className="text-xs text-slate-500">Verified at {new Date(mutation.data.verifiedAt).toLocaleString()}</p>
                  )}
                </div>
              )}
            </Card>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicVerifyPage;
