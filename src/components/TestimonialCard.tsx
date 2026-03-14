import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import StarRating from "./StarRating";
import type { Testimonial } from "@/data/mockData";

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="flex w-72 flex-shrink-0 flex-col gap-3 rounded-lg border border-border bg-card p-5 shadow-card sm:w-80">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 bg-lavender-light">
          <AvatarFallback className="bg-lavender text-primary-foreground font-body text-sm font-bold">
            {testimonial.avatar}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-body text-sm font-semibold text-card-foreground">{testimonial.name}</p>
          <p className="text-xs text-muted-foreground">{testimonial.service}</p>
        </div>
      </div>
      <StarRating rating={testimonial.rating} />
      <p className="text-sm text-muted-foreground italic leading-relaxed">"{testimonial.text}"</p>
    </div>
  );
};

export default TestimonialCard;
