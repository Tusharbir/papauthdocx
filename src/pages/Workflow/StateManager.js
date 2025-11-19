import { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography } from '@mui/material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { workflowApi } from '../../api/workflowApi';
import { useSnackbar } from 'notistack';
import useUIStore from '../../store/uiStore';

const states = ['Uploaded', 'Verifier review', 'Approved', 'Revoked'];

const StateManager = () => {
  const [selectedState, setSelectedState] = useState(states[0]);
  const [reason, setReason] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX', 'Workflow']);
  }, [setBreadcrumbs]);

  const { data: history = [] } = useQuery({
    queryKey: ['workflow-history', 'DOC-2024-001'],
    queryFn: () => workflowApi.getWorkflowHistory('DOC-2024-001'),
  });

  const mutation = useMutation({
    mutationFn: workflowApi.changeState,
    onSuccess: () => {
      enqueueSnackbar('State transitioned.', { variant: 'success' });
      setDialogOpen(false);
      setReason('');
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setDialogOpen(true);
  };

  const confirmTransition = () => {
    mutation.mutate({ documentId: 'DOC-2024-001', state: selectedState, reason });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 4, borderRadius: 4 }} component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight={700}>
                State orchestration
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="state-select">State</InputLabel>
                <Select labelId="state-select" label="State" value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
                  {states.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth multiline rows={3} />
              <Button type="submit" variant="contained" disabled={!reason}>
                Queue transition
              </Button>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom>
              Timeline
            </Typography>
            <Stack spacing={3}>
              {history.map((entry, index) => (
                <motion.div key={entry.state} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: index * 0.1 }}>
                  <Box sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1">{entry.state}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {entry.actor} • {new Date(entry.timestamp).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" mt={1}>
                      {entry.reason}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirm transition</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Move document to {selectedState}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmTransition} variant="contained" disabled={mutation.isPending}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default StateManager;
