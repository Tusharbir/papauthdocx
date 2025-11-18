import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import cn from '../../utils/cn';

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const panel = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

const Modal = ({ open, onClose, children, className }) =>
  createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdrop}
        >
          <div className="absolute inset-0 bg-slate-950/70" onClick={onClose} />
          <motion.div
            variants={panel}
            className={cn('relative z-10 w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900/90 p-6', className)}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );

export default Modal;
