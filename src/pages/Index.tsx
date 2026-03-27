import { useState, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import MenuSidebar from "@/components/MenuSidebar";
import CartSidebar, { type CartItem } from "@/components/CartSidebar";
import CarouselSection from "@/components/CarouselSection";
import ProductCard from "@/components/ProductCard";
import TestimonialCard from "@/components/TestimonialCard";
import ProfessionalCard from "@/components/ProfessionalCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import WhatsAppButton from "@/components/WhatsAppButton";
import Footer from "@/components/Footer";
import { testimonials, professionalAds, categoryNames, type Product } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import heroBaby from "@/assets/hero-baby.jpg";
import { motion } from "framer-motion";

const Index = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const clearCart = useCallback(() => setCartItems([]), []);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mapped: Product[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || "",
          price: Number(p.price),
          image: p.image_url || "https://placehold.co/300x300?text=Produto",
          category: p.category_id || "geral",
          stock: p.stock,
          isFeatured: p.is_featured,
          rating: p.rating || 0,
          reviewCount: p.review_count || 0,
        }));
        setFeaturedProducts(mapped.filter((p) => p.isFeatured));
        setAllProducts(mapped.filter((p) => !p.isFeatured));
      }
      setLoadingProducts(false);
    };
    fetchProducts();
  }, []);

  const addToCart = useCallback((product: Product, qty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartCount={cartCount}
        onMenuToggle={() => setMenuOpen(true)}
        onCartToggle={() => setCartOpen(true)}
      />

      <motion.section
        className="relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative h-48 sm:h-64 overflow-hidden">
          <img src={heroBaby} alt="Cura & Cuidado" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute bottom-4 left-0 right-0 text-center px-4">
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Amor em cada cuidado 💕
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Produtos e serviços para mamães e bebês
            </p>
          </div>
        </div>
      </motion.section>

      <CarouselSection title="Destaques">
        {loadingProducts ? (
          <p className="text-sm text-muted-foreground px-4 py-8 animate-pulse">Carregando produtos...</p>
        ) : featuredProducts.length > 0 ? (
          featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={(prod) => addToCart(prod)} onViewDetails={setSelectedProduct} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground px-4 py-8">Nenhum destaque ainda.</p>
        )}
      </CarouselSection>

      <div className="bg-rose-light/50">
        <CarouselSection title={categoryNames.testimonials}>
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </CarouselSection>
      </div>

      <CarouselSection title="Nossos Produtos">
        {loadingProducts ? (
          <p className="text-sm text-muted-foreground px-4 py-8 animate-pulse">Carregando...</p>
        ) : allProducts.length > 0 ? (
          allProducts.map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={(prod) => addToCart(prod)} onViewDetails={setSelectedProduct} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground px-4 py-8">Nenhum produto cadastrado ainda.</p>
        )}
      </CarouselSection>

      <div className="bg-lavender-light/50">
        <CarouselSection title={categoryNames.professionals}>
          {professionalAds.map((ad) => (
            <ProfessionalCard key={ad.id} ad={ad} />
          ))}
        </CarouselSection>
      </div>

      <Footer />
      <WhatsAppButton />

      <MenuSidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <CartSidebar
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onClearCart={clearCart}
      />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product, qty) => addToCart(product, qty)}
        />
      )}
    </div>
  );
};

export default Index;
