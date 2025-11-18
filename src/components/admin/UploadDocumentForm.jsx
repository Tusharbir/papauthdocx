import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import HashInputGrid from './HashInputGrid';
import useUIStore from '../../store/uiStore';

const initialState = {
  docId: '',
  type: 'Credential',
  fileType: 'pdf',
  pageCount: '',
  sizeInKB: '',
  mimeType: 'application/pdf',
};

const UploadDocumentForm = ({ onSubmit, isSubmitting }) => {
  const [payload, setPayload] = useState(initialState);
  const [hashes, setHashes] = useState({ textHash: '', imageHash: '', signatureHash: '', stampHash: '' });
  const mode = useUIStore((state) => state.mode);
  const inputClass =
    mode === 'dark'
      ? 'border-white/10 bg-white/5 text-white'
      : 'border-slate-300 bg-white text-slate-900';

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ ...payload, hashes });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold">Document ID</label>
            <input
              required
              className={`w-full rounded-2xl px-4 py-3 text-sm ${inputClass}`}
              value={payload.docId}
              onChange={(e) => setPayload((prev) => ({ ...prev, docId: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Document type</label>
            <select
              className={`w-full rounded-2xl px-4 py-3 text-sm ${inputClass}`}
              value={payload.type}
              onChange={(e) => setPayload((prev) => ({ ...prev, type: e.target.value }))}
            >
              <option>Credential</option>
              <option>Contract</option>
              <option>License</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">File type</label>
            <input
              className={`w-full rounded-2xl px-4 py-3 text-sm ${inputClass}`}
              value={payload.fileType}
              onChange={(e) => setPayload((prev) => ({ ...prev, fileType: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Page count</label>
            <input
              type="number"
              className={`w-full rounded-2xl px-4 py-3 text-sm ${inputClass}`}
              value={payload.pageCount}
              onChange={(e) => setPayload((prev) => ({ ...prev, pageCount: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">Size (KB)</label>
            <input
              type="number"
              className={`w-full rounded-2xl px-4 py-3 text-sm ${inputClass}`}
              value={payload.sizeInKB}
              onChange={(e) => setPayload((prev) => ({ ...prev, sizeInKB: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold">MIME type</label>
            <input
              className={`w-full rounded-2xl px-4 py-3 text-sm ${inputClass}`}
              value={payload.mimeType}
              onChange={(e) => setPayload((prev) => ({ ...prev, mimeType: e.target.value }))}
            />
          </div>
        </div>
      </Card>
      <HashInputGrid hashes={hashes} onChange={setHashes} />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Uploading…' : 'Upload version'}
      </Button>
    </form>
  );
};

export default UploadDocumentForm;
