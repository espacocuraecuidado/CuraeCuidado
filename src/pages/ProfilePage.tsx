import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Package, Calendar, Briefcase, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-700",
  confirmed: "bg-blue-500/20 text-blue-700",
  completed: "bg-green-500/20 text-green-700",
  cancelled: "bg-red-500/20 text-red-700",
  processing: "bg-purple-500/20 text-purple-700",
  shipped: "bg-indigo-500/20 text-indigo-700",
  delivered: "bg-green-500/20 text-green-700",
};

const statusLabels: Record<string, string> = {
  pending: "Pendente", confirmed: "Confirmado", completed: "Concluído",
  cancelled: "Cancelado", processing: "Processando", shipped: "Enviado", delivered: "Entregue",
};

export default function ProfilePage() {
  const { user, loading: authLoading, role, isAdmin, isSeller, isProfessional } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ full_name: "", phone: "", bio: "" });
  const [orders, setOrders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [myProfessional, setMyProfessional] = useState<any>(null);
  const [profForm, setProfForm] = useState({ name: "", specialty: "", bio: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/auth"); return; }
    loadAll();
  }, [user, authLoading]);

  const loadAll = async () => {
    // Profile
    const { data: p } = await supabase.from("profiles").select("full_name, phone, bio").eq("user_id", user!.id).single();
    if (p) setProfile({ full_name: p.full_name || "", phone: p.phone || "", bio: p.bio || "" });

    // Orders
    const { data: o } = await supabase.from("orders").select("id, total, status, created_at").eq("user_id", user!.id).order("created_at", { ascending: false });
    setOrders(o || []);

    // Appointments
    const { data: a } = await supabase.from("appointments").select("*, professionals(name)").eq("client_id", user!.id).order("date", { ascending: false });
    setAppointments(a || []);

    // Professional profile (if applicable)
    if (isProfessional) {
      const { data: prof } = await supabase.from("professionals").select("*").eq("email", user!.email).single();
      if (prof) { setMyProfessional(prof); setProfForm({ name: prof.name || "", specialty: prof.specialty || "", bio: prof.bio || "" }); }
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({ user_id: user!.id, ...profile });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Perfil atualizado!");
  };

  const saveProfessional = async () => {
    setSaving(true);
    const { error } = myProfessional
      ? await supabase.from("professionals").update(profForm).eq("id", myProfessional.id)
      : await supabase.from("professionals").insert({ ...profForm, email: user!.email, is_active: true });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Perfil profissional atualizado!");
    loadAll();
  };

  if (authLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p>Carregando...</p></div>;

  const roleLabel: Record<string, string> = { admin: "Administrador", manager: "Gerente", seller: "Vendedor", professional: "Profissional", client: "Cliente" };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <h1 className="text-lg font-bold font-serif">Meu Perfil</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Badge className="ml-auto text-xs" variant="secondary">{roleLabel[role] || role}</Badge>
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => navigate("/admin")} className="gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <Tabs defaultValue="dados">
          <TabsList className={"grid w-full " + (isAdmin || (isSeller && isProfessional) ? "grid-cols-4" : isProfessional || isSeller ? "grid-cols-3" : "grid-cols-2")}>
            <TabsTrigger value="dados" className="gap-1"><User className="h-3.5 w-3.5" /><span className="hidden sm:inline">Dados</span></TabsTrigger>
            <TabsTrigger value="pedidos" className="gap-1"><Package className="h-3.5 w-3.5" /><span className="hidden sm:inline">Pedidos</span></TabsTrigger>
            <TabsTrigger value="agendamentos" className="gap-1"><Calendar className="h-3.5 w-3.5" /><span className="hidden sm:inline">Agenda</span></TabsTrigger>
            {isProfessional && <TabsTrigger value="profissional" className="gap-1"><Briefcase className="h-3.5 w-3.5" /><span className="hidden sm:inline">Profissional</span></TabsTrigger>}
          </TabsList>
          <TabsContent value="dados" className="space-y-4 mt-4">
            <Card><CardContent className="p-4 space-y-3">
              <div><Label>Nome completo</Label><Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} placeholder="Seu nome" /></div>
              <div><Label>WhmtsApp</Label><Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="(85) 99999-9999" /></div>
              <div><Label>Sobre mim</Label><Textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} placeholder="Conte um pouco sobre você" /></div>
              <Button className="w-full" onClick={saveProfile} disabled={saving}>{saving ? "Salvando..." : "Salvar dados"}</Button>
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="pedidos" className="space-y-3 mt-4">
            {orders.length === 0 ? (<div className="text-center py-12 space-y-3"><Package className="w-12 h-12 mx-auto text-muted-foreground/40" /><p className="text-muted-foreground">Nenhum pedido ainda</p></div>) : orders.map((o) => (<Card key={o.id}><CardContent className="p-3 flex items-center justify-between"><div><p className="font-medium text-sm">Pedido #{o.id.slice(0,8)}</p><p className="text-xs text-muted-foreground">{format(new Date(o.created_at), "dd/MM/yyyy", { locale: ptBR })}</p><p className="text-sm font-semibold text-primary">R$ {Number(o.total).toFixed(2)}</p></div><Badge className={statusColors[o.status]}>{statusLabels[o.status] || o.status}</Badge></CardContent></Card>))}
          </TabsContent>
          <TabsContent value="agendamentos" className="space-y-3 mt-4">
            {appointments.length === 0 ? (<div className="text-center py-12 space-y-3"><Calendar className="w-12 h-12 mx-auto text-muted-foreground/40" /><p className="text-muted-foreground">Nenhum agendamento ainda</p><Button variant="outline" onClick={() => navigate("/professionals")}>Ver Profissionais</Button></div>) : appointments.map((a) => (<Card key={a.id}><CardContent className="p-3 flex items-center justify-between"><div><p className="font-medium text-sm">{a.professionals?.name}</p><p className="text-xs text-muted-foreground">{a.specialty}</p><p className="text-xs text-muted-foreground">{format(new Date(a.date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })} às {a.time?.slice(0,5)}</p></div><Badge className={statusColors[a.status]}>{statusLabels[a.status]}</Badge></CardContent></Card>))}
          </TabsContent>
          {isProfessional && (
            <TabsContent value="profissional" className="space-y-4 mt-4">
              <Card><CardContent className="p-4 space-y-3">
                <p className="text-sm text-muted-foreground">Gerencie como você aparece para os clientes na página de profissionais.</p>
                <div><Label>Nome de exibição</Label><Input value={profForm.name} onChange={(e) => setProfForm({ ...profForm, name: e.target.value })} placeholder="Seu nome profissional" /></div>
                <div><Label>Especialidade</Label><Input value={profForm.specialty} onChange={(e) => setProfForm({ ...profForm, specialty: e.target.value })} placeholder="Ex: Psicóloga, Terapeuta Holística..." /></div>
                <div><Label>Bio profissional</Label><Textarea value={profForm.bio} onChange={(e) => setProfForm({ ...profForm, bio: e.target.value })} rows={4} placeholder="Descreva sua atuação, abordagem e experiência" /></div>
                <Button className="w-full" onClick={saveProfessional} disabled={saving}>{saving ? "Salvando..." : "Salvar perfil profissional"}</Button>
              </CardContent></Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
