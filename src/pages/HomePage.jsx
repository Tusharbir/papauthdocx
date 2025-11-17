import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RegisterVerifyPanel from '../components/RegisterVerifyPanel';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const fadeUpSlow = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

const useCases = [
  {
    title: 'Universities',
    text: 'Secure transcripts, degree certificates and offer letters. Alumni can verify documents instantly.',
    emoji: '🎓',
    img: 'https://images.pexels.com/photos/3059748/pexels-photo-3059748.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'Government',
    text: 'Protect ID cards, licenses and permits using client-side hashing and QR-based verification.',
    emoji: '🏛️',
    img: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    title: 'Enterprises',
    text: 'Authenticate employment letters, NDAs and contracts with a tamper score and version chain.',
    emoji: '🏢',
    img: 'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

const features = [
  {
    title: 'Zero-knowledge flows',
    text: 'OCR, hashing and feature extraction happen entirely on the client.',
    icon: '🛡️',
  },
  {
    title: 'Multi-modal document DNA',
    text: 'Text, layout, image ROIs, stamps, seals — combined into a unique fingerprint.',
    icon: '🧬',
  },
  {
    title: 'Version chains & audit trails',
    text: 'Each update creates a new version hashed to the previous one.',
    icon: '🔗',
  },
  {
    title: 'Polyglot persistence',
    text: 'MongoDB for document metadata + SQL for structured audit logs.',
    icon: '🗄️',
  },
  {
    title: 'Tamper scoring engine',
    text: 'Compare similarity percentages for text, layout and visual ROIs.',
    icon: '📊',
  },
  {
    title: 'QR-based verification checkpoints',
    text: 'Every document includes a secure QR linking to its verification endpoint.',
    icon: '🔳',
  },
];

function HomePage() {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-50">
      <Navbar />
      <main>
      <motion.section
        className="w-full px-8 lg:px-20 pt-24 pb-32 bg-gradient-to-b from-[#020617] via-[#050b2d] to-[#020617]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={fadeUp}
      >
        <div className="max-w-[1800px] mx-auto grid grid-cols-1 xl:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-[12px] px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-300 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
              Privacy-first document authentication for institutions
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6 max-w-3xl">
              Stop trusting screenshots.
              <br />
              <span className="text-slate-300">Start trusting verified documents.</span>
            </h1>
            <p className="text-lg text-slate-300/90 max-w-2xl mb-10 leading-relaxed">
              PapDocAuthX+ helps universities, governments and enterprises verify certificates, IDs and contracts with a zero-knowledge, multi-modal hashing pipeline.
              All analysis runs locally in the browser — only cryptographic fingerprints ever leave the device.
            </p>
            <div className="flex flex-wrap gap-4 mb-6">
              <Link
                to="/demo"
                className="px-8 py-3 rounded-full text-base font-medium bg-gradient-to-r from-blue-500 to-emerald-400 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.02] transition-transform"
              >
                Try the live demo
              </Link>
              <Link
                to="/docs"
                className="px-8 py-3 rounded-full text-base font-medium border border-white/20 bg-white/5 hover:bg-white/10 transition"
              >
                See how it works
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-300/80">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Zero-knowledge by design
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Multi-modal hashing (text, layout, images, signatures)
              </div>
            </div>
          </div>
          <motion.aside className="w-full" variants={fadeUpSlow} viewport={{ once: true, amount: 0.4 }}>
            <div className="w-full rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-white/10 p-10 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <h3 className="text-xl font-semibold mb-6">Built for high stakes</h3>
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-emerald-300 icon-float">0</div>
                  <div className="text-sm text-slate-400">Document content stored</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-300 icon-float">4+</div>
                  <div className="text-sm text-slate-400">Hashes per document</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-amber-300 icon-float">2</div>
                  <div className="text-sm text-slate-400">Database layers</div>
                </div>
              </div>
              <div className="mt-8 text-sm text-slate-300">
                Ideal for:
                <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                  <li>University registrars</li>
                  <li>HR & compliance teams</li>
                  <li>Government departments</li>
                </ul>
              </div>
            </div>
          </motion.aside>
        </div>
      </motion.section>

      <motion.section
        className="w-full px-8 lg:px-20 py-24 bg-gradient-to-br from-[#0b0f26] via-[#111735] to-[#0b0f26]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUp}
      >
        <div className="max-w-[1800px] mx-auto">
          <h2 className="text-3xl font-semibold mb-4">Where PapDocAuthX+ fits in</h2>
          <p className="text-slate-300/85 text-lg max-w-4xl mb-12">
            The platform focuses on high-value, frequently forged documents. Perfect for academic projects, research demonstrations, and real-world deployment.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {useCases.map((card) => (
              <motion.div
                key={card.title}
                className="relative overflow-hidden rounded-3xl bg-[#10172b]/80 border border-white/10 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                whileHover={{ y: -6, boxShadow: '0 28px 70px rgba(0,0,0,0.8)' }}
                transition={{ type: 'spring', stiffness: 140, damping: 18 }}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 opacity-25">
                  <img src={card.img} alt="" className="w-40 h-40 object-cover rounded-full blur-[1px]" />
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="icon-float flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500/90 via-emerald-400/80 to-indigo-500/80 shadow-[0_0_25px_rgba(56,189,248,0.6)]">
                    <span className="text-xl">{card.emoji}</span>
                  </div>
                  <h3 className="text-xl font-semibold">{card.title}</h3>
                </div>
                <p className="relative text-slate-300/90 text-sm leading-relaxed z-10">{card.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="relative w-full px-8 lg:px-20 py-28 bg-gradient-to-b from-[#020617] via-[#050b24] to-[#020617]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        variants={fadeUp}
      >
        <div className="pointer-events-none absolute inset-x-0 -top-24 flex justify-center">
          <div className="parallax-blob w-72 h-72 rounded-full bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.35),_transparent_60%)]" />
        </div>
        <div className="pointer-events-none absolute -bottom-24 right-10">
          <div className="parallax-blob w-64 h-64 rounded-full bg-[radial-gradient(circle_at_bottom,_rgba(129,140,248,0.35),_transparent_60%)]" />
        </div>
        <div className="max-w-[1800px] mx-auto">
          <h2 className="text-3xl font-semibold mb-4">Key platform features</h2>
          <p className="text-lg text-slate-300/85 max-w-4xl mb-14">Designed as an advanced database demonstrator with real-world value.</p>
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3 relative z-10">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                whileHover={{ y: -6, scale: 1.01, boxShadow: '0 24px 80px rgba(15,23,42,0.95)' }}
                transition={{ type: 'spring', stiffness: 160, damping: 20 }}
              >
                <div className="rounded-3xl bg-gradient-to-br from-cyan-500/70 via-blue-500/60 to-violet-500/70 p-[1px] shadow-[0_0_40px_rgba(59,130,246,0.45)]">
                  <div className="rounded-3xl bg-[#020617]/95 p-6 h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="neon-icon flex items-center justify-center w-9 h-9 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 text-lg">
                        <span>{feature.icon}</span>
                      </div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-slate-300/85 text-[13px] leading-relaxed flex-1">{feature.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <RegisterVerifyPanel />

      <motion.section
        className="w-full px-8 lg:px-20 pb-24 bg-[#040714]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUpSlow}
      >
        <div className="max-w-[1800px] mx-auto">
          <div className="rounded-3xl bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-indigo-500/20 border border-blue-400/40 px-6 md:px-10 py-8 md:py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-2">Ready to see it in action?</h2>
              <p className="text-[13px] md:text-sm text-slate-100/90 max-w-2xl">
                Head over to the live demo page to walk through the full registration and verification workflow. Perfect for showing your Advanced Database Topics project or pitching the concept to a real institution.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/demo"
                className="px-6 py-2.5 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500 to-emerald-400 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-[1.03] transition-transform"
              >
                Open demo page
              </Link>
              <Link
                to="/docs"
                className="px-6 py-2.5 rounded-full text-sm font-medium border border-white/25 bg-slate-950/80 hover:bg-slate-900/80 transition"
              >
                View architecture notes
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
