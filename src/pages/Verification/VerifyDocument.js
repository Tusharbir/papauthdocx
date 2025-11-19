import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Topbar from '../../components/layout/Topbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import VerificationResultCard from '../../components/verification/VerificationResultCard';
import ROISelector from '../../components/admin/ROISelector';
import { verificationApi } from '../../api/verificationApi';
import { publicApi } from '../../api/publicApi';
import { extractAllHashes, renderPDFToCanvas } from '../../utils/hashExtraction';
import useAuthStore from '../../store/authStore';

const VerifyDocument = () => {
  const { enqueueSnackbar } = useSnackbar();
  const isAuthenticated = useAuthStore((state) => !!state.token);
  
  const [docId, setDocId] = useState('');
  const [file, setFile] = useState(null);
  const [hashes, setHashes] = useState(null);
  const [hashing, setHashing] = useState(false);
  const [showROISelector, setShowROISelector] = useState(false);
  const [pdfCanvas, setPdfCanvas] = useState(null);
  const [verificationMode, setVerificationMode] = useState('file'); // 'file' or 'manual'
  const [manualHash, setManualHash] = useState('');
  
  // Use authenticated API if logged in, public API otherwise
  const mutation = useMutation({
    mutationFn: (payload) => {
      if (isAuthenticated) {
        return verificationApi.verifyHashes(payload);
      } else {
        return publicApi.verify(payload);
      }
    },
    onSuccess: (data) => {
      if (isAuthenticated) {
        enqueueSnackbar('Verification completed and logged to your account.', { variant: 'success' });
      } else {
        enqueueSnackbar('Verification completed.', { variant: 'success' });
      }
    },
    onError: () => enqueueSnackbar('Verification failed.', { variant: 'error' }),
  });

  const handleFileChange = async (event) => {
    const uploaded = event.target.files?.[0];
    if (!uploaded) return;
    
    setFile(uploaded);
    setHashing(true);
    setHashes(null);
    
    try {
      // First extract text and image hashes
      const extractedHashes = await extractAllHashes(uploaded, null, null);
      setHashes(extractedHashes);
      
      // Render PDF to canvas for ROI selection
      const canvas = await renderPDFToCanvas(uploaded);
      setPdfCanvas(canvas);
      
      // Show ROI selector modal
      setShowROISelector(true);
      
      enqueueSnackbar('Hashes extracted. Select signature/stamp regions if needed.', { variant: 'info' });
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to extract hashes from file.', { variant: 'error' });
      setHashes(null);
    } finally {
      setHashing(false);
    }
  };

  const handleROIComplete = async (signatureBox, stampBox) => {
    setShowROISelector(false);
    
    if (file && (signatureBox || stampBox)) {
      setHashing(true);
      try {
        const extractedHashes = await extractAllHashes(file, signatureBox, stampBox);
        setHashes(extractedHashes);
        enqueueSnackbar('Signature/stamp hashes extracted.', { variant: 'success' });
      } catch (error) {
        console.error(error);
        enqueueSnackbar('Failed to extract ROI hashes.', { variant: 'error' });
      } finally {
        setHashing(false);
      }
    }
  };

  const handleSkipROI = () => {
    setShowROISelector(false);
    enqueueSnackbar('Skipped signature/stamp selection.', { variant: 'info' });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (verificationMode === 'manual') {
      if (!docId || !manualHash) {
        enqueueSnackbar('Provide document ID and version hash.', { variant: 'warning' });
        return;
      }
      mutation.mutate({ docId, versionHash: manualHash });
    } else {
      if (!docId || !hashes) {
        enqueueSnackbar('Provide a document ID and select a file.', { variant: 'warning' });
        return;
      }
      if (isAuthenticated) {
        mutation.mutate({ documentId: docId, ...hashes });
      } else {
        mutation.mutate({ docId, ...hashes });
      }
    }
  };

  // Render the verification form/content (shared between auth and public views)
  const renderVerificationContent = () => (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-blue-400">Document Verification</p>
          <h1 className="mt-2 text-4xl font-semibold">Verify document authenticity</h1>
          <p className="mt-2 text-slate-300/80">Run multi-modal cryptographic comparisons across PapDocAuthX+.</p>
        </div>
        {isAuthenticated && (
          <div className="rounded-full px-4 py-2 bg-green-500/20 border border-green-400/30 text-green-400 text-xs font-medium">
            ✓ Logged In - Verification will be tracked
          </div>
        )}
        {!isAuthenticated && (
          <div className="rounded-full px-4 py-2 bg-slate-700/20 border border-slate-600/30 text-slate-400 text-xs">
            Public Mode - No tracking
          </div>
        )}
      </div>
      
      {/* Mode Toggle */}
      <div className="flex gap-3 mb-10">
        <button
          type="button"
          onClick={() => setVerificationMode('file')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            verificationMode === 'file'
              ? 'bg-blue-500 text-white'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          Select Document File
        </button>
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
      </div>
      
      <form className="grid gap-8 lg:grid-cols-2" onSubmit={handleSubmit}>
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
          
          {verificationMode === 'manual' ? (
            <div className="space-y-2">
              <label className="text-sm font-semibold">Version Hash</label>
              <input
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm"
                placeholder="0x4be52cf2d09570a3..."
                value={manualHash}
                onChange={(e) => setManualHash(e.target.value)}
              />
              <p className="text-xs text-slate-400">Enter the version hash from the document or QR code</p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-semibold">Select document for hash extraction</label>
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
              {hashing && <Loader label="Extracting cryptographic hashes..." />}
            </div>
          )}
          
          {hashes && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs space-y-2">
              <p className="font-mono break-all">
                <span className="text-slate-500">textHash:</span> <span className="text-green-400">{hashes.textHash.slice(0, 32)}...</span>
              </p>
              <p className="font-mono break-all">
                <span className="text-slate-500">imageHash:</span> <span className="text-green-400">{hashes.imageHash.slice(0, 32)}...</span>
              </p>
              <p className="font-mono break-all">
                <span className="text-slate-500">signatureHash:</span> <span className={hashes.signatureHash ? "text-green-400" : "text-slate-600"}>{hashes.signatureHash ? `${hashes.signatureHash.slice(0, 32)}...` : 'Not selected'}</span>
              </p>
              <p className="font-mono break-all">
                <span className="text-slate-500">stampHash:</span> <span className={hashes.stampHash ? "text-green-400" : "text-slate-600"}>{hashes.stampHash ? `${hashes.stampHash.slice(0, 32)}...` : 'Not selected'}</span>
              </p>
              <p className="font-mono break-all">
                <span className="text-slate-500">merkleRoot:</span> <span className="text-blue-400 font-semibold">{hashes.merkleRoot.slice(0, 32)}...</span>
              </p>
            </div>
          )}
          {mutation.isError && <p className="text-xs text-rose-300">{mutation.error?.response?.data?.message || 'Verification failed'}</p>}
          <Button type="submit" className="w-full" disabled={mutation.isPending || hashing}>
            {mutation.isPending ? 'Verifying…' : 'Compare with backend'}
          </Button>
        </Card>
        <VerificationResultCard result={mutation.data} />
      </form>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {isAuthenticated ? (
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto bg-slate-950 px-6 py-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {renderVerificationContent()}
              </motion.div>
            </main>
          </div>
        </div>
      ) : (
        <>
          <Navbar />
          <main className="mx-auto max-w-6xl px-6 py-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {renderVerificationContent()}
            </motion.div>
          </main>
          <Footer />
        </>
      )}
      
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

export default VerifyDocument;
