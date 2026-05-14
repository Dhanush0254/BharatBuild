import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchListings } from '../hooks/useListings';
import { Filter, Map as MapIcon, List as ListIcon, X, Search as SearchIcon, SlidersHorizontal, MapPin, IndianRupee, ShieldCheck } from 'lucide-react';
import ListingCard from '../components/listings/ListingCard';
import MapView from '../components/map/MapView';
import StarRating from '../components/ui/StarRating';

const categories = [
  { id: 'all', label: 'All Categories', sub: [] },
  { id: 'workers', label: 'Workers', sub: ['Mestri','Mason','Carpenter','Electrician','Painter','Welder','Plumber','Tile Worker','POP Worker','Helper','AC Technician'] },
  { id: 'machinery', label: 'Machinery', sub: ['JCB','Crane','Dumper','Tractor','Concrete Mixer','Borewell Rig'] },
  { id: 'materials', label: 'Materials', sub: ['Sand','Cement','Bricks','Steel','Gravel','Tiles'] },
  { id: 'repairs', label: 'Repairs', sub: ['AC Repair','Electrical Repair','Plumbing Repair','Borewell Repair'] },
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('split'); // list, map, split
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredListingId, setHoveredListingId] = useState(null);

  // Parse filters from URL
  const initialFilters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    subCategory: searchParams.get('subCategory') || '',
    maxDistance: parseInt(searchParams.get('radius')) || 10,
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    lat: parseFloat(searchParams.get('lat')) || null,
    lng: parseFloat(searchParams.get('lng')) || null,
    isVerified: searchParams.get('isVerified') === 'true',
    isAvailable: searchParams.get('isAvailable') === 'true',
  };

  const [filters, setFilters] = useState(initialFilters);
  const [locationName, setLocationName] = useState(searchParams.get('locationName') || '');

  // Sync state FROM URL when URL changes (e.g., clicking navbar links)
  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || 'all',
      subCategory: searchParams.get('subCategory') || '',
      maxDistance: parseInt(searchParams.get('radius')) || 10,
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      lat: parseFloat(searchParams.get('lat')) || null,
      lng: parseFloat(searchParams.get('lng')) || null,
      isVerified: searchParams.get('isVerified') === 'true',
      isAvailable: searchParams.get('isAvailable') === 'true',
    });
    setLocationName(searchParams.get('locationName') || '');
  }, [searchParams]);

  // Sync state to URL
  const updateUrl = (newFilters) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.category !== 'all') params.set('category', newFilters.category);
    if (newFilters.subCategory) params.set('subCategory', newFilters.subCategory);
    if (newFilters.maxDistance !== 10) params.set('radius', newFilters.maxDistance.toString());
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
    if (newFilters.lat && newFilters.lng) {
      params.set('lat', newFilters.lat.toString());
      params.set('lng', newFilters.lng.toString());
      if (locationName) params.set('locationName', locationName);
    }
    if (newFilters.isVerified) params.set('isVerified', 'true');
    if (newFilters.isAvailable) params.set('isAvailable', 'true');
    setSearchParams(params);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    if (key === 'category') newFilters.subCategory = ''; // Reset subcategory when category changes
    setFilters(newFilters);
  };

  const applyFilters = (e) => {
    if (e) e.preventDefault();
    updateUrl(filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const reset = { search: '', category: 'all', subCategory: '', maxDistance: 10, minPrice: '', maxPrice: '', lat: null, lng: null, isVerified: false, isAvailable: false };
    setFilters(reset);
    setLocationName('');
    setSearchParams(new URLSearchParams());
    setShowFilters(false);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const newFilters = { ...filters, lat, lng };
          setFilters(newFilters);
          setLocationName('Current Location');
          updateUrl(newFilters);
        },
        () => alert('Could not get your location. Please check browser permissions.')
      );
    }
  };

  // Fetch data
  const apiParams = { ...filters };
  if (apiParams.category === 'all') delete apiParams.category;
  if (apiParams.subCategory === '') delete apiParams.subCategory;
  apiParams.limit = 50;
  const { data, isLoading, error } = useSearchListings(apiParams);

  const listings = data?.listings || [];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top Search Bar */}
      <div className="bg-white border-b border-border p-4 shrink-0 z-10 shadow-sm relative">
        <form onSubmit={applyFilters} className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex gap-2 relative">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input type="text" placeholder="Search workers, machinery..." className="form-input pl-10 h-12 w-full"
                value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} />
            </div>
            <button type="button" onClick={() => setShowFilters(!showFilters)} className="btn-secondary h-12 px-4 shrink-0 sm:hidden">
              <SlidersHorizontal size={18} />
            </button>
            <button type="submit" className="btn-primary h-12 px-6 shrink-0 hidden sm:flex">Search</button>
          </div>
          
          <div className="hidden sm:flex items-center gap-2 bg-slate-100 p-1 rounded-lg shrink-0">
            <button type="button" onClick={() => setViewMode('list')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow text-brand' : 'text-text-secondary hover:text-text-primary'}`}>List</button>
            <button type="button" onClick={() => setViewMode('split')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${viewMode === 'split' ? 'bg-white shadow text-brand' : 'text-text-secondary hover:text-text-primary'}`}>Split</button>
            <button type="button" onClick={() => setViewMode('map')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${viewMode === 'map' ? 'bg-white shadow text-brand' : 'text-text-secondary hover:text-text-primary'}`}>Map</button>
          </div>
        </form>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Filters Overlay */}
        {showFilters && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto lg:hidden">
            <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-white">
              <h2 className="font-bold text-lg">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="p-2"><X size={24} /></button>
            </div>
            <div className="p-4"><FilterSidebar filters={filters} handleFilterChange={handleFilterChange} applyFilters={applyFilters} clearFilters={clearFilters} getUserLocation={getUserLocation} locationName={locationName} /></div>
          </div>
        )}

        {/* Desktop Filters Sidebar */}
        <div className={`w-72 border-r border-border bg-white overflow-y-auto hidden lg:block shrink-0 ${viewMode === 'map' ? 'lg:hidden' : ''}`}>
          <div className="p-5"><FilterSidebar filters={filters} handleFilterChange={handleFilterChange} applyFilters={applyFilters} clearFilters={clearFilters} getUserLocation={getUserLocation} locationName={locationName} /></div>
        </div>

        {/* Listings Content */}
        <div className={`flex-1 overflow-y-auto bg-slate-50 relative ${viewMode === 'map' ? 'hidden lg:block lg:absolute lg:top-4 lg:left-4 lg:z-10 lg:w-[400px] lg:h-[calc(100%-32px)] lg:bg-transparent lg:pointer-events-none' : ''}`}>
          <div className={`p-4 lg:p-6 ${viewMode === 'map' ? 'lg:p-0 h-full' : ''}`}>
            
            <div className={`mb-4 flex items-center justify-between ${viewMode === 'map' ? 'bg-white p-4 rounded-xl shadow-lg pointer-events-auto' : ''}`}>
              <h1 className="text-lg sm:text-xl font-bold text-text-primary capitalize">
                {isLoading ? 'Searching...' : `${data?.pagination?.total || 0} ${filters.category !== 'all' ? filters.category : 'Results'} Found`}
              </h1>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6 pointer-events-auto">
                {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-80 rounded-2xl" />)}
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-white rounded-2xl pointer-events-auto"><p className="text-red-500 font-medium">Failed to load listings. Please try again.</p></div>
            ) : listings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl pointer-events-auto border border-border">
                <div className="text-6xl mb-4">🔍</div><h3 className="text-xl font-bold text-text-primary mb-2">No results found</h3>
                <p className="text-text-secondary mb-6">Try adjusting your filters or searching a different area.</p>
                <button onClick={clearFilters} className="btn-secondary">Clear All Filters</button>
              </div>
            ) : (
              <div className={`grid gap-4 lg:gap-6 pointer-events-auto pb-20 lg:pb-0
                ${viewMode === 'map' ? 'grid-cols-1 overflow-y-auto h-[calc(100%-70px)] pr-2 scrollbar-thin' : 
                  viewMode === 'split' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-2' : 
                  'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {listings.map(listing => (
                  <ListingCard key={listing._id} listing={listing} setHoveredListingId={setHoveredListingId} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map View */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <div className={`flex-1 relative bg-slate-200 z-0 ${viewMode === 'split' ? 'hidden md:block' : 'block'}`}>
            <MapView listings={listings} hoveredListingId={hoveredListingId} userLocation={{ lat: filters.lat, lng: filters.lng }} />
          </div>
        )}

        {/* Mobile View Toggle FAB */}
        <div className="fixed bottom-6 right-6 sm:hidden z-20 flex gap-2">
          {viewMode === 'map' ? (
            <button onClick={() => setViewMode('list')} className="bg-brand text-white p-4 rounded-full shadow-lg flex items-center justify-center"><ListIcon size={24} /></button>
          ) : (
            <button onClick={() => setViewMode('map')} className="bg-brand text-white p-4 rounded-full shadow-lg flex items-center justify-center"><MapIcon size={24} /></button>
          )}
        </div>
      </div>
    </div>
  );
};

// Extracted Sidebar Component
const FilterSidebar = ({ filters, handleFilterChange, applyFilters, clearFilters, getUserLocation, locationName }) => {
  const activeCategory = categories.find(c => c.id === filters.category);

  return (
    <form onSubmit={applyFilters} className="space-y-6">
      {/* Subcategory */}
      {activeCategory && activeCategory.id !== 'all' && (
        <div>
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{activeCategory.label} Type</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input type="radio" name="subCategory" value="" checked={filters.subCategory === ''}
                  onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                  className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-brand transition-colors" />
                <div className="absolute w-2.5 h-2.5 bg-brand rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
              </div>
              <span className={`text-sm font-medium transition-colors ${filters.subCategory === '' ? 'text-brand' : 'text-text-primary group-hover:text-brand'}`}>All {activeCategory.label}</span>
            </label>
            {activeCategory.sub.map(sub => (
              <label key={sub} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input type="radio" name="subCategory" value={sub} checked={filters.subCategory === sub}
                    onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                    className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-brand transition-colors" />
                  <div className="absolute w-2.5 h-2.5 bg-brand rounded-full scale-0 peer-checked:scale-100 transition-transform"></div>
                </div>
                <span className={`text-sm font-medium transition-colors ${filters.subCategory === sub ? 'text-brand' : 'text-text-primary group-hover:text-brand'}`}>{sub}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {activeCategory && activeCategory.id !== 'all' && <hr className="border-border" />}

      {/* Location */}
      <div>
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Location</h3>
        <button type="button" onClick={getUserLocation} className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-brand font-semibold py-2.5 rounded-lg transition-colors text-sm mb-3">
          <MapPin size={16} /> Use My Location
        </button>
        {locationName && <p className="text-xs text-text-secondary text-center">📍 {locationName}</p>}
        
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2"><span className="text-text-secondary">Radius</span><span className="font-bold text-brand">{filters.maxDistance} km</span></div>
          <input type="range" min="1" max="50" className="w-full accent-brand" value={filters.maxDistance} onChange={(e) => handleFilterChange('maxDistance', parseInt(e.target.value))} />
          <div className="flex justify-between text-xs text-text-muted mt-1"><span>1 km</span><span>50 km</span></div>
        </div>
      </div>

      <hr className="border-border" />

      {/* Price */}
      <div>
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Price Range</h3>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="number" placeholder="Min" className="form-input pl-8 h-10 text-sm" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} />
          </div>
          <span className="text-text-muted">-</span>
          <div className="relative flex-1">
            <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input type="number" placeholder="Max" className="form-input pl-8 h-10 text-sm" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} />
          </div>
        </div>
      </div>

      <hr className="border-border" />

      {/* Additional Filters */}
      <div>
        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Additional</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={filters.isVerified} onChange={(e) => handleFilterChange('isVerified', e.target.checked)} className="w-5 h-5 text-brand rounded border-slate-300 accent-brand focus:ring-brand" />
            <span className="text-sm font-medium text-text-primary flex items-center gap-1"><ShieldCheck size={16} className="text-green-500"/> Verified Shops Only</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={filters.isAvailable} onChange={(e) => handleFilterChange('isAvailable', e.target.checked)} className="w-5 h-5 text-brand rounded border-slate-300 accent-brand focus:ring-brand" />
            <span className="text-sm font-medium text-text-primary">Available Now Only</span>
          </label>
        </div>
      </div>


      <div className="pt-4 flex flex-col gap-3">
        <button type="submit" className="btn-primary w-full shadow-md">Apply Filters</button>
        <button type="button" onClick={clearFilters} className="btn-ghost w-full text-text-secondary">Clear All</button>
      </div>
    </form>
  );
};

export default SearchPage;
