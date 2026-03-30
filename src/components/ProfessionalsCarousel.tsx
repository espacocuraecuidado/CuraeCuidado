import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Professional = {
  id: string;
  name: string;
  specialty: string | null;
  bio: string | null;
  imageurl?: string | null;
};

export default function ProfessionalsCarousel() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("professionals")
      .select("id, name, specialty, bio")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setProfessionals(data ?? []));
  }, []);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  if (professionals.length === 0) return null;

  return (
    <section className="py-10 px-4">
      <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
        Nossos Profissionais
      </h2>
      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-1"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 px-8 no-scrollbar"
        >
          {professionals.map((p) => (
            <div
              key={p.id}
              className="flex-shrink-0 w-56 rounded-xl border border-border bg-card p-4 shadow-sm text-center"
            >
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-primary">
                {p.name.charAt(0)}
              </div>
              <h3 className="font-semibold text-sm text-foreground">{p.name}</h3>
              <p className="text-xs text-primary font-medium mt-0.5">{p.specialty}</p>
              {p.bio && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{p.bio}</p>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-1"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
