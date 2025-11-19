import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import jsQR from 'jsqr';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
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
  const [verificationMode, setVerificationMode] = useState('file'); // 'file', 'manual', or 'qr'
  const [manualHash, setManualHash] = useState('');
  const [qrData, setQrData] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  
  // Handle mode change and reset relevant state
  const handleModeChange = (mode) => {
    setVerificationMode(mode);
    // Clear mode-specific state
    if (mode !== 'file') {
      setFile(null);
      setHashes(null);
    }
    if (mode !== 'qr') {
      setQrImage(null);
      setQrData(null);
    }
    if (mode !== 'manual') {
      setManualHash('');
    }
    // Clear shared state
    if (mode === 'qr') {
      // Keep docId for QR mode as it gets auto-filled
    } else {
      setDocId('');
    }
  };
  
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
    
    // Validate file size (5MB max)
    const maxSizeMB = parseInt(process.env.REACT_APP_MAX_FILE_SIZE_MB || '5');
    const maxSize = maxSizeMB * 1024 * 1024;
    if (uploaded.size > maxSize) {
      enqueueSnackbar(`File size must be less than ${maxSizeMB}MB`, { variant: 'error' });
      event.target.value = ''; // Clear the input
      return;
    }
    
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

  const handleQRImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSizeMB = parseInt(process.env.REACT_APP_MAX_FILE_SIZE_MB || '5');
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      enqueueSnackbar(`QR image file size must be less than ${maxSizeMB}MB`, { variant: 'error' });
      event.target.value = ''; // Clear the input
      return;
    }

    setQrImage(file);
    setQrData(null);
    setDocId(''); // Clear previous docId
    setManualHash(''); // Clear previous hash

    try {
      // Read the image file
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          // Create canvas to extract image data
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Get image data and decode QR
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            // QR data format: papdocauthx://docId/versionHash
            const match = code.data.match(/papdocauthx:\/\/([^/]+)\/(.+)/);
            
            if (match) {
              const [, scannedDocId, versionHash] = match;
              setDocId(scannedDocId);
              setManualHash(versionHash);
              setQrData({ docId: scannedDocId, versionHash });
              enqueueSnackbar('QR code decoded successfully!', { variant: 'success' });
            } else {
              enqueueSnackbar('Invalid QR code format. Expected PapDocAuthX QR code.', { variant: 'error' });
            }
          } else {
            enqueueSnackbar('No QR code found in image. Please upload a clear QR code image.', { variant: 'warning' });
          }
        };
        img.src = e.target.result;
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Failed to process QR image', { variant: 'error' });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (verificationMode === 'manual' || verificationMode === 'qr') {
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
          onClick={() => handleModeChange('file')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            verificationMode === 'file'
              ? 'bg-blue-500 text-white'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          📄 Upload File
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('qr')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            verificationMode === 'qr'
              ? 'bg-blue-500 text-white'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          🖼️ Upload QR Code
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('manual')}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
            verificationMode === 'manual'
              ? 'bg-blue-500 text-white'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
          }`}
        >
          ⌨️ Manual Entry
        </button>
      </div>
      
      <form className="grid gap-8 lg:grid-cols-2" onSubmit={handleSubmit}>
        <Card className="space-y-5 p-6">
          <Input
            label="Document ID"
            required
            placeholder="DOC-2024-001"
            value={docId}
            onChange={(e) => setDocId(e.target.value)}
            readOnly={verificationMode === 'qr' && qrData}
            title={verificationMode === 'qr' && qrData ? 'Auto-filled from QR code' : ''}
            helperText={verificationMode === 'qr' && qrData ? '✓ Auto-filled from QR code' : ''}
            containerClassName="mb-5"
          />
          
          {verificationMode === 'qr' ? (
            <div className="space-y-4">
              <label className="text-sm font-semibold">
                Upload QR Code Image <span className="text-rose-400">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                required
                className="w-full rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm transition-colors focus:border-blue-400"
                onChange={handleQRImageUpload}
              />
              {qrImage && (
                <p className="text-xs text-slate-400">
                  {qrImage.name} • {(qrImage.size / 1024).toFixed(1)} KB
                </p>
              )}
              <p className="text-xs text-slate-400">
                Upload a screenshot or image containing the document's QR code • Max {process.env.REACT_APP_MAX_FILE_SIZE_MB || 5}MB
              </p>
              {qrData && (
                <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 space-y-2">
                  <p className="text-sm font-semibold text-green-400">✓ QR Code Decoded</p>
                  <p className="text-xs text-slate-300">
                    <span className="text-slate-500">Document ID:</span> {qrData.docId}
                  </p>
                  <p className="text-xs font-mono text-slate-300 break-all">
                    <span className="text-slate-500">Version Hash:</span> {qrData.versionHash}
                  </p>
                </div>
              )}
            </div>
          ) : verificationMode === 'manual' ? (
            <Input
              label="Version Hash"
              required
              placeholder="0x4be52cf2d09570a3..."
              value={manualHash}
              onChange={(e) => setManualHash(e.target.value)}
              className="font-mono"
              helperText="Enter the version hash from the document or QR code"
            />
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-semibold">
                Select document for hash extraction <span className="text-rose-400">*</span>
              </label>
              <input
                type="file"
                accept="application/pdf,image/*"
                required
                className="w-full rounded-2xl border border-dashed border-white/20 bg-white/5 px-4 py-3 text-sm transition-colors focus:border-blue-400"
                onChange={handleFileChange}
              />
              {file && (
                <p className="text-xs text-slate-400">
                  {file.name} • {(file.size / 1024).toFixed(1)} KB
                </p>
              )}
              <p className="text-xs text-slate-400">
                PDF or Image files supported • Max {process.env.REACT_APP_MAX_FILE_SIZE_MB || 5}MB
              </p>
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
          <Button 
            type="submit" 
            className="w-full"
          >
            {mutation.isPending ? 'Verifying…' : hashing ? 'Processing…' : 'Verify'}
          </Button>
        </Card>
        <VerificationResultCard result={mutation.data} />
      </form>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {isAuthenticated ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {renderVerificationContent()}
        </motion.div>
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
