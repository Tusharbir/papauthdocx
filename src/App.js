import { useMemo } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Routes, Route, useLocation } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleRoute from './components/layout/RoleRoute';
import LandingPage from './pages/Landing/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import HomePage from './pages/HomePage';
import DemoPage from './pages/DemoPage';
import DocsPage from './pages/DocsPage';
import NotFound from './pages/NotFound';
import SuperAdminDashboard from './pages/Dashboard/SuperAdminDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import UserDashboard from './pages/Dashboard/UserDashboard';
import UploadDocument from './pages/Documents/UploadDocument';
import DocumentDetails from './pages/Documents/DocumentDetails';
import VerifyDocument from './pages/Verification/VerifyDocument';
import StateManager from './pages/Workflow/StateManager';
import RevokeDocument from './pages/Revocation/RevokeDocument';
import GenerateQR from './pages/QR/GenerateQR';
import ScanQR from './pages/QR/ScanQR';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import OrganizationList from './pages/Organizations/OrganizationList';
import OrganizationAdmins from './pages/Organizations/OrganizationAdmins';
import DocumentVersions from './pages/Documents/DocumentVersions';
import RevokeVersion from './pages/Documents/RevokeVersion';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import PublicVerifyPage from './pages/Public/PublicVerifyPage';
import PublicQrPage from './pages/Public/PublicQrPage';
import useUIStore from './store/uiStore';
import buildTheme from './theme/muiTheme';

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
        <Route path="/verify-public" element={<PublicVerifyPage />} />
        <Route path="/qr/:docId" element={<PublicQrPage />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route element={<RoleRoute allowedRoles={['superadmin']} />}>
              <Route path="/dashboard/superadmin" element={<SuperAdminDashboard />} />
              <Route path="/organizations" element={<OrganizationList />} />
              <Route path="/organizations/:id/admins" element={<OrganizationAdmins />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/documents/upload" element={<UploadDocument />} />
              <Route path="/documents/:docId/versions" element={<DocumentVersions />} />
              <Route path="/documents/:docId/revoke/:versionNumber" element={<RevokeVersion />} />
              <Route path="/documents/:documentId" element={<DocumentDetails />} />
              <Route path="/qr/generate" element={<GenerateQR />} />
              <Route path="/workflow" element={<StateManager />} />
              <Route path="/revocations" element={<RevokeDocument />} />
            </Route>
            <Route element={<RoleRoute allowedRoles={['user', 'verifier', 'admin']} />}>
              <Route path="/dashboard/user" element={<UserDashboard />} />
              <Route path="/qr/scan" element={<ScanQR />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
            </Route>
          </Route>
          <Route element={<RoleRoute allowedRoles={['admin', 'verifier', 'user']} />}>
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
