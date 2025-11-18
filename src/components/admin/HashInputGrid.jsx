import Card from '../ui/Card';
import useUIStore from '../../store/uiStore';

const hashMeta = [
  { name: 'textHash', label: 'Text hash' },
  { name: 'imageHash', label: 'Image hash' },
  { name: 'signatureHash', label: 'Signature hash' },
  { name: 'stampHash', label: 'Stamp hash' },
];

const HashInputGrid = ({ hashes, onChange, wrap = true }) => {
  const mode = useUIStore((state) => state.mode);
  const inputClass =
    mode === 'dark'
      ? 'border-white/10 bg-white/5 text-white'
      : 'border-slate-300 bg-white text-slate-900';
  const labelColor = mode === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const content = (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {hashMeta.map((meta) => (
        <div key={meta.name} className="space-y-2">
          <label className={`text-xs uppercase tracking-[0.3em] ${labelColor}`}>{meta.label}</label>
          <input
            className={`w-full rounded-2xl px-4 py-3 font-mono text-sm outline-none focus:border-blue-400 ${inputClass}`}
            placeholder={`0x${meta.name}`}
            value={hashes[meta.name] || ''}
            onChange={(e) => onChange({ ...hashes, [meta.name]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
  if (!wrap) return content;
  return (
    <Card className="p-6">
      <p className="text-sm font-semibold">Multi-modal hashes</p>
      {content}
    </Card>
  );
};

export default HashInputGrid;
