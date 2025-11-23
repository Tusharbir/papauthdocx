import { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, Grid, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography, Autocomplete } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { workflowApi } from '../../api/workflowApi';
import { documentApi } from '../../api/documentApi';
import { useSnackbar } from 'notistack';
import useUIStore from '../../store/uiStore';

const states = ['PENDING', 'APPROVED', 'REVOKED'];

const StateManager = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [selectedState, setSelectedState] = useState(states[0]);
  const [reason, setReason] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX', 'Workflow']);
  }, [setBreadcrumbs]);

  // Fetch all documents
  const { data: documents = [], isLoading: loadingDocs } = useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.getAll,
  });

  const { data: historyData, isLoading: loadingHistory } = useQuery({
    queryKey: ['workflow-history', selectedDocument?.docId],
    queryFn: () => workflowApi.getWorkflowHistory(selectedDocument.docId),
    enabled: !!selectedDocument,
  });
  
  // Ensure history is always an array
  const history = Array.isArray(historyData) ? historyData : [];

  const mutation = useMutation({
    mutationFn: workflowApi.changeState,
    onSuccess: () => {
      enqueueSnackbar('State transitioned.', { variant: 'success' });
      setDialogOpen(false);
      setReason('');
      // Refetch workflow history and documents
      queryClient.invalidateQueries(['workflow-history', selectedDocument?.docId]);
      queryClient.invalidateQueries(['documents']);
    },
    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.error || 'Failed to change state', { variant: 'error' });
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedDocument) {
      enqueueSnackbar('Please select a document', { variant: 'warning' });
      return;
    }
    setDialogOpen(true);
  };

  const confirmTransition = () => {
    mutation.mutate({ documentId: selectedDocument.docId, state: selectedState, reason });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 4, borderRadius: 4 }} component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Typography variant="h5" fontWeight={700}>
                Change Document Status
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Update the workflow state of a document (Pending, Approved, or Revoked)
              </Typography>
              
              <Autocomplete
                fullWidth
                options={documents}
                getOptionLabel={(option) => option.docId}
                renderOption={(props, option) => (
                  <li {...props}>
                    <div>
                      <div
                        style={{ fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={option.docId}
                      >
                        {option.docId}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>
                        {option.type || 'Document'}  v{option.currentVersion || 1}  {option.latestVersionStatus || 'UNKNOWN'}
                      </div>
                    </div>
                  </li>
                )}
                value={selectedDocument}
                onChange={(event, newValue) => setSelectedDocument(newValue)}
                loading={loadingDocs}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Select Document" 
                    placeholder="Choose a document"
                    required
                    helperText={selectedDocument ? `Current status: ${selectedDocument.latestVersionStatus || 'UNKNOWN'}` : `${documents.length} document${documents.length !== 1 ? 's' : ''} available`}
                  />
                )}
              />
              
              <FormControl fullWidth>
                <InputLabel id="state-select">New State</InputLabel>
                <Select labelId="state-select" label="New State" value={selectedState} onChange={(e) => setSelectedState(e.target.value)}>
                  {states.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth multiline rows={3} required />
              <Button type="submit" variant="contained" disabled={!reason || !selectedDocument}>
                Queue transition
              </Button>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h6" gutterBottom>
              Timeline {selectedDocument && `- ${selectedDocument.docId}`}
            </Typography>
            {!selectedDocument ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                Select a document to view its workflow history
              </Typography>
            ) : loadingHistory ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                Loading history...
              </Typography>
            ) : history.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No workflow history yet
              </Typography>
            ) : (
              <Stack spacing={3}>
                {history.map((entry, index) => (
                  <motion.div key={`${entry.id}-${index}`} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: index * 0.1 }}>
                    <Box sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle1" fontWeight={600}>{entry.state}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {entry.actor} ({entry.actorRole}) • {new Date(entry.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Confirm transition</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Change <strong>{selectedDocument?.docId}</strong> from <strong>{selectedDocument?.latestVersionStatus || 'current state'}</strong> to <strong>{selectedState}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmTransition} variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default StateManager;
