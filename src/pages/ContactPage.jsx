import { useState } from 'react';
import { Box, Container, Paper, Stack, TextField, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', organization: '', email: '', message: '' });
  const { enqueueSnackbar } = useSnackbar();

  const handleSubmit = (event) => {
    event.preventDefault();
    
    // For now, just show success message
    // In production, this would send email to superadmin
    enqueueSnackbar(
      'Request received. Our team will contact you within 24-48 hours.',
      { variant: 'success' }
    );
    
    // Reset form
    setForm({ name: '', organization: '', email: '', message: '' });
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
                    PapDocAuthX+ is an enterprise-grade document authentication platform. 
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
                    />
                    
                    <TextField
                      label="Organization Name"
                      fullWidth
                      required
                      value={form.organization}
                      onChange={(e) => setForm({ ...form, organization: e.target.value })}
                      helperText="University, Corporation, Government Agency, etc."
                    />
                    
                    <TextField
                      label="Official Email"
                      fullWidth
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      helperText="Please use your organization's email address"
                    />
                    
                    <TextField
                      label="Message"
                      fullWidth
                      multiline
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your document authentication needs..."
                    />

                    <Button
                      variant="contained"
                      type="submit"
                      size="large"
                      fullWidth
                      sx={{ py: 1.5 }}
                    >
                      Submit Request
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
