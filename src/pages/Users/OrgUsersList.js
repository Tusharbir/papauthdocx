import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import { organizationApi } from '../../api/organizationApi';
import { useSnackbar } from 'notistack';
import { validateField } from '../../utils/validation';
import { USER_ROLES, ROLE_BADGE_TONES } from '../../constants/enums';

const OrgUsersList = () => {
  const mode = useUIStore((state) => state.mode);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const user = useAuthStore((state) => state.user);

  const inputClass = mode === 'dark'
    ? 'border-white/10 bg-white/5 text-white'
    : 'border-slate-300 bg-white text-slate-900';

  // Fetch users in admin's organization
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['org-users', user?.orgId],
    queryFn: () => organizationApi.listUsers(user?.orgId),
    enabled: !!user?.orgId,
  });

  const createMutation = useMutation({
    mutationFn: (payload) => organizationApi.createVerifier(user?.orgId, payload),
    onSuccess: () => {
      enqueueSnackbar('Verifier invited successfully', { variant: 'success' });
      queryClient.invalidateQueries({ queryKey: ['org-users', user?.orgId] });
      setModalOpen(false);
      setForm({ name: '', email: '', password: '' });
      setErrors({ name: '', email: '', password: '' });
      setTouched({ name: false, email: false, password: false });
    },
    onError: (error) => {
      enqueueSnackbar(error?.response?.data?.error || 'Failed to create verifier', { variant: 'error' });
    },
  });

  const filtered = users.filter((u) => {
    const matchesSearch = search === '' || 
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const tone = ROLE_BADGE_TONES[role] || 'default';
    const label = role === USER_ROLES.ADMIN ? 'Admin' 
      : role === USER_ROLES.VERIFIER ? 'Verifier' 
      : role;
    return <Badge tone={tone}>{label}</Badge>;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateFieldValue(field, form[field]);
  };

  const validateFieldValue = (field, value) => {
    let fieldType = field;
    if (field === 'name') fieldType = 'name';
    if (field === 'email') fieldType = 'email';
    if (field === 'password') fieldType = 'password';

    const error = validateField(fieldType, value);
    setErrors((prev) => ({ ...prev, [field]: error || '' }));
    return !error;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateFieldValue(field, value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ name: true, email: true, password: true });

    // Validate all fields
    const nameError = validateField('name', form.name);
    const emailError = validateField('email', form.email);
    const passwordError = validateField('password', form.password);

    setErrors({
      name: nameError || '',
      email: emailError || '',
      password: passwordError || '',
    });

    // If any errors, don't submit
    if (nameError || emailError || passwordError) {
      enqueueSnackbar('Please fix the errors before submitting', { variant: 'error' });
      return;
    }

    createMutation.mutate(form);
  };

  return (
    <div>
      <PageHeader
        title="Organization Users"
        subtitle={`Users in your organization`}
        actions={[{ label: 'Invite Verifier', onClick: () => setModalOpen(true) }]}
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
          <option value={USER_ROLES.ADMIN}>Admin</option>
          <option value={USER_ROLES.VERIFIER}>Verifier</option>
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
                  <span className="text-slate-500">User ID:</span>
                  <span
                    className="overflow-hidden text-ellipsis whitespace-nowrap align-middle inline-block"
                    style={{ maxWidth: '16rem', minWidth: '6rem', verticalAlign: 'middle' }}
                    title={u.id}
                  >
                    {u.id}
                  </span>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className={`text-lg font-semibold ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>Invite Verifier</h3>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit} autoComplete="off" noValidate>
          <div>
            <input
              className={`w-full rounded-2xl border px-4 py-3 text-sm ${inputClass} ${errors.name && touched.name ? 'border-red-500' : ''}`}
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              autoComplete="off"
            />
            {errors.name && touched.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name}</p>
            )}
          </div>
          
          <div>
            <input
              type="email"
              className={`w-full rounded-2xl border px-4 py-3 text-sm ${inputClass} ${errors.email && touched.email ? 'border-red-500' : ''}`}
              placeholder="Email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              autoComplete="off"
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email}</p>
            )}
          </div>
          
          <div>
            <input
              type="password"
              className={`w-full rounded-2xl border px-4 py-3 text-sm ${inputClass} ${errors.password && touched.password ? 'border-red-500' : ''}`}
              placeholder="Password (min 8 chars, uppercase, lowercase, number)"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              autoComplete="new-password"
            />
            {errors.password && touched.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password}</p>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating…' : 'Invite Verifier'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default OrgUsersList;
