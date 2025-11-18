const Loader = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-300">
    <span className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-blue-400" />
    <p className="text-sm uppercase tracking-[0.4em] text-slate-500">{label}</p>
  </div>
);

export default Loader;
