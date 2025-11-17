import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const sections = [
  {
    title: 'Architecture overview',
    items: ['React 18 + Vite-style routing', 'Material UI dashboards with Zustand auth store', 'Axios instance with JWT refresh handshake'],
  },
  {
    title: 'RBAC surface',
    items: ['Admin: dashboards, workflow, revocations, QR tools', 'Verifier: verification + analytics', 'User: upload + personal docs'],
  },
  {
    title: 'API contracts',
    items: ['POST /documents/upload-version → stores metadata + merkle root', 'POST /verification/verify → compares local hash vs backend', 'POST /qr/generate + /qr/resolve → issue deep-linked verification tokens'],
  },
];

const DocsPage = () => (
  <div className="min-h-screen bg-slate-950 text-slate-50">
    <Navbar />
    <main className="max-w-[1200px] mx-auto px-6 py-16 space-y-14">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-blue-300 mb-3">Documentation</p>
        <h1 className="text-4xl font-semibold mb-4">PapDocAuthX+ implementation notes</h1>
        <p className="text-slate-300/90">
          This guide summarizes the moving pieces of the secure document pipeline so you can align the UI with your backend or academic report.
        </p>
      </header>
      <section className="grid gap-6">
        {sections.map((section) => (
          <div key={section.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
            <ul className="space-y-2 text-sm text-slate-300/90">
              {section.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
    <Footer />
  </div>
);

export default DocsPage;
