import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';

// Component to dynamically adjust map bounds based on markers
const MapBounds = ({ listings, userLocation }) => {
  const map = useMap();

  useEffect(() => {
    const isValidNum = (n) => typeof n === 'number' && isFinite(n);

    try {
      if (userLocation && isValidNum(userLocation.lat) && isValidNum(userLocation.lng)) {
        map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 1.5 });
      } else if (listings && listings.length > 0) {
        const bounds = listings
          .filter(l => l.location?.coordinates && isValidNum(l.location.coordinates[0]) && isValidNum(l.location.coordinates[1]))
          .map(l => [l.location.coordinates[1], l.location.coordinates[0]]);
        
        if (bounds.length === 0) return;

        if (bounds.length === 1) {
          map.flyTo(bounds[0], 13, { duration: 1.5 });
        } else {
          // Check if all points are identical — flyToBounds crashes on zero-area bounds
          const allSameLat = bounds.every(b => b[0] === bounds[0][0]);
          const allSameLng = bounds.every(b => b[1] === bounds[0][1]);
          if (allSameLat && allSameLng) {
            map.flyTo(bounds[0], 13, { duration: 1.5 });
          } else {
            map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5, maxZoom: 16 });
          }
        }
      }
    } catch (err) {
      // Silently handle any Leaflet LatLng errors
      console.warn('MapBounds: Could not adjust map view', err);
    }
  }, [listings, userLocation, map]);

  return null;
};

const MapView = ({ listings, hoveredListingId, userLocation }) => {
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
        
        {((listings && listings.length > 0) || (userLocation && userLocation.lat)) && (
          <MapBounds listings={listings} userLocation={userLocation} />
        )}

        {/* User Location Marker */}
        {userLocation && userLocation.lat && userLocation.lng && (
          <CircleMarker
            center={[userLocation.lat, userLocation.lng]}
            radius={10}
            pathOptions={{
              color: '#ffffff',
              weight: 3,
              fillColor: '#3b82f6', // Bright Blue
              fillOpacity: 1,
            }}
          >
            <Popup className="custom-popup z-50">
              <div className="font-semibold text-center text-sm py-1">📍 You are here</div>
            </Popup>
          </CircleMarker>
        )}

        {listings?.filter(l => 
          l.location?.coordinates && 
          typeof l.location.coordinates[0] === 'number' && 
          typeof l.location.coordinates[1] === 'number' &&
          !isNaN(l.location.coordinates[0]) &&
          !isNaN(l.location.coordinates[1])
        ).map((listing) => {
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
