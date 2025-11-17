import { useEffect, useRef, useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import { qrApi } from '../../api/qrApi';
import useUIStore from '../../store/uiStore';

const GenerateQR = () => {
  const [documentId, setDocumentId] = useState('DOC-2024-001');
  const canvasRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX+', 'QR', 'Generate']);
  }, [setBreadcrumbs]);

  const mutation = useMutation({
    mutationFn: (id) => qrApi.generate(id),
    onSuccess: () => enqueueSnackbar('QR generated.', { variant: 'success' }),
  });

  const handleGenerate = () => mutation.mutate(documentId);

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentId}.png`;
    a.click();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5" fontWeight={700}>
            Generate secure QR
          </Typography>
          <TextField label="Document ID" value={documentId} onChange={(e) => setDocumentId(e.target.value)} fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="contained" onClick={handleGenerate}>
              Generate
            </Button>
            <Button variant="outlined" onClick={handleDownload} disabled={!mutation.data}>
              Download QR
            </Button>
          </Stack>
          <Box ref={canvasRef} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <QRCodeCanvas value={mutation.data?.qrValue || `papdocauthx://${documentId}`} size={200} bgColor="transparent" fgColor="#0066FF" />
          </Box>
          {mutation.data && (
            <Typography variant="body2" color="text.secondary">
              Expires at {new Date(mutation.data.expiresAt).toLocaleTimeString()}
            </Typography>
          )}
        </Stack>
      </Paper>
    </motion.div>
  );
};

export default GenerateQR;
