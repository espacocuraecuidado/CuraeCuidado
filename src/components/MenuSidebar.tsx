import { X, CalendarDays, Package, User, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuSidebar = ({ isOpen, onClose }: MenuSidebarProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNav = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
    toast.success("Você saiu da sua conta.");
    navigate("/");
  };

  const menuItems = [
    { icon: CalendarDays, label: "Calendário", action: () => handleNav("/agendamento") },
    { icon: Package, label: "Meus Pedidos", action: () => handleNav("/meus-pedidos") },
    { icon: User, label: "Meu Perfil", action: () => handleNav("#") },
    ...(user
      ? [{ icon: LogOut, label: "Sair", action: handleLogout }]
      : [{ icon: LogIn, label: "Entrar", action: () => handleNav("/auth") }]),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-foreground/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed left-0 top-0 z-[70] flex h-full w-72 flex-col bg-card shadow-hover-lift"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="font-display text-lg font-bold text-gradient-hero">Menu</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <item.icon className="h-5 w-5 text-primary" />
                  {item.label}
                </button>
              ))}
            </nav>
            {user && (
              <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground truncate">
                {user.email}
              </div>
            )}
            <div className="border-t border-border p-4 text-center text-xs text-muted-foreground">
              Cura & Cuidado © 2026
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MenuSidebar;
