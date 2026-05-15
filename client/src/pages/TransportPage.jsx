import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchNearbyVehicles, estimateTransportPrice } from '../api/transportApi';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Truck, MapPin, Star, Phone, IndianRupee, Navigation,
  Package, ShieldCheck, ArrowRight, Search, Filter
} from 'lucide-react';

const VEHICLE_TYPES = [
  { id: 'any', label: 'All Vehicles', emoji: '🚛' },
  { id: 'tractor', label: 'Tractor', emoji: '🚜' },
  { id: 'mini_truck', label: 'Mini Truck', emoji: '🛻' },
  { id: 'pickup_auto', label: 'Pickup Auto', emoji: '🛺' },
  { id: 'lorry', label: 'Lorry', emoji: '🚚' },
  { id: 'tipper', label: 'Tipper', emoji: '⛟' },
  { id: 'bolero_pickup', label: 'Bolero Pickup', emoji: '🚙' },
  { id: 'tempo', label: 'Tempo', emoji: '📦' },
];

const TransportPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [vehicleType, setVehicleType] = useState('any');
  const [userLocation] = useState({ lng: 78.4867, lat: 17.3850 });

  const { data, isLoading } = useQuery({
    queryKey: ['nearby-vehicles', vehicleType, userLocation],
    queryFn: () => {
      const params = { lng: userLocation.lng, lat: userLocation.lat, radius: 30 };
      if (vehicleType !== 'any') {
        params.vehicleType = vehicleType;
      }
      return searchNearbyVehicles(params);
    },
  });

  const vehicles = data?.vehicles || [];

  const handleContact = (vehicle) => {
    if (!isAuthenticated) {
      toast.error('Please login to contact drivers');
      navigate('/login');
      return;
    }
    if (vehicle.ownerInfo?.phone) {
      window.open(`tel:${vehicle.ownerInfo.phone}`);
    } else {
      toast('Contact info not available');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 pt-8 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 75% 50%, rgba(59,130,246,0.4) 0%, transparent 50%)' }} />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="text-blue-400" size={28} />
            <h1 className="text-3xl font-black text-white">Transport & Delivery</h1>
            <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30">
              FAST DELIVERY
            </span>
          </div>
          <p className="text-blue-200 text-lg max-w-2xl">
            Book tractors, mini trucks, lorries for construction material delivery. Find nearby drivers instantly.
          </p>
        </div>
      </div>

      {/* Vehicle Type Filter */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {VEHICLE_TYPES.map(vt => (
              <button key={vt.id} onClick={() => setVehicleType(vt.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all
                  ${vehicleType === vt.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <span>{vt.emoji}</span> {vt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {vehicleType !== 'any' ? VEHICLE_TYPES.find(v => v.id === vehicleType)?.label + 's' : 'All Vehicles'} Near You
            </h2>
            <p className="text-sm text-slate-500 mt-1">{vehicles.length} available within 30km</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-20">
            <Truck size={64} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-bold text-slate-500">No vehicles available nearby</h3>
            <p className="text-slate-400 mt-2">Try a different vehicle type or expand search radius</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map(vehicle => (
              <div key={vehicle._id} className="bg-white rounded-2xl border border-slate-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {/* Vehicle Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{VEHICLE_TYPES.find(v => v.id === vehicle.vehicleType)?.emoji || '🚛'}</span>
                    <div>
                      <h3 className="font-bold text-slate-800 capitalize">
                        {vehicle.vehicleType?.replace('_', ' ')}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">{vehicle.vehicleNumber}</p>
                    </div>
                  </div>
                  {vehicle.verificationStatus === 'verified' && (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck size={10} /> Verified
                    </span>
                  )}
                </div>

                {/* Vehicle Info */}
                <div className="p-5">
                  {/* Driver */}
                  {vehicle.ownerInfo && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        {vehicle.ownerInfo.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800">{vehicle.ownerInfo.name}</p>
                        {vehicle.ratings?.average > 0 && (
                          <span className="flex items-center gap-1 text-xs text-amber-600">
                            <Star size={10} fill="currentColor" /> {vehicle.ratings.average.toFixed(1)}
                            <span className="text-slate-400">({vehicle.ratings.count})</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-xl px-3 py-2">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Capacity</p>
                      <p className="text-sm font-bold text-slate-700">{vehicle.capacity?.weight || '—'} tons</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl px-3 py-2">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Trips Done</p>
                      <p className="text-sm font-bold text-slate-700">{vehicle.tripsCompleted || 0}</p>
                    </div>
                  </div>

                  {/* Distance */}
                  {vehicle.distance && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                      <Navigation size={11} /> {(vehicle.distance / 1000).toFixed(1)} km from you
                    </p>
                  )}

                  {/* Pricing & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-xl font-black text-slate-800 flex items-center">
                        <IndianRupee size={18} className="text-blue-500" />
                        {vehicle.pricingPerKm}
                        <span className="text-xs text-slate-400 font-medium ml-1">/ km</span>
                      </p>
                      {vehicle.baseFare > 0 && (
                        <p className="text-xs text-slate-400">Min: ₹{vehicle.baseFare}</p>
                      )}
                    </div>
                    <button onClick={() => handleContact(vehicle)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm">
                      <Phone size={14} /> Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Future Features Banner */}
        <div className="mt-16 bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-center border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-2">🚀 Coming Soon</h3>
          <p className="text-slate-400 max-w-lg mx-auto">
            Real-time GPS tracking, instant booking, automated driver matching, and online payments.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {['Live Tracking', 'Instant Booking', 'Online Payment', 'Route Optimization'].map(f => (
              <span key={f} className="bg-slate-700 text-slate-300 text-xs font-medium px-3 py-1.5 rounded-full">{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransportPage;
