import { Card, CardContent, Stack, Typography, Avatar } from '@mui/material';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);

const StatCard = ({ icon, label, value, trend }) => (
  <MotionCard
    whileHover={{ y: -6 }}
    sx={{
      borderRadius: 3,
      px: 1,
      border: (theme) => `1px solid ${theme.palette.divider}`,
      background: 'radial-gradient(circle at top, rgba(0,102,255,0.15), rgba(0,0,0,0))',
    }}
  >
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar sx={{ bgcolor: 'primary.main', color: 'white' }}>{icon}</Avatar>
        <Stack>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {value}
          </Typography>
          {trend && (
            <Typography variant="caption" color={trend?.startsWith('+') ? 'success.main' : 'error.main'}>
              {trend} vs last 24h
            </Typography>
          )}
        </Stack>
      </Stack>
    </CardContent>
  </MotionCard>
);

export default StatCard;
