import useUIStore from '../../store/uiStore';
import cn from '../../utils/cn';

const baseStyles =
  'inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

const Button = ({ className = '', variant = 'primary', ...props }) => {
  const mode = useUIStore((state) => state.mode);
  const isDark = mode === 'dark';

  const variants = {
    primary:
      'bg-gradient-to-r from-blue-500 to-emerald-400 text-white shadow-lg shadow-blue-500/30 hover:brightness-110 focus-visible:ring-blue-300 focus-visible:ring-offset-transparent',
    secondary: isDark
      ? 'border border-white/20 bg-white/10 text-white hover:bg-white/20 focus-visible:ring-white/30 focus-visible:ring-offset-transparent'
      : 'border border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-50 focus-visible:ring-blue-200 focus-visible:ring-offset-white',
    ghost: isDark
      ? 'text-slate-300 hover:text-white focus-visible:ring-white/30 focus-visible:ring-offset-transparent'
      : 'text-slate-600 hover:text-slate-900 focus-visible:ring-blue-200 focus-visible:ring-offset-white',
  };

  return <button className={cn(baseStyles, variants[variant], className)} {...props} />;
};

export default Button;
