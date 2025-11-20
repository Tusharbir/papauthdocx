import { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Card from '../components/ui/Card';

// Default to shared Gamma URL but allow override via env for flexibility.
const presentationUrl = process.env.REACT_APP_PRESENTATION_URL || 'https://papdocauthx-56qy7ln.gamma.site/';

const userGuides = [
  {
    title: 'How to Register a Document',
    steps: [
      '1. Login with your admin/superadmin credentials',
      '2. Navigate to "Upload Document" from the dashboard',
      '3. Drag & drop your PDF document (max 5MB)',
      '4. System extracts cryptographic hashes locally in your browser',
      '5. Optionally select signature and stamp regions for enhanced security',
      '6. Fill in document metadata (holder name, type, institution)',
      '7. Click "Upload Document Version" - your document is now registered!'
    ]
  },
  {
    title: 'How to Verify a Document',
    steps: [
      '1. Go to "Verify Document" page (no login required for public users)',
      '2. Choose verification method:',
      '   • Upload the document file - system extracts and compares hashes',
      '   • Upload QR code image - system decodes and verifies instantly',
      '   • Enter document hash manually',
      '3. View verification results showing tamper score, version chain, and authenticity',
      '4. Check Merkle proof and document metadata for full transparency'
    ]
  },
  {
    title: 'How to Generate & Use QR Codes',
    steps: [
      '1. Login as admin/superadmin',
      '2. Navigate to "Generate QR" in dashboard',
      '3. Select the document you want to create a QR code for',
      '4. Click "Generate QR Code" - system creates QR with docId and versionHash',
      '5. Download the QR code image',
      '6. Print QR on physical documents or embed in digital certificates',
      '7. Anyone can scan/upload this QR to verify document authenticity instantly'
    ]
  },
];

const technicalDocs = [
  {
    title: 'Architecture Overview',
    items: [
      'Frontend: React 18 with React Router for client-side routing',
      'UI Framework: Material UI + TailwindCSS for responsive design',
      'State Management: Zustand for auth store and UI preferences',
      'API Communication: Axios with JWT token refresh mechanism',
      'Build Tool: Create React App with hot reload',
      'Deployment: Supports Netlify, Vercel, AWS S3 + CloudFront'
    ],
  },
  {
    title: 'RBAC & Authorization',
    items: [
      'Superadmin: Full CRUD on all resources, system-wide analytics, org management',
      'Admin: Upload documents, generate QR codes, manage org users, view org analytics',
      'User/Verifier: Verify documents, view personal documents, limited analytics',
      'Public: Document verification without authentication',
      'Protected Routes: Role-based routing with ProtectedRoute and RoleRoute components',
      'JWT Authentication: Access tokens with refresh token rotation'
    ],
  },
  {
    title: 'Cryptographic Hash Extraction',
    items: [
      'Text Hash: PDF.js extracts text → normalize whitespace → SHA-256',
      'Image Hash: Canvas API rasterizes PDF (300 DPI) → grayscale → SHA-256 of pixels',
      'Signature Hash: User selects ROI → extract pixel region → SHA-256',
      'Stamp Hash: User selects ROI → extract pixel region → SHA-256',
      'Merkle Root: Combine (textHash + imageHash) and (signatureHash + stampHash) → SHA-256',
      'All hashing happens client-side in browser - zero document upload to server',
      'Only hashes and metadata are transmitted to backend'
    ],
  },
  {
    title: 'Security & Privacy',
    items: [
      'Zero-Knowledge Verification: Documents never leave user\'s browser',
      'Client-Side Hashing: All cryptographic operations in browser using Web Crypto API',
      'Blockchain-Style Merkle Trees: Tamper-proof version chains',
      'JWT with HttpOnly Cookies: Secure token storage with CSRF protection',
      'Role-Based Access Control: Granular permissions per endpoint',
      'Audit Logging: All actions logged with user identity and timestamp',
      'File Size Limits: 5MB max for all uploads (enforced client & server-side)'
    ],
  },
];

const faqs = [
  {
    q: 'Is my document uploaded to your servers?',
    a: 'No! All hash extraction happens in your browser using JavaScript. Only the cryptographic hashes (not the document) are sent to our servers. This is "zero-knowledge" verification.'
  },
  {
    q: 'What file formats are supported?',
    a: 'Currently: PDF documents (primary), JPG/PNG images, and TXT files. Maximum file size is 5MB for all types.'
  },
  {
    q: 'Can I verify documents without creating an account?',
    a: 'Yes! Public users can verify documents without login. Just upload the document or QR code on the Verify page. Registration is only needed to upload/issue new documents.'
  },
  {
    q: 'What happens if someone modifies my document?',
    a: 'Even a single pixel or character change will produce a completely different hash. The system will detect tampering and show verification failure with tamper score.'
  },
  {
    q: 'How long are documents stored?',
    a: 'We only store cryptographic hashes and metadata - not the actual documents. Hash records are permanent to maintain verification history and version chains.'
  },
  {
    q: 'Can I revoke a document?',
    a: 'Yes! Admins can revoke documents or specific versions through the Revocations page. Revoked documents will show as invalid during verification.'
  }
];

const DocsPage = () => {
  const [activeTab, setActiveTab] = useState('user-guide'); // 'user-guide' | 'technical' | 'presentation'
  const [showFullscreen, setShowFullscreen] = useState(false);
  const fullscreenRef = useRef(null);
  const [deckLoaded, setDeckLoaded] = useState(false);

  // Preload presentation in background to reduce visible delay
  useEffect(() => {
    if (!presentationUrl) return;
    // Keep a hidden iframe alive to warm the deck and reuse browser cache.
    const iframe = document.createElement('iframe');
    iframe.src = presentationUrl;
    iframe.loading = 'eager';
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.setAttribute('aria-hidden', 'true');
    iframe.onload = () => setDeckLoaded(true);
    document.body.appendChild(iframe);
    // Persist the iframe; no cleanup so cache stays warm during session.
  }, [presentationUrl]);

  useEffect(() => {
    // When toggling fullscreen mode, request/exit browser fullscreen for immersive view.
    if (showFullscreen) {
      const el = fullscreenRef.current || document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      }
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [showFullscreen]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 py-16 space-y-10">
        <header>
          <p className="text-xs uppercase tracking-[0.4em] text-blue-300 mb-3">Documentation</p>
          <h1 className="text-4xl font-semibold mb-4">PapDocAuthX Documentation</h1>
          <p className="text-slate-300/90 max-w-3xl">
            Complete guide covering user instructions, technical implementation, security, and API reference.
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-3 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('user-guide')}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'user-guide'
                ? 'bg-blue-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            📖 User Guide
          </button>
          <button
            onClick={() => setActiveTab('technical')}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'technical'
                ? 'bg-emerald-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            ⚙️ Technical Docs
          </button>
          <button
            onClick={() => setActiveTab('presentation')}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'presentation'
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            📽️ Presentation
          </button>
        </div>

        {/* User Guide Tab */}
        {activeTab === 'user-guide' && (
          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6">How-To Guides</h2>
              <div className="grid gap-6">
                {userGuides.map((guide) => (
                  <Card key={guide.title}>
                    <h3 className="text-xl font-semibold mb-4 text-blue-400">{guide.title}</h3>
                    <div className="space-y-2 text-sm text-slate-300/90">
                      {guide.steps.map((step, idx) => (
                        <p key={idx} className={step.startsWith('   ') ? 'ml-6 text-slate-400' : ''}>
                          {step}
                        </p>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
              <div className="grid gap-4">
                {faqs.map((faq, idx) => (
                  <Card key={idx}>
                    <h3 className="text-lg font-semibold mb-2 text-emerald-400">{faq.q}</h3>
                    <p className="text-sm text-slate-300/90">{faq.a}</p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Technical Documentation Tab */}
        {activeTab === 'technical' && (
          <section className="space-y-6">
            {technicalDocs.map((section) => (
              <Card key={section.title}>
                <h2 className="text-xl font-semibold mb-4 text-emerald-400" id={section.title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}>{section.title}</h2>
                <ul className="space-y-2 text-sm text-slate-300/90">
                  {section.items.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </Card>
            ))}
            
            {/* Anchors for footer links */}
            <div id="compliance" />
            <div id="rbac" />
            <div id="api" />
          </section>
        )}

        {/* Presentation Tab */}
        {activeTab === 'presentation' && (
          <section className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 border-white/5 shadow-2xl">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-indigo-300/80">Live Deck</p>
                  <h2 className="text-xl font-semibold text-indigo-200">Final Presentation</h2>
                  <p className="text-sm text-slate-300/90 mt-1">
                    Slide deck covering features, architecture, and demo flow.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200">
                    Interactive • Inline viewer
                  </div>
                  <button
                    onClick={() => setShowFullscreen(true)}
                    className="rounded-xl border border-indigo-400/30 bg-indigo-500/20 px-3 py-1.5 text-xs font-medium text-indigo-100 hover:bg-indigo-500/30"
                  >
                    Expand to Full Page
                  </button>
                </div>
              </div>
              <div className="mt-6 w-full min-h-[80vh] overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative">
                {!deckLoaded && (
                  <div className="absolute inset-0 grid place-items-center text-slate-400 text-sm">
                    Loading presentation...
                  </div>
                )}
                <iframe
                  title="PapDocAuthX Presentation"
                  src={presentationUrl}
                  className="h-[80vh] w-full"
                  allowFullScreen
                  loading="eager"
                  referrerPolicy="no-referrer-when-downgrade"
                  onLoad={() => setDeckLoaded(true)}
                />
              </div>
            </Card>
          </section>
        )}
      </main>
      {showFullscreen && (
        <div
          ref={fullscreenRef}
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm px-[100px] py-[40px]"
        >
          <div className="flex h-full w-full flex-col rounded-3xl border border-white/10 bg-slate-950/70 shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-white/5 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-300/80">Live Deck</p>
                <h3 className="text-lg font-semibold text-indigo-100">PapDocAuthX Presentation</h3>
              </div>
              <button
                onClick={() => setShowFullscreen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <div className="m-3 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black relative">
              {!deckLoaded && (
                <div className="absolute inset-0 grid place-items-center text-slate-300 text-sm">
                  <div className="flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 border border-white/10 shadow-lg">
                    <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                    <span>Loading presentation... warming inline viewer</span>
                  </div>
                </div>
              )}
              <iframe
                title="PapDocAuthX Presentation Full"
                src={presentationUrl}
                className="h-full w-full"
                allowFullScreen
                loading="eager"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => setDeckLoaded(true)}
              />
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default DocsPage;
