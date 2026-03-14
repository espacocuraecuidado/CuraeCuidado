import { Star } from "lucide-react";

const StarRating = ({ rating, size = 14 }: { rating: number; size?: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={star <= rating ? "fill-accent text-accent" : "text-muted"}
          size={size}
        />
      ))}
    </div>
  );
};

export default StarRating;
