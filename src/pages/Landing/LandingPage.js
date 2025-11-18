import { useEffect } from 'react';
import { Box, Button, Container, Grid, Stack, Typography, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import useUIStore from '../../store/uiStore';

const LandingPage = () => {
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX+', 'Landing']);
  }, [setBreadcrumbs]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, rgba(0,102,255,0.35), rgba(17,24,39,1))',
        color: 'white',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Grid container spacing={10} alignItems="center">
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Typography variant="h2" fontWeight={700} gutterBottom>
                PapDocAuthX+
              </Typography>
              <Typography variant="h5" color="rgba(255,255,255,0.8)" mb={4}>
                Enterprise-grade document authentication with quantum-safe hashing, Merkle visibility, and AI-assisted verification.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button variant="contained" color="secondary" component={RouterLink} to="/login" size="large">
                  Secure Login
                </Button>
                <Button variant="outlined" color="inherit" component={RouterLink} to="/register">
                  Request access
                </Button>
              </Stack>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 5,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Typography variant="subtitle1" color="rgba(255,255,255,0.8)" gutterBottom>
                  Platform Signals
                </Typography>
                <Stack spacing={3}>
                  {['Zero-trust workflows', 'AI tamper scoring', 'RBAC visibility'].map((item) => (
                    <Box key={item} sx={{ p: 2.5, borderRadius: 3, border: '1px solid rgba(255,255,255,0.2)' }}>
                      <Typography variant="h6">{item}</Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.7)">
                        Always-encrypted updates with deterministic audit trails.
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
