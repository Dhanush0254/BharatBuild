import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFeaturedListings, getMarketplaceStats } from '../api/listingsApi';
import { 
  Search, Users, Truck, Wrench, Hammer, 
  MapPin, ShieldCheck, ChevronRight, IndianRupee, ArrowRight,
  PhoneCall, Wallet, Clock, HardHat, FileText, CheckCircle2
} from 'lucide-react';

const LandingPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: getMarketplaceStats,
  });

  const { data: featured } = useQuery({
    queryKey: ['featured-listings'],
    queryFn: getFeaturedListings,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim() || category) {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (category) params.append('category', category);
      navigate(`/search?${params.toString()}`);
    } else {
      navigate('/search');
    }
  };

  const categories = [
    { id: 'workers', label: 'Workers', icon: <Users size={32} />, desc: 'Mestris, Helpers, Plumbers, Electricians, Carpenters' },
    { id: 'machinery', label: 'Machinery', icon: <Truck size={32} />, desc: 'JCBs, Cranes, Tractors, Drilling Rigs, Mixers' },
    { id: 'materials', label: 'Materials', icon: <Hammer size={32} />, desc: 'Sand, Cement, Bricks, Steel, Gravel' },
    { id: 'repairs', label: 'Repairs', icon: <Wrench size={32} />, desc: 'AC Repair, Electrical Repair, Borewell Services' },
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans bg-slate-50">
      
      {/* ── 1. HERO SECTION ── */}
      <section className="relative overflow-hidden bg-slate-900 pt-20 pb-32">
        <div className="absolute inset-0 pattern-dots opacity-20"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand/20 blur-3xl rounded-full"></div>
        <div className="absolute top-48 -left-24 w-72 h-72 bg-emerald-500/10 blur-3xl rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-full px-4 py-2 text-brand text-sm font-bold tracking-wide uppercase shadow-lg shadow-brand/10 backdrop-blur-sm">
                <MapPin size={16} /> Serving across Telangana
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight">
                BUILD <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">FASTER.</span><br />
                FIND EXPERTS <span className="text-outline block mt-2 text-6xl sm:text-7xl lg:text-8xl opacity-80">LOCALLY.</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-400 max-w-2xl font-medium leading-relaxed">
                BharatBuild connects you directly with verified Mestris, JCB owners, and material suppliers in your area. No middlemen. No commissions.
              </p>

              {/* Floating Search Bar */}
              <div className="bg-white p-3 rounded-2xl shadow-2xl shadow-black/50 max-w-3xl transform hover:scale-[1.01] transition-transform">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="What do you need? (e.g. JCB, Painter, Sand)"
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-none bg-slate-50 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-brand focus:bg-white transition-all text-base font-medium"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="sm:w-48">
                    <select
                      className="w-full form-select border-none bg-slate-50 py-4 rounded-xl text-slate-600 font-medium h-full"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      <option value="workers">Workers</option>
                      <option value="machinery">Machinery</option>
                      <option value="materials">Materials</option>
                      <option value="repairs">Repairs</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-primary py-4 px-8 text-base shadow-brand/30">
                    Search <ArrowRight size={18} />
                  </button>
                </form>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400 font-medium">
                <span className="text-slate-500">Trending Searches:</span>
                {['Mestri', 'JCB Rental', 'Sand Supplier', 'Electrician'].map(tag => (
                  <button key={tag} onClick={() => { setSearch(tag); handleSearch({preventDefault:()=> {}}); }} className="hover:text-brand transition-colors px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50">
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Hero Visual Stats */}
            <div className="lg:col-span-5 hidden lg:block relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-3xl text-white transform translate-y-12 shadow-xl shadow-orange-500/20">
                  <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                    <Users size={24} />
                  </div>
                  <h3 className="text-4xl font-black mb-1">{stats?.users || '500'}+</h3>
                  <p className="font-medium text-orange-100">Verified Providers</p>
                </div>
                
                <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 pattern-diagonal opacity-10"></div>
                  <div className="relative z-10">
                    <div className="bg-slate-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-brand">
                      <Wrench size={24} />
                    </div>
                    <h3 className="text-4xl font-black text-white mb-1">{stats?.total || '1,200'}+</h3>
                    <p className="font-medium text-slate-400">Active Listings</p>
                  </div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-brand transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>

                <div className="col-span-2 bg-white p-6 rounded-3xl shadow-xl mt-8 flex items-center justify-between border border-slate-100 group cursor-pointer hover:border-brand/30 transition-colors" onClick={() => navigate('/search')}>
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600 relative overflow-hidden">
                      <ShieldCheck size={32} className="relative z-10" />
                      <div className="absolute inset-0 bg-emerald-200 blur-xl opacity-50"></div>
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-800">100% Free Contact</h4>
                      <p className="text-slate-500 font-medium">Talk Directly to Providers</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand group-hover:text-white transition-all transform group-hover:translate-x-2">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. DETAILED CATEGORIES EXPLANATION ── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-800 mb-4">Everything You Need for Construction</h2>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto">
            From the foundation to the final coat of paint, BharatBuild helps you find the right people and machinery. Click any category to see available providers in your area.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/search?category=${cat.id}`}
              className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:-translate-y-2 hover:border-brand/50 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center text-brand mb-6 group-hover:bg-brand group-hover:text-white transition-colors">
                {cat.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">{cat.label}</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                {cat.desc}
              </p>
              <div className="text-brand font-bold flex items-center gap-2 group-hover:gap-4 transition-all">
                Browse {cat.label} <ArrowRight size={18} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 3. DETAILED 'HOW IT WORKS' FOR BEGINNERS ── */}
      <section className="bg-slate-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 pattern-diagonal opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">How Do I Use BharatBuild?</h2>
            <p className="text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed">
              We made it extremely simple. You do not need to pay anything to the platform. 
              We just connect you with the provider. You talk to them directly on your phone!
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-16 relative">
            <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 z-0 border-t-2 border-dashed border-slate-700"></div>

            {[
              { 
                step: '1', title: 'Search & Find', 
                desc: 'Type what you need (e.g. "JCB in Kukatpally"). Our map will show you all available providers nearby.',
                icon: <Search size={32} />
              },
              { 
                step: '2', title: 'Check Details & Price', 
                desc: 'Click on a provider to see their photos, experience, and pricing (like "₹700 per day").',
                icon: <FileText size={32} />
              },
              { 
                step: '3', title: 'Send Inquiry & Call', 
                desc: 'Click "Send Inquiry". The provider gets your phone number, and you get theirs. Talk directly and negotiate!',
                icon: <PhoneCall size={32} />
              }
            ].map((item) => (
              <div key={item.step} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-slate-800 rounded-full border-4 border-slate-900 flex items-center justify-center text-brand shadow-xl shadow-black/50 mb-8 relative">
                  {item.icon}
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-brand rounded-full text-white font-black flex items-center justify-center text-xl border-4 border-slate-900">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-slate-400 text-lg leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. BENEFITS - WHY BHARATBUILD? ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-widest text-sm mb-4">
                <ShieldCheck size={18} /> Safe & Transparent
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 mb-6 leading-tight">
                Why thousands in Telangana trust BharatBuild
              </h2>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Finding reliable construction help used to mean asking around or waiting at labor addas. 
                Now, you can find verified local professionals from your phone.
              </p>
              
              <div className="space-y-6">
                {[
                  { icon: <Wallet className="text-brand" size={28}/>, title: 'Zero Commission Fees', desc: 'We do not take a cut. Whatever price you agree on with the provider is what you pay them directly.' },
                  { icon: <MapPin className="text-brand" size={28}/>, title: 'Local Radius Search', desc: 'Find workers and machinery within a 5km radius to save on travel and transport costs.' },
                  { icon: <CheckCircle2 className="text-brand" size={28}/>, title: 'Verified Providers', desc: 'Our admin team manually reviews provider listings to ensure they are real businesses and workers.' }
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 bg-amber-50 p-3 rounded-2xl shrink-0 h-min">
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-800 mb-2">{benefit.title}</h4>
                      <p className="text-slate-600">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-50 p-8 sm:p-12 rounded-[3rem] border border-slate-200 relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <HardHat size={200} />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-slate-800 mb-8">Recent Activity in Telangana</h3>
                <div className="space-y-4">
                  {[
                    { action: 'Mestri hired in Kukatpally', time: '2 mins ago' },
                    { action: 'JCB booked in Miyapur', time: '15 mins ago' },
                    { action: '100 bags of cement ordered in LB Nagar', time: '1 hour ago' },
                    { action: 'Electrician contacted in Secunderabad', time: '3 hours ago' },
                  ].map((activity, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                      <span className="font-medium text-slate-700">{activity.action}</span>
                      <span className="text-sm text-slate-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FEATURED LISTINGS ── */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-brand font-bold uppercase tracking-widest text-sm mb-3">
                <span className="w-8 h-1 bg-brand rounded-full"></span> Top Quality
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">Featured Providers</h2>
            </div>
            <Link to="/search" className="btn-secondary group">
              View All <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {featured && featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featured.slice(0, 3).map((listing) => (
                <div 
                  key={listing._id} 
                  className="card group cursor-pointer hover:border-brand/30"
                  onClick={() => navigate(`/listings/${listing._id}`)}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <span className="badge-amber">{listing.category}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-brand transition-colors line-clamp-2">
                      {listing.title}
                    </h3>
                    
                    <div className="flex items-center text-slate-500 mb-6 text-sm font-medium">
                      <MapPin size={16} className="mr-1 text-slate-400" />
                      {listing.address?.area}, {listing.address?.city}
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Price</p>
                        <p className="text-xl font-black text-slate-800 flex items-center">
                          <IndianRupee size={20} className="text-brand mr-1" />
                          {listing.pricing?.amount} 
                          <span className="text-sm text-slate-500 font-medium ml-1">/ {listing.pricing?.unit}</span>
                        </p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand group-hover:text-white transition-colors">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-64" />)}
            </div>
          )}
        </div>
      </section>

      {/* ── 6. PROVIDER CTA SECTION (Very Detailed) ── */}
      <section className="py-24 bg-brand relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTIgMGwxOCAxOHYybS0yMC0yMGgybTE4IDE4djJtLTItMjBMMCAxOHYyIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9zdmc+')] opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[3rem] p-8 md:p-16 text-white text-center shadow-2xl">
            <HardHat size={64} className="mx-auto mb-8 text-orange-200" />
            <h2 className="text-4xl md:text-5xl font-black mb-6">Are you a Mestri, JCB Owner, or Supplier?</h2>
            <p className="text-xl md:text-2xl text-orange-100 mb-12 max-w-4xl mx-auto font-medium leading-relaxed">
              Stop waiting for calls from agents who take a cut. Register your service on BharatBuild for FREE. 
              Upload photos of your work, set your daily price, and let customers in your area find you directly on the map.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to="/register" className="bg-slate-900 text-white hover:bg-slate-800 px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl">
                Create Free Provider Profile
              </Link>
            </div>
            <p className="mt-8 text-orange-200 font-medium">Over {stats?.users || 500}+ providers are already getting direct business.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
