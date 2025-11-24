import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import axiosInstance from '../../api/axiosInstance';
import useUIStore from '../../store/uiStore';
import { USER_ROLES, ROLE_BADGE_TONES } from '../../constants/enums';

const AllUsersList = () => {
  const mode = useUIStore((state) => state.mode);
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');

  useEffect(() => {
    // Ensure breadcrumbs reflect the current page even when navigating from other sections.
    setBreadcrumbs(['PapDocAuthX', 'All Users']);
  }, [setBreadcrumbs]);

  const inputClass = mode === 'dark'
    ? 'border-white/10 bg-white/5 text-white'
    : 'border-slate-300 bg-white text-slate-900';

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
    const tone = ROLE_BADGE_TONES[role] || 'default';
    const label = role === USER_ROLES.SUPERADMIN ? 'Superadmin' 
      : role === USER_ROLES.ADMIN ? 'Admin' 
      : role === USER_ROLES.VERIFIER ? 'Verifier' 
      : role;
    return <Badge tone={tone}>{label}</Badge>;
  };

  return (
    <div>
      <PageHeader
        title="All Users"
        subtitle="System-wide user registry"
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
          <option value={USER_ROLES.SUPERADMIN}>Superadmin</option>
          <option value={USER_ROLES.ADMIN}>Admin</option>
          <option value={USER_ROLES.VERIFIER}>Verifier</option>
        </select>
        <select
          className={`rounded-full border px-4 py-2 text-sm ${inputClass}`}
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
        <p className={mode === 'dark' ? 'text-slate-400' : 'text-slate-600'}>Loading users...</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No users found" description="No users match your filters." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((user) => (
            <Card key={user.id} className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 pr-2">
                  <p className={`text-lg font-semibold ${mode === 'dark' ? 'text-white' : 'text-slate-900'} truncate`} title={user.fullName}>{user.fullName}</p>
                  <p className={`text-sm ${mode === 'dark' ? 'text-slate-400' : 'text-slate-600'} truncate`} title={user.email}>{user.email}</p>
                  {user.organization && (
                    <p className={`mt-2 text-xs ${mode === 'dark' ? 'text-slate-500' : 'text-slate-500'} truncate`} title={user.organization.name}>{user.organization.name}</p>
                  )}
                </div>
                <div className="shrink-0">{getRoleBadge(user.role)}</div>
              </div>
              <div className={`mt-4 grid grid-cols-2 gap-2 text-xs ${mode === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                <div>
                  <span className={mode === 'dark' ? 'text-slate-500' : 'text-slate-400'}>ID:</span>
                  <span
                    className="overflow-hidden text-ellipsis whitespace-nowrap align-middle inline-block ml-1"
                    style={{ maxWidth: '16rem', minWidth: '6rem', verticalAlign: 'middle' }}
                    title={user.id}
                  >
                    {user.id}
                  </span>
                </div>
                <div>
                  <span className={mode === 'dark' ? 'text-slate-500' : 'text-slate-400'}>Org ID:</span> {user.orgId || 'N/A'}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className={`mt-4 text-sm ${mode === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
        Showing {filtered.length} of {users.length} users
      </div>
    </div>
  );
};

export default AllUsersList;
