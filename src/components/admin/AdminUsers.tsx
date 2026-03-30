import { useAdminGuard } from "@/hooks/useAdminGuard";import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pencil, UserX, Eye } from "lucide-react";
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
  role: "admin" | "manager" | "seller" | "client";
};

const AdminUsers = () => {
  const allowed = useAdminGuard();  if (!allowed) return null;
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [newRole, setNewRole] = useState<string>("client");
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

  const getUserRole = (userId: string) => roles.find((r) => r.user_id === userId)?.role || "client";

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

  const roleColors: Record<string, string> = {
    admin: "bg-primary/20 text-primary",
    manager: "bg-lavender/20 text-lavender",
    seller: "bg-coral/20 text-coral",
    client: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-foreground">Usuários ({filtered.length})</h2>
        <Button variant="outline" size="sm" onClick={() => setShowDeleted(!showDeleted)}>
          <Eye className="mr-1.5 h-3.5 w-3.5" />
          {showDeleted ? "Ocultar excluídos" : "Mostrar excluídos"}
        </Button>
      </div>

      <div className="space-y-2">
        {filtered.map((p) => (
          <Card key={p.id} className={`border-border/50 ${p.is_deleted ? "opacity-50" : ""}`}>
            <CardContent className="flex items-center justify-between p-3">
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {p.full_name} {p.is_deleted && <span className="text-destructive">(excluído)</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  CPF: {p.cpf || "—"} · Tel: {p.phone || "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={roleColors[getUserRole(p.user_id)] || ""}>
                  {getUserRole(p.user_id)}
                </Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingUser(p); setNewRole(getUserRole(p.user_id)); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                {!p.is_deleted && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => softDelete(p)}>
                    <UserX className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Papel - {editingUser?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Papel</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["admin", "manager", "seller", "client"].map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={updateRole} className="w-full">Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
