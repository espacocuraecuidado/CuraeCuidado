import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfessionalCard from "./ProfessionalCard";

type Professional = {
  id: string;
  name: string;
  specialty: string | null;
  whatsapp: string | null;
  bio: string | null;
  image?: string;
  is_active: boolean;
  description?: string;
};

const ProfessionalsCarousel = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from("professionals")
      .select("*")
      .eq("is_active", true)
      .order("name");
    const pros = (data || []).map((p: any) => ({
      ...p,
      image: p.image_url || "",
      description: p.bio || "",
    }));
    setProfessionals(pros);
    setLoading(false);
  };

  if (loading) return null;
  if (professionals.length === 0) return null;

  return (
    <section className="py-12 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              Nossos Profissionais
            </h2>
            <p className="text-muted-foreground">
              Especialistas qualificados para cuidar de você
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/professionals")}
            className="gap-2 hidden sm:flex"
          >
            <Users className="h-4 w-4" />
            Ver todos
          </Button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {professionals.map((pro) => (
            <div key={pro.id} className="snap-start flex-shrink-0">
              <ProfessionalCard ad={pro as any} />
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6 sm:hidden">
          <Button
            variant="outline"
            onClick={() => navigate("/professionals")}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Ver todos os profissionais
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalsCarousel;