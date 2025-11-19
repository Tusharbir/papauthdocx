import { Fragment, useMemo } from 'react';
import { Box, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Tooltip } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';

const APP_NAME = process.env.REACT_APP_NAME || 'PapDocAuthX';
const APP_SHORT_NAME = process.env.REACT_APP_SHORT_NAME || 'PDX+';

const navConfig = [
  // Superadmin only (exclusive features)
  { label: 'Dashboard', icon: <SpaceDashboardOutlinedIcon />, path: '/dashboard/superadmin', roles: ['superadmin'] },
  { label: 'Organizations', icon: <BusinessOutlinedIcon />, path: '/dashboard/superadmin/organizations', roles: ['superadmin'] },
  { label: 'All Users', icon: <PeopleOutlinedIcon />, path: '/dashboard/superadmin/users', roles: ['superadmin'] },
  { label: 'All Audit Logs', icon: <AssignmentOutlinedIcon />, path: '/dashboard/superadmin/audit', roles: ['superadmin'] },
  { label: 'Analytics', icon: <QueryStatsOutlinedIcon />, path: '/dashboard/superadmin/analytics', roles: ['superadmin'] },
  
  // Admin features (also available to superadmin)
  { label: 'Dashboard', icon: <SpaceDashboardOutlinedIcon />, path: '/dashboard/admin', roles: ['admin'] },
  { label: 'Upload Document', icon: <UploadFileOutlinedIcon />, path: '/dashboard/admin/upload', roles: ['admin', 'superadmin'] },
  { label: 'Documents', icon: <DescriptionOutlinedIcon />, path: '/dashboard/admin/documents', roles: ['admin', 'superadmin'] },
  { label: 'Verify Document', icon: <VerifiedOutlinedIcon />, path: '/dashboard/admin/verify', roles: ['admin', 'superadmin'] },
  { label: 'Generate QR', icon: <QrCode2OutlinedIcon />, path: '/dashboard/admin/qr/generate', roles: ['admin', 'superadmin'] },
  { label: 'Workflow', icon: <HubOutlinedIcon />, path: '/dashboard/admin/workflow', roles: ['admin', 'superadmin'] },
  { label: 'Revocations', icon: <BlockOutlinedIcon />, path: '/dashboard/admin/revocations', roles: ['admin', 'superadmin'] },
  { label: 'Org Users', icon: <PeopleOutlinedIcon />, path: '/dashboard/admin/users', roles: ['admin'] },
  { label: 'Org Audit Logs', icon: <AssignmentOutlinedIcon />, path: '/dashboard/admin/audit', roles: ['admin', 'superadmin'] },
  { label: 'Analytics', icon: <QueryStatsOutlinedIcon />, path: '/dashboard/admin/analytics', roles: ['admin'] },
  
  // User/Verifier only
  { label: 'Dashboard', icon: <SpaceDashboardOutlinedIcon />, path: '/dashboard/user', roles: ['user', 'verifier'] },
  { label: 'Verify Document', icon: <VerifiedOutlinedIcon />, path: '/dashboard/user/verify', roles: ['user', 'verifier'] },
  { label: 'Scan QR', icon: <QrCode2OutlinedIcon />, path: '/dashboard/user/qr/scan', roles: ['user', 'verifier'] },
  { label: 'History', icon: <HistoryOutlinedIcon />, path: '/dashboard/user/history', roles: ['user', 'verifier'] },
];

const Sidebar = () => {
  const location = useLocation();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const role = useAuthStore((state) => state.role) || 'admin';

  const items = useMemo(
    () => navConfig.filter((item) => !item.roles || item.roles.includes(role)),
    [role]
  );

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 260 : 86 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      style={{
        height: '100vh',
        position: 'sticky',
        top: 0,
        backdropFilter: 'blur(16px)',
        background: sidebarOpen
          ? 'linear-gradient(180deg, rgba(17,24,39,0.9), rgba(17,24,39,0.7))'
          : 'rgba(17,24,39,0.85)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        zIndex: 1100,
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" px={2} py={3}>
        <Typography variant="h6" color="white" fontWeight={700} sx={{ letterSpacing: 1 }}>
          {sidebarOpen ? APP_NAME : APP_SHORT_NAME}
        </Typography>
        <IconButton size="small" onClick={toggleSidebar} sx={{ color: 'white' }}>
          <MenuOpenRoundedIcon />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)' }} />
      <List sx={{ mt: 2 }}>
        {items.map((item) => {
          const active = location.pathname.startsWith(item.path);
          const content = (
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{
                mx: 1.5,
                mb: 1,
                borderRadius: 3,
                color: 'rgba(255,255,255,0.85)',
                backgroundColor: active ? 'rgba(0,100,255,0.18)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(0,196,180,0.18)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
              {sidebarOpen && <ListItemText primary={item.label} />}
            </ListItemButton>
          );

          return sidebarOpen ? (
            <Fragment key={item.path}>{content}</Fragment>
          ) : (
            <Tooltip key={item.path} title={item.label} placement="right">
              {content}
            </Tooltip>
          );
        })}
      </List>
    </motion.aside>
  );
};

export default Sidebar;
