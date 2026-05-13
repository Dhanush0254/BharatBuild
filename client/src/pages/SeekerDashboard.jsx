import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getMySentInquiries } from '../api/inquiriesApi';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, MessageCircle, User, MapPin, IndianRupee, Clock, ExternalLink,
} from 'lucide-react';

const statusColors = { pending: 'badge-amber', responded: 'badge-green', closed: 'badge-slate' };

const SeekerDashboard = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['seeker', 'inquiries', page],
    queryFn: () => getMySentInquiries({ page, limit: 10 }),
  });

  const inquiries = data?.inquiries || [];
  const pagination = data?.pagination;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="page-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard size={24} className="text-brand" />
            My Dashboard
          </h1>
          <p className="text-text-secondary mt-1">Welcome, {user?.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <MessageCircle size={18} className="text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-black text-text-primary">{pagination?.total || 0}</div>
                <div className="text-xs text-text-muted font-medium">Total Inquiries</div>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Clock size={18} className="text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-black text-text-primary">
                  {inquiries.filter(i => i.status === 'responded').length}
                </div>
                <div className="text-xs text-text-muted font-medium">Responded</div>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                <User size={18} className="text-sky-600" />
              </div>
              <div>
                <div className="text-2xl font-black text-text-primary capitalize">{user?.role}</div>
                <div className="text-xs text-text-muted font-medium">Account Type</div>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiries List */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <MessageCircle size={18} className="text-brand" />
            My Sent Inquiries
          </h2>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-32" />)}
          </div>
        ) : inquiries.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="font-bold text-lg text-text-primary mb-2">No inquiries yet</h3>
            <p className="text-text-secondary mb-4">Start browsing listings and send your first inquiry.</p>
            <Link to="/search" className="btn-primary">Browse Listings</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div key={inq._id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Listing info */}
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        to={`/listings/${inq.listing?._id}`}
                        className="font-bold text-text-primary hover:text-brand transition-colors truncate"
                      >
                        {inq.listing?.title || 'Listing'}
                      </Link>
                      <span className={statusColors[inq.status]}>{inq.status}</span>
                    </div>

                    {/* Provider */}
                    <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                      <User size={14} />
                      <span>Provider: <span className="font-medium">{inq.provider?.name || 'N/A'}</span></span>
                      {inq.provider?.phone && <span className="text-text-muted">• 📞 {inq.provider.phone}</span>}
                    </div>

                    {/* Message */}
                    <p className="text-sm text-text-secondary bg-slate-50 rounded-lg px-3 py-2 mb-2 leading-relaxed">
                      "{inq.message}"
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                      {inq.listing?.category && (
                        <span className="capitalize">{inq.listing.category} → {inq.listing.subCategory}</span>
                      )}
                      {inq.listing?.pricing && (
                        <span className="flex items-center gap-0.5">
                          <IndianRupee size={10} />{inq.listing.pricing.amount}/{inq.listing.pricing.unit}
                        </span>
                      )}
                      <span>📅 {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <Link
                    to={`/listings/${inq.listing?._id}`}
                    className="btn-secondary btn-sm shrink-0"
                  >
                    <ExternalLink size={14} /> View Listing
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                  p === pagination.page
                    ? 'bg-brand text-white shadow-md'
                    : 'bg-white border border-border text-text-secondary hover:border-brand'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeekerDashboard;
