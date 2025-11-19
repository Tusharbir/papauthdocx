import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import cn from '../../utils/cn';
import useUIStore from '../../store/uiStore';

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panel = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

const Modal = ({ open, onClose, children, className, size = 'md' }) => {
  const mode = useUIStore((state) => state.mode);
  const backdropClass = mode === 'dark' ? 'bg-slate-950/70' : 'bg-slate-900/50';
  const panelClass = mode === 'dark' 
    ? 'border-white/10 bg-slate-900/95 text-white'
    : 'border-slate-200 bg-white text-slate-900 shadow-2xl';

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-[90vw]'
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-8 overflow-y-auto"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdrop}
        >
          <div className={`absolute inset-0 ${backdropClass}`} onClick={onClose} />
          <motion.div
            variants={panel}
            className={cn('relative z-10 w-full rounded-3xl border p-6 backdrop-blur-xl my-8 max-h-[calc(100vh-4rem)]', sizeClasses[size], panelClass, className)}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
