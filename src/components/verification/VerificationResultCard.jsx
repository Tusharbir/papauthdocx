import Card from '../ui/Card';
import Badge from '../ui/Badge';

const VerificationResultCard = ({ result }) => {
  if (!result) {
    return (
      <Card className="p-6 text-sm text-slate-400">
        <div className="text-center space-y-3 py-8">
          <svg className="mx-auto h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium text-white">Awaiting verification</p>
          <p className="text-xs">Submit document ID and hashes to begin cryptographic verification</p>
        </div>
      </Card>
    );
  }

  // Parse verification result with 9-level checks
  const cryptoChecks = result.cryptographicVerification || {};
  const authorityChecks = result.authorityValidation || {};

  const allChecks = [
    { label: 'Text Hash Verify', passed: cryptoChecks.textHashMatch, category: 'crypto' },
    { label: 'Image Hash Verify', passed: cryptoChecks.imageHashMatch, category: 'crypto' },
    { label: 'Signature Hash Verify', passed: cryptoChecks.signatureHashMatch, category: 'crypto' },
    { label: 'Stamp Hash Verify', passed: cryptoChecks.stampHashMatch, category: 'crypto' },
    { label: 'Merkle Root Verify', passed: cryptoChecks.merkleRootValid, category: 'crypto' },
    { label: 'Version Chain Verify', passed: cryptoChecks.versionChainValid, category: 'chain' },
    { label: 'Version Hash Verify', passed: cryptoChecks.versionHashValid, category: 'chain' },
    { label: 'Document Approved', passed: authorityChecks.documentApproved, category: 'authority' },
    { label: 'Organization Verified', passed: authorityChecks.organizationVerified, category: 'authority' },
  ];

  const totalChecks = allChecks.filter(c => c.passed !== undefined).length;
  const allPassed = result.verified === true;

  const statusTone = allPassed ? 'success' : 'danger';
  const statusLabel = allPassed ? 'VERIFIED' : 'VERIFY FAILED';


  return (
    <Card className="space-y-5 p-6">
      {/* Overall Status & Tamper Score */}
      <div className="flex flex-col items-center justify-center gap-2 pb-4 border-b border-white/10">
        <div className="flex items-center justify-center w-20 h-20 rounded-full" style={{
          background: allPassed ? 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0) 70%)' : 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0) 70%)'
        }}>
          {allPassed ? (
            <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-12 h-12 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <Badge tone={statusTone} className="text-sm px-4 py-2">{statusLabel}</Badge>
      </div>

      {/* Document Info */}
      {result.document && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-slate-500">Document ID</p>
              <p className="font-mono text-white break-all leading-relaxed text-[11px] sm:text-xs md:text-sm">
                {result.document.docId}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Organization</p>
              <p className="text-white break-words leading-relaxed text-[11px] sm:text-xs md:text-sm">
                {result.document.organization || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Type</p>
              <p className="text-white">{result.document.docType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500">Version</p>
              <p className="text-white">#{result.document.versionNumber || 1}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cryptographic Verification Checks */}
      {totalChecks > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Cryptographic Checks</p>
          {allChecks.filter(c => c.category === 'crypto' && c.passed !== undefined).map((check) => (
            <div key={check.label} className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5">
              <span className="text-sm text-white">{check.label}</span>
              <div className="flex items-center gap-2">
                {check.passed ? (
                  <>
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <Badge tone="success">PASS</Badge>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <Badge tone="danger">FAIL</Badge>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Version Chain Checks */}
      {allChecks.some(c => c.category === 'chain' && c.passed !== undefined) && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Version Chain</p>
          {allChecks.filter(c => c.category === 'chain' && c.passed !== undefined).map((check) => (
            <div key={check.label} className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5">
              <span className="text-sm text-white">{check.label}</span>
              <div className="flex items-center gap-2">
                {check.passed ? (
                  <>
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <Badge tone="success">PASS</Badge>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <Badge tone="danger">FAIL</Badge>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Authority Validation */}
      {allChecks.some(c => c.category === 'authority' && c.passed !== undefined) && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Authority Validation</p>
          {allChecks.filter(c => c.category === 'authority' && c.passed !== undefined).map((check) => (
            <div key={check.label} className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5">
              <span className="text-sm text-white">{check.label}</span>
              <div className="flex items-center gap-2">
                {check.passed ? (
                  <>
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <Badge tone="success">PASS</Badge>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <Badge tone="danger">FAIL</Badge>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Message */}
      <div className="pt-4 border-t border-white/10">
        <p className="text-xs text-slate-400 text-center">
          {allPassed ? (
            <>🔒 All cryptographic signatures match. This document is authentic and unaltered.</>
          ) : (
            <>⚠️ Verification failed. This document may be forged, altered, or revoked.</>
          )}
        </p>
      </div>
    </Card>
  );
};

export default VerificationResultCard;
