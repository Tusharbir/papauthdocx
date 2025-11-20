import { useState } from 'react';
import { Box, Container, Paper, Stack, TextField, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import { useMutation } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import accessRequestApi from '../api/accessRequestApi';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', organization: '', email: '', message: '' });
  const { enqueueSnackbar } = useSnackbar();

  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: accessRequestApi.submit,
    onSuccess: (data) => {
      enqueueSnackbar(data.message || 'Request submitted successfully!', { variant: 'success' });
      setForm({ name: '', organization: '', email: '', message: '' });
    },
    onError: (error) => {
      // Prefer validation details if present
      const details = error.response?.data?.details;
      if (Array.isArray(details) && details.length > 0) {
        details.forEach(d => enqueueSnackbar(`${d.field}: ${d.message}`, { variant: 'error' }));
        return;
      }

      const message = error.response?.data?.error || 'Failed to submit request. Please try again.';
      enqueueSnackbar(message, { variant: 'error' });
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    // Client-side validation
    const newErrors = {};
    if (!form.name || form.name.trim().length < 2) newErrors.name = 'Please enter your name (min 2 chars)';
    if (!form.organization || form.organization.trim().length < 2) newErrors.organization = 'Please enter organization name (min 2 chars)';
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = 'Please enter a valid email';
    if (form.message && form.message.length > 2000) newErrors.message = 'Message must not exceed 2000 characters';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <Box sx={{ py: 8 }}>
        <Container maxWidth="md">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
            <Paper sx={{ p: 5, borderRadius: 4, bgcolor: 'background.paper' }}>
              <Stack spacing={3}>
                <div>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    Request Enterprise Access
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    PapDocAuthX is an enterprise-grade document authentication platform. 
                    Fill out the form below and our team will contact you to set up your organization.
                  </Typography>
                </div>

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      label="Full Name"
                      fullWidth
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      error={!!errors.name}
                      helperText={errors.name}
                    />
                    
                    <TextField
                      label="Organization Name"
                      fullWidth
                      required
                      value={form.organization}
                      onChange={(e) => setForm({ ...form, organization: e.target.value })}
                      helperText={errors.organization || 'University, Corporation, Government Agency, etc.'}
                      error={!!errors.organization}
                    />
                    
                    <TextField
                      label="Official Email"
                      fullWidth
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      helperText={errors.email || "Please use your organization's email address"}
                      error={!!errors.email}
                    />
                    
                    <TextField
                      label="Message"
                      fullWidth
                      multiline
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your document authentication needs..."
                      error={!!errors.message}
                      helperText={errors.message}
                    />

                    <Button
                      variant="contained"
                      type="submit"
                      size="large"
                      fullWidth
                      disabled={mutation.isPending}
                      sx={{ py: 1.5 }}
                    >
                      {mutation.isPending ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </Stack>
                </Box>

                <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>What happens next?</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    1. Our team reviews your request (24-48 hours)
                    <br />
                    2. We'll schedule a demo and discuss your requirements
                    <br />
                    3. Upon approval, we'll create your organization account
                    <br />
                    4. You'll receive login credentials and onboarding materials
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </motion.div>
        </Container>
      </Box>
      <Footer />
    </div>
  );
};

export default ContactPage;
