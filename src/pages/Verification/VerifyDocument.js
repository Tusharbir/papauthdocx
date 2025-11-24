import { useState, useRef } from 'react';
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
  
  // Refs for file inputs
  const fileInputRef = useRef(null);
  const qrInputRef = useRef(null);
  
  const [docId, setDocId] = useState('');
  const [file, setFile] = useState(null);
  const [hashes, setHashes] = useState(null);
  const [hashing, setHashing] = useState(false);
  const [showROISelector, setShowROISelector] = useState(false);
  const [pdfCanvas, setPdfCanvas] = useState(null);
  const [verificationMode, setVerificationMode] = useState('file'); // 'file', 'manual', or 'qr'
  const [manualHash, setManualHash] = useState('');
  // Only version hash is needed for manual entry
  const [qrData, setQrData] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  
  // Handle mode change and reset relevant state
  const handleModeChange = (mode) => {
    setVerificationMode(mode);
    // Clear ALL state when switching modes for proper isolation
    setFile(null);
    setHashes(null);
    setQrImage(null);
    setQrData(null);
    setManualHash('');
    setDocId('');
    setShowROISelector(false);
    setPdfCanvas(null);
    mutation.reset(); // Clear previous results

    // Clear file input elements
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (qrInputRef.current) qrInputRef.current.value = '';
  };
  
  // Use authenticated API if logged in, public API otherwise
  const mutation = useMutation({
    mutationFn: (payload) => {
      // QR mode, manual mode, or file mode with QR data always use public API (supports versionHash)
      if (verificationMode === 'qr' || verificationMode === 'manual' || payload.versionHash) {
        // Always flatten and sanitize hashes for public API
        if (payload.hashes) {
          const h = payload.hashes;
          payload.textHash = typeof h.textHash === 'string' ? h.textHash : (h.textHash ? String(h.textHash) : '');
          payload.imageHash = typeof h.imageHash === 'string' ? h.imageHash : (h.imageHash ? String(h.imageHash) : '');
          payload.signatureHash = typeof h.signatureHash === 'string' ? h.signatureHash : (h.signatureHash ? String(h.signatureHash) : '');
          payload.stampHash = typeof h.stampHash === 'string' ? h.stampHash : (h.stampHash ? String(h.stampHash) : '');
          // Remove hashes object to avoid sending nested
          delete payload.hashes;
        }
        // If any hash fields are still boolean/undefined, sanitize them
        payload.textHash = typeof payload.textHash === 'string' ? payload.textHash : (payload.textHash ? String(payload.textHash) : '');
        payload.imageHash = typeof payload.imageHash === 'string' ? payload.imageHash : (payload.imageHash ? String(payload.imageHash) : '');
        payload.signatureHash = typeof payload.signatureHash === 'string' ? payload.signatureHash : (payload.signatureHash ? String(payload.signatureHash) : '');
        payload.stampHash = typeof payload.stampHash === 'string' ? payload.stampHash : (payload.stampHash ? String(payload.stampHash) : '');
        return publicApi.verify(payload);
      }
      // File mode with hashes uses authenticated API if logged in (requires hashes object)
      if (isAuthenticated) {
        return verificationApi.verifyHashes(payload);
      } else {
        return publicApi.verify(payload);
      }
    },
    onSuccess: (data) => {
      if (isAuthenticated && verificationMode === 'file') {
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
    setQrData(null); // Clear any previous QR data
    
    try {
      // First, try to detect QR code in the file
      const qrDetected = await tryDetectQRInFile(uploaded);
      if (qrDetected) {
        enqueueSnackbar('QR code detected in file! You can verify using the QR data or continue with hash extraction.', { variant: 'info' });
      }
      
      // Then extract text and image hashes
      const extractedHashes = await extractAllHashes(uploaded, null, null);
      setHashes(extractedHashes);
      
      // Only try to render PDF canvas if it's a PDF file
      if (uploaded.type === 'application/pdf') {
        try {
          const canvas = await renderPDFToCanvas(uploaded);
          setPdfCanvas(canvas);
          // Show ROI selector modal for PDFs
          setShowROISelector(true);
          enqueueSnackbar('Hashes extracted. Select signature/stamp regions if needed.', { variant: 'info' });
        } catch (pdfError) {
          console.error('PDF rendering error:', pdfError);
          enqueueSnackbar('Hashes extracted successfully.', { variant: 'success' });
        }
      } else {
        // For images, hashes are already extracted
        enqueueSnackbar('Hashes extracted successfully from image.', { variant: 'success' });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Unable to extract hashes from file.', { variant: 'error' });
      setHashes(null);
    } finally {
      setHashing(false);
    }
  };

  // Helper function to try detecting QR code in uploaded file
  const tryDetectQRInFile = async (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Try multiple scales
          const scales = [1, 2, 0.5];
          let code = null;
          
            for (const scale of scales) {
            const width = img.width * scale;
            const height = img.height * scale;
            canvas.width = width;
            canvas.height = height;
            
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            const imageData = ctx.getImageData(0, 0, width, height);
            code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "attemptBoth"
            });
            
            if (code) {
              console.log(`QR detected in file at scale ${scale}x`);
              break;
            }
          }

          if (code) {
            const urlMatch = code.data.match(/papdocauthx:\/\/([^/]+)\/(.+)/);
            if (urlMatch) {
              const [, scannedDocId, versionHash] = urlMatch;
              setQrData({ docId: scannedDocId, versionHash });
              setDocId(scannedDocId);
              resolve(true);
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        };
        img.onerror = () => resolve(false);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(false);
      reader.readAsDataURL(file);
    });
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
          
          // Try multiple scales to improve detection for screenshots
          const scales = [1, 2, 0.5];
          let code = null;
          
          for (const scale of scales) {
            const width = img.width * scale;
            const height = img.height * scale;
            canvas.width = width;
            canvas.height = height;
            
            // Clear and redraw at new scale
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            
            // Apply slight contrast enhancement for better QR detection
            const imageData = ctx.getImageData(0, 0, width, height);
            
            // Try to decode QR with inverted colors option
            code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "attemptBoth"
            });
            
            if (code) {
            console.log(`QR detected at scale ${scale}x`);
              break;
            }
          }

          if (code) {
            console.log('QR code scan success');
            console.log('Full QR data:', code.data);
            console.log('Data length:', code.data.length);
            console.log('Data type:', typeof code.data);
            
            // Try URL format first: papdocauthx://docId/versionHash
            const urlMatch = code.data.match(/papdocauthx:\/\/([^/]+)\/(.+)/);
            
            if (urlMatch) {
              const [, scannedDocId, versionHash] = urlMatch;
              console.log('Matched URL format');
              console.log('  - DocId:', scannedDocId);
              console.log('  - Hash:', versionHash);
              console.log('  - Hash length:', versionHash.length);
              setDocId(scannedDocId);
              setManualHash(versionHash);
              setQrData({ docId: scannedDocId, versionHash });
              enqueueSnackbar('QR code decoded successfully!', { variant: 'success' });
            } else {
              console.log('URL format match failed');
              console.log('Expected format: papdocauthx://DOC_ID/VERSION_HASH');
              console.log('Got:', code.data);
              
              // Try JSON format as fallback
              try {
                console.log('Trying JSON parse...');
                const parsed = JSON.parse(code.data);
                console.log('Parsed JSON:', parsed);
                if (parsed.docId && parsed.versionHash) {
                  setDocId(parsed.docId);
                  setManualHash(parsed.versionHash);
                  setQrData({ docId: parsed.docId, versionHash: parsed.versionHash });
                  enqueueSnackbar('QR code decoded successfully!', { variant: 'success' });
                } else {
                  console.error('JSON missing required fields:', parsed);
                  enqueueSnackbar(`Invalid QR: ${code.data.substring(0, 40)}... Expected PapDocAuthX format`, { variant: 'error' });
                }
              } catch (e) {
                console.error('QR decode error:', e, 'Raw data:', code.data);
                enqueueSnackbar(`Not a PapDocAuthX QR. Found: "${code.data.substring(0, 50)}..."`, { variant: 'error' });
              }
            }
          } else {
              console.log('QR code detection failed at all scales');
            enqueueSnackbar('No QR code detected. Try: 1) Download QR directly (not screenshot) 2) Use Manual Entry mode with the QR data text 3) Ensure good image quality', { variant: 'warning' });
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
    
    if (verificationMode === 'qr') {
      // QR mode: use decoded QR data (docId + versionHash)
      if (!qrData) {
        enqueueSnackbar('Upload a QR code image first.', { variant: 'warning' });
        return;
      }
      console.log('Submitting QR verification:', { docId: qrData.docId, versionHash: qrData.versionHash });
      mutation.mutate({ docId: qrData.docId, versionHash: qrData.versionHash });
    } else if (verificationMode === 'manual') {
      // Manual mode: user enters docId and version hash only
      if (!docId || !manualHash) {
        enqueueSnackbar('Provide document ID and version hash.', { variant: 'warning' });
        return;
      }
      mutation.mutate({ docId, versionHash: manualHash });
    } else {
      // File mode: can verify with QR data OR extracted hashes
      if (qrData) {
        // If QR was detected in file, offer to use that
        console.log('File contains QR data, verifying with QR:', qrData);
        mutation.mutate({ docId: qrData.docId, versionHash: qrData.versionHash });
      } else if (docId && hashes) {
        // Sanitize hashes: ensure all values are strings (never boolean/undefined)
        const safeHashes = {
          textHash: typeof hashes.textHash === 'string' ? hashes.textHash : (hashes.textHash ? String(hashes.textHash) : ''),
          imageHash: typeof hashes.imageHash === 'string' ? hashes.imageHash : (hashes.imageHash ? String(hashes.imageHash) : ''),
          signatureHash: typeof hashes.signatureHash === 'string' ? hashes.signatureHash : (hashes.signatureHash ? String(hashes.signatureHash) : ''),
          stampHash: typeof hashes.stampHash === 'string' ? hashes.stampHash : (hashes.stampHash ? String(hashes.stampHash) : ''),
          merkleRoot: typeof hashes.merkleRoot === 'string' ? hashes.merkleRoot : (hashes.merkleRoot ? String(hashes.merkleRoot) : ''),
        };
        mutation.mutate({ docId, hashes: safeHashes });
      } else {
        enqueueSnackbar('Provide a document ID and select a file.', { variant: 'warning' });
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
          <p className="mt-2 text-slate-300/80">Run multi-modal cryptographic comparisons across PapDocAuthX.</p>
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
          {/* Show Document ID field only when needed */}
          {verificationMode !== 'qr' && !(verificationMode === 'file' && qrData) && (
            <Input
              label="Document ID"
              required
              placeholder="DOC-2024-001"
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              helperText="Enter the document ID you want to verify"
              containerClassName="mb-5"
            />
          )}
          
          {verificationMode === 'qr' ? (
            <div className="space-y-4">
              <label className="text-sm font-semibold">
                Upload QR Code Image <span className="text-rose-400">*</span>
              </label>
              <input
                ref={qrInputRef}
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
                    <span className="text-slate-500">Document ID:</span> <strong>{qrData.docId}</strong>
                  </p>
                  <p className="text-xs font-mono text-slate-300 break-all">
                    <span className="text-slate-500">Version Hash:</span> {qrData.versionHash}
                  </p>
                  <p className="text-xs text-green-400 mt-2">
                    Ready to verify - click the Verify button below
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
                ref={fileInputRef}
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
              {qrData && verificationMode === 'file' && (
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-2 mt-3">
                  <p className="text-sm font-semibold text-blue-400">🎯 QR Code Found in File!</p>
                  <p className="text-xs text-slate-300">
                    <span className="text-slate-500">Document ID:</span> <strong>{qrData.docId}</strong>
                  </p>
                  <p className="text-xs font-mono text-slate-300 break-all">
                    <span className="text-slate-500">Version Hash:</span> {qrData.versionHash}
                  </p>
                  <p className="text-xs text-blue-400 mt-2">
                    You can verify using the QR data or continue with hash extraction
                  </p>
                </div>
              )}
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
    <div className={isAuthenticated ? "" : "min-h-screen bg-slate-950 text-white"}>
      {isAuthenticated ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
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
      <Modal open={showROISelector} onClose={handleSkipROI} size="full" maxHeight="80vh">
        <div className="flex h-full flex-col space-y-4">
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
