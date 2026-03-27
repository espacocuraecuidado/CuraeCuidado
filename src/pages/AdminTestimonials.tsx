import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Testimonial = {
  id: string;
  user_id: string;
  professional_id: string | null;
  rating: number;
  comment: string;
  about_site: boolean;
  created_at: string;
  approved: boolean;
  fullname?: string;
};

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApproved, setShowApproved] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from("testimonials")
      .select("*, profiles(fullname)")
      .order("created_at", { ascending: false });
    setTestimonials(data || []);
    setLoading(false);
  };

  const toggleApproved = async (id: string, approved: boolean) => {
    const { error } = await supabase
      .from("testimonials")
      .update({ approved: !approved })
      .eq("id", id);
    if (error) {
      toast.error("Erro: " + error.message);
    } else {
      toast.success("Status alterado!");
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este depoimento?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Depoimento excluído!");
      load();
    }
  };

  const filtered = showApproved 
    ? testimonials 
    : testimonials.filter(t => !t.approved);

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">
          Depoimentos ({filtered.length})
        </h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowApproved(!showApproved)}
        >
          {showApproved ? (
            <>
              <EyeOff className="mr-1.5 h-3.5 w-3.5" />
              Ocultar aprovados
            </>
          ) : (
            <>
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Mostrar aprovados
            </>
          )}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum depoimento {showApproved ? "" : "pendente"} encontrado.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <Card key={t.id} className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{t.fullname}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant={t.about_site ? "secondary" : "default"}>
                    {t.about_site ? "Sobre site" : "Sobre profissional"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm mb-1">⭐ {t.rating}/5</p>
                    <p className="text-sm text-foreground">{t.comment}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={t.approved || false}
                      onCheckedChange={() => toggleApproved(t.id, t.approved || false)}
                    />
                    <Label className="text-xs">
                      {t.approved ? "Aprovado" : "Pendente"}
                    </Label>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => remove(t.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;
