import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Admin from "./pages/Admin.tsx";
import Auth from "./pages/Auth.tsx";
import Scheduling from "./pages/Scheduling.tsx";
import MyOrders from "./pages/MyOrders.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminGuard from "@/components/AdminGuard";
import Profile from "./pages/Profile.tsx";
import ProfessionalsPage from "./pages/Professionals";
import AdminLayout from "./layouts/AdminLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/agendamento" element={<Scheduling />} />
          <Route path="/meus-pedidos" element={<MyOrders />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/professionals" element={<ProfessionalsPage />} />
          <Route path="/admin/*" element={<AdminLayout />} />

          {/* ✅ Apenas UMA rota /admin, com proteção */}
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <Admin />
              </AdminGuard>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
