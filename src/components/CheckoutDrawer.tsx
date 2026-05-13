"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bike,
  Clock,
  Store,
  UtensilsCrossed,
  X,
} from "lucide-react";
import type { CartItem } from "@/components/CartDrawer";
import { loadSavedCustomer, saveSavedCustomer } from "@/lib/checkout-storage";
import {
  buildWhatsAppOrderMessage,
  phoneToWhatsAppDigits,
  whatsAppOrderUrl,
  type OrderModality,
  type PaymentMethod,
} from "@/lib/whatsapp-order";
import { isSupabaseConfigured } from "@/lib/supabase-config";
import { supabase } from "@/lib/supabase";
import { isStoreOpen } from "@/lib/schedule";
import type { GradeHorarios } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

type Step = "modality" | "details";

const inputClass =
  "w-full rounded-xl border border-[#334155] bg-[#263548] px-3 py-2.5 text-sm text-white placeholder:text-slate-500 shadow-inner " +
  "focus:outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]";

const labelClass =
  "mb-1.5 block text-xs font-semibold tracking-wide text-slate-200";

interface CheckoutDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  items: CartItem[];
  primaryColor: string;
  storeSlug: string;
  storeName: string;
  merchantWhatsApp: string;
  gradeHorarios: GradeHorarios;
  /** Valor vindo do SSR/mock; atualizado pelo Supabase na entrega */
  taxaEntregaInitial?: number;
}

export default function CheckoutDrawer({
  open,
  onClose,
  onSuccess,
  items,
  primaryColor,
  storeSlug,
  storeName,
  merchantWhatsApp,
  gradeHorarios,
  taxaEntregaInitial = 0,
}: CheckoutDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<Step>("modality");
  const [modality, setModality] = useState<OrderModality | null>(null);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [endereco, setEndereco] = useState("");
  const [referencia, setReferencia] = useState("");
  const [mesa, setMesa] = useState("");
  const [payment, setPayment] = useState<PaymentMethod | "">("");
  const [trocoPara, setTrocoPara] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [storeOpen, setStoreOpen] = useState(true);
  const [taxaEntrega, setTaxaEntrega] = useState(taxaEntregaInitial);
  const taxaInitialRef = useRef(taxaEntregaInitial);
  taxaInitialRef.current = taxaEntregaInitial;

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.produto.preco * i.quantity, 0),
    [items]
  );

  const taxaAplicavel = modality === "entrega" ? taxaEntrega : 0;
  const grandTotal = subtotal + taxaAplicavel;

  const merchantDigits = useMemo(
    () => phoneToWhatsAppDigits(merchantWhatsApp || "0").replace(/\D/g, ""),
    [merchantWhatsApp]
  );
  const merchantOk = merchantDigits.length >= 12;

  const syncTaxaFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setTaxaEntrega(taxaInitialRef.current ?? 0);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("lojistas")
        .select("taxa_entrega")
        .eq("slug", storeSlug)
        .eq("ativo", true)
        .maybeSingle();

      if (error || data == null) {
        setTaxaEntrega(taxaInitialRef.current ?? 0);
        return;
      }

      const raw = (data as { taxa_entrega?: unknown }).taxa_entrega;
      const n =
        typeof raw === "string" ? parseFloat(raw) : Number(raw ?? 0);
      setTaxaEntrega(Number.isFinite(n) ? n : taxaInitialRef.current ?? 0);
    } catch {
      setTaxaEntrega(taxaInitialRef.current ?? 0);
    }
  }, [storeSlug]);

  useEffect(() => {
    if (open) {
      const s = loadSavedCustomer(storeSlug);
      setNome(s.nome);
      setWhatsapp(s.whatsapp);
      setEndereco(s.endereco);
      setReferencia("");
      setMesa("");
      setPayment("");
      setTrocoPara("");
      setFormError(null);
      setStep("modality");
      setModality(null);
      setTaxaEntrega(taxaEntregaInitial ?? 0);
      setStoreOpen(isStoreOpen(gradeHorarios));
    }
  }, [open, storeSlug, taxaEntregaInitial, gradeHorarios]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (open && items.length === 0) onClose();
  }, [open, items.length, onClose]);

  /** Horário em tempo real + atualização da taxa de entrega */
  useEffect(() => {
    if (!open) return;

    const tick = () => {
      setStoreOpen(isStoreOpen(gradeHorarios));
      if (modality === "entrega" && step === "details") {
        void syncTaxaFromSupabase();
      }
    };

    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, [open, gradeHorarios, modality, step, syncTaxaFromSupabase]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const chooseModality = (m: OrderModality) => {
    setModality(m);
    setStep("details");
    setFormError(null);
    setStoreOpen(isStoreOpen(gradeHorarios));
  };

  const goBack = () => {
    if (step === "details") {
      setStep("modality");
      setModality(null);
      setFormError(null);
    } else onClose();
  };

  function validate(): string | null {
    if (!modality) return "Selecione uma modalidade.";
    if (!nome.trim()) return "Informe seu nome.";
    if (!whatsapp.trim()) return "Informe seu WhatsApp.";
    if (modality === "entrega" && !endereco.trim()) {
      return "Informe o endereço completo.";
    }
    if (modality === "local" && !mesa.trim()) return "Informe o número da mesa.";
    if (!payment) return "Selecione a forma de pagamento.";
    return null;
  }

  function handleSubmit() {
    if (!isStoreOpen(gradeHorarios)) {
      setStoreOpen(false);
      return;
    }

    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    if (!modality || !payment) return;
    if (!merchantOk) {
      setFormError(
        "Esta loja ainda não configurou um WhatsApp para receber pedidos."
      );
      return;
    }

    saveSavedCustomer(storeSlug, {
      nome: nome.trim(),
      whatsapp: whatsapp.trim(),
      endereco: endereco.trim(),
    });

    const lines = items.map((it) => ({
      quantity: it.quantity,
      produtoNome: it.produto.nome,
      observacao: it.observacao,
    }));

    const text = buildWhatsAppOrderMessage({
      storeName,
      clienteNome: nome.trim(),
      clienteWhatsapp: whatsapp.trim(),
      modality,
      mesa: modality === "local" ? mesa.trim() : undefined,
      endereco: modality === "entrega" ? endereco.trim() : undefined,
      referencia: modality === "entrega" ? referencia.trim() : undefined,
      paymentMethod: payment,
      trocoParaRaw: payment === "dinheiro" ? trocoPara : undefined,
      items: lines,
      subtotal,
      taxaEntrega: modality === "entrega" ? taxaEntrega : undefined,
      grandTotal,
    });

    const url = whatsAppOrderUrl(merchantWhatsApp, text);
    window.open(url, "_blank", "noopener,noreferrer");
    onSuccess();
  }

  const canSubmit = merchantOk && storeOpen;

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[55] flex items-end justify-center bg-black/75 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="checkout-title"
    >
      <div
        className={cn(
          "flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border-x border-t border-[#334155]",
          "bg-[#1e293b] shadow-2xl animate-slide-up"
        )}
      >
        <header className="flex flex-shrink-0 items-center gap-3 border-b border-[#334155] px-4 py-3">
          <button
            type="button"
            onClick={goBack}
            aria-label={step === "details" ? "Voltar" : "Fechar"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#263548] text-slate-300 transition-colors hover:bg-[#334155] hover:text-white"
          >
            {step === "details" ? (
              <ArrowLeft size={18} />
            ) : (
              <X size={18} />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <h2
              id="checkout-title"
              className="truncate text-base font-bold text-white"
            >
              {step === "modality" ? "Finalizar pedido" : "Seus dados"}
            </h2>
            <p className="truncate text-xs text-slate-400">{storeName}</p>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {step === "modality" && (
            <div className="space-y-3">
              <p className="text-center text-sm text-slate-300">
                Como você prefere receber este pedido?
              </p>
              <button
                type="button"
                onClick={() => chooseModality("entrega")}
                className="flex w-full items-center gap-4 rounded-2xl border border-[#334155] bg-[#263548] px-4 py-4 text-left transition-colors hover:border-[#475569] active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1e293b] text-2xl">
                  <Bike className="text-white" size={22} />
                </span>
                <span>
                  <span className="block font-bold text-white">
                    Entrega 🛵
                  </span>
                  <span className="text-xs text-slate-400">
                    Enviamos até você
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => chooseModality("retirada")}
                className="flex w-full items-center gap-4 rounded-2xl border border-[#334155] bg-[#263548] px-4 py-4 text-left transition-colors hover:border-[#475569] active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1e293b] text-2xl">
                  <Store className="text-white" size={22} />
                </span>
                <span>
                  <span className="block font-bold text-white">
                    Retirada na Loja 🛍️
                  </span>
                  <span className="text-xs text-slate-400">
                    Você busca no balcão
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => chooseModality("local")}
                className="flex w-full items-center gap-4 rounded-2xl border border-[#334155] bg-[#263548] px-4 py-4 text-left transition-colors hover:border-[#475569] active:scale-[0.99]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1e293b] text-2xl">
                  <UtensilsCrossed className="text-white" size={22} />
                </span>
                <span>
                  <span className="block font-bold text-white">
                    Consumir no Local 🍽️
                  </span>
                  <span className="text-xs text-slate-400">
                    Comer no salão
                  </span>
                </span>
              </button>
            </div>
          )}

          {step === "details" && modality && (
            <div className="space-y-5 pb-2">
              <div
                className={cn(
                  "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs leading-relaxed",
                  storeOpen
                    ? "border-emerald-500/25 bg-emerald-950/25 text-emerald-100"
                    : "border-slate-600/50 bg-[#263548] text-slate-300"
                )}
              >
                <Clock
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    storeOpen ? "text-emerald-400" : "text-slate-500"
                  )}
                  aria-hidden
                />
                <p>
                  {storeOpen ? (
                    <>
                      <span className="font-semibold text-white">
                        Horário verificado agora
                      </span>
                      <span className="text-slate-400">
                        {" "}
                        · Loja aberta para novos pedidos (atualizado a cada 30s)
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-slate-200">
                        Horário verificado agora
                      </span>
                      <span className="block pt-1 text-slate-400">
                        Infelizmente a loja fechou para novos pedidos. 🕒
                      </span>
                    </>
                  )}
                </p>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200"
                >
                  {formError}
                </div>
              )}

              <div>
                <label htmlFor="chk-nome" className={labelClass}>
                  Nome
                </label>
                <input
                  id="chk-nome"
                  type="text"
                  autoComplete="name"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={inputClass}
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label htmlFor="chk-wa" className={labelClass}>
                  WhatsApp
                </label>
                <input
                  id="chk-wa"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className={inputClass}
                  placeholder="(11) 99999-9999"
                />
              </div>

              {modality === "entrega" && (
                <>
                  <div>
                    <label htmlFor="chk-end" className={labelClass}>
                      Endereço completo
                    </label>
                    <textarea
                      id="chk-end"
                      rows={3}
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className={cn(inputClass, "resize-none")}
                      placeholder="Rua, número, bairro, cidade…"
                    />
                  </div>
                  <div>
                    <label htmlFor="chk-ref" className={labelClass}>
                      Ponto de referência{" "}
                      <span className="font-normal text-slate-500">
                        (opcional)
                      </span>
                    </label>
                    <input
                      id="chk-ref"
                      type="text"
                      value={referencia}
                      onChange={(e) => setReferencia(e.target.value)}
                      className={inputClass}
                      placeholder="Próximo ao…, apartamento…"
                    />
                  </div>
                </>
              )}

              {modality === "local" && (
                <div>
                  <label htmlFor="chk-mesa" className={labelClass}>
                    Número da mesa
                  </label>
                  <input
                    id="chk-mesa"
                    type="text"
                    inputMode="numeric"
                    value={mesa}
                    onChange={(e) => setMesa(e.target.value)}
                    className={inputClass}
                    placeholder="Ex.: 12"
                  />
                </div>
              )}

              <div>
                <span className={labelClass}>Forma de pagamento</span>
                <p className="mb-2 text-[11px] text-slate-500">
                  Apenas informativo para o estabelecimento
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ["dinheiro", "Dinheiro"],
                      ["cartao", "Cartão"],
                      ["pix", "Pix"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setPayment(key);
                        if (key !== "dinheiro") setTrocoPara("");
                        setFormError(null);
                      }}
                      className={cn(
                        "rounded-xl border py-2.5 text-xs font-bold transition-all",
                        payment === key
                          ? "border-transparent text-white shadow-md"
                          : "border-[#334155] bg-[#263548] text-slate-300 hover:border-[#475569]"
                      )}
                      style={
                        payment === key
                          ? {
                              background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`,
                              boxShadow: `0 4px 14px ${primaryColor}44`,
                            }
                          : undefined
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {payment === "dinheiro" && (
                <div>
                  <label htmlFor="chk-troco" className={labelClass}>
                    Precisa de troco para quanto?{" "}
                    <span className="font-normal text-slate-500">
                      (opcional)
                    </span>
                  </label>
                  <input
                    id="chk-troco"
                    type="text"
                    value={trocoPara}
                    onChange={(e) => setTrocoPara(e.target.value)}
                    className={inputClass}
                    placeholder="Ex.: R$ 50,00 ou 50"
                  />
                </div>
              )}

              {!merchantOk && (
                <p className="rounded-xl border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-xs text-amber-100">
                  O telefone do estabelecimento não está configurado. Peça ao
                  lojista para cadastrar o WhatsApp no painel.
                </p>
              )}

              <div className="space-y-2 rounded-xl border border-[#334155] bg-[#263548] px-3 py-3">
                {modality === "entrega" ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Subtotal</span>
                      <span className="font-medium text-white">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Taxa de entrega</span>
                      <span className="font-medium text-white">
                        {formatCurrency(taxaEntrega)}
                      </span>
                    </div>
                    <div className="border-t border-[#334155] pt-2 flex justify-between text-sm">
                      <span className="font-semibold text-slate-200">
                        Total
                      </span>
                      <span
                        className="font-bold text-white"
                        style={{ color: primaryColor }}
                      >
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total do pedido</span>
                    <span
                      className="font-bold text-white"
                      style={{ color: primaryColor }}
                    >
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {step === "details" && modality && (
          <footer className="flex-shrink-0 border-t border-[#334155] bg-[#1e293b] px-4 py-4 space-y-3">
            {!storeOpen && (
              <p className="text-center text-xs text-slate-400">
                O envio será liberado quando a loja estiver aberta.
              </p>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: canSubmit
                  ? `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`
                  : "#475569",
                boxShadow: canSubmit
                  ? `0 6px 20px ${primaryColor}50`
                  : undefined,
              }}
            >
              Enviar pedido via WhatsApp
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
