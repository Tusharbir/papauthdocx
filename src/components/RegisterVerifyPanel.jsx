import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';

const steps = [
  {
    title: 'Register document',
    text: 'Drag & drop a PDF or image. Client-side hashing extracts metadata, structure, and signature ROIs.',
    accent: 'from-blue-500/30 via-emerald-400/20 to-violet-500/30',
  },
  {
    title: 'Verifier approval',
    text: 'Route to RBAC-based reviewers. Each action is logged with JWT identity and timestamp.',
    accent: 'from-violet-500/30 via-blue-400/20 to-pink-400/20',
  },
];

const RegisterVerifyPanel = () => {
  const isAuthenticated = useAuthStore((state) => !!state.token);
  
  return (
  <motion.section
    className="w-full px-8 lg:px-20 py-24 bg-gradient-to-b from-[#01030c] via-[#050b1a] to-[#01030c]"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <div className="max-w-[1600px] mx-auto grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
      <div>
        <p className="uppercase text-[12px] tracking-[0.25em] text-emerald-300 mb-4">Register → Verify</p>
        <h2 className="text-3xl lg:text-4xl font-semibold mb-4 text-white">
          Guided workflow built for demos
        </h2>
        <p className="text-slate-300/90 text-base lg:text-lg max-w-2xl mb-8">
          Run uploads, hash comparisons, revocations, and QR scans without leaving your classroom demo.
          The UI mirrors the production admin plane, powered by the same API contracts and PBAC rules.
        </p>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`rounded-3xl border border-white/10 bg-gradient-to-r ${step.accent} p-[1px]`}
            >
              <div className="rounded-3xl bg-slate-950/80 p-5 flex gap-4">
                <span className="mt-1 text-sm text-emerald-300">{index + 1}</span>
                <div>
                  <p className="text-lg font-semibold text-white">{step.title}</p>
                  <p className="text-sm text-slate-300/85">{step.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <p className="text-sm text-slate-300 mb-4">Try the zero-trust flow:</p>
        <div className="space-y-4">
          {isAuthenticated && (
            <Link
              to="/documents/upload"
              className="w-full inline-flex items-center justify-between px-4 py-3 rounded-2xl bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition-colors"
            >
              Register document
              <span className="text-emerald-300">→</span>
            </Link>
          )}
          <Link
            to="/verify"
            className="w-full inline-flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 text-white/90 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Verify hashes
            <span className="text-blue-300">→</span>
          </Link>
        </div>
        {!isAuthenticated && (
          <p className="text-xs text-slate-400 mt-6 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            💡 <Link to="/login" className="text-blue-400 underline">Login</Link> to register documents. Public users can verify documents only.
          </p>
        )}
        <p className="text-[12px] text-slate-400 mt-6">
          For institutional access, <Link to="/contact" className="text-emerald-400 underline">request access</Link> to onboard your organization.
        </p>
      </div>
    </div>
  </motion.section>
  );
};

export default RegisterVerifyPanel;
