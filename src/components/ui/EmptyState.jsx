import Button from './Button';
import cn from '../../utils/cn';
import useUIStore from '../../store/uiStore';

const EmptyState = ({ title, description, actionLabel, onAction, className }) => {
  const mode = useUIStore((state) => state.mode);
  const base = mode === 'dark'
    ? 'border-white/20 bg-white/5 text-slate-300'
    : 'border-slate-200 bg-slate-50 text-slate-600';
  const titleColor = mode === 'dark' ? 'text-white' : 'text-slate-900';
  const descColor = mode === 'dark' ? 'text-slate-400' : 'text-slate-500';
  return (
    <div className={cn('rounded-3xl border border-dashed p-10 text-center', base, className)}>
      <p className={cn('text-lg font-semibold', titleColor)}>{title}</p>
      {description && <p className={cn('mt-2 text-sm', descColor)}>{description}</p>}
      {actionLabel && (
        <Button className="mt-4" onClick={onAction} variant={mode === 'dark' ? 'secondary' : 'primary'}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
