import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, count = 0, size = 16, showCount = true, interactive = false, onRate }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-125 transition-transform' : 'cursor-default'}`}
          >
            <Star
              size={size}
              className={
                star <= Math.round(rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-200 text-slate-200'
              }
            />
          </button>
        ))}
      </div>
      {showCount && (
        <span className="text-sm text-text-muted font-medium ml-1">
          {rating > 0 ? rating.toFixed(1) : '0'}{count > 0 && ` (${count})`}
        </span>
      )}
    </div>
  );
};

export default StarRating;
