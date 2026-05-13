"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { X, ShoppingBag, Plus, Check } from "lucide-react";
import type { Produto } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";

const CLOSE_AFTER_MS = 820;

interface ProductDetailDrawerProps {
  produto: Produto | null;
  primaryColor: string;
  onClose: () => void;
  /** Observação já normalizada (trim) pelo pai ao adicionar */
  onAdd: (produto: Produto, observacao: string) => void;
}

export default function ProductDetailDrawer({
  produto,
  primaryColor,
  onClose,
  onAdd,
}: ProductDetailDrawerProps) {
  const open = produto !== null;
  const [observacao, setObservacao] = useState("");
  const [justAdded, setJustAdded] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (produto) {
      setObservacao("");
      setJustAdded(false);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    }
  }, [produto?.id]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (justAdded) return;
    if (e.target === overlayRef.current) onClose();
  };

  const handleConfirm = useCallback(() => {
    if (!produto || justAdded) return;
    onAdd(produto, observacao.trim());
    setJustAdded(true);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, CLOSE_AFTER_MS);
  }, [produto, justAdded, observacao, onAdd, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={cn(
        "fixed inset-0 z-[48] flex items-end justify-center",
        "bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      )}
      aria-modal="true"
      role="dialog"
      aria-labelledby="product-drawer-title"
    >
      <div
        className={cn(
          "w-full max-w-lg rounded-t-3xl overflow-hidden",
          "bg-[#1e293b] border-t border-x border-[#334155]",
          "flex flex-col max-h-[88dvh] shadow-2xl",
          "animate-slide-up"
        )}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
          <h2
            id="product-drawer-title"
            className="text-sm font-bold text-slate-300 uppercase tracking-wider"
          >
            Personalizar
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={justAdded}
            aria-label="Fechar"
            className="w-9 h-9 rounded-full bg-[#263548] flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-[#334155] transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-[#263548] border border-[#334155]">
              {produto.imagem_url ? (
                <Image
                  src={produto.imagem_url}
                  alt={produto.nome}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="text-slate-600" size={32} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-base font-bold text-slate-100 leading-snug">
                {produto.nome}
              </p>
              {produto.descricao && (
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-4">
                  {produto.descricao}
                </p>
              )}
              <p
                className="text-lg font-bold mt-2"
                style={{ color: primaryColor }}
              >
                {formatCurrency(produto.preco)}
              </p>
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="product-drawer-obs"
              className="block text-xs font-semibold text-slate-400 mb-2"
            >
              Observação para a cozinha
            </label>
            <textarea
              id="product-drawer-obs"
              rows={3}
              maxLength={280}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              disabled={justAdded}
              placeholder="Ex.: sem cebola, bem passado, sem maionese…"
              className="w-full resize-none rounded-xl bg-[#0f172a] border border-[#334155] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/25 focus-visible:border-slate-500/50 disabled:opacity-50 disabled:pointer-events-none"
            />
            <p className="text-[10px] text-slate-600 mt-1.5 text-right">
              {observacao.length}/280
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 px-5 pt-2 pb-6 border-t border-[#334155] bg-[#1e293b]">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={justAdded}
            aria-busy={justAdded}
            className={cn(
              "relative w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 overflow-hidden",
              "transition-[transform,background-color] duration-300",
              !justAdded && "active:scale-[0.98]",
              justAdded && "animate-btn-confirm-glow scale-[1.02]"
            )}
            style={
              justAdded
                ? {
                    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
                    boxShadow: "0 6px 24px rgba(34, 197, 94, 0.45)",
                  }
                : {
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`,
                    boxShadow: `0 6px 20px ${primaryColor}50`,
                  }
            }
          >
            {!justAdded && (
              <>
                <Plus size={18} strokeWidth={2.5} />
                Adicionar ao carrinho · {formatCurrency(produto.preco)}
              </>
            )}
            {justAdded && (
              <>
                <Check
                  size={20}
                  strokeWidth={3}
                  className="animate-check-pop shrink-0"
                />
                <span className="tracking-tight">Adicionado!</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
