import { useEffect, useRef, useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography, Autocomplete } from '@mui/material';
import { QRCodeCanvas } from 'qrcode.react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import { qrApi } from '../../api/qrApi';
import { documentApi } from '../../api/documentApi';
import useUIStore from '../../store/uiStore';

const GenerateQR = () => {
  const [documentId, setDocumentId] = useState('');
  const canvasRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX', 'QR', 'Generate']);
  }, [setBreadcrumbs]);

  // Fetch documents for dropdown
  const { data: documents = [], isLoading: loadingDocs } = useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.getAll,
  });

  // Filter only APPROVED documents
  const activeDocuments = documents.filter(doc => 
    doc.latestVersionStatus === 'APPROVED'
  );

  const mutation = useMutation({
    mutationFn: (id) => qrApi.generate(id),
    onSuccess: () => enqueueSnackbar('QR generated.', { variant: 'success' }),
  });

  const handleGenerate = () => {
    if (!documentId) {
      enqueueSnackbar('Please select a document', { variant: 'warning' });
      return;
    }
    mutation.mutate(documentId);
  };

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
          
          <Autocomplete
            fullWidth
            options={activeDocuments}
            getOptionLabel={(option) => option.docId}
            renderOption={(props, option) => (
              <li {...props}>
                <div>
                  <div style={{ fontWeight: 500 }}>{option.docId}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    {option.type || 'Document'} • v{option.currentVersion || 1}
                  </div>
                </div>
              </li>
            )}
            value={activeDocuments.find(doc => doc.docId === documentId) || null}
            onChange={(event, newValue) => setDocumentId(newValue?.docId || '')}
            loading={loadingDocs}
            renderInput={(params) => (
              <TextField 
                {...params} 
                label="Select Document" 
                placeholder="Choose an approved document"
                helperText={`${activeDocuments.length} approved document${activeDocuments.length !== 1 ? 's' : ''} available`}
              />
            )}
          />
          
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="contained" onClick={handleGenerate} disabled={!documentId || mutation.isPending}>
              {mutation.isPending ? 'Generating...' : 'Generate QR'}
            </Button>
            <Button variant="outlined" onClick={handleDownload} disabled={!mutation.data}>
              Download QR
            </Button>
          </Stack>
          
          {mutation.data ? (
            <>
              <Box ref={canvasRef} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <QRCodeCanvas value={mutation.data.qrValue} size={256} bgColor="#ffffff" fgColor="#000000" level="H" />
              </Box>
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant="body2" color="text.secondary">
                  Document: <strong>{mutation.data.docId}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                  {mutation.data.versionHash?.slice(0, 16)}...
                </Typography>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    QR Code Data (for manual verification if scanning fails):
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: 'monospace', 
                      wordBreak: 'break-all',
                      fontSize: '0.75rem',
                      color: 'primary.main'
                    }}
                  >
                    {mutation.data.qrValue}
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ p: 6, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Select a document and click Generate QR
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>
    </motion.div>
  );
};

export default GenerateQR;
