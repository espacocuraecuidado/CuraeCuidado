import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const COLORS = ["hsl(340,82%,52%)", "hsl(280,60%,65%)", "hsl(15,80%,60%)", "hsl(25,90%,75%)"];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
  });
  const [salesByCategory, setSalesByCategory] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [products, orders, users] = await Promise.all([
      supabase.from("products").select("id, stock, category_id, price"),
      supabase.from("orders").select("id, total, status, created_at, payment_status"),
      supabase.from("profiles").select("id"),
    ]);

    const totalRevenue = (orders.data || [])
      .filter((o) => o.payment_status === "confirmed")
      .reduce((s, o) => s + Number(o.total), 0);

    const lowStock = (products.data || []).filter((p) => p.stock <= 5).length;

    setStats({
      totalProducts: products.data?.length || 0,
      totalOrders: orders.data?.length || 0,
      totalUsers: users.data?.length || 0,
      totalRevenue,
      lowStockProducts: lowStock,
    });

    // Mock monthly sales for chart
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"];
    setRecentOrders(
      months.map((m, i) => ({
        name: m,
        vendas: Math.floor(Math.random() * 5000) + 1000,
        pedidos: Math.floor(Math.random() * 30) + 5,
      }))
    );

    // Category distribution
    const categories = await supabase.from("categories").select("id, name");
    const catMap = new Map((categories.data || []).map((c) => [c.id, c.name]));
    const catCount: Record<string, number> = {};
    (products.data || []).forEach((p) => {
      const name = catMap.get(p.category_id || "") || "Sem categoria";
      catCount[name] = (catCount[name] || 0) + 1;
    });
    setSalesByCategory(Object.entries(catCount).map(([name, value]) => ({ name, value })));
  };

  const statCards = [
    { label: "Produtos", value: stats.totalProducts, icon: Package, color: "text-primary" },
    { label: "Pedidos", value: stats.totalOrders, icon: ShoppingBag, color: "text-coral" },
    { label: "Usuários", value: stats.totalUsers, icon: Users, color: "text-lavender" },
    { label: "Receita (R$)", value: `R$ ${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-green-500" },
    { label: "Estoque Baixo", value: stats.lowStockProducts, icon: AlertTriangle, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="flex flex-col items-center p-4 text-center">
              <s.icon className={`h-6 w-6 ${s.color} mb-2`} />
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              Vendas Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={recentOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="vendas" fill="hsl(340,82%,52%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-lavender" />
              Produtos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={salesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {salesByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <ShoppingBag className="h-4 w-4 text-coral" />
              Pedidos Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={recentOrders}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="pedidos" stroke="hsl(280,60%,65%)" strokeWidth={2} dot={{ fill: "hsl(280,60%,65%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
