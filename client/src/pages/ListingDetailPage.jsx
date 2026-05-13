import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useListingDetails } from '../hooks/useListings';
import { useAuth } from '../context/AuthContext';
import { createInquiry } from '../api/inquiriesApi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import toast from 'react-hot-toast';
import {
  MapPin, IndianRupee, Phone, Mail, Eye, MessageCircle, Clock,
  ChevronLeft, Send, User, Tag, Info, CheckCircle
} from 'lucide-react';

const ListingDetailPage = () => {
  const { id } = useParams();
  const { data: listing, isLoading, error } = useListingDetails(id);
  const { isAuthenticated, isSeeker } = useAuth();
  const [inquiryForm, setInquiryForm] = useState({ message: '', contactPhone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to send an inquiry');
      return;
    }
    try {
      setSubmitting(true);
      await createInquiry({
        listingId: id,
        message: inquiryForm.message,
        contactPhone: inquiryForm.contactPhone,
      });
      toast.success('Inquiry sent successfully!');
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="skeleton h-80" />
            <div className="skeleton h-40" />
          </div>
          <div className="skeleton h-96" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="page-container text-center py-20">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Listing not found</h2>
        <p className="text-text-secondary mb-6">The listing you're looking for doesn't exist or has been removed.</p>
        <Link to="/search" className="btn-primary">Back to Search</Link>
      </div>
    );
  }

  const position = listing.location?.coordinates
    ? [listing.location.coordinates[1], listing.location.coordinates[0]]
    : [17.385, 78.4867];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="page-container">
        {/* Breadcrumb */}
        <Link to="/search" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-brand mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to Search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column — Listing Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image / Header Card */}
            <div className="card p-0 overflow-hidden">
              {listing.images && listing.images.length > 0 ? (
                <div className="h-64 sm:h-96 relative group">
                  <div className="flex overflow-x-auto snap-x snap-mandatory h-full hide-scrollbar">
                    {listing.images.map((img, i) => (
                      <div key={i} className="min-w-full h-full snap-center relative">
                        <img 
                          src={img.url} 
                          alt={`${listing.title} image ${i+1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  {listing.images.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                      1 / {listing.images.length} (Scroll right &rarr;)
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-64 sm:h-80 bg-slate-100 flex items-center justify-center text-6xl">
                  {listing.category === 'workers' ? '👷' : listing.category === 'machinery' ? '🏗️' : listing.category === 'materials' ? '🧱' : '🔧'}
                </div>
              )}
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="badge-amber capitalize">{listing.category}</span>
                  <span className="badge-slate capitalize">{listing.subCategory}</span>
                  {listing.availability ? (
                    <span className="badge-green">Available</span>
                  ) : (
                    <span className="badge-red">Unavailable</span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">{listing.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {listing.address?.area}, {listing.address?.city}</span>
                  <span className="flex items-center gap-1"><Eye size={14} /> {listing.viewCount} views</span>
                  <span className="flex items-center gap-1"><MessageCircle size={14} /> {listing.inquiryCount} inquiries</span>
                </div>
              </div>
            </div>

            {/* Price Card */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Pricing</h3>
              <div className="flex items-baseline gap-1">
                <IndianRupee size={28} className="text-brand" />
                <span className="text-4xl font-black text-brand">{listing.pricing?.amount?.toLocaleString('en-IN')}</span>
                <span className="text-lg text-text-secondary ml-1">/{listing.pricing?.unit}</span>
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Description</h3>
              <p className="text-text-primary leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Metadata */}
            {listing.metadata && Object.keys(listing.metadata).length > 0 && (
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(listing.metadata).map(([key, value]) => (
                    <div key={key} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <Tag size={16} className="text-brand mt-0.5 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-text-muted uppercase">{key}</div>
                        <div className="text-sm text-text-primary font-medium">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Location</h3>
              </div>
              <div className="h-64 sm:h-80">
                <MapContainer center={position} zoom={13} className="h-full w-full z-0">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={position}>
                    <Popup>{listing.title}<br />{listing.address?.area}</Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Right Column — Provider Info & Inquiry */}
          <div className="space-y-6">
            {/* Provider Card */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Provider</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
                  <User size={20} className="text-brand" />
                </div>
                <div>
                  <p className="font-bold text-text-primary">{listing.provider?.name || 'BharatBuild Provider'}</p>
                  <p className="text-xs text-text-muted">Verified Provider</p>
                </div>
              </div>
              {listing.provider?.phone && (
                <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                  <Phone size={14} /> {listing.provider.phone}
                </div>
              )}
              {listing.provider?.email && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Mail size={14} /> {listing.provider.email}
                </div>
              )}
            </div>

            {/* Inquiry Form */}
            <div className="card p-6 sticky top-20">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Send Inquiry</h3>

              {submitted ? (
                <div className="text-center py-6">
                  <CheckCircle size={48} className="mx-auto text-emerald-500 mb-3" />
                  <p className="font-bold text-text-primary mb-1">Inquiry Sent!</p>
                  <p className="text-sm text-text-secondary">The provider will contact you soon.</p>
                </div>
              ) : !isAuthenticated ? (
                <div className="text-center py-6">
                  <Info size={32} className="mx-auto text-text-muted mb-3" />
                  <p className="text-sm text-text-secondary mb-4">Please login as a seeker to send inquiries.</p>
                  <Link to="/login" className="btn-primary w-full">Login to Continue</Link>
                </div>
              ) : !isSeeker ? (
                <div className="text-center py-6">
                  <Info size={32} className="mx-auto text-text-muted mb-3" />
                  <p className="text-sm text-text-secondary">Only seekers can send inquiries.</p>
                </div>
              ) : (
                <form onSubmit={handleInquiry} className="space-y-4">
                  <div>
                    <label className="form-label">Your Message</label>
                    <textarea
                      className="form-textarea h-28"
                      placeholder="Hi, I am interested in your service. I need..."
                      value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                      required
                      minLength={10}
                    />
                  </div>
                  <div>
                    <label className="form-label">Your Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="9876543210"
                      value={inquiryForm.contactPhone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, contactPhone: e.target.value })}
                      required
                      pattern="[6-9]\d{9}"
                    />
                  </div>
                  <button type="submit" disabled={submitting} className="btn-primary w-full">
                    <Send size={16} /> {submitting ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;
