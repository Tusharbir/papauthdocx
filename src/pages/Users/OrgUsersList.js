import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import axiosInstance from '../../api/axiosInstance';

const OrgUsersList = () => {
  const mode = useUIStore((state) => state.mode);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const user = useAuthStore((state) => state.user);

  const inputClass = mode === 'dark'
    ? 'border-white/10 bg-white/5 text-white'
    : 'border-slate-300 bg-white text-slate-900';

  // Fetch users in admin's organization
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['org-users', user?.orgId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/api/orgs/${user?.orgId}/users`);
      return data.users || [];
    },
    enabled: !!user?.orgId,
  });

  const filtered = users.filter((u) => {
    const matchesSearch = search === '' || 
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    if (role === 'admin') return <Badge tone="warning">Admin</Badge>;
    if (role === 'user') return <Badge tone="info">User</Badge>;
    return <Badge tone="default">Verifier</Badge>;
  };

  return (
    <div>
      <PageHeader
        title="Organization Users"
        subtitle={`Users in your organization`}
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          className={`w-full max-w-sm rounded-full border px-4 py-2 text-sm ${inputClass}`}
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={`rounded-full border px-4 py-2 text-sm ${inputClass}`}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="verifier">Verifier</option>
        </select>
      </div>
      {isLoading ? (
        <p className="text-slate-400">Loading users...</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No users found" description="No users match your filters." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u) => (
            <Card key={u.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{u.fullName}</p>
                  <p className="text-sm text-slate-400">{u.email}</p>
                </div>
                {getRoleBadge(u.role)}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div>
                  <span className="text-slate-500">User ID:</span> {u.id}
                </div>
                <div>
                  <span className="text-slate-500">Role:</span> {u.role}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-4 text-sm text-slate-400">
        Showing {filtered.length} of {users.length} users
      </div>
    </div>
  );
};

export default OrgUsersList;
