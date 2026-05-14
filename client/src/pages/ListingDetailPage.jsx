import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useListingDetails } from '../hooks/useListings';
import { useAuth } from '../context/AuthContext';
import { createInquiry } from '../api/inquiriesApi';
import { createBooking } from '../api/bookingsApi';
import { getListingReviews } from '../api/reviewsApi';
import { getOrCreateChat } from '../api/chatsApi';
import { saveWorker, unsaveWorker } from '../api/usersApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import BookingModal from '../components/bookings/BookingModal';
import StarRating from '../components/ui/StarRating';
import toast from 'react-hot-toast';
import {
  MapPin, IndianRupee, Phone, Mail, Eye, MessageCircle, Clock,
  ChevronLeft, Send, User, Tag, Info, CheckCircle, Heart, CalendarCheck,
  ShieldCheck, Star
} from 'lucide-react';

const ImageWithLoader = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="w-full h-full relative">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-brand rounded-full animate-spin"></div>
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`} 
      />
    </div>
  );
};

const DetailMapController = ({ listingPosition }) => {
  const map = useMap();
  const [userPos, setUserPos] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const up = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(up);
          // Fly to user location and center it
          map.flyTo(up, 13, { duration: 1.5 });
        },
        () => {
          map.flyTo(listingPosition, 13, { duration: 1.5 });
        }
      );
    } else {
      map.flyTo(listingPosition, 13, { duration: 1.5 });
    }
  }, [listingPosition, map]);

  if (!userPos) return null;

  return (
    <CircleMarker
      center={userPos}
      radius={10}
      pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#3b82f6', fillOpacity: 1 }}
    >
      <Popup className="custom-popup z-50">
        <div className="font-semibold text-center text-sm py-1">📍 You are here</div>
      </Popup>
    </CircleMarker>
  );
};

const ListingDetailPage = () => {
  const { id } = useParams();
  const { data: listing, isLoading, error } = useListingDetails(id);
  const { isAuthenticated, isSeeker, user } = useAuth();
  const qc = useQueryClient();
  const [inquiryForm, setInquiryForm] = useState({ message: '', contactPhone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: reviewsData } = useQuery({
    queryKey: ['listing-reviews', id],
    queryFn: () => getListingReviews(id),
    enabled: !!id,
  });

  const handleInquiry = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login'); return; }
    try {
      setSubmitting(true);
      await createInquiry({ listingId: id, message: inquiryForm.message, contactPhone: inquiryForm.contactPhone });
      toast.success('Inquiry sent!');
      setSubmitted(true);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleBooking = async (data) => {
    await createBooking(data);
  };

  const handleSave = async () => {
    if (!isAuthenticated) { toast.error('Please login'); return; }
    try {
      if (saved) { await unsaveWorker(id); setSaved(false); toast.success('Removed from saved'); }
      else { await saveWorker(id); setSaved(true); toast.success('Saved!'); }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) { toast.error('Please login'); return; }
    try {
      await getOrCreateChat(listing.provider?._id, id);
      toast.success('Chat started! Check your dashboard.');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6"><div className="skeleton h-80" /><div className="skeleton h-40" /></div>
          <div className="skeleton h-96" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="page-container text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Listing not found</h2>
        <Link to="/search" className="btn-primary">Back to Search</Link>
      </div>
    );
  }

  const position = listing.location?.coordinates ? [listing.location.coordinates[1], listing.location.coordinates[0]] : [17.385, 78.4867];
  const reviews = reviewsData?.reviews || [];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="page-container">
        <Link to="/search" className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-brand mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to Search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="card p-0 overflow-hidden">
              {listing.images && listing.images.length > 0 ? (
                <div className="h-64 sm:h-96 relative group">
                  <div className="flex overflow-x-auto snap-x snap-mandatory h-full">
                    {listing.images.map((img, i) => (
                      <div key={i} className="min-w-full h-full snap-center">
                        <ImageWithLoader src={img.url} alt={`${listing.title} ${i+1}`} />
                      </div>
                    ))}
                  </div>
                  {listing.images.length > 1 && <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">1 / {listing.images.length}</div>}
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
                  {listing.workerStatus === 'active' && <span className="badge-green">Available</span>}
                  {listing.workerStatus === 'busy' && <span className="badge-amber">Busy</span>}
                  {listing.workerStatus === 'unavailable' && <span className="badge-red">Unavailable</span>}
                  {listing.isVerified && <span className="badge-green"><ShieldCheck size={12} className="inline mr-1"/>Verified Shop</span>}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">{listing.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                  <span className="flex items-center gap-1"><MapPin size={14} />{listing.address?.area}, {listing.address?.city}</span>
                  <span className="flex items-center gap-1"><Eye size={14} />{listing.viewCount} views</span>
                  <span className="flex items-center gap-1"><MessageCircle size={14} />{listing.inquiryCount} inquiries</span>
                </div>
                {listing.ratings?.count > 0 && (
                  <div className="mt-3"><StarRating rating={listing.ratings.average} count={listing.ratings.count} size={18} /></div>
                )}
              </div>
            </div>

            {/* Price */}
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
                      <div><div className="text-xs font-semibold text-text-muted uppercase">{key}</div><div className="text-sm text-text-primary font-medium">{value}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                <Star size={16} className="text-brand" />Reviews ({reviewsData?.pagination?.total || 0})
              </h3>
              {reviews.length === 0 ? (
                <p className="text-text-muted text-sm">No reviews yet</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r._id} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-sm shrink-0">
                        {r.reviewer?.name?.[0] || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{r.reviewer?.name}</span>
                          <StarRating rating={r.rating} showCount={false} size={12} />
                        </div>
                        <p className="text-sm text-text-secondary">{r.comment}</p>
                        <p className="text-xs text-text-muted mt-1">{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Map */}
            <div className="card overflow-hidden">
              <div className="p-4 border-b border-border"><h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Location</h3></div>
              <div className="h-64 sm:h-80">
                <MapContainer center={position} zoom={13} className="h-full w-full z-0">
                  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={position}><Popup>{listing.title}<br />{listing.address?.area}</Popup></Marker>
                  <DetailMapController listingPosition={position} />
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Provider */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Provider</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center"><User size={20} className="text-brand" /></div>
                <div>
                  <p className="font-bold text-text-primary">{listing.provider?.name || 'BharatBuild Provider'}</p>
                  <p className="text-xs text-text-muted">{listing.isVerified ? '✅ Verified Shop' : 'Provider'}</p>
                </div>
              </div>
              {listing.provider?.phone && <div className="flex items-center gap-2 text-sm text-text-secondary mb-2"><Phone size={14} />{listing.provider.phone}</div>}
              {listing.provider?.email && <div className="flex items-center gap-2 text-sm text-text-secondary"><Mail size={14} />{listing.provider.email}</div>}
            </div>

            {/* Quick Actions */}
            {isAuthenticated && isSeeker && (
              <div className="card p-6 space-y-3">
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Actions</h3>
                <button onClick={() => setShowBooking(true)} className="btn-primary w-full"><CalendarCheck size={16} />Book Now</button>
                <button onClick={handleStartChat} className="btn-secondary w-full"><MessageCircle size={16} />Chat with Provider</button>
                <button onClick={handleSave} className={`btn-ghost w-full ${saved ? 'text-red-500' : ''}`}>
                  <Heart size={16} className={saved ? 'fill-red-500' : ''} />{saved ? 'Saved' : 'Save Worker'}
                </button>
              </div>
            )}

            {/* Inquiry Form */}
            <div className="card p-6 sticky top-20">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Send Inquiry</h3>
              {submitted ? (
                <div className="text-center py-6">
                  <CheckCircle size={48} className="mx-auto text-emerald-500 mb-3" />
                  <p className="font-bold mb-1">Inquiry Sent!</p>
                  <p className="text-sm text-text-secondary">The provider will contact you soon.</p>
                </div>
              ) : !isAuthenticated ? (
                <div className="text-center py-6">
                  <Info size={32} className="mx-auto text-text-muted mb-3" />
                  <p className="text-sm text-text-secondary mb-4">Login to send inquiries or book.</p>
                  <Link to="/login" className="btn-primary w-full">Login to Continue</Link>
                </div>
              ) : !isSeeker ? (
                <div className="text-center py-6"><Info size={32} className="mx-auto text-text-muted mb-3" /><p className="text-sm text-text-secondary">Only seekers can send inquiries.</p></div>
              ) : (
                <form onSubmit={handleInquiry} className="space-y-4">
                  <div>
                    <label className="form-label">Your Message</label>
                    <textarea className="form-textarea h-28" placeholder="Hi, I am interested in your service..." value={inquiryForm.message}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })} required minLength={10} />
                  </div>
                  <div>
                    <label className="form-label">Your Phone Number</label>
                    <input type="tel" className="form-input" placeholder="9876543210" value={inquiryForm.contactPhone}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, contactPhone: e.target.value })} required pattern="[6-9]\d{9}" />
                  </div>
                  <button type="submit" disabled={submitting} className="btn-primary w-full"><Send size={16} />{submitting ? 'Sending...' : 'Send Inquiry'}</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && listing && (
        <BookingModal listing={listing} onClose={() => setShowBooking(false)} onSubmit={handleBooking} />
      )}
    </div>
  );
};

export default ListingDetailPage;
