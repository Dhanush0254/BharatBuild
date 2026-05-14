import { useState, useEffect } from 'react';
import { X, Calendar, IndianRupee, FileText, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const BookingModal = ({ listing, onClose, onSubmit, isRebook = false }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [serviceAddress, setServiceAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const isMaterial = listing.category === 'materials';
  const isRepair = listing.category === 'repairs';
  const isWorkerOrMachine = listing.category === 'workers' || listing.category === 'machinery';

  // Auto-fetch user GPS on mount
  useEffect(() => {
    if (navigator.geolocation) {
      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGettingLocation(false);
        },
        () => {
          setGettingLocation(false);
        }
      );
    }
  }, []);

  const calculateTotal = () => {
    if (isMaterial) {
      return listing.pricing.amount * (parseInt(quantity) || 1);
    }
    if (isRepair) {
      return listing.pricing.amount; // Base inspection fee
    }
    // Workers / Machinery → price × days
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
    return listing.pricing.amount * days;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isWorkerOrMachine && (!startDate || !endDate)) {
      toast.error('Please select both dates');
      return;
    }
    if (isMaterial && !endDate) {
      toast.error('Please select a delivery date');
      return;
    }
    if (isRepair && !endDate) {
      toast.error('Please select a service date');
      return;
    }
    if (!serviceAddress.trim()) {
      toast.error('Please enter your service/delivery address');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        listingId: listing._id,
        startDate: isMaterial || isRepair ? endDate : startDate,
        endDate: endDate,
        totalAmount: calculateTotal(),
        notes: serviceAddress,
        serviceAddress: serviceAddress,
        serviceLocation: userLocation || null,
      });
      toast.success(isRebook ? 'Worker rebooked!' : 'Booking request sent!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">
            {isRebook ? '🔄 Rebook Worker' : isMaterial ? '📦 Order Materials' : isRepair ? '🔧 Book Repair' : '📅 Book Now'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Listing Info */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-semibold text-text-primary text-sm truncate">{listing.title}</h3>
            <div className="flex items-center gap-1 text-brand font-bold mt-1">
              <IndianRupee size={14} />
              <span>{listing.pricing?.amount?.toLocaleString('en-IN')}</span>
              <span className="text-xs text-text-muted font-normal">/{listing.pricing?.unit}</span>
            </div>
          </div>

          {/* Dynamic Fields based on category */}
          {isMaterial ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Quantity ({listing.pricing?.unit})</label>
                <input type="number" className="form-input" min="1" value={quantity}
                  onChange={(e) => setQuantity(e.target.value)} required placeholder="e.g. 5" />
              </div>
              <div>
                <label className="form-label"><Calendar size={12} className="inline mr-1" />Delivery Date</label>
                <input type="date" className="form-input" min={today} value={endDate}
                  onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>
          ) : isRepair ? (
            <div>
              <label className="form-label"><Calendar size={12} className="inline mr-1" />Preferred Service Date</label>
              <input type="date" className="form-input" min={today} value={endDate}
                onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label"><Calendar size={12} className="inline mr-1" />Start Date</label>
                <input type="date" className="form-input" min={today} value={startDate}
                  onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div>
                <label className="form-label"><Calendar size={12} className="inline mr-1" />End Date</label>
                <input type="date" className="form-input" min={startDate || today} value={endDate}
                  onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>
          )}

          {/* Service/Delivery Address */}
          <div>
            <label className="form-label"><FileText size={12} className="inline mr-1" />{isMaterial ? 'Delivery Address & Notes' : 'Service Address & Requirements'}</label>
            <textarea className="form-textarea h-24" placeholder="Please provide your full address (house number, street, landmark)..."
              value={serviceAddress} onChange={(e) => setServiceAddress(e.target.value)} required />
          </div>

          {/* GPS Location Status */}
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${userLocation ? 'bg-green-50 text-green-700' : gettingLocation ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-700'}`}>
            {gettingLocation ? (
              <><Loader2 size={14} className="animate-spin" /> Detecting your location...</>
            ) : userLocation ? (
              <><MapPin size={14} /> 📍 Location captured — provider can navigate to you</>
            ) : (
              <><MapPin size={14} /> ⚠️ Could not detect your location. Provider will use the address above.</>
            )}
          </div>

          {/* Pricing Summary */}
          {((isWorkerOrMachine && startDate && endDate) || (isMaterial && quantity > 0) || isRepair) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-amber-800">{isRepair ? 'Base Inspection Fee' : 'Estimated Total'}</span>
                <span className="text-xl font-black text-amber-700 flex items-center">
                  <IndianRupee size={18} />{calculateTotal().toLocaleString('en-IN')}
                </span>
              </div>
              {isRepair && (
                <p className="text-xs text-amber-700 mt-1">
                  ⚠️ This is a basic inspection/visit fee. Final price may increase depending on the severity of the issue after checking.
                </p>
              )}
              {isWorkerOrMachine && startDate && endDate && (
                <p className="text-xs text-amber-600 mt-1">
                  {Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1)} days × ₹{listing.pricing?.amount?.toLocaleString('en-IN')}/{listing.pricing?.unit}
                </p>
              )}
              {isMaterial && (
                <p className="text-xs text-amber-600 mt-1">
                  {quantity} × ₹{listing.pricing?.amount?.toLocaleString('en-IN')}/{listing.pricing?.unit}
                </p>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? 'Submitting...' : (isRebook ? 'Confirm Rebooking' : isMaterial ? 'Place Order' : isRepair ? 'Request Service' : 'Send Booking Request')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
