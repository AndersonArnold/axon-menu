import { formatCurrency } from "@/lib/utils";

export type OrderModality = "entrega" | "retirada" | "local";

export type PaymentMethod = "dinheiro" | "cartao" | "pix";

export type OrderLineItem = {
  quantity: number;
  produtoNome: string;
  observacao: string;
};

const SEP = "------------------------------";

const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  dinheiro: "Dinheiro",
  cartao: "Cartão",
  pix: "Pix",
};

function modalityLabel(
  modality: OrderModality,
  mesa?: string
): string {
  if (modality === "entrega") return "Entrega 🛵";
  if (modality === "retirada") return "Retirada na Loja 🛍️";
  const m = (mesa ?? "").trim();
  return m ? `Consumir no Local 🍽️ — Mesa ${m}` : "Consumir no Local 🍽️";
}

/** Interpreta valores como "50", "R$ 100,00", "1.234,56" */
export function parseBrazilianMoney(input: string): number | null {
  const t = input.trim().replace(/R\$\s*/gi, "");
  if (!t) return null;
  if (/^\d+$/.test(t)) return parseInt(t, 10);
  const normalized = t.includes(",")
    ? t.replace(/\./g, "").replace(",", ".")
    : t.replace(/[^\d.-]/g, "");
  const n = parseFloat(normalized);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/**
 * Linha de troco para WhatsApp: nota informada vs total do pedido.
 * "TROCO PARA: R$ X (Levar R$ Y de troco)" quando Y ≥ 0.
 */
export function buildTrocoWhatsAppLine(
  grandTotal: number,
  trocoParaRaw: string
): string | null {
  const nota = parseBrazilianMoney(trocoParaRaw);
  if (nota == null) return null;
  const diff = Math.round((nota - grandTotal) * 100) / 100;
  const notaFmt = formatCurrency(nota);
  const totalFmt = formatCurrency(grandTotal);
  if (diff < 0) {
    return `*TROCO PARA: ${notaFmt}* (Valor informado é menor que o total de ${totalFmt})`;
  }
  return `*TROCO PARA: ${notaFmt} (Levar ${formatCurrency(diff)} de troco)*`;
}

/**
 * Monta o texto do pedido para WhatsApp (formatação acordada com o lojista).
 */
export function buildWhatsAppOrderMessage(params: {
  storeName: string;
  clienteNome: string;
  clienteWhatsapp: string;
  modality: OrderModality;
  mesa?: string;
  endereco?: string;
  referencia?: string;
  paymentMethod: PaymentMethod;
  /** Texto bruto do campo "troco para quanto" (dinheiro) */
  trocoParaRaw?: string;
  items: OrderLineItem[];
  subtotal: number;
  /** Só usado na entrega; taxa em reais */
  taxaEntrega?: number;
  grandTotal: number;
}): string {
  const itemsBlock = params.items
    .map((it) => {
      const line = `${it.quantity}x ${it.produtoNome}`;
      const obs = it.observacao.trim();
      return obs ? `${line}\n _Obs: ${obs}_` : line;
    })
    .join("\n\n");

  const subtotalStr = formatCurrency(params.subtotal);
  const totalStr = formatCurrency(params.grandTotal);

  let msg = `* NOVO PEDIDO - ${params.storeName} *\n\n`;
  msg += `${SEP}\n\n`;
  msg += `*CLIENTE:* ${params.clienteNome}\n\n`;
  msg += `*CONTATO:* ${params.clienteWhatsapp}\n\n`;
  msg += `*MODALIDADE:* ${modalityLabel(params.modality, params.mesa)}\n\n`;
  msg += `*PAGAMENTO:* ${PAYMENT_LABEL[params.paymentMethod]}\n\n`;

  const trocoLine =
    params.paymentMethod === "dinheiro" && params.trocoParaRaw?.trim()
      ? buildTrocoWhatsAppLine(params.grandTotal, params.trocoParaRaw)
      : null;
  if (trocoLine) msg += `${trocoLine}\n\n`;

  msg += `${SEP}\n\n`;
  msg += `*ITENS:*\n\n`;
  msg += `${itemsBlock}\n\n`;
  msg += `${SEP}\n\n`;

  msg += `*SUBTOTAL: ${subtotalStr}*\n\n`;
  if (params.modality === "entrega" && (params.taxaEntrega ?? 0) > 0) {
    msg += `*TAXA DE ENTREGA: ${formatCurrency(params.taxaEntrega ?? 0)}*\n\n`;
  }
  msg += `*TOTAL: ${totalStr}*\n\n`;
  msg += `${SEP}`;

  if (params.modality === "entrega") {
    const end = (params.endereco ?? "").trim();
    const ref = (params.referencia ?? "").trim();
    const addr =
      end && ref ? `${end}\nRef.: ${ref}` : end || ref || "";
    if (addr) msg += `\n\n*ENDEREÇO:* ${addr}`;
  }

  return msg.trim();
}

/** Dígitos com DDI 55 para wa.me */
export function phoneToWhatsAppDigits(phone: string): string {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = d.slice(1);
  if (!d.startsWith("55")) d = `55${d}`;
  return d;
}

export function whatsAppOrderUrl(phoneDigits: string, text: string): string {
  const d = phoneToWhatsAppDigits(phoneDigits);
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}
