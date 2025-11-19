import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import useUIStore from '../../store/uiStore';
import { organizationApi } from '../../api/organizationApi';
import { documentApi } from '../../api/documentApi';
import Card from '../../components/ui/Card';
import PageHeader from '../../components/ui/PageHeader';
import Badge from '../../components/ui/Badge';

const activity = [
  { date: 'Mon', orgs: 2, documents: 38 },
  { date: 'Tue', orgs: 1, documents: 44 },
  { date: 'Wed', orgs: 3, documents: 52 },
  { date: 'Thu', orgs: 1, documents: 48 },
  { date: 'Fri', orgs: 2, documents: 60 },
];

const SuperAdminDashboard = () => {
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX+', 'Superadmin']);
  }, [setBreadcrumbs]);

  const { data: orgs = [], error: orgError } = useQuery({ queryKey: ['orgs'], queryFn: organizationApi.list });
  const { data: docs = [], error: docError } = useQuery({ queryKey: ['docs'], queryFn: documentApi.listUserDocs });

  const stats = [
    { label: 'Organizations', value: orgs.length },
    { label: 'Admins', value: orgs.length * 2 + 3 },
    { label: 'Documents', value: docs.length },
  ];

  return (
    <div>
      <PageHeader title="Superadmin Dashboard" subtitle="Global visibility across tenants" />
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <p className="text-sm uppercase tracking-[0.4em] text-blue-300">{stat.label}</p>
            <p className="mt-2 text-4xl font-semibold">{stat.value}</p>
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
          <p className="text-sm text-slate-300/80">Activity (orgs + documents)</p>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={activity}>
                <defs>
                  <linearGradient id="colorDocs" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area dataKey="documents" stroke="#38bdf8" fill="url(#colorDocs)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-slate-300/80">Recent org activity</p>
          <div className="mt-4 space-y-3 text-sm">
            {orgs.slice(0, 5).map((org) => (
              <div key={org.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div>
                  <p className="font-semibold text-white">{org.name}</p>
                  <p className="text-xs text-slate-400">{org.slug}</p>
                </div>
                <Badge tone="info">{org.type}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="mt-6 p-6">
        <p className="text-sm text-slate-300/80">Top organizations</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead>
              <tr className="text-xs uppercase tracking-[0.4em] text-slate-500">
                <th className="py-2">Name</th>
                <th className="py-2">Type</th>
                <th className="py-2">Slug</th>
                <th className="py-2 text-right">Admins</th>
              </tr>
            </thead>
            <tbody>
              {orgs.slice(0, 6).map((org) => (
                <tr key={org.id} className="border-t border-white/5">
                  <td className="py-3 font-semibold text-white">{org.name}</td>
                  <td className="py-3 text-slate-400">{org.type}</td>
                  <td className="py-3 text-slate-400">{org.slug}</td>
                  <td className="py-3 text-right text-slate-200">{org.adminCount || 2}</td>
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
