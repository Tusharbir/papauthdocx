
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RegisterVerifyPanel from '../components/RegisterVerifyPanel';
import { Link } from 'react-router-dom';

const steps = [
  { title: 'Upload & hash', detail: 'Use our drag-and-drop zone to compute text, image, signature, and stamp hashes locally in your browser.' },
  { title: 'Assign & review', detail: 'Assign the upload to an admin or verifier. The workflow timeline updates as the document is reviewed and verified.' },
  { title: 'Version chain', detail: 'Each document version is cryptographically linked, creating an immutable audit trail.' },
];

const DemoPage = () => (
  <div className="min-h-screen bg-slate-950 text-slate-50">
    <Navbar />
    <main className="max-w-[1400px] mx-auto px-6 py-16 space-y-16">
      <section>
        <h1 className="text-4xl font-semibold mb-4">PapDocAuthX Demo Flow</h1>
        <p className="text-slate-300/90 max-w-3xl">
          Experience secure, privacy-first document authentication. Upload a document, assign it for verification, and view the cryptographic version chain. All actions are logged for auditability—no document ever leaves your device.
        </p>
      </section>
      <section className="grid gap-8 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <p className="text-lg font-semibold mb-2">{step.title}</p>
            <p className="text-sm text-slate-300/90">{step.detail}</p>
          </div>
        ))}
      </section>

      <section className="max-w-2xl mx-auto text-center">
        <p className="text-sm text-slate-400 mb-4">Ready to try the public flow?</p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/login" className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 text-sm font-semibold">Open dashboard (login)</Link>
          <Link to="/verify" className="px-6 py-3 rounded-full border border-white/10 text-sm">Verify a document (public)</Link>
        </div>
      </section>
    </main>
    <RegisterVerifyPanel />
    <Footer />
  </div>
);

export default DemoPage;
