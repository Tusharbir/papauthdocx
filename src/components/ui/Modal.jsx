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

const Modal = ({ open, onClose, children, className, size = 'md', maxHeight = '70vh' }) => {
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
    full: 'max-w-[80vw]',
    fullscreen: 'w-screen h-screen max-w-none max-h-none rounded-none p-0 m-0',
  };

  // Only apply max-w-[80vw] for size='full', not for all modals
  let widthClass = '';
  if (size === 'fullscreen') widthClass = sizeClasses.fullscreen;
  else if (size === 'full') widthClass = sizeClasses.full;
  else if (sizeClasses[size]) widthClass = sizeClasses[size];

  // Try to find main content area for portal target
  const portalTarget = document.querySelector('main') || document.body;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className={size === 'fullscreen'
            ? 'fixed top-0 left-0 w-screen h-screen flex flex-col justify-center items-center p-0 m-0 z-[2000]'
            : 'fixed top-0 left-0 w-full h-full flex flex-col justify-center items-center p-4 md:p-8'}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdrop}
        >
          <div className={`fixed inset-0 ${backdropClass}`} onClick={onClose} />
          <motion.div
            variants={panel}
            style={size === 'fullscreen' ? { maxHeight: '100vh', height: '100vh' } : { maxHeight: '70vh' }}
            className={cn(
              size === 'fullscreen'
                ? 'w-screen h-screen max-w-none max-h-none rounded-none border-none p-0 m-0 flex flex-col bg-slate-950/95 text-white'
                : 'w-full rounded-3xl border backdrop-blur-xl overflow-hidden flex flex-col',
              widthClass,
              panelClass,
              className
            )}
          >
            {size !== 'fullscreen' && (
              <div className="flex-shrink-0 p-6 pr-16">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className={size === 'fullscreen' ? 'flex-1 overflow-hidden p-0' : 'flex-1 overflow-hidden px-6 pb-6'}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalTarget
  );
};

export default Modal;
