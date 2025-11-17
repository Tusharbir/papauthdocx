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
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';

const navConfig = [
  { label: 'Dashboard', icon: <SpaceDashboardOutlinedIcon />, path: '/dashboard', roles: ['admin', 'user'] },
  { label: 'Upload Documents', icon: <DescriptionOutlinedIcon />, path: '/documents/upload', roles: ['admin', 'user'] },
  { label: 'Document Details', icon: <DescriptionOutlinedIcon />, path: '/documents/DOC-2024-001', roles: ['admin', 'user', 'verifier'] },
  { label: 'Verify', icon: <VerifiedOutlinedIcon />, path: '/verify', roles: ['admin', 'verifier'] },
  { label: 'Workflow', icon: <HubOutlinedIcon />, path: '/workflow', roles: ['admin'] },
  { label: 'Revocations', icon: <BlockOutlinedIcon />, path: '/revocations', roles: ['admin'] },
  { label: 'QR Generate', icon: <QrCode2OutlinedIcon />, path: '/qr/generate', roles: ['admin', 'user'] },
  { label: 'QR Scan', icon: <QrCode2OutlinedIcon />, path: '/qr/scan', roles: ['admin', 'verifier', 'user'] },
  { label: 'Analytics', icon: <QueryStatsOutlinedIcon />, path: '/analytics', roles: ['admin', 'verifier'] },
];

const Sidebar = () => {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useUIStore((state) => ({
    sidebarOpen: state.sidebarOpen,
    toggleSidebar: state.toggleSidebar,
  }));
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
          {sidebarOpen ? 'PapDocAuthX+' : 'PDX+'}
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
