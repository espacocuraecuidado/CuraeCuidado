import { useState } from "react";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background max-w-md w-full max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b bg-background/80 backdrop-blur">
          <h2 className="font-display text-xl font-bold">{product.name}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {product.image && (
            <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-xl" />
          )}
          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(product.rating || 0)} size={16} />
            <span className="text-sm text-muted-foreground">
              {product.rating?.toFixed(1) || "0"} ({product.reviews || 0} avaliações)
            </span>
          </div>
          {lowStock && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border rounded-lg">
              <span className="text-sm font-medium text-yellow-800">
                ⚡ Este produto é um dos últimos, garanta o seu agora!
              </span>
            </div>
          )}
          <div className="space-y-3">
            <div className="text-2xl font-bold">R$ {product.price.toFixed(2)}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setQty(Math.max(1, qty - 1))} className="h-12 w-12">
                <Minus className="h-5 w-5" />
              </Button>
              <span className="flex-1 text-center text-lg font-bold">{qty}</span>
              <Button variant="outline" size="icon" onClick={() => setQty(qty + 1)} className="h-12 w-12">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <Button className="w-full h-12 gap-2 text-lg" onClick={() => { onAddToCart(product, qty); onClose(); }}>
              <ShoppingCart className="h-5 w-5" />
              Adicionar ao Carrinho
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductDetailModal;