import cn from '../../utils/cn';
import useUIStore from '../../store/uiStore';

const Card = ({ children, className }) => {
  const mode = useUIStore((state) => state.mode);
  const themeClass =
    mode === 'dark'
      ? 'border-white/10 bg-white/5 text-white'
      : 'border-slate-200 bg-white text-slate-900 shadow-[0_15px_45px_rgba(15,23,42,0.08)]';
  return (
    <div className={cn('rounded-3xl backdrop-blur border transition-colors', themeClass, className)}>
      {children}
    </div>
  );
};

export default Card;
