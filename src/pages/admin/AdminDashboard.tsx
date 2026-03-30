import { useAdminGuard } from "@/hooks/useAdminGuard";// Dados reais OU teste (últimos 6 meses)
const now = new Date();
const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

const { data: orders } = await supabase
  .from('orders')
  .select('created_at, total, payment_status')
  .gte('created_at', sixMonthsAgo.toISOString())
  .eq('payment_status', 'confirmed');

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
const monthlyData = monthNames.map((monthName, i) => {
  // Filtra pedidos do mês
  const monthOrders = orders?.filter((order: any) => {
    const orderMonth = new Date(order.created_at).toLocaleDateString('pt-BR', { month: 'short' });
    return orderMonth === monthName;
  }) || [];
  
  const totalVendas = monthOrders.reduce((sum: number, order: any) => sum + Number(order.total || 0), 0);
  
  return {
    name: monthName,
    vendas: totalVendas || 0,
    pedidos: monthOrders.length || 0,
  };
});

setRecentOrders(monthlyData);
