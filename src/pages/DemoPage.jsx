import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RegisterVerifyPanel from '../components/RegisterVerifyPanel';

const steps = [
  { title: 'Upload & hash', detail: 'Use our drag-and-drop zone to compute structure, layout, and stamp hashes locally.' },
  { title: 'Verifier queue', detail: 'Assign the upload to an RBAC role (admin/verifier/user) and watch the workflow timeline update.' },
  { title: 'QR verification', detail: 'Generate dynamic QR codes, then scan them with your webcam to view tamper status.' },
];

const DemoPage = () => (
  <div className="min-h-screen bg-slate-950 text-slate-50">
    <Navbar />
    <main className="max-w-[1400px] mx-auto px-6 py-16 space-y-16">
      <section>
        <p className="text-sm text-blue-300 uppercase tracking-[0.3em] mb-3">Live demo briefing</p>
        <h1 className="text-4xl font-semibold mb-4">PapDocAuthX showcase</h1>
        <p className="text-slate-300/90 max-w-3xl">
          Launch the dashboard, upload sample documents, and present tamper proofing to stakeholders. Every action writes to the audit store so you can narrate database behavior in real time.
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
    </main>
    <RegisterVerifyPanel />
    <Footer />
  </div>
);

export default DemoPage;
