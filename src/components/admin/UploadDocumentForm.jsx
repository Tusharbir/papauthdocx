import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import Modal from '../ui/Modal';
import useUIStore from '../../store/uiStore';
import { extractAllHashes, renderPDFToCanvas } from '../../utils/hashExtraction';
import ROISelector from './ROISelector';

const UploadDocumentForm = ({ onSubmit, isSubmitting }) => {
  const [file, setFile] = useState(null);
  const [hashes, setHashes] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showROISelector, setShowROISelector] = useState(false);
  const [pdfCanvas, setPdfCanvas] = useState(null);
  const [signatureBox, setSignatureBox] = useState(null);
  const [stampBox, setStampBox] = useState(null);
  const [metadata, setMetadata] = useState({
    docId: '',
    type: 'DEGREE_CERTIFICATE',
    holderName: '',
    degreeTitle: '',
    issueDate: '',
    institution: ''
  });
  
  const mode = useUIStore((state) => state.mode);
  const inputClass =
    mode === 'dark'
      ? 'border-white/10 bg-white/5 text-white'
      : 'border-slate-300 bg-white text-slate-900';

  const onDrop = async (acceptedFiles) => {
    const pdfFile = acceptedFiles[0];
    if (!pdfFile) return;

    setFile(pdfFile);
    setError(null);
    setProcessing(true);
    setHashes(null);
    setSignatureBox(null);
    setStampBox(null);

    try {
      // First, extract text and image hashes only
      const extractedHashes = await extractAllHashes(pdfFile, null, null);
      
      setHashes(extractedHashes);
      
      // Auto-generate docId from filename if not set
      if (!metadata.docId) {
        const docId = `DOC_${Date.now()}_${pdfFile.name.replace(/\.[^/.]+$/, '').toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
        setMetadata(prev => ({ ...prev, docId }));
      }
      
      // Try to render PDF to canvas for ROI selection (optional feature)
      try {
        const canvas = await renderPDFToCanvas(pdfFile);
        setPdfCanvas(canvas);
        setShowROISelector(true);
      } catch (canvasErr) {
        console.warn('Could not render PDF for ROI selection:', canvasErr);
        // Continue without ROI selector - user can still upload
      }
    } catch (err) {
      console.error('Hash extraction error:', err);
      setError(err.message || 'Failed to extract document hashes. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleROIComplete = async (regions) => {
    const { signature, stamp } = regions || {};
    setSignatureBox(signature);
    setStampBox(stamp);
    setShowROISelector(false);
    
    // Re-extract hashes with ROI boxes only if user selected regions
    if (file && (signature || stamp)) {
      setProcessing(true);
      try {
        const extractedHashes = await extractAllHashes(file, signature, stamp);
        setHashes(extractedHashes);
      } catch (err) {
        console.error('ROI hash extraction error:', err);
        setError('Failed to extract signature/stamp hashes');
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleSkipROI = () => {
    setShowROISelector(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: (parseInt(process.env.REACT_APP_MAX_FILE_SIZE_MB || '5')) * 1024 * 1024,
    disabled: processing || isSubmitting,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      const maxSizeMB = process.env.REACT_APP_MAX_FILE_SIZE_MB || '5';
      if (rejection?.errors[0]?.code === 'file-too-large') {
        setError(`File size must be less than ${maxSizeMB}MB`);
      } else if (rejection?.errors[0]?.code === 'file-invalid-type') {
        setError('Only PDF files are accepted');
      } else {
        setError('File rejected. Please try another file.');
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    let errors = {};
    const docIdPattern = /^[A-Z0-9_-]+$/;
    if (!hashes || !file) {
      setError('Please upload a PDF document first');
      return;
    }
    if (!metadata.docId) {
      errors.docId = 'Document ID is required';
    } else if (metadata.docId.length < 5 || metadata.docId.length > 150) {
      errors.docId = 'Document ID must be 5-150 characters';
    } else if (!docIdPattern.test(metadata.docId)) {
      errors.docId = 'Document ID must contain only uppercase letters, numbers, underscores, and hyphens';
    }
    if (!metadata.holderName) {
      errors.holderName = 'Holder Name is required';
    }
    if (!metadata.issueDate) {
      errors.issueDate = 'Issue Date is required';
    }
    setFieldErrors(errors);
    setError(null);
    if (Object.keys(errors).length > 0) return;
    onSubmit({
      docId: metadata.docId,
      type: metadata.type,
      metadata: {
        holderName: metadata.holderName,
        degreeTitle: metadata.degreeTitle,
        issueDate: metadata.issueDate,
        institution: metadata.institution,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      },
      hashes: {
        textHash: hashes.textHash,
        imageHash: hashes.imageHash,
        signatureHash: hashes.signatureHash,
        stampHash: hashes.stampHash
      }
    });
  };

  return (
    <>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* File Upload Dropzone */}
        <Card className="p-8">
        <h3 className="text-lg font-semibold mb-4">1. Upload Document</h3>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
            isDragActive
              ? 'border-blue-400 bg-blue-400/10'
              : mode === 'dark'
              ? 'border-white/20 hover:border-blue-400/50 bg-white/5'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50'
          } ${(processing || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-3">
            <svg
              className="mx-auto h-12 w-12 text-blue-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            
            {isDragActive ? (
              <p className="text-blue-400 font-medium">Drop PDF here...</p>
            ) : (
              <>
                <p className="font-medium">
                  {file ? (
                    <span className="text-blue-400">✓ {file.name}</span>
                  ) : (
                    'Drop PDF here or click to select'
                  )}
                </p>
                <p className="text-sm text-slate-400">
                  Only PDF files • Max {process.env.REACT_APP_MAX_FILE_SIZE_MB || 5}MB • Zero-document-upload security
                </p>
              </>
            )}
          </div>
        </div>

        {processing && (
          <div className="mt-6">
            <Loader label="Extracting cryptographic hashes from document..." />
            <p className="text-xs text-slate-400 mt-2 text-center">
              🔒 This process happens entirely in your browser. The document never leaves your device.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <p className="text-sm text-rose-400">{error}</p>
          </div>
        )}

        {hashes && !processing && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <span className="text-sm font-medium text-green-400">✓ Hashes extracted successfully</span>
              {(signatureBox || stampBox) && (
                <span className="text-xs text-blue-400">
                  {signatureBox && stampBox ? '✓ Signature & Stamp' : signatureBox ? '✓ Signature only' : '✓ Stamp only'}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-400 mb-1">Text Hash (SHA-256)</p>
                <p className="text-white truncate">{hashes.textHash.slice(0, 32)}...</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-400 mb-1">Image Hash (SHA-256)</p>
                <p className="text-white truncate">{hashes.imageHash.slice(0, 32)}...</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-400 mb-1">Signature Hash</p>
                <p className="text-white truncate">
                  {hashes.signatureHash ? `${hashes.signatureHash.slice(0, 32)}...` : 'Not selected'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-400 mb-1">Stamp Hash</p>
                <p className="text-white truncate">
                  {hashes.stampHash ? `${hashes.stampHash.slice(0, 32)}...` : 'Not selected'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 md:col-span-2">
                <p className="text-slate-400 mb-1">Merkle Root</p>
                <p className="text-blue-400 truncate font-semibold">{hashes.merkleRoot.slice(0, 32)}...</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 md:col-span-2">
                <p className="text-slate-400 mb-1">Status</p>
                <p className="text-green-400">✓ Ready to upload</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Metadata Form */}
      {hashes && (
        <Card className="p-8">
          <h3 className="text-lg font-semibold mb-4">2. Document Metadata</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Document ID <span className="text-rose-400">*</span></label>
              <input
                required
                className={`w-full rounded-2xl px-4 py-3 text-sm ${inputClass}`}
                value={metadata.docId}
                onChange={(e) => setMetadata(prev => ({ ...prev, docId: e.target.value }))}
                placeholder="DOC_2024_001"
              />
              {fieldErrors.docId && (
                <div className="text-xs text-rose-400 mt-1">{fieldErrors.docId}</div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold">Document Type <span className="text-rose-400">*</span></label>
              <select
                className={`w-full rounded-2xl px-4 py-3 text-sm ${inputClass}`}
                value={metadata.type}
                onChange={(e) => setMetadata(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="DEGREE_CERTIFICATE">Degree Certificate</option>
                <option value="TRANSCRIPT">Transcript</option>
                <option value="OFFER_LETTER">Offer Letter</option>
                <option value="CONTRACT">Contract</option>
                <option value="LICENSE">License</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold">Holder Name <span className="text-rose-400">*</span></label>
              <input
                required
                className={`w-full rounded-2xl px-4 py-3 text-sm ${inputClass}`}
                value={metadata.holderName}
                onChange={(e) => setMetadata(prev => ({ ...prev, holderName: e.target.value }))}
                placeholder="John Doe"
              />
              {fieldErrors.holderName && (
                <div className="text-xs text-rose-400 mt-1">{fieldErrors.holderName}</div>
              )}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold">Institution</label>
              <input
                className={`w-full rounded-2xl px-4 py-3 text-sm ${inputClass}`}
                value={metadata.institution}
                onChange={(e) => setMetadata(prev => ({ ...prev, institution: e.target.value }))}
                placeholder="MIT"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold">Degree Title</label>
              <input
                className={`w-full rounded-2xl px-4 py-3 text-sm ${inputClass}`}
                value={metadata.degreeTitle}
                onChange={(e) => setMetadata(prev => ({ ...prev, degreeTitle: e.target.value }))}
                placeholder="Bachelor of Science in Computer Science"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold">Issue Date <span className="text-rose-400">*</span></label>
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                className={`w-full rounded-2xl px-4 py-3 text-sm ${inputClass}`}
                value={metadata.issueDate}
                onChange={(e) => setMetadata(prev => ({ ...prev, issueDate: e.target.value }))}
              />
              {fieldErrors.issueDate && (
                <div className="text-xs text-rose-400 mt-1">{fieldErrors.issueDate}</div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Submit Button */}
      {hashes && (
        <Button type="submit" className="w-full" disabled={isSubmitting || !hashes}>
          {isSubmitting ? 'Uploading to blockchain...' : '🔐 Upload Document Version'}
        </Button>
      )}
    </form>

    {/* ROI Selector Modal (Unified with superadmin) */}
    <Modal open={showROISelector} onClose={handleSkipROI} size="fullscreen">
      <div className="flex flex-col h-full w-full">
        {/* Header */}
        <div className="w-full px-4 pt-6 pb-2 bg-slate-900 border-b border-white/10 flex items-center justify-between relative z-40">
          <div>
            <h3 className="text-lg md:text-2xl font-bold text-white">Select Signature & Stamp Regions (Optional)</h3>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Draw boxes around the signature and official stamp for enhanced verification.<br />
              This step is optional - you can skip if the document has no signature/stamp.
            </p>
          </div>
          <button
            onClick={handleSkipROI}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 z-50"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* PDF Viewer Area */}
        <div className="flex-1 flex flex-col items-center justify-center bg-[#0a1120] overflow-auto w-full">
          {pdfCanvas ? (
            <div className="flex-1 flex items-center justify-center w-full h-full p-2 md:p-6">
              <div className="relative w-full max-w-full h-full max-h-full flex items-center justify-center">
                <ROISelector
                  canvas={pdfCanvas}
                  onSignatureSelect={setSignatureBox}
                  onStampSelect={setStampBox}
                  onComplete={handleROIComplete}
                />
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-400 w-full">
              <p className="text-lg">PDF preview not available.</p>
              <p className="text-sm mt-2">Please re-upload your document or try again.</p>
            </div>
          )}
        </div>
        {/* Sticky Footer */}
        <div className="sticky bottom-0 left-0 right-0 z-30 flex gap-3 bg-gradient-to-t from-slate-900/90 to-transparent px-4 py-3 border-t border-slate-800">
          <Button
            type="button"
            onClick={() => handleROIComplete({ signature: signatureBox, stamp: stampBox })}
            className="flex-1"
            disabled={!signatureBox && !stampBox}
          >
            ✓ Continue
          </Button>
          <Button type="button" onClick={handleSkipROI} className="flex-1 bg-slate-600">
            Skip This Step
          </Button>
        </div>
      </div>
    </Modal>
  </>
  );
};

export default UploadDocumentForm;
