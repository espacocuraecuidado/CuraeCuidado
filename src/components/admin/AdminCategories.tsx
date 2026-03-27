import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
};

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", display_order: 0, is_active: true });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("categories").select("*").order("display_order");
    setCategories(data || []);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", slug: "", display_order: categories.length + 1, is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, display_order: c.display_order, is_active: c.is_active });
    setDialogOpen(true);
  };

  const save = async () => {
    const payload = { name: form.name, slug: form.slug, display_order: form.display_order, is_active: form.is_active };
    if (editing) {
      const { error } = await supabase.from("categories").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Categoria atualizada!");
    } else {
      const { error } = await supabase.from("categories").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Categoria criada!");
    }
    setDialogOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta categoria?")) return;
    await supabase.from("categories").delete().eq("id", id);
    toast.success("Categoria excluída!");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">Categorias</h2>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      <div className="space-y-2">
        {categories.map((c) => (
          <Card key={c.id} className="border-border/50">
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <p className="font-semibold text-sm text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">slug: {c.slug} · ordem: {c.display_order}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
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
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="ex: baby-products" />
            </div>
            <div>
              <Label>Ordem de exibição</Label>
              <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: +e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Ativa</Label>
            </div>
            <Button onClick={save} className="w-full">
              {editing ? "Salvar" : "Criar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCategories;
