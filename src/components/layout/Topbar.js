import { useMemo } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Stack, Avatar, Chip, Button } from '@mui/material';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useSnackbar } from 'notistack';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';

const Topbar = () => {
  const mode = useUIStore((state) => state.mode);
  const toggleMode = useUIStore((state) => state.toggleMode);
  const breadcrumbs = useUIStore((state) => state.breadcrumbs);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role || 'guest');
  const logout = useAuthStore((state) => state.logout);
  const { enqueueSnackbar } = useSnackbar();

  const initials = useMemo(() => user?.fullName?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'PX', [user]);

  const handleLogout = () => {
    logout();
    enqueueSnackbar('Session terminated securely', { variant: 'info' });
  };

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        top: 0,
        backdropFilter: 'blur(16px)',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(17,24,39,0.9)'
            : 'rgba(255,255,255,0.8)',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 88 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1, minWidth: 0, mr: 2 }}>
          {breadcrumbs.map((crumb, index) => (
            <Stack direction="row" spacing={1} alignItems="center" key={`${crumb}-${index}`} sx={{ minWidth: 0 }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: { xs: '80px', sm: '120px', md: '200px' }
                }}
              >
                {crumb}
              </Typography>
              {index < breadcrumbs.length - 1 && (
                <Typography variant="body2" color="text.disabled" sx={{ flexShrink: 0 }}>
                  /
                </Typography>
              )}
            </Stack>
          ))}
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton onClick={toggleMode} color="inherit" sx={{ border: '1px solid', borderColor: 'divider' }}>
            {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
          </IconButton>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}>{initials}</Avatar>
            <Stack>
              <Typography variant="subtitle2">{user?.fullName || 'PapDoc User'}</Typography>
              <Chip size="small" label={role?.toUpperCase()} color="primary" variant="outlined" sx={{ borderRadius: 2 }} />
            </Stack>
          </Stack>
          <Button variant="contained" color="secondary" startIcon={<LogoutRoundedIcon />} onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
