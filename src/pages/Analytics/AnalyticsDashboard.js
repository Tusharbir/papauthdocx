import { useEffect } from 'react';
import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import useUIStore from '../../store/uiStore';

const verificationTrend = [
  { name: 'Jan', count: 120 },
  { name: 'Feb', count: 180 },
  { name: 'Mar', count: 230 },
  { name: 'Apr', count: 210 },
  { name: 'May', count: 250 },
  { name: 'Jun', count: 320 },
];

const revocationTrend = [
  { name: 'Week 1', revoked: 2 },
  { name: 'Week 2', revoked: 5 },
  { name: 'Week 3', revoked: 3 },
  { name: 'Week 4', revoked: 6 },
];

const accessData = [
  { name: 'Playbook.pdf', access: 82 },
  { name: 'RiskModel.xlsx', access: 64 },
  { name: 'BoardDeck.pptx', access: 51 },
  { name: 'HRPolicy.pdf', access: 33 },
];

const tamperScores = [
  { name: '0-25', value: 6 },
  { name: '25-50', value: 12 },
  { name: '50-75', value: 5 },
  { name: '75-100', value: 2 },
];

const AnalyticsDashboard = () => {
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX', 'Analytics']);
  }, [setBreadcrumbs]);

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <Stack spacing={3}>
        <Typography variant="h4" fontWeight={700}>
          Analytics Center
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6">Verification count over time</Typography>
              <Box height={280}>
                <ResponsiveContainer>
                  <LineChart data={verificationTrend}>
                    <XAxis dataKey="name" stroke="currentColor" />
                    <YAxis stroke="currentColor" />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#00C4B4" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6">Revocation trends</Typography>
              <Box height={280}>
                <ResponsiveContainer>
                  <AreaChart data={revocationTrend}>
                    <XAxis dataKey="name" stroke="currentColor" />
                    <YAxis stroke="currentColor" />
                    <Tooltip />
                    <Area type="monotone" dataKey="revoked" stroke="#FF6B6B" fill="rgba(255,107,107,0.2)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6">Most accessed documents</Typography>
              <Box height={280}>
                <ResponsiveContainer>
                  <BarChart data={accessData} layout="vertical">
                    <XAxis type="number" stroke="currentColor" />
                    <YAxis type="category" dataKey="name" stroke="currentColor" width={120} />
                    <Tooltip />
                    <Bar dataKey="access" fill="#0066FF" radius={8} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6">Tamper score distribution</Typography>
              <Stack spacing={1} mt={2}>
                {tamperScores.map((row) => (
                  <Box key={row.name} display="flex" justifyContent="space-between">
                    <Typography>{row.name}</Typography>
                    <Typography>{row.value}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </motion.div>
  );
};

export default AnalyticsDashboard;
