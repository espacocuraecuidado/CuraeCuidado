import { useState } from "react";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import StarRating from "./StarRating";
import type { Product } from "@/data/mockData";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, qty: number) => void;
}

const ProductDetailModal = ({ product, onClose, onAddToCart }: ProductDetailModalProps) => {
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const lowStock = product.stock <= 5 && product.stock > 0;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-end justify-center bg-foreground/50 sm:items-center sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-lg overflow-hidden rounded-t-2xl bg-card sm:rounded-2xl max-h-[90vh] overflow-y-auto"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant="ghost" size="icon" className="absolute right-2 top-2 z-10 bg-card/80 rounded-full" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>

          <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />

          <div className="p-5 space-y-3">
            <h2 className="font-display text-xl font-bold text-card-foreground">{product.name}</h2>
            <p className="text-sm text-muted-foreground">{product.description}</p>

            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(product.rating)} size={16} />
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews} avaliações)
              </span>
            </div>

            {lowStock && (
              <p className="text-sm font-bold text-primary animate-pulse-soft">
                ⚡ Este produto é um dos últimos, garanta o seu agora!
              </p>
            )}

            <p className="font-display text-3xl font-bold text-primary">
              R$ {product.price.toFixed(2)}
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-border p-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQty(Math.max(1, qty - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-bold text-foreground">{qty}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setQty(qty + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                className="flex-1 bg-gradient-hero text-primary-foreground font-bold"
                onClick={() => { onAddToCart(product, qty); onClose(); }}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Adicionar ao Carrinho
              </Button>
            </div>

            <div className="border-t border-border pt-3 mt-3">
              <h3 className="font-display text-sm font-bold text-card-foreground mb-2">Comentários</h3>
              <div className="space-y-2">
                <div className="rounded-lg bg-muted p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-foreground">Maria S.</span>
                    <StarRating rating={5} size={10} />
                  </div>
                  <p className="text-xs text-muted-foreground">Produto maravilhoso! Recomendo demais.</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-foreground">Ana P.</span>
                    <StarRating rating={4} size={10} />
                  </div>
                  <p className="text-xs text-muted-foreground">Ótima qualidade, chegou rápido!</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductDetailModal;
