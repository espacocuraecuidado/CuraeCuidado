import { X, Minus, Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/data/mockData";
import { useState } from "react";

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
}

const CartSidebar = ({ isOpen, onClose, items, onUpdateQuantity, onRemove }: CartSidebarProps) => {
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(false);
  const discount = appliedCoupon ? 0.1 : 0;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountValue = subtotal * discount;
  const total = subtotal - discountValue;

  const handleApplyCoupon = () => {
    if (coupon.trim().length > 0) setAppliedCoupon(true);
  };

  // Group same products by id
  const grouped = items.reduce<CartItem[]>((acc, item) => {
    const existing = acc.find((i) => i.product.id === item.product.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, []);

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
            className="fixed right-0 top-0 z-[70] flex h-full w-80 flex-col bg-card shadow-hover-lift sm:w-96"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
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
                <p className="text-center text-sm text-muted-foreground py-8">Seu carrinho está vazio</p>
              ) : (
                grouped.map((item) => (
                  <div key={item.product.id} className="flex gap-3 rounded-lg border border-border p-3">
                    <img src={item.product.image} alt={item.product.name} className="h-16 w-16 rounded-md object-cover" />
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="text-sm font-semibold text-card-foreground line-clamp-1">{item.product.name}</p>
                        <p className="text-xs text-primary font-bold">R$ {item.product.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => onUpdateQuantity(item.product.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-bold text-foreground w-6 text-center">{item.quantity}</span>
                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => onUpdateQuantity(item.product.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="ml-auto text-xs text-destructive h-6 px-2" onClick={() => onRemove(item.product.id)}>
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
                    className="text-sm"
                  />
                  <Button variant="outline" size="sm" onClick={handleApplyCoupon} className="shrink-0">
                    <Ticket className="h-4 w-4 mr-1" />
                    Aplicar
                  </Button>
                </div>
                {appliedCoupon && (
                  <p className="text-xs text-mint font-semibold">✓ Cupom aplicado! 10% de desconto</p>
                )}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
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
                <Button className="w-full bg-gradient-hero text-primary-foreground font-bold">
                  Confirmar Compra
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
