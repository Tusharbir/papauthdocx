import cn from '../../utils/cn';

const palette = {
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40',
  warning: 'bg-amber-500/15 text-amber-200 border-amber-400/40',
  danger: 'bg-rose-500/15 text-rose-200 border-rose-400/40',
  info: 'bg-blue-500/15 text-blue-200 border-blue-400/40',
  neutral: 'bg-white/10 text-white border-white/20',
};

const Badge = ({ children, tone = 'neutral', className }) => (
  <span className={cn('inline-flex items-center px-3 py-1 rounded-full border text-xs uppercase tracking-[0.25em]', palette[tone], className)}>
    {children}
  </span>
);

export default Badge;
