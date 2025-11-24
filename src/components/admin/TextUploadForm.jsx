import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import organizationApi from '../../api/organizationApi';
import { useDropzone } from 'react-dropzone';
import { useQuery } from '@tanstack/react-query';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Loader from '../ui/Loader';
import useUIStore from '../../store/uiStore';
import { metadataApi } from '../../api/metadataApi';

const TextUploadForm = ({ onSubmit, isSubmitting }) => {
  const { data: documentTypesData } = useQuery({
    queryKey: ['document-types'],
    queryFn: metadataApi.getDocumentTypes,
  });

  const documentTypes = documentTypesData?.documentTypes || [];

  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [textHash, setTextHash] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [metadata, setMetadata] = useState({
    docId: '',
    type: 'other',
    holderName: '',
    title: '',
    issueDate: ''
  });
  const [orgList, setOrgList] = useState([]);
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const role = useAuthStore((state) => state.role);

  // Fetch organizations if superadmin
  useEffect(() => {
    if (role === 'superadmin') {
      organizationApi.list().then((orgs) => {
        setOrgList(orgs);
      });
    }
  }, [role]);
  
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
    let errors = {};
    const docIdPattern = /^[A-Z0-9_-]+$/;
    if (!textHash) {
      setError('Please upload a text file first');
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
    if (role === 'superadmin' && !selectedOrgId) {
      errors.selectedOrgId = 'Please select an organization';
    }
    setFieldErrors(errors);
    setError(null);
    if (Object.keys(errors).length > 0) return;
    const documentData = {
      docId: metadata.docId,
      type: metadata.type,
      metadata: {
        holderName: metadata.holderName,
        title: metadata.title,
        issueDate: metadata.issueDate
      },
      hashes: {
        textHash: textHash || '',
        imageHash: '',
        signatureHash: '',
        stampHash: '',
        merkleRoot: textHash || ''
      }
    };
    if (role === 'superadmin') {
      documentData.targetOrgId = Number(selectedOrgId);
    }
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
                  Supports TXT files • Max {process.env.REACT_APP_MAX_FILE_SIZE_MB || 5}MB
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
            {/* Superadmin: Organization dropdown */}
            {role === 'superadmin' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Organization <span className="text-rose-400">*</span></label>
                <select
                  required
                  className={`w-full px-3 py-2 rounded-md border ${inputClass}`}
                  value={selectedOrgId}
                  onChange={e => setSelectedOrgId(e.target.value)}
                >
                  <option value="">Select organization</option>
                  {orgList.map(org => (
                    <option key={org.id || org.orgId} value={org.id || org.orgId}>{org.name}</option>
                  ))}
                </select>
                {fieldErrors.selectedOrgId && (
                  <div className="text-xs text-rose-400 mt-1">{fieldErrors.selectedOrgId}</div>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Document ID <span className="text-rose-400">*</span></label>
              <input
                type="text"
                name="docId"
                value={metadata.docId}
                onChange={handleMetadataChange}
                className={`w-full px-3 py-2 rounded-md border ${inputClass}`}
                required
              />
              {fieldErrors.docId && (
                <div className="text-xs text-rose-400 mt-1">{fieldErrors.docId}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Document Type <span className="text-rose-400">*</span></label>
              <select
                name="type"
                value={metadata.type}
                onChange={handleMetadataChange}
                className={`w-full px-3 py-2 rounded-md border ${inputClass}`}
                required
              >
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Holder Name <span className="text-rose-400">*</span></label>
              <input
                type="text"
                name="holderName"
                value={metadata.holderName}
                onChange={handleMetadataChange}
                className={`w-full px-3 py-2 rounded-md border ${inputClass}`}
                required
              />
              {fieldErrors.holderName && (
                <div className="text-xs text-rose-400 mt-1">{fieldErrors.holderName}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={metadata.title}
                onChange={handleMetadataChange}
                className={`w-full px-3 py-2 rounded-md border ${inputClass}`}
                placeholder="Document Title (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Issue Date <span className="text-rose-400">*</span></label>
              <input
                type="date"
                name="issueDate"
                value={metadata.issueDate}
                onChange={handleMetadataChange}
                className={`w-full px-3 py-2 rounded-md border ${inputClass}`}
                required
              />
              {fieldErrors.issueDate && (
                <div className="text-xs text-rose-400 mt-1">{fieldErrors.issueDate}</div>
              )}
            </div>
          </div>
          <div className="mt-6">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              <span className="inline-flex items-center gap-2">
                <span className="text-lg">🔐</span>
                {isSubmitting ? (
                  <>
                    <Loader className="h-4 w-4" />
                    Registering Hashes...
                  </>
                ) : (
                  'Register Document Hashes'
                )}
              </span>
            </Button>
          </div>
        </Card>
      )}
    </form>
  );
};

export default TextUploadForm;
