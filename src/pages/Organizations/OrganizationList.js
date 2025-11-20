import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { organizationApi } from '../../api/organizationApi';
import { useSnackbar } from 'notistack';
import useUIStore from '../../store/uiStore';

const OrganizationList = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const mode = useUIStore((state) => state.mode);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'Enterprise', slug: '' });

  const inputClass = mode === 'dark'
    ? 'border-white/10 bg-white/5 text-white'
    : 'border-slate-300 bg-white text-slate-900';

  const queryParams = {};
  if (search) queryParams.search = search;
  if (typeFilter !== 'all') queryParams.type = typeFilter;
  const { data: orgs = [] } = useQuery({ queryKey: ['orgs', search, typeFilter], queryFn: () => organizationApi.list(queryParams) });

  const mutation = useMutation({
    mutationFn: organizationApi.create,
    onSuccess: () => {
      enqueueSnackbar('Organization created.', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['orgs'] });
      setModalOpen(false);
      setForm({ name: '', type: 'Enterprise', slug: '' });
    },
  });

  const filtered = orgs.filter((org) => (typeFilter === 'all' ? true : org.type === typeFilter));

  // Get unique organization types from actual data
  const uniqueTypes = [...new Set(orgs.map(o => o.type).filter(Boolean))];

  return (
    <div>
      <PageHeader
        title="Organizations"
        subtitle="Tenant registry"
        actions={[{ label: 'Create organization', onClick: () => setModalOpen(true) }]}
      />
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          className={`w-full max-w-sm rounded-full border px-4 py-2 text-sm ${inputClass}`}
          placeholder="Search orgs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={`rounded-full border px-4 py-2 text-sm ${inputClass}`}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All types</option>
          {uniqueTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState title="No organizations" description="Create your first tenant." actionLabel="Create" onAction={() => setModalOpen(true)} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((org) => (
            <Card key={org.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold text-white">{org.name}</p>
                  <p className="text-xs text-slate-400">{org.slug}</p>
                </div>
                <Badge tone="info">{org.type}</Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1" variant="secondary" onClick={() => window.location.assign(`/dashboard/superadmin/organizations/${org.id}/admins`)}>
                  Manage admins
                </Button>
                <Button className="flex-1" variant="ghost" onClick={() => setDetail(org)}>
                  View profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className={`text-lg font-semibold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Create organization</h3>
        <form className="mt-4 space-y-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }}>
          <input
            className={`w-full rounded-2xl border px-4 py-3 text-sm ${inputClass}`}
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            className={`w-full rounded-2xl border px-4 py-3 text-sm ${inputClass}`}
            placeholder="Slug"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
          />
          <select
            className={`w-full rounded-2xl border px-4 py-3 text-sm ${inputClass}`}
            value={form.type}
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
          >
            <option>Enterprise</option>
            <option>Government</option>
            <option>University</option>
          </select>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating…' : 'Create'}
          </Button>
        </form>
      </Modal>
      <Modal open={Boolean(detail)} onClose={() => setDetail(null)}>
        {detail && (
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>{detail.name}</h3>
            <div className={`space-y-2 text-sm ${mode === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
              <p>
                <span className="text-slate-500">Slug:</span> {detail.slug}
              </p>
              <p>
                <span className="text-slate-500">Type:</span> {detail.type}
              </p>
              <p>
                <span className="text-slate-500">Org ID:</span> {detail.id}
              </p>
            </div>
            <Button className="w-full" onClick={() => window.location.assign(`/dashboard/superadmin/organizations/${detail.id}/admins`)}>
              View admins
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrganizationList;
