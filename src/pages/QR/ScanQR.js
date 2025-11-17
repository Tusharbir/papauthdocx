import { useEffect, useRef, useState } from 'react';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Button, Paper, Stack, Typography } from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { qrApi } from '../../api/qrApi';
import useUIStore from '../../store/uiStore';

const ScanQR = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX+', 'QR', 'Scan']);
  }, [setBreadcrumbs]);

  const mutation = useMutation({
    mutationFn: qrApi.resolve,
    onSuccess: (data) => {
      enqueueSnackbar('QR decoded. Redirecting…', { variant: 'success' });
      scannerRef.current?.clear().catch(() => {});
      setTimeout(() => navigate(`/documents/${data.documentId}`), 800);
    },
    onError: () => setError('Invalid QR payload'),
  });

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader-container',
      { fps: 10, qrbox: { width: 250, height: 250 }, showTorchButtonIfSupported: true },
      false
    );

    scanner.render(
      (qrText) => {
        mutation.mutate({ qrValue: qrText });
      },
      (scanError) => {
        if (scanError?.message) {
          console.debug('QR scan error', scanError.message);
        }
      }
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [mutation]);

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5" fontWeight={700}>
            Scan document QR
          </Typography>
          <Box
            id="qr-reader-container"
            sx={{
              width: '100%',
              maxWidth: 380,
              borderRadius: 3,
              overflow: 'hidden',
              border: '2px solid',
              borderColor: 'primary.main',
              boxShadow: '0 15px 30px rgba(0,102,255,0.2)',
              '& video': { width: '100%' },
            }}
          />
          <Typography color="text.secondary">Auto navigates once a valid code is captured.</Typography>
        </Stack>
      </Paper>
      <Dialog open={Boolean(error)} onClose={() => setError(null)}>
        <DialogTitle>Invalid QR</DialogTitle>
        <DialogContent>
          <Typography>{error}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setError(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default ScanQR;
