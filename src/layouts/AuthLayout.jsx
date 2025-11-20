import { Outlet } from 'react-router-dom';
import useUIStore from '../store/uiStore';

const AuthLayout = () => {
  const mode = useUIStore((state) => state.mode);
  const isDark = mode === 'dark';

  const shellBg = isDark
    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white'
    : 'bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900';

  const leftPanel = isDark
    ? 'border-white/10 bg-gradient-to-b from-blue-600/30 to-slate-900/20 text-slate-100'
    : 'border-slate-200 bg-gradient-to-b from-white to-slate-100 text-slate-800';

  const rightPanel = isDark ? 'bg-slate-950/70' : 'bg-white/80 backdrop-blur';
  const cardStyles = isDark
    ? 'border-white/10 bg-slate-950/80 shadow-2xl'
    : 'border-slate-200 bg-white/95 shadow-xl';

  return (
    <div className={`min-h-screen ${shellBg}`}>
      <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
        <div className={`hidden flex-col justify-between border-r p-10 lg:flex ${leftPanel}`}>
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-emerald-400">PapDocAuthX</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight">Multi-modal document authentication</h1>
            <p className={`mt-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Verify certificates, contracts, and credentials with zero-knowledge hashing, Merkle visibility, and automated audit trails.
            </p>
          </div>
          <div className={`space-y-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            <p>• Multi-modal hashing (text/image/signature/stamp)</p>
            <p>• Version chains across MongoDB + SQL audit</p>
            <p>• RBAC-ready dashboards for superadmins, admins, verifiers</p>
          </div>
        </div>
        <div className={`flex items-center justify-center px-5 py-10 sm:px-8 ${rightPanel}`}>
          <div className={`w-full max-w-lg rounded-3xl border p-8 sm:p-10 ${cardStyles}`}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
