import { useEffect, useState } from 'react';
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, Paper, Select, TextField, Typography, Chip } from '@mui/material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { documentApi } from '../../api/documentApi';
import { revocationApi } from '../../api/revocationApi';
import { useSnackbar } from 'notistack';
import useUIStore from '../../store/uiStore';

const RevokeDocument = () => {
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const { enqueueSnackbar } = useSnackbar();
  const [form, setForm] = useState({ documentId: '', version: '', reason: '' });

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX', 'Revocation']);
  }, [setBreadcrumbs]);

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.listUserDocs,
  });

  const mutation = useMutation({
    mutationFn: revocationApi.revoke,
    onSuccess: () => enqueueSnackbar('Document revoked.', { variant: 'warning' }),
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(form);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4, borderRadius: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Document</InputLabel>
              <Select label="Document" value={form.documentId} onChange={(e) => setForm((prev) => ({ ...prev, documentId: e.target.value }))}>
                {documents.map((doc) => (
                  <MenuItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Version" fullWidth value={form.version} onChange={(e) => setForm((prev) => ({ ...prev, version: e.target.value }))} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Reason" fullWidth value={form.reason} onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))} />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="error" disabled={!form.documentId || !form.reason || mutation.isPending}>
              Revoke access
            </Button>
          </Grid>
        </Grid>
        {mutation.data && (
          <Box mt={4}>
            <Typography variant="subtitle1">Status</Typography>
            <Chip color="error" label={mutation.data.status} />
          </Box>
        )}
      </Paper>
    </motion.div>
  );
};

export default RevokeDocument;
