import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import axiosInstance from '../../api/axiosInstance';

const AllUsersList = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');

  // Fetch all users (superadmin only)
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/api/auth/users');
      return data.users || [];
    },
  });

  // Fetch organizations for filter
  const { data: orgs = [] } = useQuery({
    queryKey: ['orgs'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/api/orgs');
      return data.organizations || [];
    },
  });

  const filtered = users.filter((user) => {
    const matchesSearch = search === '' || 
      user.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesOrg = orgFilter === 'all' || user.orgId === parseInt(orgFilter);
    return matchesSearch && matchesRole && matchesOrg;
  });

  const getRoleBadge = (role) => {
    if (role === 'superadmin') return <Badge tone="error">Superadmin</Badge>;
    if (role === 'admin') return <Badge tone="warning">Admin</Badge>;
    return <Badge tone="info">User</Badge>;
  };

  return (
    <div>
      <PageHeader
        title="All Users"
        subtitle="System-wide user registry"
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          className="w-full max-w-sm rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All roles</option>
          <option value="superadmin">Superadmin</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="verifier">Verifier</option>
        </select>
        <select
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm"
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
        >
          <option value="all">All organizations</option>
          {orgs.map((org) => (
            <option key={org.id} value={org.id}>{org.name}</option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <p className="text-slate-400">Loading users...</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No users found" description="No users match your filters." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((user) => (
            <Card key={user.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{user.fullName}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                  {user.organization && (
                    <p className="mt-2 text-xs text-slate-500">{user.organization.name}</p>
                  )}
                </div>
                {getRoleBadge(user.role)}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div>
                  <span className="text-slate-500">ID:</span> {user.id}
                </div>
                <div>
                  <span className="text-slate-500">Org ID:</span> {user.orgId || 'N/A'}
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

export default AllUsersList;
