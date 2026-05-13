"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Produto, Categoria, GradeHorarios } from "@/lib/types";
import StoriesMenu from "@/components/StoriesMenu";
import ProductCard from "@/components/ProductCard";
import CartDrawer, { CartItem } from "@/components/CartDrawer";
import CartFab from "@/components/CartFab";
import ProductDetailDrawer from "@/components/ProductDetailDrawer";
import CheckoutDrawer from "@/components/CheckoutDrawer";

interface MenuClientProps {
  categorias: Categoria[];
  produtos: Produto[];
  primaryColor: string;
  storeSlug: string;
  storeName: string;
  merchantWhatsApp: string;
  gradeHorarios: GradeHorarios;
  taxaEntregaInitial?: number;
}

export default function MenuClient({
  categorias,
  produtos,
  primaryColor,
  storeSlug,
  storeName,
  merchantWhatsApp,
  gradeHorarios,
  taxaEntregaInitial = 0,
}: MenuClientProps) {
  const [activeCatId, setActiveCatId] = useState<string | null>(
    categorias[0]?.id ?? null
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [productDrawer, setProductDrawer] = useState<Produto | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // ── IntersectionObserver: sync active category with scroll ───────────────
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    categorias.forEach((cat) => {
      const el = sectionRefs.current[cat.id];
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveCatId(cat.id);
        },
        { rootMargin: "-25% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [categorias]);

  // ── Scroll to category when Stories tab is tapped ────────────────────────
  const scrollToCategory = useCallback((id: string) => {
    setActiveCatId(id);
    const el = sectionRefs.current[id];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  // ── Cart: add from product drawer (observação + merge mesma combinação) ──
  const handleAddToCart = useCallback((produto: Produto, observacao: string) => {
    const obs = observacao.trim();
    setCartItems((prev) => {
      const matchIdx = prev.findIndex(
        (i) => i.produto.id === produto.id && i.observacao.trim() === obs
      );
      if (matchIdx !== -1) {
        return prev.map((i, j) =>
          j === matchIdx ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          lineId: crypto.randomUUID(),
          produto,
          quantity: 1,
          observacao: obs,
        },
      ];
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 600);
  }, []);

  // ── Cart: increment / decrement / remove ─────────────────────────────────
  const handleIncrement = useCallback((lineId: string) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i.lineId === lineId ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  }, []);

  const handleDecrement = useCallback((lineId: string) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.lineId === lineId ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const handleRemove = useCallback((lineId: string) => {
    setCartItems((prev) => prev.filter((i) => i.lineId !== lineId));
  }, []);

  const handleObservacaoChange = useCallback(
    (lineId: string, observacao: string) => {
      setCartItems((prev) =>
        prev.map((i) =>
          i.lineId === lineId ? { ...i, observacao } : i
        )
      );
    },
    []
  );

  const openCart = useCallback(() => {
    setProductDrawer(null);
    setCheckoutOpen(false);
    setCartOpen(true);
  }, []);

  const startCheckout = useCallback(() => {
    setCartOpen(false);
    setProductDrawer(null);
    setCheckoutOpen(true);
  }, []);

  const handleCheckoutSuccess = useCallback(() => {
    setCheckoutOpen(false);
    setCartItems([]);
  }, []);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.produto.preco * item.quantity,
    0
  );
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Sticky Stories navigation */}
      <StoriesMenu
        categorias={categorias}
        activeId={activeCatId}
        primaryColor={primaryColor}
        onSelect={scrollToCategory}
      />

      {/* Product sections */}
      <main className="px-4 pb-32 space-y-8 mt-5">
        {categorias.map((cat) => {
          const catProdutos = produtos
            .filter((p) => p.categoria_id === cat.id)
            .sort((a, b) => a.ordem - b.ordem);

          if (!catProdutos.length) return null;

          return (
            <section
              key={cat.id}
              id={`section-${cat.id}`}
              ref={(el) => { sectionRefs.current[cat.id] = el; }}
              aria-labelledby={`cat-heading-${cat.id}`}
              className="animate-fade-up"
            >
              <h2
                id={`cat-heading-${cat.id}`}
                className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-3 pl-1"
              >
                {cat.nome}
              </h2>

              <div className="space-y-3">
                {catProdutos.map((produto) => (
                  <ProductCard
                    key={produto.id}
                    produto={produto}
                    primaryColor={primaryColor}
                    onProductPress={(p) => setProductDrawer(p)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {/* Empty state */}
        {produtos.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500 text-sm">
              Nenhum produto cadastrado ainda.
            </p>
          </div>
        )}
      </main>

      <ProductDetailDrawer
        produto={productDrawer}
        primaryColor={primaryColor}
        onClose={() => setProductDrawer(null)}
        onAdd={handleAddToCart}
      />

      {/* Floating cart button */}
      <CartFab
        itemCount={cartCount}
        total={cartTotal}
        primaryColor={primaryColor}
        onClick={openCart}
        justAdded={justAdded}
      />

      {/* Cart drawer */}
      <CartDrawer
        items={cartItems}
        primaryColor={primaryColor}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
        onRemove={handleRemove}
        onObservacaoChange={handleObservacaoChange}
        onFinalizePedido={startCheckout}
      />

      <CheckoutDrawer
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handleCheckoutSuccess}
        items={cartItems}
        primaryColor={primaryColor}
        storeSlug={storeSlug}
        storeName={storeName}
        merchantWhatsApp={merchantWhatsApp}
        gradeHorarios={gradeHorarios}
        taxaEntregaInitial={taxaEntregaInitial}
      />
    </>
  );
}
