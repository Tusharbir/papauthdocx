import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Chip, CircularProgress, Grid, Paper, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { documentApi } from '../../api/documentApi';
import HashComparison from '../../components/widgets/HashComparison';
import VersionTimeline from '../../components/widgets/VersionTimeline';
import useUIStore from '../../store/uiStore';

const DocumentDetails = () => {
  const { documentId = 'DOC-2024-001' } = useParams();
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX+', 'Documents', documentId]);
  }, [documentId, setBreadcrumbs]);

  const { data, isLoading } = useQuery({
    queryKey: ['document-details', documentId],
    queryFn: () => documentApi.getDetails(documentId),
  });

  if (isLoading) {
    return (
      <Stack alignItems="center" mt={6}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!data) {
    return (
      <Stack alignItems="center" mt={6}>
        <Typography color="text.secondary">Unable to load document payload.</Typography>
      </Stack>
    );
  }

  const hashData = [
    { label: 'Current vs Backend', score: 100, match: true, backendHash: data.hashes.current, providedHash: data.hashes.current },
    { label: 'Previous Link', score: 82, match: true, backendHash: data.hashes.previous, providedHash: data.hashes.previous },
    { label: 'Merkle root', score: 64, match: true, backendHash: data.hashes.merkleRoot, providedHash: data.hashes.merkleRoot },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: 4, mb: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">{data.name}</Typography>
                <Chip label={`Versions ${data.metadata.versions}`} />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Owner
                  </Typography>
                  <Typography>{data.metadata.owner}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Uploaded by
                  </Typography>
                  <Typography>{data.metadata.uploadedBy}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Uploaded at
                  </Typography>
                  <Typography>{new Date(data.metadata.uploadedAt).toLocaleString()}</Typography>
                </Box>
              </Stack>
            </Stack>
          </Paper>
          <HashComparison data={hashData} />
          <Box mt={3}>
            <VersionTimeline events={data.versions} />
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, borderRadius: 4, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Merkle root visualization
            </Typography>
            <Box
              sx={{
                height: 180,
                borderRadius: 3,
                background: 'radial-gradient(circle, rgba(0,196,180,0.2), transparent)',
                border: '1px dashed rgba(0,196,180,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                px: 2,
              }}
            >
              <Typography variant="body2">{data.hashes.merkleRoot}</Typography>
            </Box>
          </Paper>
          <Paper sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom>
              Secure QR identity
            </Typography>
            <Stack alignItems="center" spacing={2}>
              <QRCodeCanvas value={`papdocauthx://${data.id}`} size={180} bgColor="transparent" fgColor="#0066FF" />
              <Typography variant="body2" color="text.secondary">
                Document ID: {data.id}
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default DocumentDetails;
