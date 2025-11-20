import useUIStore from '../../store/uiStore';
import cn from '../../utils/cn';

const paletteDark = {
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40',
  warning: 'bg-amber-500/15 text-amber-200 border-amber-400/40',
  danger: 'bg-rose-500/15 text-rose-200 border-rose-400/40',
  info: 'bg-blue-500/15 text-blue-200 border-blue-400/40',
  neutral: 'bg-white/10 text-white border-white/20',
};

const paletteLight = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
};

const Badge = ({ children, tone = 'neutral', className }) => {
  const mode = useUIStore((state) => state.mode);
  const palette = mode === 'dark' ? paletteDark : paletteLight;

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full border text-xs uppercase tracking-[0.25em]',
        palette[tone],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
