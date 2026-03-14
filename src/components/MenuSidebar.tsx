import { X, CalendarDays, Package, User, LogIn, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: CalendarDays, label: "Calendário", href: "#" },
  { icon: Package, label: "Meus Pedidos", href: "#" },
  { icon: User, label: "Meu Perfil", href: "#" },
  { icon: LogIn, label: "Entrar", href: "#" },
  { icon: LogOut, label: "Sair", href: "#" },
];

const MenuSidebar = ({ isOpen, onClose }: MenuSidebarProps) => {
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
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-body font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <item.icon className="h-5 w-5 text-primary" />
                  {item.label}
                </a>
              ))}
            </nav>
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
