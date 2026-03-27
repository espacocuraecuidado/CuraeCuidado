import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

type ProductReview = {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  approved: boolean;
  fullname?: string;
  product_name?: string;
};

const AdminProductReviews = () => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApproved, setShowApproved] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data } = await supabase
      .from("product_reviews")
      .select(`
        *,
        profiles(fullname),
        products(name)
      `)
      .order("created_at", { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  const toggleApproved = async (id: string, approved: boolean) => {
    const { error } = await supabase
      .from("product_reviews")
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
    if (!confirm("Excluir esta avaliação?")) return;
    const { error } = await supabase.from("product_reviews").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Avaliação excluída!");
      load();
    }
  };

  const filtered = showApproved 
    ? reviews 
    : reviews.filter(r => !r.approved);

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">
          Avaliações de Produto ({filtered.length})
        </h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowApproved(!showApproved)}
        >
          {showApproved ? (
            <>
              <EyeOff className="mr-1.5 h-3.5 w-3.5" />
              Ocultar aprovadas
            </>
          ) : (
            <>
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Mostrar aprovadas
            </>
          )}
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma avaliação {showApproved ? "" : "pendente"} encontrada.
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Card key={r.id} className="border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{r.fullname}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.product_name} • {new Date(r.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Pedido #{r.order_id.slice(-6)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star 
                          key={i}
                          className={`h-4 w-4 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
                        />
                      ))}
                      <span className="text-sm ml-1">{r.rating}/5</span>
                    </div>
                    {r.comment && (
                      <p className="text-sm text-foreground">{r.comment}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={r.approved || false}
                      onCheckedChange={() => toggleApproved(r.id, r.approved || false)}
                    />
                    <Label className="text-xs">
                      {r.approved ? "Aprovada" : "Pendente"}
                    </Label>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => remove(r.id)}
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

export default AdminProductReviews;
