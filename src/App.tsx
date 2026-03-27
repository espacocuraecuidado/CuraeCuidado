import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Scheduling from "./pages/Scheduling.tsx";
import MyOrders from "./pages/MyOrders.tsx";
import NotFound from "./pages/NotFound.tsx";
import Profile from "./pages/Profile.tsx";
import ProfessionalsPage from "./pages/Professionals";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminProfessionals from "@/components/admin/AdminProfessionals";
import AdminCoupons from "@/components/admin/AdminCoupons";
import AdminSettings from "@/components/admin/AdminSettings";

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
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="professionals" element={<AdminProfessionals />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
