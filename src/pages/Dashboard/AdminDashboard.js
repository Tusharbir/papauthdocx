import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell } from 'recharts';
import { documentApi } from '../../api/documentApi';
import { analyticsApi } from '../../api/analyticsApi';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const AdminDashboard = () => {
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const user = useAuthStore((state) => state.user);
  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX', 'Admin Dashboard']);
  }, [setBreadcrumbs]);

  const { data: documents = [], error } = useQuery({
    queryKey: ['documents'],
    queryFn: documentApi.getAll,
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: analyticsApi.getSummary,
  });

  const stats = [
    { label: 'Total documents', value: analytics?.data?.totalDocuments || 0, trend: '+6%' },
    { label: 'Approved', value: analytics?.data?.approved || 0, trend: '+2%' },
    { label: 'Pending', value: analytics?.data?.pending || 0, trend: '-1%' },
    { label: 'Revoked', value: analytics?.data?.revoked || 0, trend: '+11%' },
  ];

  const analyticsData = analytics?.data?.throughputData || [];
  const pieData = analytics?.data?.pieData?.map((item, index) => ({
    ...item,
    color: index === 0 ? '#00C4B4' : index === 1 ? '#FFC857' : '#FF6B6B'
  })) || [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title="Admin Dashboard" subtitle={`Welcome back, ${user?.fullName || 'Admin'}`} />
      {error && <p className="text-sm text-rose-300">{error.response?.data?.message || 'Unable to load documents.'}</p>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <p className="text-xs uppercase tracking-[0.4em] text-blue-300">{stat.label}</p>
            <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
            <p className="text-xs text-emerald-300">{stat.trend} vs last 24h</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <p className="text-sm text-slate-400">Throughput (last 5 days)</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <BarChart data={analyticsData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="approved" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pending" fill="#facc15" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-400">Tamper score distribution</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={4}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-sm text-slate-400">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span>{item.name}</span>
                <span>{item.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <p className="text-sm text-slate-400">Latest uploads</p>
          <div className="mt-4 space-y-4">
            {documents.slice(0, 4).map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-semibold">{doc.name}</p>
                  <p className="text-xs text-slate-400">{doc.owner}</p>
                </div>
                <Badge tone={doc.status === 'verified' ? 'success' : doc.status === 'revoked' ? 'danger' : 'info'}>
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-400">Recent activity</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between">
                <span>{doc.activity}</span>
                <span className="text-xs text-slate-500">{doc.lastUpdated}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
