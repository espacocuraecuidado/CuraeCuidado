import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { ArrowLeft, User, Phone, FileText, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) { navigate("/auth"); return; }
    if (user) fetchProfile();
  }, [user, loading]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone, cpf")
      .eq("user_id", user!.id)
      .single();
    if (data) {
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setCpf(data.cpf || "");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("user_id", user!.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Perfil atualizado!");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold font-display text-foreground">Meu Perfil</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-primary" /> Dados pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Nome completo</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> CPF
              </Label>
              <Input value={cpf} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">CPF não pode ser alterado.</p>
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> Telefone
              </Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-2">
            <p className="text-xs text-muted-foreground">Logado como</p>
            <p className="text-sm font-semibold text-foreground">{user?.email}</p>
            <Button variant="outline" className="w-full text-destructive" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Sair da conta
            </Button>
          </CardContent>
        </Card>

        <Link to="/meus-pedidos">
          <Button variant="outline" className="w-full">Ver meus pedidos</Button>
        </Link>
      </div>
    </div>
  );
};

export default Profile;