import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';

// Component to dynamically adjust map bounds based on markers
const MapBounds = ({ listings }) => {
  const map = useMap();

  useEffect(() => {
    if (listings && listings.length > 0) {
      const bounds = listings.map(l => [l.location.coordinates[1], l.location.coordinates[0]]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [listings, map]);

  return null;
};

const MapView = ({ listings, hoveredListingId }) => {
  // Center of Hyderabad as fallback
  const defaultCenter = [17.3850, 78.4867];

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={11} 
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {listings && listings.length > 0 && <MapBounds listings={listings} />}

        {listings?.map((listing) => {
          const isHovered = listing._id === hoveredListingId;
          return (
            <CircleMarker 
              key={listing._id} 
              center={[listing.location.coordinates[1], listing.location.coordinates[0]]}
              radius={isHovered ? 14 : 8}
              pathOptions={{
                color: isHovered ? '#ffffff' : '#ea580c', // Border color
                weight: isHovered ? 3 : 2,
                fillColor: isHovered ? '#ea580c' : '#ffffff', // Inner color
                fillOpacity: isHovered ? 1 : 0.8,
              }}
            >
              <Popup className="custom-popup z-50">
                <div className="w-48">
                  <h4 className="font-semibold text-text-primary truncate">{listing.title}</h4>
                  <p className="text-xs text-text-secondary mt-1 truncate">{listing.address.area}</p>
                  <div className="mt-2 font-bold text-brand flex items-center text-sm">
                    <IndianRupee size={12} />
                    {listing.pricing.amount} <span className="text-xs font-normal text-text-muted ml-1">/{listing.pricing.unit}</span>
                  </div>
                  <Link to={`/listings/${listing._id}`} className="mt-2 w-full bg-brand text-white py-1.5 rounded text-xs font-bold hover:bg-orange-600 transition-colors inline-block text-center shadow-md">
                    View Details
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
