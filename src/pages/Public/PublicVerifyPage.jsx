import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import ROISelector from '../../components/admin/ROISelector';
import { publicApi } from '../../api/publicApi';
import { extractAllHashes, renderPDFToCanvas } from '../../utils/hashExtraction';

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
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [hashes, setHashes] = useState(null);
  const [showROISelector, setShowROISelector] = useState(false);
  const [pdfCanvas, setPdfCanvas] = useState(null);
  const [verificationMode, setVerificationMode] = useState('manual'); // 'manual' or 'file'
  
  const mutation = useMutation({
    mutationFn: publicApi.verify,
  });

  const handleFileUpload = async (event) => {
    const uploaded = event.target.files?.[0];
    if (!uploaded) return;
    
    setFile(uploaded);
    setExtracting(true);
    setHashes(null);
    
    try {
      const extractedHashes = await extractAllHashes(uploaded, null, null);
      setHashes(extractedHashes);
      
      const canvas = await renderPDFToCanvas(uploaded);
      setPdfCanvas(canvas);
      
      setShowROISelector(true);
    } catch (error) {
      console.error('Hash extraction failed:', error);
    } finally {
      setExtracting(false);
    }
  };

  const handleROIComplete = async (signatureBox, stampBox) => {
    setShowROISelector(false);
    
    if (file && (signatureBox || stampBox)) {
      setExtracting(true);
      try {
        const extractedHashes = await extractAllHashes(file, signatureBox, stampBox);
        setHashes(extractedHashes);
      } catch (error) {
        console.error('ROI hash extraction failed:', error);
      } finally {
        setExtracting(false);
      }
    }
  };

  const handleSkipROI = () => {
    setShowROISelector(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (verificationMode === 'manual') {
      if (!form.docId || !form.versionHash) return;
      mutation.mutate(form);
    } else {
      // File-based verification
      if (!form.docId || !hashes) return;
      mutation.mutate({
        docId: form.docId,
        textHash: hashes.textHash,
        imageHash: hashes.imageHash,
        signatureHash: hashes.signatureHash,
        stampHash: hashes.stampHash,
        versionHash: hashes.merkleRoot // Use merkle root as version identifier
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm uppercase tracking-[0.4em] text-blue-400">Public Verification</p>
          <h1 className="mt-2 text-4xl font-semibold">Check a document&apos;s cryptographic status</h1>
          <p className="mt-3 text-slate-300/80">Provide the Document ID and version hash to verify across the PapDocAuthX+ trust fabric.</p>
          
          {/* Mode Toggle */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setVerificationMode('manual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                verificationMode === 'manual'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              Manual Hash Entry
            </button>
            <button
              type="button"
              onClick={() => setVerificationMode('file')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                verificationMode === 'file'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
            >
              Select Document
            </button>
          </div>
          
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
                
                {verificationMode === 'manual' ? (
                  <>
                    <label className="block text-sm font-semibold text-white">Version hash</label>
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm outline-none focus:border-blue-400"
                      placeholder="0x4be52cf2d09570a3"
                      value={form.versionHash}
                      onChange={(e) => setForm((prev) => ({ ...prev, versionHash: e.target.value }))}
                    />
                  </>
                ) : (
                  <>
                    <label className="block text-sm font-semibold text-white">Select document for verification</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="w-full rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm"
                      onChange={handleFileUpload}
                    />
                    {file && (
                      <p className="text-xs text-slate-400">
                        {file.name} • {(file.size / 1024).toFixed(1)} KB
                      </p>
                    )}
                    {extracting && <Loader label="Extracting hashes..." />}
                    {hashes && (
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs space-y-1">
                        <p className="font-mono text-green-400">✓ Hashes extracted</p>
                        <p className="font-mono text-slate-400">Merkle Root: {hashes.merkleRoot.slice(0, 32)}...</p>
                      </div>
                    )}
                  </>
                )}
                
                <Button type="submit" className="w-full" disabled={
                  mutation.isPending || 
                  extracting || 
                  (verificationMode === 'manual' ? (!form.docId || !form.versionHash) : (!form.docId || !hashes))
                }>
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
      
      {/* ROI Selector Modal */}
      <Modal open={showROISelector} onClose={handleSkipROI}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Select Signature & Stamp Regions (Optional)</h3>
          <p className="text-sm text-slate-400">
            Draw boxes around the signature and official stamp for enhanced verification.
          </p>
          
          {pdfCanvas && (
            <ROISelector
              canvas={pdfCanvas}
              onComplete={handleROIComplete}
              onSkip={handleSkipROI}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PublicVerifyPage;
