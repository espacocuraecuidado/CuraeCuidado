import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProfessionalReviewModal from "./ProfessionalReviewModal";
import AppointmentModal from "./AppointmentModal";
import type { ProfessionalAd } from "@/data/mockData";

const ProfessionalCard = ({ ad }: { ad: ProfessionalAd }) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  return (
    <>
      <div className="flex w-64 flex-shrink-0 flex-col overflow-hidden rounded-lg border bg-card">
        <div className="aspect-[3/2] overflow-hidden bg-muted">
          <img src={ad.image} alt={ad.name} className="h-full w-full object-cover transition-transform hover:scale-105" />
        </div>
        <div className="p4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-card-foreground">
              {ad.name}
            </h3>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setShowReviewModal(true)}>
              Avaliar
            </Button>
          </div>
          <p className="text-xs font-semibold text-primary">{ad.specialty}</p>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {ad.bio || ad.description}
          </p>
          <Button className="w-full mt-2" size="sm" onClick={() => setShowAppointmentModal(true)}>
            Agendar Consulta
          </Button>
        </div>
      </div>

      {showReviewModal && (
        <ProfessionalReviewModal
          professionalId={ad.id}
          onClose={() => setShowReviewModal(false)}
        />
      )}

      {showAppointmentModal && (
        <AppointmentModal
          professional={{ id: ad.id, name: ad.name, specialty: ad.specialty || null }}
          onClose={() => setShowAppointmentModal(false)}
        />
      )}
    </>
  );
};

export default ProfessionalCard;
