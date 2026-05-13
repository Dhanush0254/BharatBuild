import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminStats, getPendingListings, moderateListing, getAdminUsers, toggleUserStatus } from '../api/adminApi';
import toast from 'react-hot-toast';
import { Shield, BarChart3, Clock, Users, List, CheckCircle, XCircle, UserX, UserCheck, MapPin, IndianRupee } from 'lucide-react';

const statusColors = { pending:'badge-amber', approved:'badge-green', rejected:'badge-red' };

const AdminDashboard = () => {
  const qc = useQueryClient();
  const [tab, setTab] = useState('stats');
  const { data: stats } = useQuery({ queryKey:['admin','stats'], queryFn:getAdminStats });
  const { data: pending } = useQuery({ queryKey:['admin','pending'], queryFn:()=>getPendingListings() });
  const { data: users } = useQuery({ queryKey:['admin','users'], queryFn:()=>getAdminUsers() });

  const modMut = useMutation({
    mutationFn:({id,action})=>moderateListing(id,action),
    onSuccess:()=>{qc.invalidateQueries(['admin']);toast.success('Listing moderated');},
    onError:(e)=>toast.error(e.response?.data?.message||'Failed'),
  });
  const togMut = useMutation({
    mutationFn:toggleUserStatus,
    onSuccess:()=>{qc.invalidateQueries(['admin','users']);toast.success('User status updated');},
  });

  const tabs = [
    {k:'stats',l:'Dashboard',i:BarChart3},
    {k:'pending',l:'Pending',i:Clock,c:pending?.pagination?.total},
    {k:'users',l:'Users',i:Users,c:users?.pagination?.total},
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="page-container">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield size={24} className="text-brand"/>Admin Panel</h1>
          <p className="text-text-secondary mt-1">Marketplace moderation & management</p>
        </div>

        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-border overflow-x-auto">
          {tabs.map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${tab===t.k?'bg-brand text-white shadow-md':'text-text-secondary hover:bg-slate-50'}`}>
              <t.i size={16}/>{t.l}{t.c!=null&&<span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${tab===t.k?'bg-white/20':'bg-slate-100'}`}>{t.c}</span>}
            </button>
          ))}
        </div>

        {/* Stats */}
        {tab==='stats'&&stats&&(
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {l:'Total Users',v:stats.users?.total,color:'text-blue-600',bg:'bg-blue-50'},
                {l:'Providers',v:stats.users?.providers,color:'text-amber-600',bg:'bg-amber-50'},
                {l:'Listings',v:stats.listings?.total,color:'text-emerald-600',bg:'bg-emerald-50'},
                {l:'Pending',v:stats.listings?.pending,color:'text-red-600',bg:'bg-red-50'},
              ].map(s=>(
                <div key={s.l} className="card p-5">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                    <BarChart3 size={18} className={s.color}/>
                  </div>
                  <div className="text-2xl font-black text-text-primary">{s.v}</div>
                  <div className="text-xs text-text-muted font-medium mt-1">{s.l}</div>
                </div>
              ))}
            </div>
            {stats.categoryBreakdown&&(
              <div className="card p-6">
                <h3 className="font-bold mb-4">Category Breakdown</h3>
                <div className="space-y-3">
                  {stats.categoryBreakdown.map(c=>(
                    <div key={c._id} className="flex items-center justify-between">
                      <span className="capitalize font-medium">{c._id}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand rounded-full" style={{width:`${(c.count/(stats.listings?.total||1))*100}%`}}/>
                        </div>
                        <span className="text-sm font-bold w-8 text-right">{c.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pending Listings */}
        {tab==='pending'&&(
          <div className="space-y-4">
            {pending?.listings?.length===0?<div className="card p-12 text-center"><div className="text-5xl mb-4">✅</div><h3 className="font-bold text-lg">All caught up!</h3><p className="text-text-secondary">No pending listings to review.</p></div>:
            pending?.listings?.map(l=>(
              <div key={l._id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1"><h3 className="font-bold truncate">{l.title}</h3><span className={statusColors[l.status]}>{l.status}</span></div>
                    <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                      <span className="capitalize">{l.category} → {l.subCategory}</span>
                      <span className="flex items-center gap-1"><MapPin size={11}/>{l.address?.area}</span>
                      <span className="flex items-center gap-1"><IndianRupee size={11}/>{l.pricing?.amount}/{l.pricing?.unit}</span>
                      <span>By: {l.provider?.name||'Unknown'}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-2 line-clamp-2">{l.description}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={()=>modMut.mutate({id:l._id,action:'approved'})} className="btn-primary btn-sm"><CheckCircle size={14}/>Approve</button>
                    <button onClick={()=>modMut.mutate({id:l._id,action:'rejected'})} className="btn-danger btn-sm"><XCircle size={14}/>Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users */}
        {tab==='users'&&(
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-border">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Name</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Email</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Role</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Status</th>
                    <th className="text-left px-5 py-3 font-semibold text-text-secondary">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users?.users?.map(u=>(
                    <tr key={u._id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-medium">{u.name}</td>
                      <td className="px-5 py-3 text-text-secondary">{u.email}</td>
                      <td className="px-5 py-3"><span className="badge-amber capitalize">{u.role}</span></td>
                      <td className="px-5 py-3">{u.isActive?<span className="badge-green">Active</span>:<span className="badge-red">Inactive</span>}</td>
                      <td className="px-5 py-3">{u.role!=='admin'&&<button onClick={()=>togMut.mutate(u._id)} className="btn-ghost btn-sm">{u.isActive?<><UserX size={14}/>Deactivate</>:<><UserCheck size={14}/>Activate</>}</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
