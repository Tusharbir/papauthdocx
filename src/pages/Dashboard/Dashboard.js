import { useEffect } from 'react';
import { Box, Grid, Paper, Stack, Typography, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import DocumentCard from '../../components/widgets/DocumentCard';
import StatCard from '../../components/widgets/StatCard';
import { documentApi } from '../../api/documentApi';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const user = useAuthStore((state) => state.user);
  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX+', 'Dashboard']);
  }, [setBreadcrumbs]);

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.listUserDocs,
  });

  const stats = [
    { label: 'Total Documents', value: documents.length || 42, icon: 'Σ', trend: '+6%' },
    { label: 'Verified', value: documents.filter((d) => d.status === 'verified').length || 28, icon: '✓', trend: '+2%' },
    { label: 'Pending', value: documents.filter((d) => d.status === 'pending').length || 9, icon: '…', trend: '-1%' },
    { label: 'Revoked', value: documents.filter((d) => d.status === 'revoked').length || 5, icon: '!', trend: '+11%' },
  ];

  const analyticsData = [
    { name: 'Mon', verified: 12, pending: 3 },
    { name: 'Tue', verified: 18, pending: 2 },
    { name: 'Wed', verified: 16, pending: 5 },
    { name: 'Thu', verified: 22, pending: 1 },
    { name: 'Fri', verified: 20, pending: 4 },
  ];

  const pieData = [
    { name: 'Verified', value: 68, color: '#00C4B4' },
    { name: 'Pending', value: 22, color: '#FFC857' },
    { name: 'Revoked', value: 10, color: '#FF6B6B' },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome, {user?.name || 'PapDoc Operator'}
          </Typography>
          <Typography color="text.secondary">Monitor verification throughput and revocation posture at a glance.</Typography>
        </Box>

        <Grid container spacing={3}>
          {stats.map((stat) => (
            <Grid key={stat.label} item xs={12} sm={6} md={3}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Usage Analytics
              </Typography>
              <Box height={280}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData}>
                    <XAxis dataKey="name" stroke="currentColor" />
                    <YAxis stroke="currentColor" />
                    <Tooltip />
                    <Bar dataKey="verified" fill="#0066FF" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="pending" fill="#FFC857" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Tamper Score Distribution
              </Typography>
              <Box height={240}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={4}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack spacing={1}>
                {pieData.map((item) => (
                  <Stack key={item.name} direction="row" justifyContent="space-between">
                    <Typography variant="body2">{item.name}</Typography>
                    <Typography variant="body2">{item.value}%</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            {documents.slice(0, 3).map((doc) => (
              <DocumentCard key={doc.id} {...doc} subtitle={doc.owner} />
            ))}
          </Stack>
          <Divider sx={{ my: 3 }} />
          <Typography variant="subtitle2" color="text.secondary">
            Recent Activity Feed
          </Typography>
          <Stack spacing={2} mt={2}>
            {documents.map((doc) => (
              <Stack key={doc.id} direction="row" justifyContent="space-between">
                <Typography>{doc.activity}</Typography>
                <Typography color="text.secondary">{doc.lastUpdated}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Stack>
    </motion.div>
  );
};

export default Dashboard;
