import type { ProfessionalAd } from "@/data/mockData";

const ProfessionalCard = ({ ad }: { ad: ProfessionalAd }) => {
  return (
    <div className="flex w-64 flex-shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card sm:w-72">
      <div className="aspect-[3/2] overflow-hidden bg-muted">
        <img src={ad.image} alt={ad.name} className="h-full w-full object-cover" />
      </div>
      <div className="p-4 space-y-1">
        <h3 className="font-display text-base font-bold text-card-foreground">{ad.name}</h3>
        <p className="text-xs font-semibold text-primary">{ad.specialty}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{ad.description}</p>
      </div>
    </div>
  );
};

export default ProfessionalCard;
