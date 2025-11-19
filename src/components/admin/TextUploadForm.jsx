import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import useUIStore from '../../store/uiStore';

const TextUploadForm = ({ onSubmit, isSubmitting }) => {
  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [textHash, setTextHash] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState({
    docId: '',
    type: 'OTHER',
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

  // Hash text content using SHA-256
  const hashText = async (text) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const onDrop = async (acceptedFiles) => {
    const textFile = acceptedFiles[0];
    if (!textFile) return;

    setFile(textFile);
    setError(null);
    setProcessing(true);
    setTextHash('');

    try {
      // Read text file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        setTextContent(text);
        
        // Hash the text
        const hash = await hashText(text);
        setTextHash(hash);
        setProcessing(false);
      };
      reader.onerror = () => {
        setError('Failed to read text file');
        setProcessing(false);
      };
      reader.readAsText(textFile);
    } catch (err) {
      console.error('Error processing text file:', err);
      setError(err.message || 'Failed to process text file');
      setProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt']
    },
    multiple: false,
    maxSize: (parseInt(process.env.REACT_APP_MAX_FILE_SIZE_MB || '5')) * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      const rejection = fileRejections[0];
      const maxSizeMB = process.env.REACT_APP_MAX_FILE_SIZE_MB || '5';
      if (rejection?.errors[0]?.code === 'file-too-large') {
        setError(`File size must be less than ${maxSizeMB}MB`);
      } else if (rejection?.errors[0]?.code === 'file-invalid-type') {
        setError('Only TXT files are accepted');
      } else {
        setError('File rejected. Please try another file.');
      }
    }
  });

  const handleMetadataChange = (e) => {
    setMetadata({ ...metadata, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!textHash) {
      setError('Please upload a text file first');
      return;
    }

    const documentData = {
      ...metadata,
      textHash,
      imageHash: '', // No image for text files
      signatureHash: '', // No signature for text files
      stampHash: '', // No stamp for text files
      merkleRoot: textHash // For text files, merkle root is just the text hash
    };
    
    onSubmit(documentData);
  };

  return (
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
              <p className="text-lg">Drop the text file here...</p>
            ) : (
              <>
                <p className="text-lg mb-2">
                  📄 Drag & drop a text file here, or click to select
                </p>
                <p className="text-sm">
                  Supports TXT files only
                </p>
              </>
            )}
          </div>
        </div>
        
        {file && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className={mode === 'dark' ? 'text-green-400' : 'text-green-700'}>
              ✓ File selected: {file.name}
            </p>
          </div>
        )}
        
        {processing && (
          <div className="mt-4 flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Loader className="h-5 w-5" />
            <p className={mode === 'dark' ? 'text-blue-400' : 'text-blue-700'}>
              Processing text file...
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

      {/* Text Content Preview */}
      {textContent && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Text Content Preview</h3>
          <div className={`p-4 rounded border ${inputClass} max-h-64 overflow-y-auto`}>
            <pre className="whitespace-pre-wrap text-sm">{textContent}</pre>
          </div>
        </Card>
      )}

      {/* Hash Display */}
      {textHash && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Extracted Cryptographic Hash</h3>
          <div>
            <label className="text-sm font-medium block mb-1">Text Hash (SHA-256)</label>
            <div className={`font-mono text-xs p-2 rounded border ${inputClass} break-all font-bold`}>
              {textHash}
            </div>
          </div>
        </Card>
      )}

      {/* Metadata Form */}
      {textHash && (
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
                <option value="TRANSCRIPT">Transcript</option>
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
              <label className="block text-sm font-medium mb-2">Title/Description</label>
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
              <label className="block text-sm font-medium mb-2">Institution/Issuer</label>
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
                'Register Document Hash'
              )}
            </Button>
          </div>
        </Card>
      )}
    </form>
  );
};

export default TextUploadForm;
