"use client";

import Image from "next/image";
import { useState, useCallback } from "react";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { Produto } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";

interface ProductCardProps {
  produto: Produto;
  primaryColor: string;
  /** Abre o drawer de personalização (observação + adicionar) */
  onProductPress?: (produto: Produto) => void;
}

export default function ProductCard({
  produto,
  primaryColor,
  onProductPress,
}: ProductCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleActivate = useCallback(() => {
    if (!produto.disponivel || !onProductPress) return;
    onProductPress(produto);
  }, [produto, onProductPress]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleActivate();
      }
    },
    [handleActivate]
  );

  return (
    <div
      id={`product-${produto.id}`}
      role={produto.disponivel && onProductPress ? "button" : undefined}
      tabIndex={produto.disponivel && onProductPress ? 0 : undefined}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex gap-0 rounded-2xl overflow-hidden",
        "bg-[#1e293b] border border-[#334155]",
        "shadow-lg hover:shadow-xl hover:border-[#475569]",
        "transition-all duration-300",
        produto.disponivel &&
          onProductPress &&
          "cursor-pointer active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-page,#070b12)]",
        !produto.disponivel && "opacity-55"
      )}
      aria-label={
        produto.disponivel && onProductPress
          ? `${produto.nome}, ${formatCurrency(produto.preco)}. Toque para adicionar com observação`
          : undefined
      }
    >
      {/* ── Left: Large image (fixed width) ── */}
      <div className="relative flex-shrink-0 w-28 h-28 sm:w-32 sm:h-32 bg-[#263548] pointer-events-none">
        {!imgLoaded && produto.imagem_url && (
          <div className="skeleton absolute inset-0" />
        )}

        {produto.imagem_url ? (
          <Image
            src={produto.imagem_url}
            alt=""
            fill
            className={cn(
              "object-cover transition-all duration-500",
              imgLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
            )}
            sizes="128px"
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart size={28} className="text-slate-600" />
          </div>
        )}

        {!produto.disponivel && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest rotate-[-20deg] border border-slate-400/40 px-2 py-0.5 rounded">
              Esgotado
            </span>
          </div>
        )}

        <div className="absolute inset-y-0 right-0 w-6 bg-gradient-to-r from-transparent to-[#1e293b]" />
      </div>

      {/* ── Right: Info ── */}
      <div className="flex flex-col justify-between flex-1 min-w-0 px-3 py-3 pointer-events-none">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {produto.nome}
          </h3>
          {produto.descricao && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {produto.descricao}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 gap-2">
          <span
            className="text-base font-bold tracking-tight"
            style={{ color: primaryColor }}
          >
            {formatCurrency(produto.preco)}
          </span>

          {produto.disponivel && onProductPress && (
            <span className="flex items-center gap-0.5 text-[11px] font-semibold text-slate-500 group-hover:text-slate-300 transition-colors">
              Adicionar
              <ChevronRight size={14} className="opacity-80" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
