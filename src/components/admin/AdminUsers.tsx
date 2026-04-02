import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, UserX } from "lucide-react";
import { toast } from "sonner";

type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  cpf: string | null;
  phone: string | null;
  is_deleted: boolean;
  created_at: string;
};

type UserRole = {
  id: string;
  user_id: string;
  role: "admin" | "manager" | "seller" | "client" | "professional";
};

const ROLES = ["admin", "manager", "seller", "client", "professional"];

const roleColors: Record<string, string> = {
  admin: "bg-primary/20 text-primary",
  manager: "bg-lavender/20 text-lavender",
  seller: "bg-coral/20 text-coral",
  professional: "bg-blue-500/20 text-blue-700",
  client: "bg-muted text-muted-foreground",
};

const AdminUsers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [newRole, setNewRole] = useState("client");
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const [p, r] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);
    setProfiles(p.data || []);
    setRoles(r.data || []);
  };

  const getUserRole = (userId: string) =>
    roles.find((r) => r.user_id === userId)?.role || "client";

  const updateRole = async () => {
    if (!editingUser) return;
    const existing = roles.find((r) => r.user_id === editingUser.user_id);
    if (existing) {
      await supabase.from("user_roles").update({ role: newRole as any }).eq("id", existing.id);
    } else {
      await supabase.from("user_roles").insert({ user_id: editingUser.user_id, role: newRole as any });
    }
    toast.success("Papel atualizado!");
    setEditingUser(null);
    load();
  };

  const softDelete = async (p: Profile) => {
    if (!confirm(`Marcar "${p.full_name}" como excluído?`)) return;
    await supabase.from("profiles").update({ is_deleted: true }).eq("id", p.id);
    toast.success("Usuário marcado como excluído.");
    load();
  };

  const filtered = showDeleted ? profiles : profiles.filter((p) => !p.is_deleted);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Usuários ({filtered.length})</h2>
        <Button variant="outline" size="sm" onClick={() => setShowDeleted(!showDeleted)}>
          {showDeleted ? "Ocultar excluídos" : "Mostrar excluídos"}
        </Button>
      </div>

      {filtered.map((p) => (
        <Card key={p.id}>
          <CardContent className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">
                {p.full_name}{" "}
                {p.is_deleted && <span className="text-xs text-red-500">(excluído)</span>}
              </p>
              <p className="text-sm text-muted-foreground">
                CPF: {p.cpf || "—"} · Tel: {p.phone || "—"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={roleColors[getUserRole(p.user_id)] || ""}>
                {getUserRole(p.user_id)}
              </Badge>
              <Button size="icon" variant="ghost" onClick={() => { setEditingUser(p); setNewRole(getUserRole(p.user_id)); }}>
                <Pencil className="w-4 h-4" />
              </Button>
              {!p.is_deleted && (
                <Button size="icon" variant="ghost" onClick={() => softDelete(p)}>
                  <UserX className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Papel - {editingUser?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Papel</Label>
<select 
  value={newRole} 
  onChange={(e) => setNewRole(e.target.value)} 
  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
>
  {ROLES.map((r) => (
    <option key={r} value={r}>{r}</option>
  ))}
</select>
            <Button onClick={updateRole} className="w-full">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;