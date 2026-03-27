import { useState, useEffect } from "react";
import { X, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import StarRating from "./StarRating";
import type { Product } from "@/data/mockData";
import { toast } from "sonner";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, qty: number) => void;
}

const ProductDetailModal = ({ product, onClose, onAddToCart }: ProductDetailModalProps) => {
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [loadingReview, setLoadingReview] = useState(false);
  const { user } = useAuth();

  if (!product) return null;

  const lowStock = product.stock <= 5 && product.stock > 0;

  // Carregar reviews aprovados
  useEffect(() => {
    loadReviews();
    checkCanReview();
  }, [product?.id]);

  const loadReviews = async () => {
    const { data } = await supabase
      .from("product_reviews")
      .select("*, profiles(fullname)")
      .eq("product_id", product.id)
      .eq("approved", true)
      .order("created_at", { ascending: false });
    setReviews(data || []);
  };

  const checkCanReview = async () => {
    if (!user) return setCanReview(false);
    // Verifica se tem pedido confirmado com este produto
    const { data } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", user.id)
      .contains("products", [product.id])
      .eq("payment_status", "confirmed")
      .single();
    setCanReview(!!data);
  };

  const submitReview = async () => {
    if (!reviewRating || !user) return;
    setLoadingReview(true);
    const { error } = await supabase.from("product_reviews").insert({
      product_id: product.id,
      rating: reviewRating,
      comment: reviewComment || null,
    });
    if (error) {
      toast.error("Erro: " + error.message);
    } else {
      toast.success("Avaliação enviada! Aguardando aprovação.");
      setReviewRating(0);
      setReviewComment("");
      loadReviews();
    }
    setLoadingReview(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background max-w-md w-full max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b bg-background/80 backdrop-blur">
          <h2 className="font-display text-xl font-bold">{product.name}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(product.rating || 0)} size={16} />
            <span className="text-sm text-muted-foreground">
              {product.rating?.toFixed(1) || "0"} ({reviews.length} avaliações)
            </span>
          </div>

          {lowStock && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border rounded-lg">
              <div className="w-4 h-4 bg-yellow-400 rounded-full" />
              <span className="text-sm font-medium text-yellow-800">
                ⚡ Este produto é um dos últimos, garanta o seu agora!
              </span>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between text-2xl font-bold">
              R$ {product.price.toFixed(2)}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="h-12 w-12"
              >
                <Minus className="h-5 w-5" />
              </Button>
              <span className="flex-1 text-center text-lg font-bold">{qty}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQty(qty + 1)}
                className="h-12 w-12"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <Button
              className="w-full h-12 gap-2 text-lg"
              onClick={() => {
                onAddToCart(product, qty);
                onClose();
              }}
            >
              <ShoppingCart className="h-5 w-5" />
              Adicionar ao Carrinho
            </Button>
          </div>

          {/* SUA AVALIAÇÃO - SÓ QUEM COMProu */}
          {canReview && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <h3 className="font-semibold mb-4">Sua avaliação</h3>
              <div className="flex items-center gap-3 mb-4">
                <StarRating 
                  rating={reviewRating} 
                  onRatingChange={setReviewRating}
                  interactive
                />
              </div>
              <Textarea 
                placeholder="O que achou do produto? (opcional)"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="mb-4"
              />
              <Button 
                className="w-full"
                onClick={submitReview}
                disabled={!reviewRating || loadingReview}
              >
                {loadingReview ? "Enviando..." : "Enviar Avaliação"}
              </Button>
            </div>
          )}

          {/* LISTA DE AVALIAÇÕES */}
          {reviews.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                Avaliações <Badge>{reviews.length}</Badge>
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {reviews.map((review: any) => (
                  <div key={review.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <StarRating rating={review.rating} size={14} />
                      <span className="font-medium text-sm">{review.profiles?.fullname}</span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductDetailModal;
