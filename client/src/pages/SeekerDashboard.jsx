import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getSeekerBookings, cancelBooking, rebookWorker } from '../api/bookingsApi';
import { getMySentInquiries } from '../api/inquiriesApi';
import { getSavedWorkers, unsaveWorker } from '../api/usersApi';
import { getUserChats, getOrCreateChat } from '../api/chatsApi';
import ChatWindow from '../components/chat/ChatWindow';
import BookingModal from '../components/bookings/BookingModal';
import ReviewForm from '../components/reviews/ReviewForm';
import StarRating from '../components/ui/StarRating';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, CalendarCheck, Heart, MessageCircle, Clock, RefreshCw,
  MapPin, IndianRupee, ExternalLink, X, User, XCircle, Send, CheckCircle, Star, Navigation
} from 'lucide-react';

const statusColors = { pending:'badge-amber', accepted:'badge-green', rejected:'badge-red', completed:'badge-blue', cancelled:'badge-slate', responded:'badge-green', closed:'badge-slate' };

const SeekerDashboard = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState('bookings');
  const [selectedChat, setSelectedChat] = useState(null);
  const [rebookListing, setRebookListing] = useState(null);
  const [reviewBookingId, setReviewBookingId] = useState(null);

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['seeker', 'bookings'], queryFn: () => getSeekerBookings({ limit: 50 }),
  });
  const { data: inquiriesData } = useQuery({
    queryKey: ['seeker', 'inquiries'], queryFn: () => getMySentInquiries({ limit: 50 }),
  });
  const { data: savedData } = useQuery({
    queryKey: ['seeker', 'saved'], queryFn: getSavedWorkers,
  });
  const { data: chatsData } = useQuery({
    queryKey: ['user-chats'], queryFn: getUserChats,
  });

  const cancelMut = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => { qc.invalidateQueries(['seeker', 'bookings']); toast.success('Booking cancelled'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });
  const unsaveMut = useMutation({
    mutationFn: unsaveWorker,
    onSuccess: () => { qc.invalidateQueries(['seeker', 'saved']); toast.success('Removed'); },
  });

  const bookings = bookingsData?.bookings || [];
  const inquiries = inquiriesData?.inquiries || [];
  const saved = savedData || [];
  const chats = chatsData || [];

  const completedBookings = bookings.filter(b => b.status === 'completed');

  const tabs = [
    { k: 'bookings', l: 'My Bookings', i: CalendarCheck, c: bookings.length },
    { k: 'saved', l: 'Saved', i: Heart, c: saved.length },
    { k: 'chats', l: 'Chats', i: MessageCircle, c: chats.length },
    { k: 'history', l: 'Rebook', i: RefreshCw, c: completedBookings.length },
    { k: 'inquiries', l: 'Inquiries', i: Send, c: inquiries.length },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="page-container">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard size={24} className="text-brand" /> My Dashboard
          </h1>
          <p className="text-text-secondary mt-1">Welcome, {user?.name}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-border overflow-x-auto">
          {tabs.map(t => (
            <button key={t.k} onClick={() => { setTab(t.k); setSelectedChat(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                tab === t.k ? 'bg-brand text-white shadow-md' : 'text-text-secondary hover:bg-slate-50'
              }`}>
              <t.i size={16} />{t.l}
              {t.c > 0 && <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${tab === t.k ? 'bg-white/20' : 'bg-slate-100'}`}>{t.c}</span>}
            </button>
          ))}
        </div>

        {/* BOOKINGS TAB */}
        {tab === 'bookings' && (
          <div className="space-y-4">
            {bookingsLoading ? [1,2,3].map(i => <div key={i} className="skeleton h-28" />) :
            bookings.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-5xl mb-4">📅</div>
                <h3 className="font-bold text-lg mb-2">No bookings yet</h3>
                <p className="text-text-secondary mb-4">Browse listings and book workers or machinery.</p>
                <Link to="/search" className="btn-primary">Browse Listings</Link>
              </div>
            ) : bookings.map(b => (
              <SeekerBookingCard key={b._id} booking={b} cancelMut={cancelMut} setReviewBookingId={setReviewBookingId} />
            ))}
          </div>
        )}

        {/* SAVED TAB */}
        {tab === 'saved' && (
          <div>
            {saved.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-5xl mb-4">❤️</div>
                <h3 className="font-bold text-lg mb-2">No saved workers</h3>
                <p className="text-text-secondary mb-4">Save workers and services you like for quick access.</p>
                <Link to="/search" className="btn-primary">Browse Listings</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {saved.map(listing => (
                  <div key={listing._id} className="card-hover group">
                    <Link to={`/listings/${listing._id}`} className="block p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge-amber capitalize text-xs">{listing.subCategory}</span>
                        {listing.ratings?.average > 0 && <StarRating rating={listing.ratings.average} count={listing.ratings.count} size={12} />}
                      </div>
                      <h3 className="font-bold text-text-primary truncate group-hover:text-brand transition-colors">{listing.title}</h3>
                      <p className="text-xs text-text-muted mt-1 flex items-center gap-1"><MapPin size={11} />{listing.address?.area}</p>
                      <p className="text-brand font-bold mt-2 flex items-center"><IndianRupee size={14} />{listing.pricing?.amount}/{listing.pricing?.unit}</p>
                    </Link>
                    <div className="px-5 pb-4">
                      <button onClick={() => unsaveMut.mutate(listing._id)} className="btn-ghost btn-sm text-red-500 w-full"><X size={14} />Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHATS TAB */}
        {tab === 'chats' && (
          <div className="card overflow-hidden" style={{ minHeight: '500px' }}>
            <div className="flex h-[600px]">
              {/* Chat List */}
              <div className={`w-full lg:w-80 border-r border-border overflow-y-auto ${selectedChat ? 'hidden lg:block' : ''}`}>
                {chats.length === 0 ? (
                  <div className="p-8 text-center text-text-muted text-sm">No conversations yet</div>
                ) : chats.map(chat => {
                  const other = chat.participants?.find(p => p._id !== user._id);
                  return (
                    <button key={chat._id} onClick={() => setSelectedChat(chat)}
                      className={`w-full text-left p-4 border-b border-border hover:bg-slate-50 transition-colors ${selectedChat?._id === chat._id ? 'bg-slate-50' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold shrink-0">
                          {other?.name?.[0] || '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm truncate">{other?.name}</span>
                            {chat.myUnreadCount > 0 && <span className="w-5 h-5 bg-brand text-white text-[10px] rounded-full flex items-center justify-center font-bold">{chat.myUnreadCount}</span>}
                          </div>
                          <p className="text-xs text-text-muted truncate mt-0.5">{chat.lastMessage?.text || 'No messages'}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {/* Chat Window */}
              <div className={`flex-1 ${!selectedChat ? 'hidden lg:flex items-center justify-center' : 'flex flex-col'}`}>
                {selectedChat ? (
                  <ChatWindow chat={selectedChat} onBack={() => setSelectedChat(null)} />
                ) : (
                  <div className="text-center text-text-muted"><MessageCircle size={48} className="mx-auto mb-3 opacity-30" /><p>Select a conversation</p></div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* REBOOK/HISTORY TAB */}
        {tab === 'history' && (
          <div className="space-y-4">
            {completedBookings.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-5xl mb-4">🔄</div>
                <h3 className="font-bold text-lg mb-2">No completed bookings</h3>
                <p className="text-text-secondary">Complete a booking to rebook the same worker later.</p>
              </div>
            ) : completedBookings.map(b => (
              <div key={b._id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold truncate">{b.listing?.title}</h3>
                    <span className="badge-blue">Completed</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                    <span><User size={11} className="inline mr-1" />{b.provider?.name}</span>
                    <span className="flex items-center gap-1"><IndianRupee size={11} />{b.totalAmount?.toLocaleString('en-IN')}</span>
                    <span>{new Date(b.dates?.start).toLocaleDateString('en-IN')} → {new Date(b.dates?.end).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <button onClick={() => setRebookListing(b.listing)}
                  className="btn-primary btn-sm"><RefreshCw size={14} />Rebook Worker</button>
              </div>
            ))}
          </div>
        )}

        {/* INQUIRIES TAB */}
        {tab === 'inquiries' && (
          <div className="space-y-4">
            {inquiries.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="text-5xl mb-4">📭</div>
                <h3 className="font-bold text-lg mb-2">No inquiries yet</h3>
                <Link to="/search" className="btn-primary">Browse Listings</Link>
              </div>
            ) : inquiries.map(inq => (
              <div key={inq._id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Link to={`/listings/${inq.listing?._id}`} className="font-bold hover:text-brand truncate">{inq.listing?.title || 'Listing'}</Link>
                      <span className={statusColors[inq.status]}>{inq.status}</span>
                    </div>
                    <p className="text-sm text-text-secondary bg-slate-50 rounded-lg px-3 py-2 mb-2">"{inq.message}"</p>
                    <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                      <span><User size={11} className="inline mr-1" />{inq.provider?.name}</span>
                      <span>📅 {new Date(inq.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                  <Link to={`/listings/${inq.listing?._id}`} className="btn-secondary btn-sm shrink-0"><ExternalLink size={14} />View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rebook Modal */}
      {rebookListing && (
        <BookingModal listing={rebookListing} isRebook onClose={() => setRebookListing(null)}
          onSubmit={async (data) => {
            const completedB = completedBookings.find(b => b.listing?._id === rebookListing._id);
            if (completedB) await rebookWorker(completedB._id, data);
            qc.invalidateQueries(['seeker', 'bookings']);
          }} />
      )}

      {/* Review Modal */}
      {reviewBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Leave a Review</h2>
              <button onClick={() => setReviewBookingId(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
            </div>
            <ReviewForm bookingId={reviewBookingId} onSuccess={() => { setReviewBookingId(null); qc.invalidateQueries(['seeker', 'bookings']); }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SeekerDashboard;

// Booking card with expandable provider location map
const SeekerBookingCard = ({ booking: b, cancelMut, setReviewBookingId }) => {
  const [showMap, setShowMap] = useState(false);
  // Provider's listing location
  const isValidNum = (n) => typeof n === 'number' && !isNaN(n);
  const listingCoords = b.listing?.location?.coordinates;
  const hasListingLocation = listingCoords && 
                           listingCoords.length === 2 && 
                           isValidNum(listingCoords[0]) && 
                           isValidNum(listingCoords[1]);
  const providerPos = hasListingLocation ? [listingCoords[1], listingCoords[0]] : null;
  // Show map button only for active bookings
  const showMapBtn = (b.status === 'accepted' || b.status === 'completed') && providerPos;

  return (
    <div className="card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/listings/${b.listing?._id}`} className="font-bold truncate hover:text-brand transition-colors">
              {b.listing?.title || 'Listing'}
            </Link>
            <span className={statusColors[b.status]}>{b.status}</span>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-text-muted">
            <span className="capitalize">{b.listing?.category} → {b.listing?.subCategory}</span>
            <span className="flex items-center gap-1"><MapPin size={11} />{b.listing?.address?.area}</span>
            <span className="flex items-center gap-1"><IndianRupee size={11} />{b.totalAmount?.toLocaleString('en-IN')}</span>
            <span className="flex items-center gap-1"><Clock size={11} />{new Date(b.dates?.start).toLocaleDateString('en-IN')} → {new Date(b.dates?.end).toLocaleDateString('en-IN')}</span>
          </div>
          {b.provider && <p className="text-xs text-text-muted mt-1"><User size={11} className="inline mr-1" />Provider: {b.provider.name} • {b.provider.phone}</p>}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {b.status === 'pending' && (
            <button onClick={() => { if(confirm('Cancel this booking?')) cancelMut.mutate(b._id); }}
              className="btn-ghost btn-sm text-red-500"><XCircle size={14} />Cancel</button>
          )}
          {b.status === 'completed' && !b._reviewed && (
            <button onClick={() => setReviewBookingId(b._id)} className="btn-secondary btn-sm"><Star size={14} />Review</button>
          )}
          <Link to={`/listings/${b.listing?._id}`} className="btn-secondary btn-sm"><ExternalLink size={14} />View</Link>
          {showMapBtn && (
            <button onClick={() => setShowMap(!showMap)} className="btn-secondary btn-sm">
              <Navigation size={14} />{showMap ? 'Hide Map' : 'Provider Location'}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Provider Location Map */}
      {showMap && providerPos && (
        <div className="mt-4 rounded-xl overflow-hidden border border-border" style={{ height: '250px' }}>
          <MapContainer center={providerPos} zoom={15} className="h-full w-full z-0" scrollWheelZoom={false}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <CircleMarker center={providerPos} radius={12} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#ea580c', fillOpacity: 1 }}>
              <Popup><div className="font-semibold text-sm">📍 Provider's Location</div><p className="text-xs text-text-muted mt-1">{b.listing?.address?.area}</p></Popup>
            </CircleMarker>
          </MapContainer>
        </div>
      )}
    </div>
  );
};
