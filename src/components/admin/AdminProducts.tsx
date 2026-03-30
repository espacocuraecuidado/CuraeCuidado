import { useAdminGuard } from "@/hooks/useAdminGuard";import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  category_id: string | null;
  is_featured: boolean | null;
  is_active: boolean | null;
  rating: number | null;
  review_count: number | null;
};

type Category = { id: string; name: string };

const emptyProduct = {
  name: "", description: "", price: 0, stock: 0, image_url: "",
  category_id: "", is_featured: false, is_active: true,
};

const AdminProducts = () => {
  const allowed = useAdminGuard();  if (!allowed) return null;
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [p, c] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name"),
    ]);
    setProducts(p.data || []);
    setCategories(c.data || []);
  };

  const openNew = () => {
    setEditing(null);
    setForm(emptyProduct);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      stock: p.stock,
      image_url: p.image_url || "",
      category_id: p.category_id || "",
      is_featured: p.is_featured || false,
      is_active: p.is_active ?? true,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    const payload = {
      name: form.name,
      description: form.description || null,
      price: Number(form.price),
      stock: Number(form.stock),
      image_url: form.image_url || null,
      category_id: form.category_id || null,
      is_featured: form.is_featured,
      is_active: form.is_active,
    };

    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) { toast.error("Erro ao atualizar: " + error.message); return; }
      toast.success("Produto atualizado!");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error("Erro ao criar: " + error.message); return; }
      toast.success("Produto criado!");
    }
    setDialogOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Produto excluído!");
    load();
  };

  const catName = (id: string | null) => categories.find((c) => c.id === id)?.name || "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">Produtos ({products.length})</h2>
        <Button onClick={openNew} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <Card key={p.id} className="border-border/50 overflow-hidden">
            {p.image_url && (
              <img src={p.image_url} alt={p.name} className="h-32 w-full object-cover" />
            )}
            <CardContent className="p-3 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{catName(p.category_id)}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(p.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="secondary">R$ {Number(p.price).toFixed(2)}</Badge>
                <Badge variant={p.stock <= 5 ? "destructive" : "outline"} className="gap-1">
                  {p.stock <= 5 && <AlertTriangle className="h-3 w-3" />}
                  Estoque: {p.stock}
                </Badge>
                {p.is_featured && <Badge className="bg-primary/20 text-primary">Destaque</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Preço (R$)</Label>
                <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: +e.target.value })} />
              </div>
              <div>
                <Label>Estoque</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} />
              </div>
            </div>
            <div>
              <Label>URL da Imagem</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                <Label>Destaque</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                <Label>Ativo</Label>
              </div>
            </div>
            <Button onClick={save} className="w-full">
              {editing ? "Salvar Alterações" : "Criar Produto"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
