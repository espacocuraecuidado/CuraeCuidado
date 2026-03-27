import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Package, Clock, CreditCard, Truck, CheckCircle2, XCircle, Search, ChevronDown, ChevronUp, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_id: string;
  products?: { name: string; image_url: string | null } | null;
}

interface Order {
  id: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  total: number;
  coupon_code: string | null;
  tracking_code: string | null;
  tracking_status: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pendente", color: "bg-amber-100 text-amber-800 border-amber-200", icon: <Clock className="w-3.5 h-3.5" /> },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-800 border-blue-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  processing: { label: "Processando", color: "bg-purple-100 text-purple-800 border-purple-200", icon: <Package className="w-3.5 h-3.5" /> },
  shipped: { label: "Enviado", color: "bg-cyan-100 text-cyan-800 border-cyan-200", icon: <Truck className="w-3.5 h-3.5" /> },
  delivered: { label: "Entregue", color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800 border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: "Aguardando", color: "bg-amber-50 text-amber-700 border-amber-200" },
  paid: { label: "Pago", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  failed: { label: "Falhou", color: "bg-red-50 text-red-700 border-red-200" },
  refunded: { label: "Reembolsado", color: "bg-slate-50 text-slate-700 border-slate-200" },
};

const trackingSteps = ["processing", "confirmed", "shipped", "delivered"];

export default function MyOrders() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchOrders();
  }, [user, authLoading]);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`*, order_items(*, products(name, image_url))`)
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar pedidos", description: error.message, variant: "destructive" });
    } else {
      setOrders((data as unknown as Order[]) || []);
    }
    setLoading(false);
  };

  const copyTrackingCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Código copiado!", description: code });
  };

  const getTrackingProgress = (status: string | null) => {
    const idx = trackingSteps.indexOf(status || "processing");
    return Math.max(0, idx);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.tracking_code?.toLowerCase().includes(search.toLowerCase()) ||
      o.order_items.some((i) => i.products?.name?.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filter === "all" || o.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-10 w-48" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground font-serif">Meus Pedidos</h1>
          <Badge variant="secondary" className="ml-auto">{orders.length}</Badge>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por produto ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { key: "all", label: "Todos" },
              { key: "pending", label: "Pendentes" },
              { key: "shipped", label: "Enviados" },
              { key: "delivered", label: "Entregues" },
              { key: "cancelled", label: "Cancelados" },
            ].map((f) => (
              <Button
                key={f.key}
                variant={filter === f.key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f.key)}
                className="shrink-0 text-xs"
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 space-y-3"
          >
            <Package className="w-16 h-16 mx-auto text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">Nenhum pedido encontrado</p>
            <Button variant="outline" onClick={() => navigate("/")}>
              Ir às compras
            </Button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order, idx) => {
              const isExpanded = expandedOrder === order.id;
              const status = statusConfig[order.status] || statusConfig.pending;
              const payStatus = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending;
              const progress = getTrackingProgress(order.tracking_status);

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card rounded-xl border border-border shadow-sm overflow-hidden"
                >
                  {/* Order Header */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(order.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                          {status.icon}
                          {status.label}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </div>

                    {/* Product thumbnails */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex -space-x-2">
                        {order.order_items.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="w-10 h-10 rounded-lg border-2 border-card bg-muted overflow-hidden"
                          >
                            {item.products?.image_url ? (
                              <img src={item.products.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-full h-full p-2 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                        {order.order_items.length > 3 && (
                          <div className="w-10 h-10 rounded-lg border-2 border-card bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                            +{order.order_items.length - 3}
                          </div>
                        )}
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-base font-bold text-foreground">
                          R$ {order.total.toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                          {/* Tracking Progress */}
                          {order.status !== "cancelled" && (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                <Truck className="w-4 h-4 text-primary" /> Rastreamento
                              </p>
                              <div className="flex items-center gap-1">
                                {trackingSteps.map((step, i) => (
                                  <div key={step} className="flex items-center flex-1">
                                    <div
                                      className={`w-3 h-3 rounded-full shrink-0 ${
                                        i <= progress ? "bg-primary" : "bg-muted"
                                      }`}
                                    />
                                    {i < trackingSteps.length - 1 && (
                                      <div
                                        className={`h-0.5 flex-1 ${
                                          i < progress ? "bg-primary" : "bg-muted"
                                        }`}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>Processando</span>
                                <span>Confirmado</span>
                                <span>Enviado</span>
                                <span>Entregue</span>
                              </div>
                              {order.tracking_code && (
                                <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 mt-1">
                                  <span className="text-xs text-muted-foreground">Código:</span>
                                  <span className="text-xs font-mono font-medium text-foreground">
                                    {order.tracking_code}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 ml-auto"
                                    onClick={() => copyTrackingCode(order.tracking_code!)}
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Payment Info */}
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-primary" /> Pagamento
                            </p>
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${payStatus.color}`}>
                                {payStatus.label}
                              </span>
                              {order.payment_method && (
                                <span className="text-xs text-muted-foreground capitalize">
                                  {order.payment_method}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Items */}
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-foreground">Itens</p>
                            {order.order_items.map((item) => (
                              <div key={item.id} className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                                  {item.products?.image_url ? (
                                    <img src={item.products.image_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <Package className="w-full h-full p-2 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">
                                    {item.products?.name || "Produto"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.quantity}x R$ {item.unit_price.toFixed(2).replace(".", ",")}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-foreground shrink-0">
                                  R$ {item.total_price.toFixed(2).replace(".", ",")}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Totals */}
                          <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Subtotal</span>
                              <span>R$ {order.subtotal.toFixed(2).replace(".", ",")}</span>
                            </div>
                            {order.discount > 0 && (
                              <div className="flex justify-between text-emerald-600">
                                <span>Desconto {order.coupon_code && `(${order.coupon_code})`}</span>
                                <span>-R$ {order.discount.toFixed(2).replace(".", ",")}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-muted-foreground">
                              <span>Frete</span>
                              <span>
                                {order.shipping_cost > 0
                                  ? `R$ ${order.shipping_cost.toFixed(2).replace(".", ",")}`
                                  : "Grátis"}
                              </span>
                            </div>
                            <div className="flex justify-between font-bold text-foreground border-t border-border pt-1.5">
                              <span>Total</span>
                              <span>R$ {order.total.toFixed(2).replace(".", ",")}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
