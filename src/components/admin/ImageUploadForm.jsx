import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import Modal from '../ui/Modal';
import useUIStore from '../../store/uiStore';
import { extractTextFromImage, extractImageHashFromImage, extractROIHash, computeMerkleRoot } from '../../utils/hashExtraction';
import ROISelector from './ROISelector';

const ImageUploadForm = ({ onSubmit, isSubmitting }) => {
  const [file, setFile] = useState(null);
  const [hashes, setHashes] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showROISelector, setShowROISelector] = useState(false);
  const [imageCanvas, setImageCanvas] = useState(null);
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
    const imageFile = acceptedFiles[0];
    if (!imageFile) return;

    setFile(imageFile);
    setError(null);
    setProcessing(true);
    setHashes(null);

    try {
      // Extract text using OCR (Tesseract.js)
      const textHash = await extractTextFromImage(imageFile);
      
      // Extract image hash from image file (not PDF)
      const imageHash = await extractImageHashFromImage(imageFile);
      
      const extractedHashes = {
        textHash,
        imageHash,
        signatureHash: '',
        stampHash: '',
        merkleRoot: ''
      };
      
      setHashes(extractedHashes);
      
      // Render image to canvas for ROI selection
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          setImageCanvas(canvas);
          setShowROISelector(true);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(imageFile);
      
      setProcessing(false);
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err.message || 'Failed to process image');
      setProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    multiple: false,
    maxSize: (parseInt(process.env.REACT_APP_MAX_FILE_SIZE_MB || '5')) * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      const maxSizeMB = process.env.REACT_APP_MAX_FILE_SIZE_MB || '5';
      if (rejection?.errors[0]?.code === 'file-too-large') {
        setError(`File size must be less than ${maxSizeMB}MB`);
      } else if (rejection?.errors[0]?.code === 'file-invalid-type') {
        setError('Only JPG and PNG images are accepted');
      } else {
        setError('File rejected. Please try another file.');
      }
    }
  });

  const handleROIComplete = async (signature, stamp) => {
    setShowROISelector(false);

    try {
      // Re-extract hashes with ROI boxes
      const signatureHash = signature ? await extractROIHash(imageCanvas, signature) : '';
      const stampHash = stamp ? await extractROIHash(imageCanvas, stamp) : '';
      
      const merkleRoot = await computeMerkleRoot([
        hashes.textHash,
        hashes.imageHash,
        signatureHash,
        stampHash
      ]);

      setHashes({
        ...hashes,
        signatureHash,
        stampHash,
        merkleRoot
      });
    } catch (err) {
      console.error('Error extracting ROI hashes:', err);
      setError(err.message || 'Failed to extract ROI hashes');
    }
  };

  const handleSkipROI = async () => {
    setShowROISelector(false);
    
    // Compute merkle root without signature/stamp hashes
    const merkleRoot = await computeMerkleRoot([
      hashes.textHash,
      hashes.imageHash,
      '',
      ''
    ]);

    setHashes({
      ...hashes,
      merkleRoot
    });
  };

  const handleMetadataChange = (e) => {
    setMetadata({ ...metadata, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!hashes || !hashes.merkleRoot) {
      setError('Please upload an image first and complete hash extraction');
      return;
    }

    const documentData = {
      ...metadata,
      textHash: hashes.textHash,
      imageHash: hashes.imageHash,
      signatureHash: hashes.signatureHash || '',
      stampHash: hashes.stampHash || '',
      merkleRoot: hashes.merkleRoot
    };
    
    onSubmit(documentData);
  };

  return (
  <>
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dropzone */}
      <Card>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
            ${isDragActive 
              ? 'border-blue-500 bg-blue-500/10'
              : mode === 'dark'
                ? 'border-white/20 hover:border-white/40 bg-white/5'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className={mode === 'dark' ? 'text-white/60' : 'text-slate-600'}>
            {isDragActive ? (
              <p className="text-lg">Drop the image here...</p>
            ) : (
              <>
                <p className="text-lg mb-2">
                  📷 Drag & drop a scanned image here, or click to select
                </p>
                <p className="text-sm">
                  Supports JPG, PNG (OCR will extract text automatically)
                </p>
              </>
            )}
          </div>
        </div>
        
        {file && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className={mode === 'dark' ? 'text-green-400' : 'text-green-700'}>
              ✓ Image selected: {file.name}
            </p>
          </div>
        )}
        
        {processing && (
          <div className="mt-4 flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Loader className="h-5 w-5" />
            <p className={mode === 'dark' ? 'text-blue-400' : 'text-blue-700'}>
              Processing image and extracting text with OCR...
            </p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className={mode === 'dark' ? 'text-red-400' : 'text-red-700'}>
              ⚠ {error}
            </p>
          </div>
        )}
      </Card>

      {/* Hash Display */}
      {hashes && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Extracted Cryptographic Hashes</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1">Text Hash (OCR)</label>
              <div className={`font-mono text-xs p-2 rounded border ${inputClass} break-all`}>
                {hashes.textHash || 'N/A'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Image Hash</label>
              <div className={`font-mono text-xs p-2 rounded border ${inputClass} break-all`}>
                {hashes.imageHash || 'N/A'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Signature Hash</label>
              <div className={`font-mono text-xs p-2 rounded border ${inputClass} break-all`}>
                {hashes.signatureHash || 'Not selected'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Stamp Hash</label>
              <div className={`font-mono text-xs p-2 rounded border ${inputClass} break-all`}>
                {hashes.stampHash || 'Not selected'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Merkle Root (Final Hash)</label>
              <div className={`font-mono text-xs p-2 rounded border ${inputClass} break-all font-bold`}>
                {hashes.merkleRoot || 'Pending ROI selection...'}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Metadata Form */}
      {hashes && hashes.merkleRoot && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Document Metadata</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Document ID</label>
              <input
                type="text"
                name="docId"
                value={metadata.docId}
                onChange={handleMetadataChange}
                className={`w-full px-3 py-2 rounded-md border ${inputClass}`}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Document Type</label>
              <select
                name="type"
                value={metadata.type}
                onChange={handleMetadataChange}
                className={`w-full px-3 py-2 rounded-md border ${inputClass}`}
                required
              >
                <option value="DEGREE_CERTIFICATE">Degree Certificate</option>
                <option value="TRANSCRIPT">Transcript</option>
                <option value="ID_CARD">ID Card</option>
                <option value="LICENSE">License</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Holder Name</label>
              <input
                type="text"
                name="holderName"
                value={metadata.holderName}
                onChange={handleMetadataChange}
                className={`w-full px-3 py-2 rounded-md border ${inputClass}`}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Degree/Title</label>
              <input
                type="text"
                name="degreeTitle"
                value={metadata.degreeTitle}
                onChange={handleMetadataChange}
                className={`w-full px-3 py-2 rounded-md border ${inputClass}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Issue Date</label>
              <input
                type="date"
                name="issueDate"
                value={metadata.issueDate}
                onChange={handleMetadataChange}
                className={`w-full px-3 py-2 rounded-md border ${inputClass}`}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Institution</label>
              <input
                type="text"
                name="institution"
                value={metadata.institution}
                onChange={handleMetadataChange}
                className={`w-full px-3 py-2 rounded-md border ${inputClass}`}
                required
              />
            </div>
          </div>
          
          <div className="mt-6">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="h-4 w-4" />
                  Registering Document...
                </span>
              ) : (
                'Register Document Hashes'
              )}
            </Button>
          </div>
        </Card>
      )}
    </form>

    {/* ROI Selector Modal */}
    <Modal
      isOpen={showROISelector}
      onClose={() => setShowROISelector(false)}
      title="Select Signature & Stamp Regions"
    >
      <div className="space-y-4">
        <p className={mode === 'dark' ? 'text-white/70' : 'text-slate-600'}>
          Click and drag on the image to select signature (green) and stamp (blue) regions.
          These will be hashed separately for multi-modal verification.
        </p>
        {imageCanvas && (
          <ROISelector
            canvas={imageCanvas}
            onComplete={handleROIComplete}
            onSkip={handleSkipROI}
          />
        )}
      </div>
    </Modal>
  </>
  );
};

export default ImageUploadForm;
