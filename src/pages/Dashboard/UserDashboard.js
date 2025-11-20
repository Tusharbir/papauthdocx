import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const checklist = [
  'Capture hashes via upload or QR.',
  'Compare all four modalities against backend signatures.',
  'Log decision with audit reason for downstream teams.',
];

const UserDashboard = () => (
  <div className="space-y-6">
    <PageHeader title="Verifier Hub" subtitle="Validate hashes and QR checkpoints" />
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="p-6">
        <p className="text-sm uppercase tracking-[0.4em] text-blue-300">Document Browser</p>
        <h3 className="mt-3 text-2xl font-semibold">View Documents</h3>
        <p className="mt-2 text-sm text-slate-300/80">
          Browse approved documents in your organization. View metadata, versions, and status.
        </p>
        <Button className="mt-4" onClick={() => window.location.assign('/dashboard/user/documents')}>
          Browse Documents
        </Button>
      </Card>
      <Card className="p-6 lg:col-span-2">
        <p className="text-sm uppercase tracking-[0.4em] text-blue-300">Manual crypto-check</p>
        <h3 className="mt-3 text-2xl font-semibold">Deep hash comparison</h3>
        <p className="mt-2 text-sm text-slate-300/80">
          Enter multimodal hashes (text/image/signature/stamp) to compare against PapDocAuthX backend.
        </p>
        <ul className="mt-4 space-y-2 text-xs text-slate-400">
          {checklist.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-emerald-400">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Button className="mt-4" onClick={() => window.location.assign('/verify')}>
          Go to verify
        </Button>
      </Card>
    </div>
    <Card className="p-6">
      <p className="text-sm uppercase tracking-[0.4em] text-emerald-300">QR scanning</p>
      <h3 className="mt-3 text-2xl font-semibold">Scan from field teams</h3>
      <p className="mt-2 text-sm text-slate-300/80">Use the QR scanner to instantly check tamper states for documents in circulation.</p>
      <Button className="mt-4" variant="secondary" onClick={() => window.location.assign('/qr/scan')}>
        Open QR scanner
      </Button>
    </Card>
  </div>
);

export default UserDashboard;
