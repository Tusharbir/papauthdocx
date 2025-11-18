import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import useUIStore from '../store/uiStore';

const DashboardLayout = () => {
  const mode = useUIStore((state) => state.mode);
  const shellClasses = mode === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900';
  const contentBg =
    mode === 'dark'
      ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950'
      : 'bg-gradient-to-b from-slate-50 via-white to-slate-100';

  return (
    <div className={`min-h-screen w-full ${shellClasses}`}>
      <div className="flex">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
          <main className={`flex-1 overflow-y-auto px-4 py-6 md:px-8 ${contentBg}`}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
