import { useAdminGuard } from "@/hooks/useAdminGuard";import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MessageSquare, QrCode, Bitcoin, Settings, Percent } from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
  const allowed = useAdminGuard();  if (!allowed) return null;
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("app_settings").select("*");
    const map: Record<string, string> = {};
    (data || []).forEach((s) => { map[s.key] = s.value; });
    setSettings(map);
    setLoading(false);
  };

  const saveSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from("app_settings")
      .update({ value })
      .eq("key", key);
    if (error) { toast.error(error.message); return; }
    toast.success(`${key} atualizado!`);
  };

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  const fields = [
    { key: "app_title", label: "Título do App", icon: Settings, placeholder: "Cura & Cuidado" },
    { key: "whatsapp_number", label: "WhatsApp (com DDI)", icon: MessageSquare, placeholder: "5511999999999" },
    { key: "pix_key", label: "Chave PIX", icon: QrCode, placeholder: "CPF, email ou chave aleatória" },
    { key: "crypto_address", label: "Endereço Crypto", icon: Bitcoin, placeholder: "Endereço da carteira" },
    { key: "coupon_min_products", label: "Mín. produtos p/ cupom", icon: Percent, placeholder: "3" },
    { key: "coupon_discount_percent", label: "Desconto padrão (%)", icon: Percent, placeholder: "10" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold text-foreground">Configurações Gerais</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <Card key={f.key} className="border-border/50">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <f.icon className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">{f.label}</Label>
              </div>
              <div className="flex gap-2">
                <Input
                  value={settings[f.key] || ""}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
                <Button size="sm" onClick={() => saveSetting(f.key, settings[f.key] || "")}>
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
