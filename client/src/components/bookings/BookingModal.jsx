import { useState } from 'react';
import { X, Calendar, IndianRupee, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const BookingModal = ({ listing, onClose, onSubmit, isRebook = false }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
    return listing.pricing.amount * days;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('Please select both dates');
      return;
    }
    try {
      setLoading(true);
      await onSubmit({
        listingId: listing._id,
        startDate,
        endDate,
        totalAmount: calculateTotal(),
        notes,
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
            {isRebook ? '🔄 Rebook Worker' : '📅 Book Now'}
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

          {/* Dates */}
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

          {/* Notes */}
          <div>
            <label className="form-label"><FileText size={12} className="inline mr-1" />Notes (Optional)</label>
            <textarea className="form-textarea h-20" placeholder="Describe your requirements..."
              value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {/* Total */}
          {startDate && endDate && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-amber-800">Estimated Total</span>
              <span className="text-xl font-black text-amber-700 flex items-center">
                <IndianRupee size={18} />{calculateTotal().toLocaleString('en-IN')}
              </span>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? 'Submitting...' : (isRebook ? 'Confirm Rebooking' : 'Send Booking Request')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
