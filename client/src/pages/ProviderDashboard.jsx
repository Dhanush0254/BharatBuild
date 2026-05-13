import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getMyListings, createListing, deleteListing, uploadListingImages } from '../api/listingsApi';
import { getReceivedInquiries, updateInquiryStatus } from '../api/inquiriesApi';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, List, PlusCircle, MessageCircle, User,
  IndianRupee, MapPin, Trash2, Eye, CheckCircle, XCircle
} from 'lucide-react';

const subCats = {
  workers: ['construction', 'destruction', 'plumber', 'electrician'],
  machinery: ['tractor', 'lorry', 'JCB', 'crane', 'drilling rig', 'mixer machine'],
  materials: ['sand', 'bricks', 'cement', 'steel', 'gravel'],
  repairs: ['TV', 'refrigerator', 'mixer', 'AC', 'electrical repair', 'plumbing repair', 'borewell repair'],
};
const statusColors = { pending:'badge-amber', approved:'badge-green', rejected:'badge-red', responded:'badge-blue', closed:'badge-slate' };

const ProviderDashboard = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState('listings');
  const { data: ld, isLoading: ll } = useQuery({ queryKey:['prov','list'], queryFn:()=>getMyListings() });
  const { data: id } = useQuery({ queryKey:['prov','inq'], queryFn:()=>getReceivedInquiries() });
  const delMut = useMutation({ mutationFn:deleteListing, onSuccess:()=>{qc.invalidateQueries(['prov','list']);toast.success('Deleted');} });
  const updInq = useMutation({ mutationFn:({id,status})=>updateInquiryStatus(id,status), onSuccess:()=>{qc.invalidateQueries(['prov','inq']);toast.success('Updated');} });

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="page-container">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2"><LayoutDashboard size={24} className="text-brand"/>Provider Dashboard</h1>
          <p className="text-text-secondary mt-1">Welcome, {user?.name}</p>
        </div>
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-border overflow-x-auto">
          {[{k:'listings',l:'My Listings',i:List,c:ld?.pagination?.total},{k:'create',l:'Create',i:PlusCircle},{k:'inquiries',l:'Inquiries',i:MessageCircle,c:id?.pagination?.total}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${tab===t.k?'bg-brand text-white shadow-md':'text-text-secondary hover:bg-slate-50'}`}>
              <t.i size={16}/>{t.l}{t.c!=null&&<span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${tab===t.k?'bg-white/20':'bg-slate-100'}`}>{t.c}</span>}
            </button>
          ))}
        </div>

        {tab==='listings'&&(<div className="space-y-4">
          {ll?Array(3).fill(0).map((_,i)=><div key={i} className="skeleton h-28"/>):ld?.listings?.length===0?(
            <div className="card p-12 text-center"><div className="text-5xl mb-4">📋</div><h3 className="font-bold text-lg mb-2">No listings yet</h3><button onClick={()=>setTab('create')} className="btn-primary mt-2"><PlusCircle size={16}/>Create Listing</button></div>
          ):ld?.listings?.map(l=>(
            <div key={l._id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1"><h3 className="font-bold truncate">{l.title}</h3><span className={statusColors[l.status]}>{l.status}</span></div>
                <div className="flex flex-wrap gap-3 text-xs text-text-muted"><span className="capitalize">{l.category} → {l.subCategory}</span><span className="flex items-center gap-1"><MapPin size={11}/>{l.address?.area}</span><span className="flex items-center gap-1"><IndianRupee size={11}/>{l.pricing?.amount}/{l.pricing?.unit}</span><span className="flex items-center gap-1"><Eye size={11}/>{l.viewCount}</span></div>
              </div>
              <button onClick={()=>{if(confirm('Delete?'))delMut.mutate(l._id)}} className="btn-ghost text-red-500 btn-sm"><Trash2 size={14}/></button>
            </div>
          ))}
        </div>)}

        {tab==='create'&&<CreateForm onDone={()=>{setTab('listings');qc.invalidateQueries(['prov','list']);}}/>}

        {tab==='inquiries'&&(<div className="space-y-4">
          {id?.inquiries?.length===0?<div className="card p-12 text-center"><div className="text-5xl mb-4">📬</div><h3 className="font-bold text-lg">No inquiries yet</h3></div>:
          id?.inquiries?.map(inq=>(
            <div key={inq._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2"><User size={16} className="text-brand"/><span className="font-bold">{inq.seeker?.name}</span><span className={statusColors[inq.status]}>{inq.status}</span></div>
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
      </div>
    </div>
  );
};

const CreateForm = ({onDone}) => {
  const [f,sF]=useState({category:'',subCategory:'',title:'',description:'',pricing:{amount:'',unit:'per day'},address:{area:'',city:'Hyderabad',district:'',state:'Telangana'},location:{type:'Point',coordinates:[78.4867,17.385]}});
  const [images, setImages] = useState([]);
  const [ld,sL]=useState(false);

  const handleImageChange = (e) => {
    if (e.target.files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    setImages(Array.from(e.target.files));
  };

  const submit=async(e)=>{
    e.preventDefault();
    try {
      sL(true);
      // 1. Create the listing
      const newListing = await createListing({...f,pricing:{...f.pricing,amount:Number(f.pricing.amount)}});
      
      // 2. Upload images if any
      if (images.length > 0) {
        toast.loading('Uploading images...', { id: 'img-upload' });
        const formData = new FormData();
        images.forEach(img => formData.append('images', img));
        await uploadListingImages(newListing._id, formData);
        toast.success('Images uploaded!', { id: 'img-upload' });
      }

      toast.success('Created! Pending approval.');
      onDone();
    } catch(err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      sL(false);
    }
  };

  return(
    <div className="card p-6 sm:p-8 max-w-3xl">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><PlusCircle className="text-brand"/> Create New Listing</h2>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="form-label">Category *</label><select className="form-select" value={f.category} onChange={e=>sF({...f,category:e.target.value,subCategory:''})} required><option value="">Select</option><option value="workers">Workers</option><option value="machinery">Machinery</option><option value="materials">Materials</option><option value="repairs">Repairs</option></select></div>
          <div><label className="form-label">Subcategory *</label><select className="form-select" value={f.subCategory} onChange={e=>sF({...f,subCategory:e.target.value})} required disabled={!f.category}><option value="">Select</option>{f.category&&subCats[f.category]?.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <div><label className="form-label">Title *</label><input className="form-input" placeholder="e.g., Experienced Mestri or JCB 3DX" value={f.title} onChange={e=>sF({...f,title:e.target.value})} required minLength={5}/></div>
        <div><label className="form-label">Description *</label><textarea className="form-textarea h-32" placeholder="Describe your service, experience, tools, etc..." value={f.description} onChange={e=>sF({...f,description:e.target.value})} required minLength={20}/></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="form-label">Price (₹) *</label><input type="number" className="form-input" value={f.pricing.amount} onChange={e=>sF({...f,pricing:{...f.pricing,amount:e.target.value}})} required min={1}/></div>
          <div><label className="form-label">Unit *</label><select className="form-select" value={f.pricing.unit} onChange={e=>sF({...f,pricing:{...f.pricing,unit:e.target.value}})}><option value="per day">Per Day</option><option value="per hour">Per Hour</option><option value="per bag">Per Bag</option><option value="per tractor">Per Tractor</option><option value="per ton">Per Ton</option><option value="per trip">Per Trip</option><option value="per visit">Per Visit</option></select></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="form-label">Area *</label><input className="form-input" placeholder="Kukatpally" value={f.address.area} onChange={e=>sF({...f,address:{...f.address,area:e.target.value}})} required/></div>
          <div><label className="form-label">District</label><input className="form-input" placeholder="Medchal-Malkajgiri" value={f.address.district} onChange={e=>sF({...f,address:{...f.address,district:e.target.value}})}/></div>
        </div>

        {/* Image Upload Area */}
        <div className="pt-4">
          <label className="form-label">Upload Images (Max 5)</label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-4xl mb-2">📸</div>
            <p className="text-sm font-semibold text-slate-700">Click to upload photos</p>
            <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 5MB each</p>
          </div>
          {images.length > 0 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 flex items-center justify-center">
                  <img src={URL.createObjectURL(img)} alt="preview" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button type="submit" disabled={ld} className="btn-primary w-full py-3 text-lg"><PlusCircle size={20}/>{ld?'Creating...':'Publish Listing'}</button>
        </div>
      </form>
    </div>
  );
};

export default ProviderDashboard;
