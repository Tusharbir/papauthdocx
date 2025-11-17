import { Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import { motion } from 'framer-motion';

const statusColors = {
  verified: 'success',
  pending: 'warning',
  revoked: 'error',
};

const MotionCard = motion(Card);

const DocumentCard = ({ title, subtitle, status, activity, metadata }) => (
  <MotionCard
    whileHover={{ y: -4, scale: 1.01 }}
    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    sx={{
      borderRadius: 3,
      backdropFilter: 'blur(12px)',
      background: (theme) =>
        theme.palette.mode === 'dark'
          ? 'rgba(17,24,39,0.6)'
          : 'linear-gradient(120deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
      border: (theme) => `1px solid ${theme.palette.divider}`,
      boxShadow: '0 10px 40px rgba(15,23,42,0.1)',
    }}
  >
    <CardContent>
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" color="text.secondary">
            {subtitle}
          </Typography>
          {status && <Chip size="small" variant="outlined" color={statusColors[status] || 'default'} label={status?.toUpperCase()} />}
        </Stack>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        {activity && (
          <Typography variant="body2" color="text.secondary">
            {activity}
          </Typography>
        )}
        {metadata && (
          <Stack direction="row" spacing={2} mt={1}>
            {Object.entries(metadata).map(([label, value]) => (
              <Stack key={label} spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="body2">{value}</Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </CardContent>
  </MotionCard>
);

export default DocumentCard;
