import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'Overview', path: '/' },
  { label: 'Live Demo', path: '/demo' },
  { label: 'Docs', path: '/docs' },
  { label: 'Verify', path: '/verify' },
];

const MobileMenu = ({ open, onClose }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="lg:hidden absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-xl border-b border-white/10"
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `text-sm font-medium ${isActive ? 'text-emerald-300' : 'text-slate-200'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <Link
            to="/login"
            className="w-full text-center rounded-full py-2 bg-gradient-to-r from-blue-500 to-emerald-400 text-sm font-semibold"
            onClick={onClose}
          >
            Sign in
          </Link>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b border-white/10 bg-slate-950/80">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
          <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
          PapDocAuthX+
        </Link>
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-200">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${isActive ? 'text-emerald-300' : 'text-slate-200'} hover:text-white transition`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/register"
            className="px-4 py-2 rounded-full border border-white/15 text-xs font-semibold text-slate-100 hover:bg-white/10 transition"
          >
            Request access
          </Link>
          <Link
            to="/login"
            className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 text-xs font-semibold shadow-lg shadow-blue-500/30"
          >
            Sign in
          </Link>
        </div>
        <button
          className="lg:hidden w-10 h-10 grid place-items-center rounded-full border border-white/15 text-slate-100"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle navigation"
        >
          <span className="block text-xl font-semibold">
            {open ? '×' : '≡'}
          </span>
        </button>
      </div>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
};

export default Navbar;
