import { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Paper, Stack, TextField, Typography, Link } from '@mui/material';
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
    setBreadcrumbs(['PapDocAuthX+', 'Auth', 'Login']);
  }, [setBreadcrumbs]);

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setSession({ token: data.token, refreshToken: data.refreshToken, user: data.user });
      enqueueSnackbar('Welcome back. Threat counters synchronized.', { variant: 'success' });
      navigate('/dashboard');
    },
    onError: () => enqueueSnackbar('Unable to authenticate.', { variant: 'error' }),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(form);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0F172A, #1D3B5D)',
      }}
    >
      <Container maxWidth="sm">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          <Paper sx={{ p: 5, borderRadius: 4 }}>
            <Stack spacing={3}>
              <div>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Secure Login
                </Typography>
                <Typography color="text.secondary">Authenticate to access PapDocAuthX+ control plane.</Typography>
              </div>
              <Stack component="form" spacing={3} onSubmit={handleSubmit}>
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
                <Button type="submit" variant="contained" size="large" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Validating…' : 'Login'}
                </Button>
              </Stack>
              <Link component={RouterLink} to="/auth/register" color="primary">
                Request access
              </Link>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Login;
