"use client";

import { useEffect, useRef } from "react";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { Produto } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";

export interface CartItem {
  /** Identificador único da linha no carrinho (mesmo produto pode aparecer mais de uma vez) */
  lineId: string;
  produto: Produto;
  quantity: number;
  /** Observação por item (ex.: sem cebola) */
  observacao: string;
}

interface CartDrawerProps {
  items: CartItem[];
  primaryColor: string;
  open: boolean;
  onClose: () => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onObservacaoChange: (lineId: string, observacao: string) => void;
  onFinalizePedido?: () => void;
}

export default function CartDrawer({
  items,
  primaryColor,
  open,
  onClose,
  onIncrement,
  onDecrement,
  onRemove,
  onObservacaoChange,
  onFinalizePedido,
}: CartDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const total = items.reduce(
    (sum, item) => sum + item.produto.preco * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  if (!open && items.length === 0) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center",
        "transition-all duration-300",
        open ? "bg-black/70 backdrop-blur-sm" : "bg-transparent pointer-events-none"
      )}
      aria-modal="true"
      role="dialog"
      aria-label="Carrinho de compras"
    >
      <div
        className={cn(
          "w-full max-w-lg rounded-t-3xl overflow-hidden",
          "bg-[#1e293b] border-t border-x border-[#334155]",
          "flex flex-col max-h-[85dvh]",
          "transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} style={{ color: primaryColor }} />
            <h2 className="text-base font-bold text-slate-100">
              Seu Pedido
            </h2>
            {itemCount > 0 && (
              <span
                className="text-xs font-bold text-white px-2 py-0.5 rounded-full"
                style={{ background: primaryColor }}
              >
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar carrinho"
            className="w-8 h-8 rounded-full bg-[#263548] flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-[#334155] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#334155] mx-5" />

        {/* Items list */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center px-6">
            <ShoppingBag size={40} className="text-slate-600 mb-3" />
            <p className="text-slate-400 font-medium text-sm">
              Seu carrinho está vazio
            </p>
            <p className="text-slate-600 text-xs mt-1">
              Adicione itens do cardápio para começar
            </p>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {items.map(({ lineId, produto, quantity, observacao }) => (
              <li
                key={lineId}
                className="rounded-xl bg-[#263548] border border-[#334155] overflow-hidden"
              >
                <div className="flex gap-3 items-center p-2.5">
                {/* Thumbnail */}
                {produto.imagem_url ? (
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-[#1e293b]">
                    <Image
                      src={produto.imagem_url}
                      alt={produto.nome}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-[#334155] flex items-center justify-center">
                    <ShoppingBag size={16} className="text-slate-500" />
                  </div>
                )}

                {/* Name + controls */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-200 line-clamp-1">
                    {produto.nome}
                  </p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: primaryColor }}>
                    {formatCurrency(produto.preco * quantity)}
                  </p>
                </div>

                {/* Qty controls */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onDecrement(lineId)}
                    aria-label="Diminuir quantidade"
                    className="w-7 h-7 rounded-lg bg-[#334155] hover:bg-[#475569] text-slate-300 flex items-center justify-center transition-colors active:scale-90"
                  >
                    <Minus size={12} strokeWidth={2.5} />
                  </button>
                  <span className="text-xs font-bold text-slate-100 w-4 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => onIncrement(lineId)}
                    aria-label="Aumentar quantidade"
                    className="w-7 h-7 rounded-lg text-white flex items-center justify-center transition-all active:scale-90"
                    style={{ background: primaryColor }}
                  >
                    <Plus size={12} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Remove */}
                <button
                  onClick={() => onRemove(lineId)}
                  aria-label={`Remover ${produto.nome}`}
                  className="text-slate-600 hover:text-red-400 transition-colors ml-1 active:scale-90"
                >
                  <Trash2 size={14} />
                </button>
                </div>

                <div className="px-2.5 pb-2.5 pt-0">
                  <label
                    htmlFor={`obs-${lineId}`}
                    className="sr-only"
                  >
                    Observação para {produto.nome}
                  </label>
                  <textarea
                    id={`obs-${lineId}`}
                    rows={2}
                    maxLength={280}
                    placeholder="Observação (opcional) — ex.: sem cebola, ponto da carne..."
                    value={observacao}
                    onChange={(e) =>
                      onObservacaoChange(lineId, e.target.value)
                    }
                    className="w-full resize-none rounded-lg bg-[#1e293b] border border-[#334155] px-2.5 py-2 text-[11px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/25 focus-visible:border-slate-500/50 transition-shadow"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="px-5 pt-3 pb-6 flex-shrink-0 space-y-3 border-t border-[#334155]">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="font-bold text-slate-100">{formatCurrency(total)}</span>
            </div>
            <button
              id="checkout-btn"
              type="button"
              onClick={onFinalizePedido}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg active:scale-[0.98] transition-transform"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`,
                boxShadow: `0 6px 20px ${primaryColor}50`,
              }}
            >
              Finalizar Pedido · {formatCurrency(total)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
