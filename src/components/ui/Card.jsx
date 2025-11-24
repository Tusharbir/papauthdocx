import cn from '../../utils/cn';
import useUIStore from '../../store/uiStore';


const Card = ({ children, className, onClick, ...rest }) => {
  const mode = useUIStore((state) => state.mode);
  const themeClass =
    mode === 'dark'
      ? 'border-white/10 bg-white/5 text-white'
      : 'border-slate-200 bg-white text-slate-900 shadow-[0_15px_45px_rgba(15,23,42,0.08)]';

  if (onClick) {
    // Fallback for keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    };
    return (
      <button
        type="button"
        role="button"
        aria-label="Card Button"
        className={cn('rounded-3xl backdrop-blur border transition-colors p-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400', themeClass, className)}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        {...rest}
      >
        {children}
      </button>
    );
  }
  return (
    <div className={cn('rounded-3xl backdrop-blur border transition-colors p-6', themeClass, className)}>
      {children}
    </div>
  );
};

export default Card;
