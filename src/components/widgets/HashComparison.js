import { Paper, Typography, Stack, LinearProgress, Chip } from '@mui/material';
import { motion } from 'framer-motion';

const HashComparison = ({ data = [] }) => (
  <Paper sx={{ p: 3, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
    <Typography variant="h6" gutterBottom>
      Hash Integrity Comparison
    </Typography>
    <Stack spacing={2}>
      {data.map((item, index) => (
        <motion.div key={item.label} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2">{item.label}</Typography>
            <Chip size="small" label={item.match ? 'Match' : 'Mismatch'} color={item.match ? 'success' : 'error'} variant="outlined" />
          </Stack>
          <LinearProgress
            variant="determinate"
            value={item.score}
            color={item.match ? 'primary' : 'error'}
            sx={{ mt: 1, height: 8, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.1)' }}
          />
          <Typography variant="caption" color="text.secondary">
            backend {item.backendHash} • provided {item.providedHash}
          </Typography>
        </motion.div>
      ))}
    </Stack>
  </Paper>
);

export default HashComparison;
