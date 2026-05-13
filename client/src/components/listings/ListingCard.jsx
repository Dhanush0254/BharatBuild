import { Link } from 'react-router-dom';
import { MapPin, IndianRupee, Eye, MessageCircle } from 'lucide-react';

const categoryColors = {
  workers: 'bg-blue-100 text-blue-800',
  machinery: 'bg-amber-100 text-amber-800',
  materials: 'bg-emerald-100 text-emerald-800',
  repairs: 'bg-purple-100 text-purple-800',
};

const categoryIcons = {
  workers: '👷',
  machinery: '🏗️',
  materials: '🧱',
  repairs: '🔧',
};

const ListingCard = ({ listing, setHoveredListingId }) => {
  return (
    <Link 
      to={`/listings/${listing._id}`} 
      className="card-hover group cursor-pointer flex flex-col h-full"
      onMouseEnter={() => setHoveredListingId && setHoveredListingId(listing._id)}
      onMouseLeave={() => setHoveredListingId && setHoveredListingId(null)}
    >
      {/* Image / Placeholder */}
      <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
        {listing.images && listing.images.length > 0 ? (
          <img src={listing.images[0].url} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {categoryIcons[listing.category] || '📦'}
          </div>
        )}
        {/* Category Badge */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${categoryColors[listing.category] || 'bg-slate-100 text-slate-800'}`}>
          {listing.subCategory}
        </div>
        {/* Availability */}
        {listing.availability === false && (
          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">Unavailable</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-base font-bold text-text-primary mb-1 line-clamp-1 group-hover:text-brand transition-colors">
          {listing.title}
        </h3>

        <div className="flex items-center text-text-muted text-sm mb-3 gap-1">
          <MapPin size={13} />
          <span className="truncate">{listing.address?.area}, {listing.address?.city}</span>
        </div>

        <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-grow leading-relaxed">
          {listing.description}
        </p>

        <div className="pt-3 border-t border-border mt-auto flex items-center justify-between">
          <div className="flex items-center text-brand font-bold text-lg">
            <IndianRupee size={16} />
            <span>{listing.pricing?.amount?.toLocaleString('en-IN')}</span>
            <span className="text-xs text-text-muted font-normal ml-1">/{listing.pricing?.unit}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span className="flex items-center gap-1"><Eye size={12} />{listing.viewCount || 0}</span>
            <span className="flex items-center gap-1"><MessageCircle size={12} />{listing.inquiryCount || 0}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
