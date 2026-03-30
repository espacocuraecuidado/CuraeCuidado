import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Professional = {
  id: string;
  name: string;
  specialty: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  zip_code: string | null;
  bio: string | null;
  agreement_signed: boolean | null;
  commission_rate: number | null;
  is_active: boolean | null;
};

const emptyForm = {
  name: "", specialty: "", whatsapp: "", email: "", address: "", zip_code: "",
  bio: "", agreement_signed: false, commission_rate: 5, is_active: true,
};

const AdminProfessionals = () => {
  const [pros, setPros] = useState<Professional[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Professional | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("professionals").select("*").order("name");
    setPros(data || []);
  };

  const openNew = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (p: Professional) => {
    setEditing(p);
    setForm({
      name: p.name,
      specialty: p.specialty || "",
      whatsapp: p.whatsapp || "",
      email: p.email || "",
      address: p.address || "",
      zip_code: p.zip_code || "",
      bio: p.bio || "",
      agreement_signed: p.agreement_signed || false,
      commission_rate: p.commission_rate ?? 5,
      is_active: p.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    const payload = {
      name: form.name,
      specialty: form.specialty || null,
      whatsapp: form.whatsapp || null,
      email: form.email || null,
      address: form.address || null,
      zip_code: form.zip_code || null,
      bio: form.bio || null,
      agreement_signed: form.agreement_signed,
      commission_rate: form.commission_rate,
      is_active: form.is_active,
    };

    if (editing) {
      const { error } = await supabase.from("professionals").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Profissional atualizado!");
    } else {
      const { error } = await supabase.from("professionals").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Profissional cadastrado!");
    }
    setDialogOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este profissional?")) return;
    await supabase.from("professionals").delete().eq("id", id);
    toast.success("Profissional excluído!");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">Profissionais ({pros.length})</h2>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Novo Profissional
        </Button>
      </div>

      <div className="space-y-2">
        {pros.map((p) => (
          <Card key={p.id} className="border-border/50">
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <p className="font-semibold text-sm text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.specialty || "—"} · {p.email || "—"}</p>
                <p className="text-xs text-muted-foreground">Comissão: {p.commission_rate}%</p>
              </div>
              <div className="flex items-center gap-2">
                {p.agreement_signed && <Badge className="bg-green-500/20 text-green-700 text-xs">Contrato ✓</Badge>}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(p.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Profissional" : "Novo Profissional"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Especialidade</Label><Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <div><Label>Endereço</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
            <div><Label>CEP</Label><Input value={form.zip_code} onChange={(e) => setForm({ ...form, zip_code: e.target.value })} /></div>
            <div><Label>Bio (máx 400 caracteres)</Label><Textarea maxLength={400} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
            <div><Label>Comissão (%)</Label><Input type="number" step="0.5" value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: +e.target.value })} /></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.agreement_signed} onCheckedChange={(v) => setForm({ ...form, agreement_signed: v })} />
                <Label>Contrato assinado</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Ativo</Label>
              </div>
            </div>
            <Button onClick={save} className="w-full">{editing ? "Salvar" : "Cadastrar"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProfessionals;
