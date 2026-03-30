import { useAdminGuard } from "@/hooks/useAdminGuard";import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Coupon = {
  id: string;
  code: string;
  discount_percent: number;
  min_products: number | null;
  is_active: boolean | null;
};

const AdminCoupons = () => {
  const allowed = useAdminGuard();  if (!allowed) return null;
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ code: "", discount_percent: 10, min_products: 1, is_active: true });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
  };

  const save = async () => {
    const { error } = await supabase.from("coupons").insert({
      code: form.code.toUpperCase(),
      discount_percent: form.discount_percent,
      min_products: form.min_products,
      is_active: form.is_active,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Cupom criado!");
    setDialogOpen(false);
    setForm({ code: "", discount_percent: 10, min_products: 1, is_active: true });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este cupom?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    toast.success("Cupom excluído!");
    load();
  };

  const toggle = async (c: Coupon) => {
    await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">Cupons ({coupons.length})</h2>
        <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Novo Cupom
        </Button>
      </div>

      <div className="space-y-2">
        {coupons.map((c) => (
          <Card key={c.id} className="border-border/50">
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <p className="font-mono font-bold text-sm text-foreground">{c.code}</p>
                <p className="text-xs text-muted-foreground">
                  {c.discount_percent}% de desconto · Mín: {c.min_products} produtos
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={c.is_active ? "bg-green-500/20 text-green-700" : "bg-muted text-muted-foreground"}>
                  {c.is_active ? "Ativo" : "Inativo"}
                </Badge>
                <Switch checked={c.is_active ?? false} onCheckedChange={() => toggle(c)} />
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(c.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Cupom</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Código</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="EX: PROMO10" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Desconto (%)</Label><Input type="number" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: +e.target.value })} /></div>
              <div><Label>Mín. produtos</Label><Input type="number" value={form.min_products} onChange={(e) => setForm({ ...form, min_products: +e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Ativo</Label>
            </div>
            <Button onClick={save} className="w-full">Criar Cupom</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCoupons;
