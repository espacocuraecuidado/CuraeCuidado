import { Mail, HelpCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-8">
      <div className="container space-y-4 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4 text-primary" />
          <a href="mailto:espacocuraecuidado@gmail.com" className="hover:text-primary transition-colors">
            espacocuraecuidado@gmail.com
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2026 Cura & Cuidado. Todos os direitos reservados.
        </p>
        <a href="#" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
          <HelpCircle className="h-3 w-3" />
          Precisa de ajuda? Clique aqui.
        </a>
      </div>
    </footer>
  );
};

export default Footer;
