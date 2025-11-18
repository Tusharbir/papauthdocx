import { Outlet } from 'react-router-dom';

const AuthLayout = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
    <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
      <div className="hidden flex-col justify-between border-r border-white/10 bg-gradient-to-b from-blue-600/30 to-slate-900/20 p-12 lg:flex">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-300">PapDocAuthX+</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Multi-modal document authentication</h1>
          <p className="mt-4 text-slate-300">
            Verify certificates, contracts, and credentials with zero-knowledge hashing, Merkle visibility, and automated audit trails.
          </p>
        </div>
        <div className="space-y-4 text-sm text-slate-300">
          <p>• Multi-modal hashing (text/image/signature/stamp)</p>
          <p>• Version chains across MongoDB + SQL audit</p>
          <p>• RBAC-ready dashboards for superadmins, admins, verifiers</p>
        </div>
      </div>
      <div className="flex items-center justify-center bg-slate-950/70 p-8">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
