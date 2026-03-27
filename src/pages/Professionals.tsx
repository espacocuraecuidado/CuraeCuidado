import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProfessionalCard from "@/components/ProfessionalCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Professional = {
  id: string;
  name: string;
  specialty: string | null;
  whatsapp: string | null;
  bio: string | null;
  image?: string;
  is_active: boolean;
};

const ProfessionalsPage = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfessionals();
  }, []);

  const loadProfessionals = async () => {
    const { data, error } = await supabase
      .from("professionals")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Erro ao carregar profissionais:", error);
    } else {
      // Adicionar imagem padrão se não tiver
      const prosWithImage = (data || []).map(pro => ({
        ...pro,
        image: pro.image || "/placeholder-professional.jpg",
      }));
      setProfessionals(prosWithImage);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-64">
          <p>Carregando profissionais...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-12 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Nossos Profissionais
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Especialistas qualificados para cuidar de você
          </p>
        </div>

        {professionals.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg">
              Ainda não temos profissionais cadastrados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {professionals.map((pro) => (
              <ProfessionalCard key={pro.id} ad={pro as any} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProfessionalsPage;
