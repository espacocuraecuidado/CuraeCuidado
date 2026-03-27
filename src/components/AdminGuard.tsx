import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      // Pega a sessão diretamente do Supabase
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      console.log("AdminGuard → role:", data, "erro:", error);

      if (!error && (data?.role === "admin" || data?.role === "manager")) {
        setAllowed(true);
      } else {
        navigate("/");
      }
      setChecking(false);
    };

    check();
  }, []);

  if (checking) return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-primary animate-pulse font-display text-xl">
        Verificando acesso...
      </p>
    </div>
  );

  return allowed ? <>{children}</> : null;
};

export default AdminGuard;