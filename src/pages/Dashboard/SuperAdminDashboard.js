import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import useUIStore from '../../store/uiStore';
import { organizationApi } from '../../api/organizationApi';
import { documentApi } from '../../api/documentApi';
import analyticsApi from '../../api/analyticsApi';
import axiosInstance from '../../api/axiosInstance';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';

const SuperAdminDashboard = () => {
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const mode = useUIStore((state) => state.mode);
  const isDark = mode === 'dark';

  const mutedText = isDark ? 'text-slate-300/80' : 'text-slate-500';
  const subtleText = isDark ? 'text-slate-400' : 'text-slate-600';
  const strongText = isDark ? 'text-white' : 'text-slate-900';
  const cardDivider = isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50';
  const axisColor = isDark ? '#94a3b8' : '#94a3b8';
  const gridColor = isDark ? '#334155' : '#e2e8f0';

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX', 'Superadmin']);
  }, [setBreadcrumbs]);

  const { data: orgs = [], error: orgError } = useQuery({ queryKey: ['orgs'], queryFn: organizationApi.list });
  const { data: docs = [], error: docError } = useQuery({ queryKey: ['docs'], queryFn: documentApi.listUserDocs });
  
  // Fetch real analytics data for superadmin (global stats)
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: analyticsApi.getSummary
  });

  // Fetch all users to get accurate admin count
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/api/auth/users');
      return data.users || [];
    }
  });

  // Calculate real stats
  const adminCount = usersData?.filter(u => u.role === 'admin').length || 0;
  const totalDocuments = analyticsData?.totalDocuments || docs.length;
  
  // Transform throughput data for activity chart (last 7 days)
  const activityData = analyticsData?.throughputData || [];

  const stats = [
    { label: 'Organizations', value: orgs.length },
    { label: 'Admins', value: adminCount },
    { label: 'Documents', value: totalDocuments },
  ];

  return (
    <div>
      <PageHeader title="Superadmin Dashboard" subtitle="Global visibility across tenants" />
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <p className={`text-sm uppercase tracking-[0.4em] ${isDark ? 'text-blue-300' : 'text-blue-600/70'}`}>{stat.label}</p>
            <p className="mt-2 text-4xl font-semibold">
              {(stat.label === 'Admins' && usersLoading) || (stat.label === 'Documents' && analyticsLoading) ? (
                <span className={subtleText}>...</span>
              ) : (
                <span className={strongText}>{stat.value}</span>
              )}
            </p>
          </Card>
        ))}
      </div>
      {(orgError || docError) && (
        <p className="text-sm text-rose-300">
          {orgError?.response?.data?.message || docError?.response?.data?.message || 'Unable to load analytics.'}
        </p>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <p className={`text-sm ${mutedText}`}>Document Activity (Last 7 Days)</p>
          {analyticsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className={subtleText}>Loading activity data...</div>
            </div>
          ) : activityData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorApproved" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRevoked" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis dataKey="date" stroke={axisColor} />
                  <YAxis stroke={axisColor} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      color: isDark ? '#e2e8f0' : '#0f172a',
                    }}
                    labelStyle={{ color: isDark ? '#e2e8f0' : '#0f172a' }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="approved" 
                    stackId="1"
                    stroke="#10b981" 
                    fill="url(#colorApproved)" 
                    strokeWidth={2}
                    name="Approved"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pending" 
                    stackId="1"
                    stroke="#f59e0b" 
                    fill="url(#colorPending)" 
                    strokeWidth={2}
                    name="Pending"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revoked" 
                    stackId="1"
                    stroke="#ef4444" 
                    fill="url(#colorRevoked)" 
                    strokeWidth={2}
                    name="Revoked"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-slate-400">No activity data available</p>
            </div>
          )}
        </Card>
        <Card className="p-6">
          <p className={`text-sm ${mutedText}`}>Recent org activity</p>
          <div className="mt-4 space-y-3 text-sm">
            {orgs.slice(0, 5).map((org) => (
              <div
                key={org.id}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${cardDivider}`}
              >
                <div>
                  <p className={`font-semibold ${strongText}`}>{org.name}</p>
                  <p className={`text-xs ${subtleText}`}>{org.slug}</p>
                </div>
                <Badge tone="info">{org.type}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="mt-6 p-6">
        <p className={`text-sm ${mutedText}`}>Top organizations</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className={`text-xs uppercase tracking-[0.4em] ${subtleText}`}>
                <th className="py-2">Name</th>
                <th className="py-2">Type</th>
                <th className="py-2">Slug</th>
                <th className="py-2 text-right">Admins</th>
              </tr>
            </thead>
            <tbody>
              {orgs.slice(0, 6).map((org) => (
                <tr key={org.id} className={`border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                  <td className={`py-3 font-semibold ${strongText}`}>{org.name}</td>
                  <td className={`py-3 ${subtleText}`}>{org.type}</td>
                  <td className={`py-3 ${subtleText}`}>{org.slug}</td>
                  <td className={`py-3 text-right ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{org.adminCount || 2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
