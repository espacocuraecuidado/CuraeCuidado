import { useAdminGuard } from "@/hooks/useAdminGuard";import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

type Order = {
  id: string;
  user_id: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  tracking_code: string | null;
  tracking_status: string | null;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  coupon_code: string | null;
  created_at: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-700",
  paid: "bg-green-500/20 text-green-700",
  shipped: "bg-blue-500/20 text-blue-700",
  delivered: "bg-emerald-500/20 text-emerald-700",
  cancelled: "bg-red-500/20 text-red-700",
};

const AdminOrders = () => {
  const allowed = useAdminGuard();  if (!allowed) return null;
  const [orders, setOrders] = useState<Order[]>([]);
  const [editing, setEditing] = useState<Order | null>(null);
  const [form, setForm] = useState({ status: "", payment_status: "", tracking_code: "", tracking_status: "" });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
  };

  const openEdit = (o: Order) => {
    setEditing(o);
    setForm({
      status: o.status,
      payment_status: o.payment_status,
      tracking_code: o.tracking_code || "",
      tracking_status: o.tracking_status || "",
    });
  };

  const save = async () => {
    if (!editing) return;
    const { error } = await supabase.from("orders").update({
      status: form.status,
      payment_status: form.payment_status,
      tracking_code: form.tracking_code || null,
      tracking_status: form.tracking_status || null,
    }).eq("id", editing.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Pedido atualizado!");
    setEditing(null);
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold text-foreground">Pedidos ({orders.length})</h2>

      {orders.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum pedido encontrado.</p>
      )}

      <div className="space-y-2">
        {orders.map((o) => (
          <Card key={o.id} className="border-border/50">
            <CardContent className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">#{o.id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[o.status] || ""}>{o.status}</Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(o)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-3 text-xs">
                <span>Subtotal: R$ {Number(o.subtotal).toFixed(2)}</span>
                <span>Frete: R$ {Number(o.shipping_cost).toFixed(2)}</span>
                <span className="font-bold">Total: R$ {Number(o.total).toFixed(2)}</span>
              </div>
              {o.tracking_code && (
                <p className="text-xs text-muted-foreground">Rastreio: {o.tracking_code}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pedido #{editing?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Status do Pedido</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["pending", "paid", "shipped", "delivered", "cancelled"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status do Pagamento</Label>
              <Select value={form.payment_status} onValueChange={(v) => setForm({ ...form, payment_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["pending", "confirmed", "failed", "refunded"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Código de Rastreio</Label>
              <Input value={form.tracking_code} onChange={(e) => setForm({ ...form, tracking_code: e.target.value })} />
            </div>
            <div>
              <Label>Status do Rastreio</Label>
              <Input value={form.tracking_status} onChange={(e) => setForm({ ...form, tracking_status: e.target.value })} />
            </div>
            <Button onClick={save} className="w-full">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
