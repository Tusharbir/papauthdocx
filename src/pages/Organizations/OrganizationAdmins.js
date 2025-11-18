import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { organizationApi } from '../../api/organizationApi';
import { useSnackbar } from 'notistack';

const OrganizationAdmins = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [form, setForm] = useState({ name: '', email: '', role: 'issuer-admin' });

  const { data: admins = [] } = useQuery({ queryKey: ['org-admins', id], queryFn: () => organizationApi.listAdmins(id) });

  const mutation = useMutation({
    mutationFn: (payload) => organizationApi.createAdmin(id, payload),
    onSuccess: () => {
      enqueueSnackbar('Admin invited.', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['org-admins', id] });
      setOpen(false);
      setForm({ name: '', email: '', role: 'issuer-admin' });
    },
  });

  const filtered = admins.filter((admin) => (roleFilter === 'all' ? true : admin.role === roleFilter));

  return (
    <div>
      <PageHeader title="Organization admins" subtitle={`Org ID: ${id}`} actions={[{ label: 'Create admin', onClick: () => setOpen(true) }]} />
      <div className="mb-4">
        <select
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All roles</option>
          <option value="issuer-admin">Issuer admin</option>
          <option value="compliance">Compliance</option>
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((admin) => (
          <Card key={admin.id} className="p-6">
            <p className="text-lg font-semibold">{admin.name}</p>
            <p className="text-sm text-slate-400">{admin.email}</p>
            <div className="mt-3 flex items-center justify-between">
              <Badge tone="info">{admin.role}</Badge>
              <Button variant="ghost" className="text-sm" onClick={() => setSelected(admin)}>
                Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 className="text-lg font-semibold text-white">Create admin</h3>
        <form className="mt-4 space-y-4" onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }}>
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <select
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
          >
            <option value="issuer-admin">Issuer Admin</option>
            <option value="compliance">Compliance</option>
          </select>
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating…' : 'Invite admin'}
          </Button>
        </form>
      </Modal>
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected && (
          <div className="space-y-3 text-sm text-slate-300">
            <h3 className="text-lg font-semibold text-white">{selected.name}</h3>
            <p>
              <span className="text-slate-500">Email:</span> {selected.email}
            </p>
            <p>
              <span className="text-slate-500">Role:</span> {selected.role}
            </p>
            <p>
              <span className="text-slate-500">Admin ID:</span> {selected.id}
            </p>
            <Button className="w-full" onClick={() => setSelected(null)}>
              Close
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrganizationAdmins;
