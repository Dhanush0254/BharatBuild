import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { searchListings } from '../api/listingsApi';
import { searchProducts } from '../api/productsApi';
import { searchNearbyVehicles } from '../api/transportApi';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Settings, LayoutDashboard, Truck, Store, Wrench, IndianRupee, Layers } from 'lucide-react';
import L from 'leaflet';

// Fix Leaflet's default icon path issues


// Custom Icons for different ecosystem layers
const createCustomIcon = (emoji, bgColor) => {
  return L.divIcon({
    className: 'custom-map-icon',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        transform: translate(-50%, -100%);
      ">
        ${emoji}
      </div>
      <div style="
        width: 0; 
        height: 0; 
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid ${bgColor};
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
      "></div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -45],
  });
};

const icons = {
  workers: createCustomIcon('👷', '#f59e0b'), // Amber
  machinery: createCustomIcon('🚜', '#f59e0b'), // Amber
  shops: createCustomIcon('🏪', '#10b981'), // Emerald
  transport: createCustomIcon('🚚', '#3b82f6'), // Blue
  user: createCustomIcon('📍', '#ef4444'), // Red
};

// Component to handle map re-centering
const RecenterMap = ({ lat, lng, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [lat, lng, zoom, map]);
  return null;
};

const MapPage = () => {
  // Default: Hyderabad center
  const [userLocation, setUserLocation] = useState({ lat: 17.3850, lng: 78.4867 });
  const [zoom, setZoom] = useState(13);
  
  // Layer toggles
  const [layers, setLayers] = useState({
    workers: true,
    machinery: true,
    shops: true,
    transport: true,
  });

  // Fetch data
  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['map-listings', userLocation],
    queryFn: () => searchListings({ lat: userLocation.lat, lng: userLocation.lng, radius: 20, limit: 100 }),
    enabled: layers.workers || layers.machinery
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['map-products', userLocation],
    queryFn: () => searchProducts({ lat: userLocation.lat, lng: userLocation.lng, radius: 20, limit: 100 }),
    enabled: layers.shops
  });

  const { data: vehiclesData, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['map-vehicles', userLocation],
    queryFn: () => searchNearbyVehicles({ lat: userLocation.lat, lng: userLocation.lng, radius: 20 }),
    enabled: layers.transport
  });

  // Process data for map
  const listings = listingsData?.listings || [];
  const workers = listings.filter(l => l.category === 'workers' || l.category === 'repairs');
  const machinery = listings.filter(l => l.category === 'machinery');
  
  // Group products by shop to avoid duplicate shop markers
  const shopMap = new Map();
  if (productsData?.products) {
    productsData.products.forEach(p => {
      if (p.shopInfo && p.location?.coordinates) {
        const shopId = p.shop;
        if (!shopMap.has(shopId)) {
          shopMap.set(shopId, {
            _id: shopId,
            name: p.shopInfo.name,
            address: p.shopInfo.address || p.address,
            location: p.location,
            products: 1,
            distance: p.distance
          });
        } else {
          shopMap.get(shopId).products += 1;
        }
      }
    });
  }
  const shops = Array.from(shopMap.values());
  const vehicles = vehiclesData?.vehicles || [];

  const toggleLayer = (layer) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const locateUser = () => {
    if (navigator.geolocation) {
      toast.loading('Locating...', { id: 'locate' });
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setZoom(14);
          toast.success('Location updated', { id: 'locate' });
        },
        (err) => {
          toast.error('Could not get location', { id: 'locate' });
        }
      );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 relative">
      {/* Sidebar Overlay */}
      <div className="absolute top-4 left-4 z-[400] w-72 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 flex flex-col max-h-[calc(100%-32px)]">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="text-brand" size={24} />
            <h1 className="text-xl font-black text-slate-800">Ecosystem Map</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">Live view of BharatBuild network</p>
        </div>

        <div className="p-5 flex-1 overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Map Layers</h3>
          
          <div className="space-y-3">
            {/* Workers Layer */}
            <label className="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all hover:border-amber-300 bg-amber-50/30 border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-lg">👷</div>
                <div>
                  <p className="font-bold text-sm text-slate-800">Workers</p>
                  <p className="text-xs text-slate-500">{workers.length} nearby</p>
                </div>
              </div>
              <input type="checkbox" checked={layers.workers} onChange={() => toggleLayer('workers')} className="toggle-checkbox w-5 h-5 rounded text-amber-500 focus:ring-amber-500" />
            </label>

            {/* Machinery Layer */}
            <label className="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all hover:border-amber-300 bg-amber-50/30 border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-lg">🚜</div>
                <div>
                  <p className="font-bold text-sm text-slate-800">Machinery</p>
                  <p className="text-xs text-slate-500">{machinery.length} nearby</p>
                </div>
              </div>
              <input type="checkbox" checked={layers.machinery} onChange={() => toggleLayer('machinery')} className="toggle-checkbox w-5 h-5 rounded text-amber-500 focus:ring-amber-500" />
            </label>

            {/* Shops Layer */}
            <label className="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all hover:border-emerald-300 bg-emerald-50/30 border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-lg">🏪</div>
                <div>
                  <p className="font-bold text-sm text-slate-800">Material Shops</p>
                  <p className="text-xs text-slate-500">{shops.length} nearby</p>
                </div>
              </div>
              <input type="checkbox" checked={layers.shops} onChange={() => toggleLayer('shops')} className="toggle-checkbox w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500" />
            </label>

            {/* Transport Layer */}
            <label className="flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all hover:border-blue-300 bg-blue-50/30 border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-lg">🚚</div>
                <div>
                  <p className="font-bold text-sm text-slate-800">Transport</p>
                  <p className="text-xs text-slate-500">{vehicles.length} nearby</p>
                </div>
              </div>
              <input type="checkbox" checked={layers.transport} onChange={() => toggleLayer('transport')} className="toggle-checkbox w-5 h-5 rounded text-blue-500 focus:ring-blue-500" />
            </label>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <button onClick={locateUser} className="w-full btn-secondary py-2.5 flex items-center justify-center gap-2">
              <Navigation size={16} /> Locate Me
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full h-full z-0 relative">
        <MapContainer center={[userLocation.lat, userLocation.lng]} zoom={zoom} className="h-full w-full" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <RecenterMap lat={userLocation.lat} lng={userLocation.lng} zoom={zoom} />
          
          {/* User Location Marker */}
          <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={15} pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.2, color: '#3b82f6', weight: 2 }}>
            <CircleMarker center={[userLocation.lat, userLocation.lng]} radius={6} pathOptions={{ fillColor: '#2563eb', fillOpacity: 1, color: '#ffffff', weight: 2 }}>
              <Popup>
                <div className="font-bold text-sm text-center">📍 You are here</div>
              </Popup>
            </CircleMarker>
          </CircleMarker>

          {/* Render Workers */}
          {layers.workers && workers.map(w => w.location?.coordinates && (
            <Marker key={w._id} position={[w.location.coordinates[1], w.location.coordinates[0]]} icon={icons.workers}>
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2"><span className="badge-amber uppercase text-[10px]">{w.subCategory}</span></div>
                  <h3 className="font-bold text-slate-800 leading-tight mb-1">{w.title}</h3>
                  <p className="text-brand font-black text-sm mb-3">₹{w.pricing?.amount}/{w.pricing?.unit}</p>
                  <Link to={`/listings/${w._id}`} className="btn-primary btn-sm w-full text-center block">View Profile</Link>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Render Machinery */}
          {layers.machinery && machinery.map(m => m.location?.coordinates && (
            <Marker key={m._id} position={[m.location.coordinates[1], m.location.coordinates[0]]} icon={icons.machinery}>
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2"><span className="badge-amber uppercase text-[10px]">{m.subCategory}</span></div>
                  <h3 className="font-bold text-slate-800 leading-tight mb-1">{m.title}</h3>
                  <p className="text-brand font-black text-sm mb-3">₹{m.pricing?.amount}/{m.pricing?.unit}</p>
                  <Link to={`/listings/${m._id}`} className="btn-primary btn-sm w-full text-center block">View Machinery</Link>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Render Shops */}
          {layers.shops && shops.map(s => s.location?.coordinates && (
            <Marker key={s._id} position={[s.location.coordinates[1], s.location.coordinates[0]]} icon={icons.shops}>
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2"><span className="badge-green uppercase text-[10px]">Hardware Shop</span></div>
                  <h3 className="font-bold text-slate-800 leading-tight mb-1">{s.name}</h3>
                  <p className="text-slate-500 text-xs mb-3">{s.products} materials available</p>
                  <Link to={`/materials`} className="btn-primary btn-sm w-full text-center block !bg-emerald-500 hover:!bg-emerald-600">Shop Materials</Link>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Render Vehicles */}
          {layers.transport && vehicles.map(v => v.location?.coordinates && (
            <Marker key={v._id} position={[v.location.coordinates[1], v.location.coordinates[0]]} icon={icons.transport}>
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2"><span className="badge-blue uppercase text-[10px]">{v.vehicleType?.replace('_', ' ')}</span></div>
                  <h3 className="font-bold text-slate-800 leading-tight mb-1">{v.ownerInfo?.name || 'Driver'}</h3>
                  <p className="text-blue-600 font-black text-sm mb-3">₹{v.pricingPerKm}/km <span className="text-slate-400 font-medium text-xs">base: ₹{v.baseFare}</span></p>
                  <Link to={`/transport`} className="btn-primary btn-sm w-full text-center block !bg-blue-600 hover:!bg-blue-700">Book Transport</Link>
                </div>
              </Popup>
            </Marker>
          ))}

        </MapContainer>
        
        {/* Map UI Controls position (bottom right) */}
        <div className="leaflet-bottom leaflet-right mb-6 mr-6 flex flex-col gap-2 relative z-[400] pointer-events-none">
          {/* Zoom controls are added by Leaflet, but we disabled default to position custom if needed. Let's just use CSS for it or enable it. */}
        </div>
      </div>
      
      {/* Custom Styles for Leaflet */}
      <style>{`
        .leaflet-control-container .leaflet-bottom.leaflet-right { margin-bottom: 20px; margin-right: 20px; }
        .custom-popup .leaflet-popup-content-wrapper { border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); }
        .custom-popup .leaflet-popup-content { margin: 12px; }
        .custom-popup .leaflet-popup-tip-container { display: none; }
      `}</style>
    </div>
  );
};

export default MapPage;
