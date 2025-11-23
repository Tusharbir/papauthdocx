import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Box, Grid, Paper, Stack, Typography, Skeleton } from '@mui/material';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { analyticsApi } from '../../api/analyticsApi';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';

const COLORS = ['#00C4B4', '#FFC857', '#FF6B6B'];

const AnalyticsDashboard = () => {
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX', 'Analytics']);
  }, [setBreadcrumbs]);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: analyticsApi.getSummary,
  });

  const stats = [
    { label: 'Total Documents', value: analytics?.totalDocuments || 0 },
    { label: 'Approved', value: analytics?.approved || 0 },
    { label: 'Pending', value: analytics?.pending || 0 },
    { label: 'Revoked', value: analytics?.revoked || 0 },
  ];

  const throughputData = analytics?.throughputData || [];
  const pieData = analytics?.pieData || [];

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Stack spacing={3}>
          <Typography variant="h4" fontWeight={700}>Analytics Center</Typography>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} md={6} key={i}>
                <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <Stack spacing={3}>
        <div>
          <Typography variant="h4" fontWeight={700}>Analytics Center</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {user?.role === 'superadmin' ? 'Global analytics across all organizations' : `Analytics for your organization`}
          </Typography>
        </div>
        
        {/* Stats Cards */}
        <Grid container spacing={2}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.label}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>
                  {stat.label}
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mt: 1 }}>
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Charts Grid */}
        <Grid container spacing={3}>
          {/* Throughput Chart */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Document Activity (Last 7 Days)</Typography>
              <Box height={320}>
                <ResponsiveContainer>
                  <BarChart data={throughputData}>
                    <XAxis dataKey="name" stroke="currentColor" />
                    <YAxis stroke="currentColor" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="approved" fill="#00C4B4" radius={[8, 8, 0, 0]} name="Approved" />
                    <Bar dataKey="pending" fill="#FFC857" radius={[8, 8, 0, 0]} name="Pending" />
                    <Bar dataKey="revoked" fill="#FF6B6B" radius={[8, 8, 0, 0]} name="Revoked" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Status Distribution Pie Chart */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Status Distribution</Typography>
              <Box height={200} display="flex" justifyContent="center" alignItems="center">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      dataKey="value" 
                      nameKey="name"
                      cx="50%" 
                      cy="50%" 
                      innerRadius={70} 
                      outerRadius={100} 
                      paddingAngle={4}
                      label={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Stack spacing={1} mt={2}>
                {pieData.map((item, index) => (
                  <Box key={item.name} display="flex" alignItems="center" justifyContent="space-between">
                    <Box display="flex" alignItems="center" gap={1}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          bgcolor: COLORS[index % COLORS.length] 
                        }} 
                      />
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      {item.value} ({item.percentage}%)
                    </Typography>
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
