import { Menu, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";

interface HeaderProps {
  cartCount: number;
  onMenuToggle: () => void;
  onCartToggle: () => void;
}

const Header = ({ cartCount, onMenuToggle, onCartToggle }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onMenuToggle} className="text-foreground hover:bg-muted">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-9 w-9" />
          <h1 className="font-display text-xl font-bold text-gradient-hero sm:text-2xl">
            Cura & Cuidado
          </h1>
        </div>

        <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-muted" onClick={onCartToggle}>
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary p-0 text-[10px] text-primary-foreground">
              {cartCount}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
};

export default Header;
