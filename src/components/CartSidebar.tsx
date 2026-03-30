import { X, Minus, Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/data/mockData";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onClearCart: () => void;  // ← novo prop
}

const CartSidebar = ({
  isOpen, onClose, items,
  onUpdateQuantity, onRemove, onClearCart
}: CartSidebarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");
  const [couponData, setCouponData] = useState<{
    code: string; discount_percent: number
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const grouped = items.reduce<CartItem[]>((acc, item) => {
    const existing = acc.find((i) => i.product.id === item.product.id);
    if (existing) { existing.quantity += item.quantity; }
    else { acc.push({ ...item }); }
    return acc;
  }, []);

  const subtotal = grouped.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  );
  const discountValue = couponData
    ? subtotal * (couponData.discount_percent / 100)
    : 0;
  const total = subtotal - discountValue;

  // ✅ Validação real de cupom
  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("code, discount_percent, min_products, is_active")
      .eq("code", coupon.toUpperCase())
      .eq("is_active", true)
      .single();
    setCouponLoading(false);

    if (error || !data) {
      toast.error("Cupom inválido ou expirado.");
      return;
    }
    if (data.min_products && grouped.length < data.min_products) {
      toast.error(`Este cupom exige mínimo de ${data.min_products} produtos.`);
      return;
    }
    setCouponData(data);
    toast.success(`Cupom aplicado! ${data.discount_percent}% de desconto 🎉`);
  };

  // ✅ Checkout real no Supabase
  const handleCheckout = async () => {
    if (!user) {
      toast.error("Faça login para finalizar a compra.");
      onClose();
      navigate("/auth");
      return;
    }
    if (grouped.length === 0) return;

    setCheckoutLoading(true);
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        payment_status: "pending",
        subtotal,
        discount: discountValue,
        shipping_cost: 0,
        total,
        coupon_code: couponData?.code || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      toast.error("Erro ao criar pedido. Tente novamente.");
      setCheckoutLoading(false);
      return;
    }

    const orderItems = grouped.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.product.price,
      total_price: item.product.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      toast.error("Erro ao salvar itens do pedido.");
      setCheckoutLoading(false);
      return;
    }

    // Decrementar estoque atomicamente via RPC
    const stockErrors: string[] = [];
    for (const item of grouped) {
      const { error: stockError } = await supabase.rpc("decrement_stock", {
        product_id: item.product.id,
        qty: item.quantity,
      });
      if (stockError) stockErrors.push(item.product.name);
    }

    if (stockErrors.length > 0) {
      toast.error(`Estoque insuficiente: ${stockErrors.join(", ")}`);
      await supabase.from("orders").delete().eq("id", order.id);
      setCheckoutLoading(false);
      return;
    }

    setCheckoutLoading(false);
    toast.success("Pedido criado com sucesso! 🎉");
    onClearCart();
    onClose();
    navigate("/meus-pedidos");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-foreground/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[70] flex h-full w-80 flex-col bg-card shadow-hover-lift sm:w-96"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="font-display text-lg font-bold text-gradient-hero">🛒 Carrinho</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {grouped.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Seu carrinho está vazio
                </p>
              ) : (
                grouped.map((item) => (
                  <div key={item.product.id} className="flex gap-3 rounded-lg border border-border p-3">
                    <img
                      src={item.product.image} alt={item.product.name}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="text-sm font-semibold text-card-foreground line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-primary font-bold">
                          R$ {item.product.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-6 w-6"
                          onClick={() => onUpdateQuantity(item.product.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-bold text-foreground w-6 text-center">
                          {item.quantity}
                        </span>
                        <Button variant="outline" size="icon" className="h-6 w-6"
                          onClick={() => onUpdateQuantity(item.product.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm"
                          className="ml-auto text-xs text-destructive h-6 px-2"
                          onClick={() => onRemove(item.product.id)}>
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {grouped.length > 0 && (
              <div className="border-t border-border p-4 space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Cupom de desconto"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="text-sm uppercase"
                    disabled={!!couponData}
                  />
                  <Button variant="outline" size="sm" className="shrink-0"
                    onClick={handleApplyCoupon}
                    disabled={!!couponData || couponLoading}>
                    <Ticket className="h-4 w-4 mr-1" />
                    {couponLoading ? "..." : "Aplicar"}
                  </Button>
                </div>
                {couponData && (
                  <p className="text-xs text-mint font-semibold">
                    ✓ {couponData.code} — {couponData.discount_percent}% de desconto
                  </p>
                )}

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {couponData && (
                    <div className="flex justify-between text-mint">
                      <span>Desconto</span>
                      <span>- R$ {discountValue.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-display text-lg font-bold text-foreground pt-1 border-t border-border">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-hero text-primary-foreground font-bold"
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                >
                  {checkoutLoading ? "Processando..." : "Confirmar Compra"}
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;