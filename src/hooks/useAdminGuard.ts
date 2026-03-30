import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function useAdminGuard() {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return navigate("/login");
      const { data } = await supabase
        .from("userroles")
        .select("role")
        .eq("userid", user.id)
        .single();
      if (data?.role === "admin" || data?.role === "manager") {
        setAllowed(true);
      } else {
        navigate("/");
      }
    });
  }, []);

  return allowed;
}
