import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchProducts, getProductCategories, getFeaturedProducts } from '../api/productsApi';
import { addToCart } from '../api/cartApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Search, MapPin, Star, ShieldCheck, Filter, ShoppingCart,
  Plus, Minus, Package, Truck, ChevronRight, X, IndianRupee,
  Store, ArrowRight, Sparkles
} from 'lucide-react';

const CATEGORIES = [
  { id: 'cement', label: 'Cement', emoji: '🏗️' },
  { id: 'sand', label: 'Sand', emoji: '⏳' },
  { id: 'bricks', label: 'Bricks', emoji: '🧱' },
  { id: 'steel', label: 'Steel', emoji: '🔩' },
  { id: 'tiles', label: 'Tiles', emoji: '🔲' },
  { id: 'paint', label: 'Paint', emoji: '🎨' },
  { id: 'hardware', label: 'Hardware', emoji: '🔧' },
  { id: 'pipes', label: 'Pipes', emoji: '🔌' },
  { id: 'tools', label: 'Tools', emoji: '🛠️' },
  { id: 'gravel', label: 'Gravel', emoji: '🪨' },
  { id: 'wood', label: 'Wood', emoji: '🪵' },
  { id: 'waterproofing', label: 'Waterproof', emoji: '💧' },
];

const MaterialsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sort: 'relevance', minPrice: '', maxPrice: '',
    deliveryAvailable: false, isVerified: false, inStock: true,
  });
  const [cartQuantities, setCartQuantities] = useState({});

  // Location (default Hyderabad center)
  const [userLocation] = useState({ lng: 78.4867, lat: 17.3850 });

  const queryParams = {
    lng: userLocation.lng, lat: userLocation.lat, radius: 50,
    ...(search && { search }),
    ...(activeCategory && { category: activeCategory }),
    ...(filters.sort !== 'relevance' && { sort: filters.sort }),
    ...(filters.minPrice && { minPrice: filters.minPrice }),
    ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
    ...(filters.deliveryAvailable && { deliveryAvailable: 'true' }),
    ...(filters.isVerified && { isVerified: 'true' }),
    ...(filters.inStock && { inStock: 'true' }),
    page: searchParams.get('page') || 1,
    limit: 12,
  };

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', queryParams],
    queryFn: () => searchProducts(queryParams),
  });

  const { data: featuredData } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => getFeaturedProducts(6),
    enabled: !search && !activeCategory,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (activeCategory) params.set('category', activeCategory);
    setSearchParams(params);
  };

  const handleCategoryClick = (catId) => {
    const newCat = activeCategory === catId ? '' : catId;
    setActiveCategory(newCat);
    const params = new URLSearchParams(searchParams);
    if (newCat) params.set('category', newCat);
    else params.delete('category');
    setSearchParams(params);
  };

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    try {
      const qty = cartQuantities[product._id] || 1;
      await addToCart(product._id, qty);
      toast.success(`${product.title} added to cart!`);
      setCartQuantities(prev => ({ ...prev, [product._id]: 0 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  const updateQty = (productId, delta) => {
    setCartQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta),
    }));
  };

  const products = productsData?.products || [];
  const pagination = productsData?.pagination;
  const featured = featuredData?.products || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Search Bar */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-8 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(245,158,11,0.3) 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <Store className="text-amber-400" size={28} />
            <h1 className="text-3xl font-black text-white">Construction Materials</h1>
            <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
              BUY DIRECTLY
            </span>
          </div>
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 shadow-2xl shadow-black/30 flex gap-2 max-w-3xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder='Search materials... "cement", "tiles", "sand near me"'
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 border-none text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all font-medium"
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-3 text-sm shadow-lg">
              Search <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Category Scrollbar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => handleCategoryClick(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all
                  ${activeCategory === cat.id
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30 scale-105'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <span>{cat.emoji}</span> {cat.label}
              </button>
            ))}
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-slate-800 text-white hover:bg-slate-700 whitespace-nowrap ml-2">
              <Filter size={14} /> Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border-b border-slate-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center gap-4">
              <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                className="form-select rounded-xl border-slate-200 text-sm font-medium py-2.5">
                <option value="relevance">Sort: Relevance</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="rating">Rating</option>
                <option value="nearest">Nearest</option>
                <option value="popular">Most Popular</option>
              </select>
              <input type="number" placeholder="Min ₹" value={filters.minPrice}
                onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                className="w-24 form-input rounded-xl border-slate-200 text-sm py-2.5" />
              <input type="number" placeholder="Max ₹" value={filters.maxPrice}
                onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                className="w-24 form-input rounded-xl border-slate-200 text-sm py-2.5" />
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                <input type="checkbox" checked={filters.deliveryAvailable}
                  onChange={e => setFilters(f => ({ ...f, deliveryAvailable: e.target.checked }))}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
                <Truck size={14} /> Delivery Available
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                <input type="checkbox" checked={filters.isVerified}
                  onChange={e => setFilters(f => ({ ...f, isVerified: e.target.checked }))}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-500" />
                <ShieldCheck size={14} /> Verified Shops Only
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Featured Products (when no search) */}
        {!search && !activeCategory && featured.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="text-amber-500" size={24} />
              <h2 className="text-2xl font-black text-slate-800">Popular Materials</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featured.map(p => (
                <div key={p._id} onClick={() => navigate(`/materials/${p._id}`)}
                  className="bg-white rounded-2xl p-4 border border-slate-100 hover:border-amber-300 hover:shadow-lg transition-all cursor-pointer group">
                  <div className="w-full h-20 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center text-3xl mb-3">
                    {CATEGORIES.find(c => c.id === p.category)?.emoji || '📦'}
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-amber-600 transition-colors">{p.title}</h3>
                  <p className="text-amber-600 font-black text-sm mt-1">₹{p.price?.toLocaleString()} <span className="text-xs text-slate-400 font-medium">/{p.unit}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {activeCategory ? CATEGORIES.find(c => c.id === activeCategory)?.label || activeCategory : 'All Materials'}
              {search && <span className="text-slate-400 ml-2">for "{search}"</span>}
            </h2>
            {pagination && <p className="text-sm text-slate-500 mt-1">{pagination.total} products found</p>}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-500">No products found</h3>
            <p className="text-slate-400 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product._id} className="bg-white rounded-2xl border border-slate-100 hover:border-amber-300 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {/* Product Image/Icon */}
                <div className="relative h-40 bg-gradient-to-br from-slate-50 to-amber-50 flex items-center justify-center cursor-pointer"
                  onClick={() => navigate(`/materials/${product._id}`)}>
                  <span className="text-5xl">{CATEGORIES.find(c => c.id === product.category)?.emoji || '📦'}</span>
                  {product.isVerified && (
                    <span className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck size={10} /> VERIFIED
                    </span>
                  )}
                  {product.deliveryAvailable && (
                    <span className="absolute top-3 right-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Truck size={10} /> DELIVERY
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-amber-600 transition-colors cursor-pointer"
                      onClick={() => navigate(`/materials/${product._id}`)}>
                      {product.title}
                    </h3>
                    {product.ratings?.average > 0 && (
                      <span className="flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-1.5 py-0.5 rounded-lg shrink-0">
                        <Star size={10} fill="currentColor" /> {product.ratings.average.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {product.brand && <p className="text-xs text-slate-400 font-medium mb-2">{product.brand}</p>}

                  {/* Shop info */}
                  {product.shopInfo && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                      <Store size={11} />
                      <span className="truncate">{product.shopInfo.name}</span>
                      <span className="text-slate-300">•</span>
                      <MapPin size={11} />
                      <span className="truncate">{product.shopInfo.address?.area || product.address?.area}</span>
                    </div>
                  )}

                  {/* Distance */}
                  {product.distance && (
                    <p className="text-xs text-slate-400 mb-3">
                      📍 {(product.distance / 1000).toFixed(1)} km away
                    </p>
                  )}

                  {/* Price & Cart */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-lg font-black text-slate-800 flex items-center">
                        <IndianRupee size={16} className="text-amber-500" />
                        {product.price?.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">{product.unit}</p>
                    </div>

                    {/* Quantity + Add to Cart */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-100 rounded-lg">
                        <button onClick={() => updateQty(product._id, -1)} className="p-1.5 hover:bg-slate-200 rounded-l-lg transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-bold px-2 min-w-[24px] text-center">{cartQuantities[product._id] || 1}</span>
                        <button onClick={() => updateQty(product._id, 1)} className="p-1.5 hover:bg-slate-200 rounded-r-lg transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => handleAddToCart(product)}
                        className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-xl transition-colors shadow-sm hover:shadow-md">
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => { const params = new URLSearchParams(searchParams); params.set('page', p); setSearchParams(params); }}
                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all
                  ${pagination.page === p ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialsPage;
