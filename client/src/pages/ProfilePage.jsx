import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../api/usersApi';
import toast from 'react-hot-toast';
import { User, Phone, MapPin, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const [form, setForm] = useState(null);

  const startEdit = () => {
    setForm({
      name: profile?.name || '',
      phone: profile?.phone || '',
      address: {
        area: profile?.address?.area || '',
        city: profile?.address?.city || 'Hyderabad',
        district: profile?.address?.district || '',
        state: profile?.address?.state || 'Telangana',
      },
    });
    setEditing(true);
  };

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      qc.invalidateQueries(['profile']);
      // Update stored user
      const token = localStorage.getItem('bb_token');
      login(data, token);
      toast.success('Profile updated!');
      setEditing(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const handleSave = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'provider') return '/provider';
    return '/seeker';
  };

  if (isLoading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="page-container max-w-2xl">
          <div className="skeleton h-8 w-48 mb-6" />
          <div className="skeleton h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="page-container max-w-2xl">
        <Link to={getDashboardLink()} className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-brand mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <User size={24} className="text-brand" />
          My Profile
        </h1>

        <div className="card">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center ring-4 ring-brand/30">
                <User size={28} className="text-brand" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
                <p className="text-slate-400 text-sm">{profile?.email}</p>
                <span className="badge-amber mt-2 capitalize">{profile?.role}</span>
              </div>
            </div>
          </div>

          {/* Profile Body */}
          <div className="p-6">
            {!editing ? (
              <div className="space-y-5">
                <ProfileField label="Full Name" value={profile?.name} icon={<User size={16} />} />
                <ProfileField label="Phone" value={profile?.phone || 'Not set'} icon={<Phone size={16} />} />
                <ProfileField label="Area" value={profile?.address?.area || 'Not set'} icon={<MapPin size={16} />} />
                <ProfileField label="City" value={profile?.address?.city || 'Hyderabad'} icon={<MapPin size={16} />} />
                <ProfileField label="District" value={profile?.address?.district || 'Not set'} icon={<MapPin size={16} />} />

                <div className="pt-4 border-t border-border">
                  <button onClick={startEdit} className="btn-primary">
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    pattern="[6-9]\d{9}"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Area</label>
                    <input
                      className="form-input"
                      placeholder="Kukatpally"
                      value={form.address.area}
                      onChange={(e) => setForm({ ...form, address: { ...form.address, area: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="form-label">District</label>
                    <input
                      className="form-input"
                      placeholder="Medchal-Malkajgiri"
                      value={form.address.district}
                      onChange={(e) => setForm({ ...form, address: { ...form.address, district: e.target.value } })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <button type="submit" disabled={mutation.isPending} className="btn-primary">
                    <Save size={16} /> {mutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="card p-6 mt-6">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Account Info</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-text-muted">Member Since</span>
              <p className="font-medium">{new Date(profile?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
            </div>
            <div>
              <span className="text-text-muted">Account Status</span>
              <p>{profile?.isActive ? <span className="badge-green">Active</span> : <span className="badge-red">Inactive</span>}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-text-muted shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <div className="text-xs font-bold text-text-muted uppercase tracking-wider">{label}</div>
      <div className="text-sm font-medium text-text-primary">{value}</div>
    </div>
  </div>
);

export default ProfilePage;
