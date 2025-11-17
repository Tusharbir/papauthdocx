import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, Container, Grid, Paper, Stack, TextField, Typography, Link } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import authApi from '../../api/authApi';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', org: '' });
  const { enqueueSnackbar } = useSnackbar();
  const setSession = useAuthStore((state) => state.setSession);
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const navigate = useNavigate();

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX+', 'Auth', 'Register']);
  }, [setBreadcrumbs]);

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setSession({ token: data.token, refreshToken: data.refreshToken, user: data.user });
      enqueueSnackbar('Provisioning completed. Welcome to PapDocAuthX+. ', { variant: 'success' });
      navigate('/dashboard');
    },
    onError: () => enqueueSnackbar('Registration failed.', { variant: 'error' }),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(form);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg,#001F3F,#0B1220)', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="md">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
          <Paper sx={{ p: 5, borderRadius: 4 }}>
            <Stack spacing={3}>
              <Typography variant="h4" fontWeight={700}>
                Request Enterprise Access
              </Typography>
              <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Full Name" fullWidth required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Organization" fullWidth required value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Enterprise Email" fullWidth required value={form.email} type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField label="Password" fullWidth type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" type="submit" size="large" disabled={mutation.isPending} fullWidth>
                    {mutation.isPending ? 'Provisioning account…' : 'Create secure workspace'}
                  </Button>
                </Grid>
              </Grid>
              <Link component={RouterLink} to="/auth/login" color="primary">
                Already onboarded? Login
              </Link>
            </Stack>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Register;
