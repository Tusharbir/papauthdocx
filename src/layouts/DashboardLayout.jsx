import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import useUIStore from '../store/uiStore';

const DashboardLayout = () => {
  const mode = useUIStore((state) => state.mode);
  const isDark = mode === 'dark';
  const shellClasses = `dashboard-shell min-h-screen w-full ${isDark ? 'text-slate-100' : 'text-slate-900'}`;
  const contentBg = isDark
    ? 'bg-gradient-to-b from-[#0b1220] via-[#0f172a] to-[#0b1220]'
    : 'bg-gradient-to-b from-[#f5f7fb] via-white to-[#eef2ff]';

  return (
    <div className={shellClasses}>
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
