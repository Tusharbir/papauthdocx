import Button from './Button';
import cn from '../../utils/cn';
import useUIStore from '../../store/uiStore';

const PageHeader = ({ title, subtitle, actions = [], className }) => {
  const mode = useUIStore((state) => state.mode);
  const titleColor = mode === 'dark' ? 'text-white' : 'text-slate-900';
  const subtitleColor = mode === 'dark' ? 'text-slate-300/80' : 'text-slate-500';
  return (
    <div className={cn('mb-6 flex flex-wrap items-center justify-between gap-4', className)}>
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-blue-300">PapDocAuthX</p>
        <h1 className={cn('text-3xl font-semibold', titleColor)}>{title}</h1>
        {subtitle && <p className={cn('text-sm', subtitleColor)}>{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button key={action.label} onClick={action.onClick} variant={action.variant || 'primary'}>
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default PageHeader;
