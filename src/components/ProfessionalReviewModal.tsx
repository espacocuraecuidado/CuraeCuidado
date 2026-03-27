"use client";

import { useState } from "react";
import { X, Star, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import StarRating from "./StarRating";

interface ProfessionalReviewModalProps {
  professionalId?: string;
  onClose: () => void;
}

const ProfessionalReviewModal = ({ professionalId, onClose }: ProfessionalReviewModalProps) => {
  const [aboutSite, setAboutSite] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const submitReview = async () => {
    if (!rating || !user) {
      toast.error("Escolha uma nota primeiro!");
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.from("testimonials").insert({
      professional_id: aboutSite ? null : professionalId,
      rating,
      comment: comment || null,
      about_site: aboutSite,
    });
    
    if (error) {
      toast.error("Erro ao enviar: " + error.message);
    } else {
      toast.success("✅ Depoimento enviado! Aguardando aprovação.");
      onClose();
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-background w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary/10 to-secondary/10">
          <h2 className="font-semibold text-lg">Deixe seu depoimento</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-muted rounded-xl transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={aboutSite ? "outline" : "default"}
              className="h-12 flex-1 gap-2"
              onClick={() => setAboutSite(false)}
            >
              <MessageCircle className="h-4 w-4" />
              Profissional
            </Button>
            <Button
              variant={!aboutSite ? "outline" : "default"}
              className="h-12 flex-1 gap-2"
              onClick={() => setAboutSite(true)}
            >
              <Star className="h-4 w-4" />
              Sobre site
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Sua nota</label>
            <StarRating rating={rating} onRatingChange={setRating} interactive />
          </div>

          <Textarea
            placeholder={
              aboutSite 
                ? "O que achou do site, entrega, atendimento?" 
                : "Conte como foi sua experiência com o profissional"
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />

          <Button 
            className="w-full h-12 text-lg" 
            onClick={submitReview}
            disabled={!rating || loading}
          >
            {loading ? "Enviando..." : "Enviar Depoimento"}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfessionalReviewModal;
