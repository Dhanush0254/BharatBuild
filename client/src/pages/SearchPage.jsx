import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchListings } from '../hooks/useListings';
import ListingCard from '../components/listings/ListingCard';
import MapView from '../components/map/MapView';
import {
  Search, Map as MapIcon, List, SlidersHorizontal, X, ChevronDown,
} from 'lucide-react';

const subCategories = {
  workers: ['construction', 'destruction', 'plumber', 'electrician'],
  machinery: ['tractor', 'lorry', 'JCB', 'crane', 'drilling rig', 'mixer machine'],
  materials: ['sand', 'bricks', 'cement', 'steel', 'gravel'],
  repairs: ['TV', 'refrigerator', 'mixer', 'AC', 'electrical repair', 'plumbing repair', 'borewell repair'],
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('both');
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredListingId, setHoveredListingId] = useState(null);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    subCategory: searchParams.get('subCategory') || '',
    area: searchParams.get('area') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
  });

  const { data, isLoading, error } = useSearchListings(searchParams);
  const listings = data?.listings || [];
  const pagination = data?.pagination;

  const handleSearch = (e) => {
    e.preventDefault();
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
    });
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', subCategory: '', area: '', minPrice: '', maxPrice: '', sort: 'newest' });
    setSearchParams(new URLSearchParams());
  };

  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      subCategory: searchParams.get('subCategory') || '',
      area: searchParams.get('area') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      sort: searchParams.get('sort') || 'newest',
    });
  }, [searchParams]);

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page);
    setSearchParams(params);
  };

  const activeFilterCount = Object.values(filters).filter((v) => v && v !== 'newest').length;

  return (
    <div className="flex flex-col">
      {/* Top Search Bar */}
      <div className="bg-white border-b border-border p-3 sm:p-4 z-10 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                placeholder="Search workers, machinery, materials..."
                className="form-input pl-10"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <select
              className="form-select w-full sm:w-44"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, subCategory: '' })}
            >
              <option value="">All Categories</option>
              <option value="workers">Workers</option>
              <option value="machinery">Machinery</option>
              <option value="materials">Materials</option>
              <option value="repairs">Repairs</option>
            </select>

            {filters.category && subCategories[filters.category] && (
              <select
                className="form-select w-full sm:w-44"
                value={filters.subCategory}
                onChange={(e) => setFilters({ ...filters, subCategory: e.target.value })}
              >
                <option value="">All Subcategories</option>
                {subCategories[filters.category].map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary relative ${showFilters ? 'ring-2 ring-brand/30' : ''}`}
              >
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button type="submit" className="btn-primary">Search</button>
            </div>
          </form>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="form-label">Area</label>
                <input
                  type="text"
                  placeholder="e.g. Kukatpally"
                  className="form-input"
                  value={filters.area}
                  onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Min Price (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Max Price (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Sort By</label>
                <select
                  className="form-select"
                  value={filters.sort}
                  onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low → High</option>
                  <option value="price_desc">Price: High → Low</option>
                </select>
              </div>
              <button type="button" onClick={clearFilters} className="btn-ghost text-red-500 col-span-2 sm:col-span-4">
                <X size={14} /> Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View Toggles + Results Count */}
      <div className="bg-white border-b border-border px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="text-sm text-text-secondary font-medium">
          {isLoading ? 'Searching...' : `${pagination?.total || 0} results found`}
        </div>
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
          {[
            { key: 'list', icon: List, label: 'List' },
            { key: 'both', icon: SlidersHorizontal, label: 'Split' },
            { key: 'map', icon: MapIcon, label: 'Map' },
          ].map((v) => (
            <button
              key={v.key}
              onClick={() => setViewMode(v.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
                viewMode === v.key ? 'bg-white shadow-sm text-brand' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <v.icon size={14} />
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row items-start">
        {/* List View */}
        {(viewMode === 'list' || viewMode === 'both') && (
          <div className={`p-4 md:p-6 ${viewMode === 'both' ? 'w-full lg:w-1/2 xl:w-5/12 lg:border-r border-border' : 'w-full max-w-7xl mx-auto'}`}>
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200 mb-4">
                Failed to load listings. Please try again.
              </div>
            )}

            <div className={`grid gap-5 ${viewMode === 'list' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {isLoading && Array(6).fill(0).map((_, i) => (
                <div key={i} className="skeleton h-80" />
              ))}
              {!isLoading && listings.map((listing) => (
                <ListingCard 
                  key={listing._id} 
                  listing={listing} 
                  setHoveredListingId={setHoveredListingId}
                />
              ))}
            </div>

            {!isLoading && listings.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-text-primary">No listings found</h3>
                <p className="text-text-secondary mt-1">Try adjusting your filters or searching a different area.</p>
                <button onClick={clearFilters} className="btn-secondary mt-4">Clear Filters</button>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                      page === pagination.page
                        ? 'bg-brand text-white shadow-md'
                        : 'bg-white border border-border text-text-secondary hover:border-brand hover:text-brand'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map View */}
        {(viewMode === 'map' || viewMode === 'both') && (
          <div className={`${viewMode === 'both' ? 'hidden lg:block lg:w-1/2 xl:w-7/12 lg:sticky lg:top-20 h-[calc(100vh-80px)]' : 'w-full h-[600px] sm:h-[800px]'} bg-slate-100 relative`}>
            <MapView listings={listings} hoveredListingId={hoveredListingId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
