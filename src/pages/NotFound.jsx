import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => (
  <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
    <Navbar />
    <main className="flex flex-col items-center justify-center flex-1 px-6 text-center space-y-4">
      <p className="text-sm uppercase tracking-[0.4em] text-emerald-300">404</p>
      <h1 className="text-4xl font-semibold">Surface not found</h1>
      <p className="text-slate-300/90 max-w-md">
        The page you requested isn&apos;t wired into the PapDocAuthX mesh yet. Return to the overview or jump into the demo.
      </p>
      <div className="flex gap-4">
        <Link to="/" className="px-5 py-2 rounded-full bg-white/10 text-sm font-medium">Back home</Link>
        <Link to="/demo" className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 text-sm font-medium">
          Open demo
        </Link>
      </div>
    </main>
    <Footer />
  </div>
);

export default NotFound;
