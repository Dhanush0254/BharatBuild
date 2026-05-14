import { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getMyListings, createListing, deleteListing, uploadListingImages } from '../api/listingsApi';
import { getReceivedInquiries, updateInquiryStatus } from '../api/inquiriesApi';
import { getProviderBookings, updateBookingStatus } from '../api/bookingsApi';
import { getProviderReviews } from '../api/reviewsApi';
import { getUserChats } from '../api/chatsApi';
import ChatWindow from '../components/chat/ChatWindow';
import StarRating from '../components/ui/StarRating';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, List, PlusCircle, MessageCircle, User, CalendarCheck,
  IndianRupee, MapPin, Trash2, Eye, CheckCircle, XCircle, Star, Send, Navigation
} from 'lucide-react';

const subCats = {
  workers: ['Mestri','Mason','Carpenter','Electrician','Painter','Welder','Plumber','Tile Worker','POP Worker','Helper','AC Technician'],
  machinery: ['JCB','Crane','Dumper','Tractor','Concrete Mixer','Borewell Rig'],
  materials: ['Sand','Cement','Bricks','Steel','Gravel','Tiles'],
  repairs: ['AC Repair','Electrical Repair','Plumbing Repair','Borewell Repair'],
};
const sc = { pending:'badge-amber', approved:'badge-green', rejected:'badge-red', accepted:'badge-green', completed:'badge-blue', cancelled:'badge-slate', responded:'badge-blue', closed:'badge-slate' };

const ProviderDashboard = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState('listings');
  const [selectedChat, setSelectedChat] = useState(null);

  const { data: ld, isLoading: ll } = useQuery({ queryKey: ['prov','list'], queryFn: () => getMyListings() });
  const { data: id } = useQuery({ queryKey: ['prov','inq'], queryFn: () => getReceivedInquiries() });
  const { data: bd } = useQuery({ queryKey: ['prov','bookings'], queryFn: () => getProviderBookings({ limit: 50 }) });
  const { data: rd } = useQuery({ queryKey: ['prov','reviews'], queryFn: () => getProviderReviews(user?._id) });
  const { data: chatsData } = useQuery({ queryKey: ['user-chats'], queryFn: getUserChats });

  const delMut = useMutation({ mutationFn: deleteListing, onSuccess: () => { qc.invalidateQueries(['prov','list']); toast.success('Deleted'); } });
  const updInq = useMutation({ mutationFn: ({id,status}) => updateInquiryStatus(id,status), onSuccess: () => { qc.invalidateQueries(['prov','inq']); toast.success('Updated'); } });
  const bookMut = useMutation({
    mutationFn: ({id,status}) => updateBookingStatus(id,status),
    onSuccess: () => { qc.invalidateQueries(['prov','bookings']); toast.success('Booking updated'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const bookings = bd?.bookings || [];
  const reviews = rd?.reviews || [];
  const chats = chatsData || [];

  const tabs = [
    { k:'listings', l:'Listings', i:List, c:ld?.pagination?.total },
    { k:'create', l:'Create', i:PlusCircle },
    { k:'bookings', l:'Bookings', i:CalendarCheck, c:bookings.length },
    { k:'inquiries', l:'Inquiries', i:MessageCircle, c:id?.pagination?.total },
    { k:'chats', l:'Chats', i:Send, c:chats.length },
    { k:'reviews', l:'Reviews', i:Star, c:reviews.length },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="page-container">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2"><LayoutDashboard size={24} className="text-brand"/>Provider Dashboard</h1>
          <p className="text-text-secondary mt-1">Welcome, {user?.name}</p>
        </div>
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-border overflow-x-auto">
          {tabs.map(t => (
            <button key={t.k} onClick={() => { setTab(t.k); setSelectedChat(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${tab===t.k?'bg-brand text-white shadow-md':'text-text-secondary hover:bg-slate-50'}`}>
              <t.i size={16}/>{t.l}{t.c!=null&&<span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${tab===t.k?'bg-white/20':'bg-slate-100'}`}>{t.c}</span>}
            </button>
          ))}
        </div>

        {/* LISTINGS */}
        {tab==='listings'&&(<div className="space-y-4">
          {ll?Array(3).fill(0).map((_,i)=><div key={i} className="skeleton h-28"/>):ld?.listings?.length===0?(
            <div className="card p-12 text-center"><div className="text-5xl mb-4">📋</div><h3 className="font-bold text-lg mb-2">No listings yet</h3><button onClick={()=>setTab('create')} className="btn-primary mt-2"><PlusCircle size={16}/>Create Listing</button></div>
          ):ld?.listings?.map(l=>(
            <div key={l._id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1"><h3 className="font-bold truncate">{l.title}</h3><span className={sc[l.status]}>{l.status}</span>
                  {l.isVerified && <span className="badge-green">✅ Verified</span>}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                  <span className="capitalize">{l.category} → {l.subCategory}</span>
                  <span className="flex items-center gap-1"><MapPin size={11}/>{l.address?.area}</span>
                  <span className="flex items-center gap-1"><IndianRupee size={11}/>{l.pricing?.amount}/{l.pricing?.unit}</span>
                  <span className="flex items-center gap-1"><Eye size={11}/>{l.viewCount}</span>
                  {l.ratings?.count > 0 && <StarRating rating={l.ratings.average} count={l.ratings.count} size={11} />}
                </div>
              </div>
              <button onClick={()=>{if(confirm('Delete?'))delMut.mutate(l._id)}} className="btn-ghost text-red-500 btn-sm"><Trash2 size={14}/></button>
            </div>
          ))}
        </div>)}

        {/* CREATE */}
        {tab==='create'&&<CreateForm onDone={()=>{setTab('listings');qc.invalidateQueries(['prov','list']);}}/>}

        {/* BOOKINGS */}
        {tab==='bookings'&&(
          <div className="space-y-4">
            {bookings.length===0?<div className="card p-12 text-center"><div className="text-5xl mb-4">📅</div><h3 className="font-bold text-lg">No booking requests yet</h3></div>:
            bookings.map(b=>(
              <BookingCard key={b._id} booking={b} bookMut={bookMut} />
            ))}
          </div>
        )}

        {/* INQUIRIES */}
        {tab==='inquiries'&&(<div className="space-y-4">
          {id?.inquiries?.length===0?<div className="card p-12 text-center"><div className="text-5xl mb-4">📬</div><h3 className="font-bold text-lg">No inquiries yet</h3></div>:
          id?.inquiries?.map(inq=>(
            <div key={inq._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2"><User size={16} className="text-brand"/><span className="font-bold">{inq.seeker?.name}</span><span className={sc[inq.status]}>{inq.status}</span></div>
                  <p className="text-sm text-text-secondary mb-2">{inq.message}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-text-muted"><span>📋 {inq.listing?.title}</span><span>📞 {inq.contactPhone}</span><span>📅 {new Date(inq.createdAt).toLocaleDateString('en-IN')}</span></div>
                </div>
                {inq.status==='pending'&&<div className="flex gap-2 shrink-0">
                  <button onClick={()=>updInq.mutate({id:inq._id,status:'responded'})} className="btn-primary btn-sm"><CheckCircle size={14}/>Respond</button>
                  <button onClick={()=>updInq.mutate({id:inq._id,status:'closed'})} className="btn-ghost btn-sm"><XCircle size={14}/></button>
                </div>}
              </div>
            </div>
          ))}
        </div>)}

        {/* CHATS */}
        {tab==='chats'&&(
          <div className="card overflow-hidden" style={{ minHeight: '500px' }}>
            <div className="flex h-[600px]">
              <div className={`w-full lg:w-80 border-r border-border overflow-y-auto ${selectedChat?'hidden lg:block':''}`}>
                {chats.length===0?<div className="p-8 text-center text-text-muted text-sm">No conversations yet</div>:
                chats.map(chat=>{
                  const other=chat.participants?.find(p=>p._id!==user._id);
                  return (
                    <button key={chat._id} onClick={()=>setSelectedChat(chat)}
                      className={`w-full text-left p-4 border-b border-border hover:bg-slate-50 transition-colors ${selectedChat?._id===chat._id?'bg-slate-50':''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold shrink-0">{other?.name?.[0]||'?'}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between"><span className="font-semibold text-sm truncate">{other?.name}</span>
                            {chat.myUnreadCount>0&&<span className="w-5 h-5 bg-brand text-white text-[10px] rounded-full flex items-center justify-center font-bold">{chat.myUnreadCount}</span>}
                          </div>
                          <p className="text-xs text-text-muted truncate mt-0.5">{chat.lastMessage?.text||'No messages'}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className={`flex-1 ${!selectedChat?'hidden lg:flex items-center justify-center':'flex flex-col'}`}>
                {selectedChat?<ChatWindow chat={selectedChat} onBack={()=>setSelectedChat(null)}/>:
                <div className="text-center text-text-muted"><MessageCircle size={48} className="mx-auto mb-3 opacity-30"/><p>Select a conversation</p></div>}
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {tab==='reviews'&&(
          <div className="space-y-4">
            {reviews.length===0?<div className="card p-12 text-center"><div className="text-5xl mb-4">⭐</div><h3 className="font-bold text-lg">No reviews yet</h3></div>:
            reviews.map(r=>(
              <div key={r._id} className="card p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold shrink-0">{r.reviewer?.name?.[0]||'?'}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1"><span className="font-bold text-sm">{r.reviewer?.name}</span><StarRating rating={r.rating} showCount={false} size={14}/></div>
                    <p className="text-sm text-text-secondary">{r.comment}</p>
                    <p className="text-xs text-text-muted mt-2">📋 {r.listing?.title} • {new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CreateForm = ({onDone}) => {
  const [f,sF]=useState({category:'',subCategory:'',title:'',description:'',pricing:{amount:'',unit:'per day'},address:{area:'',city:'Hyderabad',district:'',state:'Telangana'},location:{type:'Point',coordinates:[78.4867,17.385]}});
  const [images, setImages] = useState([]);
  const [ld,sL]=useState(false);

  const handleImageChange = (e) => {
    if (e.target.files.length > 5) { toast.error('Maximum 5 images'); return; }
    setImages(Array.from(e.target.files));
  };

  const submit=async(e)=>{
    e.preventDefault();
    try {
      sL(true);
      const newListing = await createListing({...f,pricing:{...f.pricing,amount:Number(f.pricing.amount)}});
      if (images.length > 0) {
        toast.loading('Uploading images...', { id: 'img-upload' });
        const formData = new FormData();
        images.forEach(img => formData.append('images', img));
        await uploadListingImages(newListing._id, formData);
        toast.success('Images uploaded!', { id: 'img-upload' });
      }
      toast.success('Created! Pending approval.');
      onDone();
    } catch(err) { toast.error(err.response?.data?.message || 'Failed'); } finally { sL(false); }
  };

  return(
    <div className="card p-6 sm:p-8 max-w-3xl">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><PlusCircle className="text-brand"/> Create New Listing</h2>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="form-label">Category *</label><select className="form-select" value={f.category} onChange={e=>sF({...f,category:e.target.value,subCategory:''})} required><option value="">Select</option><option value="workers">Workers</option><option value="machinery">Machinery</option><option value="materials">Materials</option><option value="repairs">Repairs</option></select></div>
          <div><label className="form-label">Subcategory *</label><select className="form-select" value={f.subCategory} onChange={e=>sF({...f,subCategory:e.target.value})} required disabled={!f.category}><option value="">Select</option>{f.category&&subCats[f.category]?.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <div><label className="form-label">Title *</label><input className="form-input" placeholder="e.g., Experienced Mestri" value={f.title} onChange={e=>sF({...f,title:e.target.value})} required minLength={5}/></div>
        <div><label className="form-label">Description *</label><textarea className="form-textarea h-32" placeholder="Describe your service..." value={f.description} onChange={e=>sF({...f,description:e.target.value})} required minLength={20}/></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="form-label">Price (₹) *</label><input type="number" className="form-input" value={f.pricing.amount} onChange={e=>sF({...f,pricing:{...f.pricing,amount:e.target.value}})} required min={1}/></div>
          <div><label className="form-label">Unit *</label><select className="form-select" value={f.pricing.unit} onChange={e=>sF({...f,pricing:{...f.pricing,unit:e.target.value}})}><option value="per day">Per Day</option><option value="per hour">Per Hour</option><option value="per bag">Per Bag</option><option value="per tractor">Per Tractor</option><option value="per ton">Per Ton</option><option value="per trip">Per Trip</option><option value="per visit">Per Visit</option><option value="per sq ft">Per Sq Ft</option><option value="per 1000 pieces">Per 1000 Pcs</option><option value="per cubic meter">Per Cu.m</option><option value="per 100ft">Per 100ft</option><option value="per unit">Per Unit</option><option value="per job">Per Job</option></select></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="form-label">Area *</label><input className="form-input" placeholder="Kukatpally" value={f.address.area} onChange={e=>sF({...f,address:{...f.address,area:e.target.value}})} required/></div>
          <div><label className="form-label">District</label><input className="form-input" placeholder="Medchal-Malkajgiri" value={f.address.district} onChange={e=>sF({...f,address:{...f.address,district:e.target.value}})}/></div>
        </div>
        <div className="pt-4">
          <label className="form-label">Upload Images (Max 5)</label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
            <div className="text-4xl mb-2">📸</div><p className="text-sm font-semibold text-slate-700">Click to upload photos</p>
          </div>
          {images.length > 0 && <div className="flex gap-2 mt-3 overflow-x-auto pb-2">{images.map((img, i) => <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border shrink-0"><img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover"/></div>)}</div>}
        </div>
        <div className="pt-4 border-t border-slate-100">
          <button type="submit" disabled={ld} className="btn-primary w-full py-3 text-lg"><PlusCircle size={20}/>{ld?'Creating...':'Publish Listing'}</button>
        </div>
      </form>
    </div>
  );
};

export default ProviderDashboard;

// Booking Card with expandable map
const BookingCard = ({ booking: b, bookMut }) => {
  const [showMap, setShowMap] = useState(false);
  const hasLocation = b.serviceLocation && b.serviceLocation.coordinates && b.serviceLocation.coordinates.length === 2;
  const position = hasLocation ? [b.serviceLocation.coordinates[1], b.serviceLocation.coordinates[0]] : null;

  return (
    <div className="card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1"><h3 className="font-bold truncate">{b.listing?.title}</h3><span className={sc[b.status]}>{b.status}</span></div>
          <div className="flex flex-wrap gap-3 text-xs text-text-muted">
            <span><User size={11} className="inline mr-1"/>{b.seeker?.name} • {b.seeker?.phone}</span>
            <span className="flex items-center gap-1"><IndianRupee size={11}/>{b.totalAmount?.toLocaleString('en-IN')}</span>
            <span>{new Date(b.dates?.start).toLocaleDateString('en-IN')} → {new Date(b.dates?.end).toLocaleDateString('en-IN')}</span>
          </div>
          {b.notes && <p className="text-xs text-text-secondary mt-2 bg-slate-50 rounded-lg px-3 py-2">"{b.notes}"</p>}
          {b.serviceAddress && <p className="text-xs text-text-secondary mt-1 bg-blue-50 rounded-lg px-3 py-2 flex items-center gap-1"><MapPin size={11} className="text-blue-500 shrink-0"/>{b.serviceAddress}</p>}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {b.status==='pending'&&<>
            <button onClick={()=>bookMut.mutate({id:b._id,status:'accepted'})} className="btn-primary btn-sm"><CheckCircle size={14}/>Accept</button>
            <button onClick={()=>bookMut.mutate({id:b._id,status:'rejected'})} className="btn-ghost btn-sm text-red-500"><XCircle size={14}/>Reject</button>
          </>}
          {b.status==='accepted'&&<button onClick={()=>bookMut.mutate({id:b._id,status:'completed'})} className="btn-primary btn-sm"><CheckCircle size={14}/>Complete</button>}
          {(b.status === 'accepted' || b.status === 'pending') && hasLocation && (
            <button onClick={() => setShowMap(!showMap)} className="btn-secondary btn-sm">
              <Navigation size={14} />{showMap ? 'Hide Map' : 'View Location'}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Map */}
      {showMap && position && (
        <div className="mt-4 rounded-xl overflow-hidden border border-border" style={{ height: '250px' }}>
          <MapContainer center={position} zoom={15} className="h-full w-full z-0" scrollWheelZoom={false}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <CircleMarker center={position} radius={12} pathOptions={{ color: '#ffffff', weight: 3, fillColor: '#ea580c', fillOpacity: 1 }}>
              <Popup><div className="font-semibold text-sm">📍 Client's Service Location</div><p className="text-xs text-text-muted mt-1">{b.serviceAddress || b.notes}</p></Popup>
            </CircleMarker>
          </MapContainer>
        </div>
      )}
    </div>
  );
};
