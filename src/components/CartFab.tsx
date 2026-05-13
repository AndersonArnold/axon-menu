"use client";

import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartFabProps {
  itemCount: number;
  total: number;
  primaryColor: string;
  onClick: () => void;
  /** Briefly true right after an item is added, to trigger bounce animation */
  justAdded?: boolean;
}

export default function CartFab({
  itemCount,
  total,
  primaryColor,
  onClick,
  justAdded,
}: CartFabProps) {
  if (itemCount === 0) return null;

  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(total);

  return (
    <div className="fixed bottom-6 inset-x-4 z-40 flex justify-center pointer-events-none">
      <button
        id="cart-fab"
        onClick={onClick}
        aria-label={`Abrir carrinho — ${itemCount} ${itemCount === 1 ? "item" : "itens"}`}
        className={cn(
          "pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl",
          "text-white font-semibold text-sm shadow-2xl",
          "active:scale-95 transition-transform duration-150",
          justAdded && "animate-cart-bounce"
        )}
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`,
          boxShadow: `0 8px 32px ${primaryColor}55`,
        }}
      >
        {/* Bag icon + badge */}
        <div className="relative">
          <ShoppingBag size={20} strokeWidth={2} />
          <span
            className={cn(
              "absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1",
              "rounded-full bg-white text-[10px] font-bold",
              "flex items-center justify-center leading-none",
              justAdded && "animate-cart-bounce"
            )}
            style={{ color: primaryColor }}
          >
            {itemCount}
          </span>
        </div>

        <span>Ver pedido</span>

        {/* Total */}
        <span className="ml-auto pl-3 border-l border-white/30 text-white/90 font-bold">
          {formatted}
        </span>
      </button>
    </div>
  );
}
