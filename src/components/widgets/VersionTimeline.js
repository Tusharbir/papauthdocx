import { Stack, Typography, Box, Paper } from '@mui/material';
import { motion } from 'framer-motion';

const VersionTimeline = ({ events = [] }) => (
  <Stack spacing={3} component={Paper} sx={{ p: 3, borderRadius: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
    <Typography variant="h6">Version Timeline</Typography>
    <Stack spacing={2}>
      {events.map((event, index) => (
        <motion.div
          key={event.version + index}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.08 }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: index === 0 ? 'linear-gradient(120deg,#0066FF,#00C4B4)' : 'rgba(0,0,0,0.15)',
              }}
            />
            <Box>
              <Typography variant="subtitle2">{event.version}</Typography>
              <Typography variant="body2" color="text.secondary">
                {event.date} • {event.author}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {event.hash}
              </Typography>
            </Box>
          </Box>
        </motion.div>
      ))}
    </Stack>
  </Stack>
);

export default VersionTimeline;
