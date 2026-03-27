import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminProfessionals from "@/components/admin/AdminProfessionals";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminCoupons from "@/components/admin/AdminCoupons";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Stethoscope,
  Settings,
  Ticket,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Admin = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-primary font-display text-xl">Carregando...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6">
        <h1 className="font-display text-2xl text-foreground">Acesso Restrito</h1>
        <p className="text-muted-foreground text-center">
          Você precisa estar logado como administrador para acessar esta página.
        </p>
        <Link to="/auth">
          <Button variant="default" className="mb-3">
            Fazer login
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar à loja
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-display text-lg font-bold text-primary">
              Painel Administrativo
            </h1>
          </div>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      </header>

      <div className="container py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            <TabsTrigger value="dashboard" className="gap-1.5 text-xs">
              <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5 text-xs">
              <Package className="h-3.5 w-3.5" /> Produtos
            </TabsTrigger>
            <TabsTrigger value="categories" className="gap-1.5 text-xs">
              <FolderTree className="h-3.5 w-3.5" /> Categorias
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-1.5 text-xs">
              <ShoppingBag className="h-3.5 w-3.5" /> Pedidos
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" /> Usuários
            </TabsTrigger>
            <TabsTrigger value="professionals" className="gap-1.5 text-xs">
              <Stethoscope className="h-3.5 w-3.5" /> Profissionais
            </TabsTrigger>
            <TabsTrigger value="coupons" className="gap-1.5 text-xs">
              <Ticket className="h-3.5 w-3.5" /> Cupons
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 text-xs">
              <Settings className="h-3.5 w-3.5" /> Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><AdminDashboard /></TabsContent>
          <TabsContent value="products"><AdminProducts /></TabsContent>
          <TabsContent value="categories"><AdminCategories /></TabsContent>
          <TabsContent value="orders"><AdminOrders /></TabsContent>
          <TabsContent value="users"><AdminUsers /></TabsContent>
          <TabsContent value="professionals"><AdminProfessionals /></TabsContent>
          <TabsContent value="coupons"><AdminCoupons /></TabsContent>
          <TabsContent value="settings"><AdminSettings /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
