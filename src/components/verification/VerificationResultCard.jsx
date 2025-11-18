import Card from '../ui/Card';
import Badge from '../ui/Badge';

const VerificationResultCard = ({ result }) => {
  if (!result) {
    return (
      <Card className="p-6 text-sm text-slate-500">
        Awaiting verification response. Submit a document ID and hashes to begin.
      </Card>
    );
  }

  const normalizedStatus = (result.status || '').toUpperCase();
  const tone = normalizedStatus === 'VERIFIED' ? 'success' : normalizedStatus === 'REVOKED' ? 'danger' : 'info';

  return (
    <Card className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Status</p>
          <p className="text-2xl font-semibold capitalize">{result.status}</p>
        </div>
        <Badge tone={tone}>{result.status}</Badge>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed">
          {result.documentId && (
            <p>
              <span className="text-slate-400">Doc ID:</span> {result.documentId || result.docId}
            </p>
          )}
          {result.backendHash && (
            <p>
              <span className="text-slate-400">Backend hash:</span> {result.backendHash}
            </p>
          )}
          {result.providedHash && (
            <p>
              <span className="text-slate-400">Provided hash:</span> {result.providedHash}
            </p>
          )}
          {result.matchScore && (
            <p>
              <span className="text-slate-400">Match score:</span> {result.matchScore}%
            </p>
          )}
      </div>
      <div className="space-y-3">
        {result.indicators?.map((indicator) => (
          <div key={indicator.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <p>{indicator.label}</p>
              <Badge tone={indicator.match ? 'success' : 'danger'}>{indicator.match ? 'Match' : 'Mismatch'}</Badge>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default VerificationResultCard;
