import { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Button, Paper, Stack, TextField, Typography, Link } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import authApi from '../../api/authApi';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { enqueueSnackbar } = useSnackbar();
  const setSession = useAuthStore((state) => state.setSession);
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const navigate = useNavigate();

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX', 'Auth', 'Login']);
  }, [setBreadcrumbs]);

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setSession({ token: data.token, refreshToken: data.refreshToken, user: data.user });
      enqueueSnackbar('Welcome back. Threat counters synchronized.', { variant: 'success' });
      const role = data.user?.role || 'user';
      const roleRoutes = {
        superadmin: '/dashboard/superadmin',
        admin: '/dashboard/admin',
        verifier: '/dashboard/user',
        user: '/dashboard/user',
      };
      navigate(roleRoutes[role] || '/dashboard/user', { replace: true });
    },
    onError: () => enqueueSnackbar('Unable to authenticate.', { variant: 'error' }),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(form);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          background: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15,23,42,0.85)' : '#ffffff'),
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 28px 80px rgba(0,0,0,0.45)'
              : '0 28px 80px rgba(15,23,42,0.18)',
        }}
      >
        <Stack spacing={3}>
          <div>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Secure Login
            </Typography>
            <Typography color="text.secondary">Authenticate to access PapDocAuthX control plane.</Typography>
          </div>
          <Stack component="form" spacing={2.5} onSubmit={handleSubmit}>
            <TextField
              label="Enterprise Email"
              fullWidth
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              label="Password"
              fullWidth
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" variant="contained" size="large" fullWidth disabled={mutation.isPending}>
              {mutation.isPending ? 'Validating…' : 'Login'}
            </Button>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Link component={RouterLink} to="/contact" color="primary">
              Request access
            </Link>
            <Link component={RouterLink} to="/" color="primary">
              Home Page
            </Link>
          </Stack>
        </Stack>
      </Paper>
    </motion.div>
  );
};

export default Login;
