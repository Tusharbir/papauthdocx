import cn from '../../utils/cn';

const baseStyles = 'inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

const variants = {
  primary: 'bg-gradient-to-r from-blue-500 to-emerald-400 text-white shadow-lg shadow-blue-500/30 hover:brightness-110 focus-visible:ring-blue-300',
  secondary: 'border border-white/20 bg-white/10 text-white hover:bg-white/20 focus-visible:ring-white/30',
  ghost: 'text-slate-300 hover:text-white',
};

const Button = ({ className = '', variant = 'primary', ...props }) => (
  <button className={cn(baseStyles, variants[variant], className)} {...props} />
);

export default Button;
