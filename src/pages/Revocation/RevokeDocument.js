import { useEffect } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, Stack } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { documentApi } from '../../api/documentApi';
import useUIStore from '../../store/uiStore';

const RevokeDocument = () => {
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX', 'Revocations']);
  }, [setBreadcrumbs]);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.getAll,
  });

  // Filter only REVOKED documents
  const revokedDocuments = documents.filter(doc => 
    doc.latestVersionStatus === 'REVOKED'
  );

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Revoked Documents
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View all documents that have been revoked. Revoked documents will fail verification checks.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip 
              label={`${revokedDocuments.length} Revoked`} 
              color="error" 
              variant="outlined"
            />
            <Chip 
              label={`${documents.length} Total Documents`} 
              variant="outlined"
            />
          </Box>

          {isLoading ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              Loading revoked documents...
            </Typography>
          ) : revokedDocuments.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Revoked Documents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All documents are currently active. Use the Workflow page to revoke documents if needed.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Document ID</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Version</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Created</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {revokedDocuments.map((doc) => (
                    <TableRow key={doc.docId} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {doc.docId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {doc.type || 'Document'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          v{doc.currentVersion || 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={doc.latestVersionStatus} 
                          color="error" 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 2, border: '1px solid', borderColor: 'info.light' }}>
            <Typography variant="body2" color="info.dark">
              💡 <strong>Tip:</strong> To revoke or change document status, use the <strong>Workflow</strong> page from the sidebar.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </motion.div>
  );
};

export default RevokeDocument;
