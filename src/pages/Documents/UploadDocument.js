import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, Divider, Grid, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { motion } from 'framer-motion';
import { documentApi } from '../../api/documentApi';
import useUIStore from '../../store/uiStore';

const UploadDocument = () => {
  const [file, setFile] = useState(null);
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX+', 'Documents', 'Upload']);
  }, [setBreadcrumbs]);

  const onDrop = useCallback((acceptedFiles) => {
    setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } });

  const hashPreview = useMemo(() => {
    if (!file) return [];
    return [
      { label: 'Content hash', value: '0x4be52cf2d09570a3' },
      { label: 'Metadata hash', value: '0x2de4a1ab7d45bd11' },
      { label: 'Merkle root', value: '0x94ff2d891c44de78' },
    ];
  }, [file]);

  const mutation = useMutation({
    mutationFn: documentApi.uploadVersion,
    onSuccess: () => {
      enqueueSnackbar('Document version securely uploaded.', { variant: 'success' });
      setFile(null);
    },
    onError: () => enqueueSnackbar('Upload failed. Network unreachable.', { variant: 'error' }),
  });

  const handleUpload = () => {
    if (!file) return;
    const payload = { name: file.name, size: file.size, hash: hashPreview[0]?.value };
    mutation.mutate(payload);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4, borderRadius: 4 }}>
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight={700}>
                Upload document version
              </Typography>
              <Box
                {...getRootProps()}
                sx={{
                  border: '2px dashed rgba(0,102,255,0.3)',
                  borderRadius: 4,
                  p: 6,
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDragActive ? 'rgba(0,102,255,0.08)' : 'transparent',
                  transition: '0.3s',
                }}
              >
                <input {...getInputProps()} />
                <CloudUploadOutlinedIcon fontSize="large" color="primary" />
                <Typography mt={2} variant="h6">
                  Drag & drop secure files
                </Typography>
                <Typography color="text.secondary">PDF, DOCX up to 200MB</Typography>
              </Box>
              {file && (
                <Stack spacing={1}>
                  <Typography variant="subtitle2">Auto metadata extraction</Typography>
                  <Typography color="text.secondary">{file.name}</Typography>
                  <Typography color="text.secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Typography>
                </Stack>
              )}
              <Button variant="contained" size="large" disabled={!file || mutation.isPending} onClick={handleUpload} startIcon={<FingerprintOutlinedIcon />}>
                {mutation.isPending ? 'Hashing…' : 'Save & Hash'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom>
              Hash preview
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {file ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Segment</TableCell>
                    <TableCell>Hash</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hashPreview.map((hash) => (
                    <TableRow key={hash.label}>
                      <TableCell>{hash.label}</TableCell>
                      <TableCell>{hash.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography color="text.secondary">Drop a file to preview deterministic hashes.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default UploadDocument;
