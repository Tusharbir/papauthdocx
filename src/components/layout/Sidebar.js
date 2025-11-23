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
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { USER_ROLES } from '../../constants/enums';

const APP_NAME = process.env.REACT_APP_NAME || 'PapDocAuthX';
const APP_SHORT_NAME = process.env.REACT_APP_SHORT_NAME || 'PDX+';

const navConfig = [
  // Superadmin-only features
  { label: 'Dashboard', icon: <SpaceDashboardOutlinedIcon />, pathTemplate: '/dashboard/{role}', roles: [USER_ROLES.SUPERADMIN] },
  { label: 'Organizations', icon: <BusinessOutlinedIcon />, pathTemplate: '/dashboard/{role}/organizations', roles: [USER_ROLES.SUPERADMIN] },
  { label: 'All Users', icon: <PeopleOutlinedIcon />, pathTemplate: '/dashboard/{role}/users', roles: [USER_ROLES.SUPERADMIN] },
  { label: 'Access Requests', icon: <PersonAddOutlinedIcon />, pathTemplate: '/dashboard/{role}/access-requests', roles: [USER_ROLES.SUPERADMIN] },
  { label: 'All Audit Logs', icon: <AssignmentOutlinedIcon />, pathTemplate: '/dashboard/{role}/audit', roles: [USER_ROLES.SUPERADMIN] },
  { label: 'Analytics', icon: <QueryStatsOutlinedIcon />, pathTemplate: '/dashboard/{role}/analytics', roles: [USER_ROLES.SUPERADMIN] },
  
  // Admin-only features
  { label: 'Dashboard', icon: <SpaceDashboardOutlinedIcon />, pathTemplate: '/dashboard/{role}', roles: [USER_ROLES.ADMIN] },
  { label: 'Users', icon: <PeopleOutlinedIcon />, pathTemplate: '/dashboard/{role}/users', roles: [USER_ROLES.ADMIN] },
  { label: 'Audit Logs', icon: <AssignmentOutlinedIcon />, pathTemplate: '/dashboard/{role}/audit', roles: [USER_ROLES.ADMIN] },
  { label: 'Analytics', icon: <QueryStatsOutlinedIcon />, pathTemplate: '/dashboard/{role}/analytics', roles: [USER_ROLES.ADMIN] },
  
  // Shared features (superadmin and admin)
  { label: 'Upload Document', icon: <UploadFileOutlinedIcon />, pathTemplate: '/dashboard/{role}/upload', roles: [USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN] },
  { label: 'Documents', icon: <DescriptionOutlinedIcon />, pathTemplate: '/dashboard/{role}/documents', roles: [USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN] },
  { label: 'Verify Document', icon: <VerifiedOutlinedIcon />, pathTemplate: '/dashboard/{role}/verify', roles: [USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN] },
  { label: 'Generate QR', icon: <QrCode2OutlinedIcon />, pathTemplate: '/dashboard/{role}/qr/generate', roles: [USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN] },
  { label: 'Workflow', icon: <HubOutlinedIcon />, pathTemplate: '/dashboard/{role}/workflow', roles: [USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN] },
  { label: 'Revocations', icon: <BlockOutlinedIcon />, pathTemplate: '/dashboard/{role}/revocations', roles: [USER_ROLES.SUPERADMIN, USER_ROLES.ADMIN] },
  
  // Verifier features
  { label: 'Dashboard', icon: <SpaceDashboardOutlinedIcon />, pathTemplate: '/dashboard/{role}', roles: [USER_ROLES.VERIFIER] },
  { label: 'Documents', icon: <DescriptionOutlinedIcon />, pathTemplate: '/dashboard/{role}/documents', roles: [USER_ROLES.VERIFIER] },
  { label: 'Verify Document', icon: <VerifiedOutlinedIcon />, pathTemplate: '/dashboard/{role}/verify', roles: [USER_ROLES.VERIFIER] },
  { label: 'Scan QR', icon: <QrCode2OutlinedIcon />, pathTemplate: '/dashboard/{role}/qr/scan', roles: [USER_ROLES.VERIFIER] },
  { label: 'History', icon: <HistoryOutlinedIcon />, pathTemplate: '/dashboard/{role}/history', roles: [USER_ROLES.VERIFIER] },
];

const Sidebar = () => {
  const location = useLocation();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const mode = useUIStore((state) => state.mode);
  const isDark = mode === 'dark';
  const role = useAuthStore((state) => state.role) || 'admin';

  const items = useMemo(() => {
    // Helper to resolve role-based paths
    const resolvePath = (item, currentRole) => {
      if (item.pathTemplate) {
        // Map role to URL segment
        const roleSegment = currentRole === USER_ROLES.SUPERADMIN ? 'superadmin' 
                          : currentRole === USER_ROLES.ADMIN ? 'admin' 
                          : 'user';
        return item.pathTemplate.replace('{role}', roleSegment);
      }
      return item.path;
    };

    // Filter items based on role and resolve their paths
    const filtered = navConfig
      .filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(role);
      })
      .map(item => ({
        ...item,
        path: resolvePath(item, role)
      }));

    return filtered;
  }, [role]);

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
          ? isDark
            ? 'linear-gradient(180deg, rgba(17,24,39,0.92), rgba(15,23,42,0.82))'
            : 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(241,245,249,0.92))'
          : isDark
            ? 'rgba(17,24,39,0.88)'
            : 'rgba(241,245,249,0.96)',
        borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" px={2} py={3} sx={{ flexShrink: 0 }}>
        <Typography variant="h6" color={isDark ? 'white' : 'text.primary'} fontWeight={700} sx={{ letterSpacing: 1 }}>
          {sidebarOpen ? APP_NAME : APP_SHORT_NAME}
        </Typography>
        <IconButton size="small" onClick={toggleSidebar} sx={{ color: isDark ? 'white' : 'text.primary' }}>
          <MenuOpenRoundedIcon />
        </IconButton>
      </Box>
      <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.08)', flexShrink: 0 }} />
      <List sx={{ 
        mt: 2, 
        flex: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)',
        },
        '&::-webkit-scrollbar-thumb': {
          background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.15)',
          borderRadius: '3px',
          '&:hover': {
            background: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.3)',
          },
        },
      }}>
        {items.map((item) => {
          // More precise active state detection
          // For exact dashboard paths, use exact match
          // For other paths, use startsWith but ensure it's not a false positive
          const isDashboardRoot = item.path.match(/^\/dashboard\/(superadmin|admin|user)$/);
          const active = isDashboardRoot 
            ? location.pathname === item.path 
            : location.pathname.startsWith(item.path);
            
          const content = (
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{
                mx: 1.5,
                mb: 1,
                borderRadius: 3,
                color: isDark ? 'rgba(255,255,255,0.85)' : '#0f172a',
                backgroundColor: active
                  ? isDark
                    ? 'rgba(0,100,255,0.18)'
                    : 'rgba(0,102,255,0.12)'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(0,196,180,0.18)' : 'rgba(0,196,180,0.14)',
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
