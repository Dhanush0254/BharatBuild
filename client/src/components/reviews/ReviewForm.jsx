import { useState } from 'react';
import StarRating from '../ui/StarRating';
import { createReview } from '../../api/reviewsApi';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

const ReviewForm = ({ bookingId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    if (comment.length < 5) { toast.error('Comment must be at least 5 characters'); return; }
    try {
      setLoading(true);
      await createReview({ bookingId, rating, comment });
      toast.success('Review submitted!');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="form-label">Your Rating</label>
        <StarRating rating={rating} interactive size={28} showCount={false} onRate={setRating} />
      </div>
      <div>
        <label className="form-label">Your Review</label>
        <textarea className="form-textarea h-24" placeholder="Share your experience..."
          value={comment} onChange={(e) => setComment(e.target.value)} required minLength={5} />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        <Send size={16} />{loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
