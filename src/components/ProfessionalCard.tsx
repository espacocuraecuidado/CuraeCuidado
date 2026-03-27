import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProfessionalReviewModal from "./ProfessionalReviewModal";
import type { ProfessionalAd } from "@/data/mockData";

const ProfessionalCard = ({ ad }: { ad: ProfessionalAd }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);

  return (
    <>
      <div className="flex w-64 flex-shrink-0 flex-col overflow-hidden rounded-lg border bg-card">
        <div className="aspect-[3/2] overflow-hidden bg-muted">
          <img 
            src={ad.image} 
            alt={ad.name} 
            className="h-full w-full object-cover transition-transform hover:scale-105" 
          />
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-card-foreground">
              {ad.name}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => setShowReviewModal(true)}
            >
              Avaliar
            </Button>
          </div>
          <p className="text-xs font-semibold text-primary">{ad.specialty}</p>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {ad.description}
          </p>
        </div>
      </div>

      {/* MODAL DE AVALIAÇÃO */}
      {showReviewModal && (
        <ProfessionalReviewModal
          professionalId={ad.id}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </>
  );
};

export default ProfessionalCard;
