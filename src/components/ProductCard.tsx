import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarRating from "./StarRating";
import type { Product } from "@/data/mockData";
import { motion, AnimatePresence } from "framer-motion";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart, onViewDetails }: ProductCardProps) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePointerDown = () => {
    timerRef.current = setTimeout(() => setShowQuickView(true), 2000);
  };
  const handlePointerUp = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const lowStock = product.stock <= 5 && product.stock > 0;

  return (
    <>
      <motion.div
        className="group relative flex w-44 flex-shrink-0 cursor-pointer flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-shadow hover:shadow-hover-lift sm:w-52"
        whileHover={{ y: -4 }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={() => onViewDetails(product)}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          {lowStock && (
            <div className="absolute left-0 top-0 bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
              Últimas unidades!
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          <h3 className="font-body text-sm font-semibold text-card-foreground line-clamp-1">{product.name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
          <div className="flex items-center gap-1">
            <StarRating rating={Math.round(product.rating)} size={12} />
            <span className="text-[10px] text-muted-foreground">({product.reviews})</span>
          </div>
          <div className="mt-auto flex items-center justify-between pt-1">
            <span className="font-display text-base font-bold text-primary">
              R$ {product.price.toFixed(2)}
            </span>
            <Button
              size="icon"
              className="h-7 w-7 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showQuickView && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuickView(false)}
          >
            <motion.div
              className="w-full max-w-sm overflow-hidden rounded-lg bg-card shadow-hover-lift"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img src={product.image} alt={product.name} className="w-full aspect-[4/3] object-cover" />
              <div className="p-4 space-y-2">
                <h3 className="font-display text-lg font-bold text-card-foreground">{product.name}</h3>
                <StarRating rating={Math.round(product.rating)} size={18} />
                <p className="font-display text-2xl font-bold text-primary">R$ {product.price.toFixed(2)}</p>
                <Button className="w-full bg-primary text-primary-foreground" onClick={() => setShowQuickView(false)}>
                  Fechar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductCard;
