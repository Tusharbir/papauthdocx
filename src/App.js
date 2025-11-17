import { useMemo } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleRoute from './components/layout/RoleRoute';
import LandingPage from './pages/Landing/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import HomePage from './pages/HomePage';
import DemoPage from './pages/DemoPage';
import DocsPage from './pages/DocsPage';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard/Dashboard';
import UploadDocument from './pages/Documents/UploadDocument';
import DocumentDetails from './pages/Documents/DocumentDetails';
import VerifyDocument from './pages/Verification/VerifyDocument';
import StateManager from './pages/Workflow/StateManager';
import RevokeDocument from './pages/Revocation/RevokeDocument';
import GenerateQR from './pages/QR/GenerateQR';
import ScanQR from './pages/QR/ScanQR';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import useUIStore from './store/uiStore';
import buildTheme from './theme/muiTheme';

const Shell = ({ children }) => (
  <Box
    display="flex"
    minHeight="100vh"
    sx={{ bgcolor: (theme) => theme.palette.background.default }}
  >
    <Sidebar />
    <Box flexGrow={1} display="flex" flexDirection="column">
      <Topbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: { xs: 2.5, md: 4 },
          background: (theme) =>
            theme.palette.mode === 'light'
              ? 'linear-gradient(180deg,#F4F8FB,#E8F0FB)'
              : 'radial-gradient(circle at top,#111827,#05070C)',
        }}
      >
        {children}
      </Box>
    </Box>
  </Box>
);

const ShellLayout = () => (
  <Shell>
    <Outlet />
  </Shell>
);

const App = () => {
  const location = useLocation();
  const mode = useUIStore((state) => state.mode);
  const theme = useMemo(() => buildTheme(mode), [mode]);

  const routes = (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<ShellLayout />}>
            <Route element={<RoleRoute allowedRoles={['admin', 'user']} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/documents/upload" element={<UploadDocument />} />
              <Route path="/qr/generate" element={<GenerateQR />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={['admin', 'user', 'verifier']} />}>
              <Route path="/documents/:documentId" element={<DocumentDetails />} />
              <Route path="/qr/scan" element={<ScanQR />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={['admin', 'verifier']} />}>
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/workflow" element={<StateManager />} />
              <Route path="/revocations" element={<RevokeDocument />} />
            </Route>
          </Route>
          <Route element={<RoleRoute allowedRoles={['admin', 'verifier']} />}>
            <Route path="/verify" element={<VerifyDocument />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={4} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        {routes}
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;
