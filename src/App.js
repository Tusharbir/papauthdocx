import { useMemo } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Routes, Route, useLocation } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/layout/ProtectedRoute';
import RoleRoute from './components/layout/RoleRoute';
import Login from './pages/Auth/Login';
import HomePage from './pages/HomePage';
import DemoPage from './pages/DemoPage';
import DocsPage from './pages/DocsPage';
import ContactPage from './pages/ContactPage';
import NotFound from './pages/NotFound';
import SuperAdminDashboard from './pages/Dashboard/SuperAdminDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import UserDashboard from './pages/Dashboard/UserDashboard';
import UploadDocument from './pages/Documents/UploadDocument';
import DocumentsList from './pages/Documents/DocumentsList';
import DocumentDetails from './pages/Documents/DocumentDetails';
import VerifierDocumentsList from './pages/Documents/VerifierDocumentsList';
import VerifyDocument from './pages/Verification/VerifyDocument';
import StateManager from './pages/Workflow/StateManager';
import RevokeDocument from './pages/Revocation/RevokeDocument';
import GenerateQR from './pages/QR/GenerateQR';
import ScanQR from './pages/QR/ScanQR';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import OrganizationList from './pages/Organizations/OrganizationList';
import OrganizationAdmins from './pages/Organizations/OrganizationAdmins';
import AllUsersList from './pages/Users/AllUsersList';
import OrgUsersList from './pages/Users/OrgUsersList';
import AllAuditLogs from './pages/Audit/AllAuditLogs';
import OrgAuditLogs from './pages/Audit/OrgAuditLogs';
import DocumentVersions from './pages/Documents/DocumentVersions';
import RevokeVersion from './pages/Documents/RevokeVersion';
import AccessRequests from './pages/AccessRequests/AccessRequests';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
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
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/verify" element={<VerifyDocument />} />
        <Route path="/qr/:docId" element={<PublicQrPage />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Superadmin Routes */}
            <Route element={<RoleRoute allowedRoles={['superadmin']} />}>
              <Route path="/dashboard/superadmin" element={<SuperAdminDashboard />} />
              <Route path="/dashboard/superadmin/organizations" element={<OrganizationList />} />
              <Route path="/dashboard/superadmin/organizations/:id/admins" element={<OrganizationAdmins />} />
              <Route path="/dashboard/superadmin/users" element={<AllUsersList />} />
              <Route path="/dashboard/superadmin/audit" element={<AllAuditLogs />} />
              <Route path="/dashboard/superadmin/analytics" element={<AnalyticsDashboard />} />
              <Route path="/dashboard/superadmin/access-requests" element={<AccessRequests />} />
              {/* Superadmin shared features */}
              <Route path="/dashboard/superadmin/documents" element={<DocumentsList />} />
              <Route path="/dashboard/superadmin/upload" element={<UploadDocument />} />
              <Route path="/dashboard/superadmin/documents/:docId" element={<DocumentDetails />} />
              <Route path="/dashboard/superadmin/documents/:docId/versions" element={<DocumentVersions />} />
              <Route path="/dashboard/superadmin/documents/:docId/revoke/:versionNumber" element={<RevokeVersion />} />
              <Route path="/dashboard/superadmin/verify" element={<VerifyDocument />} />
              <Route path="/dashboard/superadmin/qr/generate" element={<GenerateQR />} />
              <Route path="/dashboard/superadmin/workflow" element={<StateManager />} />
              <Route path="/dashboard/superadmin/revocations" element={<RevokeDocument />} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/dashboard/admin" element={<AdminDashboard />} />
              <Route path="/dashboard/admin/documents" element={<DocumentsList />} />
              <Route path="/dashboard/admin/upload" element={<UploadDocument />} />
              <Route path="/dashboard/admin/documents/:docId" element={<DocumentDetails />} />
              <Route path="/dashboard/admin/documents/:docId/versions" element={<DocumentVersions />} />
              <Route path="/dashboard/admin/documents/:docId/revoke/:versionNumber" element={<RevokeVersion />} />
              <Route path="/dashboard/admin/verify" element={<VerifyDocument />} />
              <Route path="/dashboard/admin/analytics" element={<AnalyticsDashboard />} />
              <Route path="/dashboard/admin/users" element={<OrgUsersList />} />
              <Route path="/dashboard/admin/audit" element={<OrgAuditLogs />} />
              <Route path="/dashboard/admin/qr/generate" element={<GenerateQR />} />
              <Route path="/dashboard/admin/workflow" element={<StateManager />} />
              <Route path="/dashboard/admin/revocations" element={<RevokeDocument />} />
            </Route>
            
            {/* User/Verifier Routes */}
            <Route element={<RoleRoute allowedRoles={['user', 'verifier']} />}>
              <Route path="/dashboard/user" element={<UserDashboard />} />
              <Route path="/dashboard/user/documents" element={<VerifierDocumentsList />} />
              <Route path="/dashboard/user/verify" element={<VerifyDocument />} />
              <Route path="/dashboard/user/history" element={<AnalyticsDashboard />} />
              <Route path="/dashboard/user/qr/scan" element={<ScanQR />} />
            </Route>
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
