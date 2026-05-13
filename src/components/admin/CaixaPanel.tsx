"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Lojista, Caixa, MovimentoCaixa, MeioPagamento } from "@/lib/types";
import {
  Plus, Minus, X, Check, AlertTriangle,
  DollarSign, CreditCard, Smartphone, TrendingUp,
  TrendingDown, Clock, Package,
} from "lucide-react";
import { cardStyle, sectionTitle, btnPrimary, btnGhost, btnDanger, inputStyle, demoWarning } from "./styles";
import { formatCurrency } from "@/lib/utils";

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeDemoMovimentos(): MovimentoCaixa[] {
  const now = new Date().toISOString();
  return [
    { id: "1", caixa_id: "c1", lojista_id: "l1", tipo: "abertura",   valor: 50,    descricao: "Fundo de caixa inicial", created_at: now },
    { id: "2", caixa_id: "c1", lojista_id: "l1", tipo: "venda",      valor: 45.9,  meio_pagamento: "dinheiro", descricao: "Pedido #101", created_at: now },
    { id: "3", caixa_id: "c1", lojista_id: "l1", tipo: "venda",      valor: 32.5,  meio_pagamento: "pix",      descricao: "Pedido #102", created_at: now },
    { id: "4", caixa_id: "c1", lojista_id: "l1", tipo: "venda",      valor: 78,    meio_pagamento: "cartao",   descricao: "Pedido #103", created_at: now },
    { id: "5", caixa_id: "c1", lojista_id: "l1", tipo: "suprimento", valor: 100,   descricao: "Troco adicional", created_at: now },
    { id: "6", caixa_id: "c1", lojista_id: "l1", tipo: "sangria",    valor: -80,   descricao: "Pagamento fornecedor", created_at: now },
  ];
}

const DEMO_CAIXA: Caixa = {
  id: "c1", lojista_id: "l1", aberto: true,
  valor_abertura: 50, aberto_em: new Date().toISOString(), created_at: new Date().toISOString(),
};

// ─── sub-components ──────────────────────────────────────────────────────────

function PaymentCard({ label, icon, value, color }: {
  label: string; icon: React.ReactNode; value: number; color: string;
}) {
  return (
    <div style={{
      flex: 1, borderRadius: 14, padding: "16px 18px",
      background: "rgba(15,23,42,0.8)", border: `1px solid ${color}33`,
      boxShadow: `0 0 18px ${color}18`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}33`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </div>
        <span style={{ color: "#64748b", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em" }}>{label}</span>
      </div>
      <p style={{ color, fontSize: 22, fontWeight: 800, margin: 0 }}>{formatCurrency(value)}</p>
    </div>
  );
}

function MovimentoRow({ mov }: { mov: MovimentoCaixa }) {
  const isPositive = mov.valor >= 0;
  const colors: Record<string, string> = {
    abertura: "#6366f1", suprimento: "#10b981", sangria: "#ef4444",
    venda: "#22d3ee", fechamento: "#f59e0b",
  };
  const labels: Record<string, string> = {
    abertura: "Abertura", suprimento: "Suprimento", sangria: "Sangria",
    venda: "Venda", fechamento: "Fechamento",
  };
  const color = colors[mov.tipo] ?? "#94a3b8";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
      borderRadius: 10, background: "#0a1120", border: "1px solid #1e293b",
    }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13, margin: 0 }}>
          {labels[mov.tipo]}
          {mov.meio_pagamento && (
            <span style={{ color: "#475569", fontWeight: 400, marginLeft: 6 }}>
              · {mov.meio_pagamento.charAt(0).toUpperCase() + mov.meio_pagamento.slice(1)}
            </span>
          )}
        </p>
        {mov.descricao && <p style={{ color: "#475569", fontSize: 11, margin: 0 }}>{mov.descricao}</p>}
      </div>
      <span style={{ color: isPositive ? "#34d399" : "#f87171", fontWeight: 700, fontSize: 14 }}>
        {isPositive ? "+" : ""}{formatCurrency(mov.valor)}
      </span>
    </div>
  );
}

// ─── modal ───────────────────────────────────────────────────────────────────

function MovModal({ title, onClose, onConfirm, loading }: {
  title: string; onClose: () => void;
  onConfirm: (valor: number, descricao: string) => void; loading: boolean;
}) {
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: "28px 24px", boxShadow: "0 32px 64px rgba(0,0,0,0.6)" }}>
        <h3 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: "0 0 20px" }}>{title}</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={{ color: "#64748b", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>VALOR (R$)</label>
          <input type="number" min="0.01" step="0.01" style={inputStyle} placeholder="0,00" value={valor} onChange={e => setValor(e.target.value)} autoFocus />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: "#64748b", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>DESCRIÇÃO (opcional)</label>
          <input type="text" style={inputStyle} placeholder="Ex: Troco para operador..." value={descricao} onChange={e => setDescricao(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...btnPrimary, flex: 1, justifyContent: "center" }} disabled={!valor || loading} onClick={() => onConfirm(parseFloat(valor), descricao)}>
            <Check size={15} /> Confirmar
          </button>
          <button style={btnGhost} onClick={onClose}><X size={15} /></button>
        </div>
      </div>
    </div>
  );
}

function FecharModal({ saldo, onClose, onConfirm, loading }: {
  saldo: number; onClose: () => void;
  onConfirm: (valorContado: number) => void; loading: boolean;
}) {
  const [contado, setContado] = useState("");
  const valorContado = parseFloat(contado) || 0;
  const diferenca = valorContado - saldo;
  const perfeito = Math.abs(diferenca) < 0.01;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
      <div style={{ width: "100%", maxWidth: 440, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: "32px 28px", boxShadow: "0 32px 64px rgba(0,0,0,0.7)" }}>
        <h3 style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 800, margin: "0 0 6px" }}>Fechar Caixa</h3>
        <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 24px" }}>Conte o dinheiro físico na gaveta e informe o valor.</p>

        <div style={{ background: "#0a1120", borderRadius: 12, padding: "14px 18px", marginBottom: 20, border: "1px solid #1e293b" }}>
          <p style={{ color: "#64748b", fontSize: 11, fontWeight: 600, margin: "0 0 4px" }}>SALDO DO SISTEMA (DINHEIRO)</p>
          <p style={{ color: "#e2e8f0", fontSize: 22, fontWeight: 800, margin: 0 }}>{formatCurrency(saldo)}</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ color: "#64748b", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>QUANTO TEM NA GAVETA? (R$)</label>
          <input type="number" min="0" step="0.01" style={{ ...inputStyle, fontSize: 20, fontWeight: 700, textAlign: "center" }} placeholder="0,00" value={contado} onChange={e => setContado(e.target.value)} autoFocus />
        </div>

        {contado && (
          <div style={{
            borderRadius: 14, padding: "16px 20px", marginBottom: 20, textAlign: "center",
            background: perfeito ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${perfeito ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            boxShadow: `0 0 24px ${perfeito ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)"}`,
          }}>
            {perfeito ? (
              <>
                <div style={{ fontSize: 36, marginBottom: 6 }}>✅</div>
                <p style={{ color: "#34d399", fontWeight: 800, fontSize: 18, margin: 0 }}>Caixa Perfeito!</p>
                <p style={{ color: "#10b981", fontSize: 13, margin: 0 }}>Nenhuma diferença encontrada.</p>
              </>
            ) : (
              <>
                <div style={{ fontSize: 36, marginBottom: 6 }}>⚠️</div>
                <p style={{ color: "#f87171", fontWeight: 800, fontSize: 18, margin: 0 }}>
                  Diferença de {formatCurrency(Math.abs(diferenca))}
                </p>
                <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
                  {diferenca > 0 ? "Sobra na gaveta" : "Falta na gaveta"}
                </p>
              </>
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button style={btnGhost} onClick={onClose} disabled={loading}><X size={15} /> Cancelar</button>
          <button
            style={{ ...btnDanger, flex: 1, justifyContent: "center", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)" }}
            disabled={!contado || loading}
            onClick={() => onConfirm(valorContado)}
          >
            Fechar Caixa
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── main panel ──────────────────────────────────────────────────────────────

interface Props {
  lojista: Lojista;
  isDemo: boolean;
}

export default function CaixaPanel({ lojista, isDemo }: Props) {
  const [caixa, setCaixa] = useState<Caixa | null>(isDemo ? DEMO_CAIXA : null);
  const [movimentos, setMovimentos] = useState<MovimentoCaixa[]>(isDemo ? makeDemoMovimentos() : []);
  const [loading, setLoading] = useState(!isDemo);
  const [acting, setActing] = useState(false);
  const [modal, setModal] = useState<"suprimento" | "sangria" | "fechar" | "abrir" | null>(null);
  const [valorAbertura, setValorAbertura] = useState("50");

  // ── computed totals ──────────────────────────────────────────────────────
  const totalDinheiro = movimentos
    .filter(m => m.tipo === "venda" && m.meio_pagamento === "dinheiro")
    .reduce((s, m) => s + m.valor, 0);
  const totalPix = movimentos
    .filter(m => m.tipo === "venda" && m.meio_pagamento === "pix")
    .reduce((s, m) => s + m.valor, 0);
  const totalCartao = movimentos
    .filter(m => m.tipo === "venda" && m.meio_pagamento === "cartao")
    .reduce((s, m) => s + m.valor, 0);

  // saldo esperado em caixa (abertura + suprimentos + sangrias + vendas dinheiro)
  const saldoSistema = movimentos.reduce((s, m) => s + m.valor, 0);

  // ── fetch ────────────────────────────────────────────────────────────────
  const fetchCaixa = useCallback(async () => {
    if (isDemo) return;
    setLoading(true);
    const { data: caixaData } = await supabase
      .from("caixas")
      .select("*")
      .eq("lojista_id", lojista.id)
      .eq("aberto", true)
      .maybeSingle();

    if (caixaData) {
      setCaixa(caixaData as Caixa);
      const { data: movs } = await supabase
        .from("movimentos_caixa")
        .select("*")
        .eq("caixa_id", caixaData.id)
        .order("created_at");
      setMovimentos((movs as MovimentoCaixa[]) ?? []);
    } else {
      setCaixa(null);
      setMovimentos([]);
    }
    setLoading(false);
  }, [lojista.id, isDemo]);

  useEffect(() => { fetchCaixa(); }, [fetchCaixa]);

  // ── actions ──────────────────────────────────────────────────────────────
  async function abrirCaixa() {
    const valor = parseFloat(valorAbertura) || 0;
    if (isDemo) {
      const novoCaixa: Caixa = { id: "c-new", lojista_id: lojista.id, aberto: true, valor_abertura: valor, aberto_em: new Date().toISOString(), created_at: new Date().toISOString() };
      const aberturaMov: MovimentoCaixa = { id: "m-open", caixa_id: "c-new", lojista_id: lojista.id, tipo: "abertura", valor, descricao: "Fundo de caixa", created_at: new Date().toISOString() };
      setCaixa(novoCaixa);
      setMovimentos([aberturaMov]);
      setModal(null);
      return;
    }
    setActing(true);
    const { data: newCaixa } = await supabase.from("caixas").insert({ lojista_id: lojista.id, aberto: true, valor_abertura: valor, aberto_em: new Date().toISOString() }).select().single();
    if (newCaixa) {
      await supabase.from("movimentos_caixa").insert({ caixa_id: newCaixa.id, lojista_id: lojista.id, tipo: "abertura", valor, descricao: "Fundo de caixa" });
      await fetchCaixa();
    }
    setActing(false);
    setModal(null);
  }

  async function addMovimento(tipo: "suprimento" | "sangria", valor: number, descricao: string) {
    if (!caixa) return;
    const valorFinal = tipo === "sangria" ? -Math.abs(valor) : Math.abs(valor);
    if (isDemo) {
      const nov: MovimentoCaixa = { id: `m-${Date.now()}`, caixa_id: caixa.id, lojista_id: lojista.id, tipo, valor: valorFinal, descricao, created_at: new Date().toISOString() };
      setMovimentos(prev => [...prev, nov]);
      setModal(null);
      return;
    }
    setActing(true);
    await supabase.from("movimentos_caixa").insert({ caixa_id: caixa.id, lojista_id: lojista.id, tipo, valor: valorFinal, descricao });
    await fetchCaixa();
    setActing(false);
    setModal(null);
  }

  async function fecharCaixa(valorContado: number) {
    if (!caixa) return;
    const diferenca = valorContado - saldoSistema;
    if (isDemo) {
      setCaixa(prev => prev ? { ...prev, aberto: false, valor_fechamento_operador: valorContado, diferenca, fechado_em: new Date().toISOString() } : prev);
      setModal(null);
      return;
    }
    setActing(true);
    await supabase.from("caixas").update({ aberto: false, valor_fechamento_sistema: saldoSistema, valor_fechamento_operador: valorContado, diferenca, fechado_em: new Date().toISOString() }).eq("id", caixa.id);
    await supabase.from("movimentos_caixa").insert({ caixa_id: caixa.id, lojista_id: lojista.id, tipo: "fechamento", valor: 0, descricao: `Fechado. Contado: ${formatCurrency(valorContado)}` });
    setCaixa(null);
    setMovimentos([]);
    setActing(false);
    setModal(null);
  }

  // ── render ───────────────────────────────────────────────────────────────
  const isOpen = caixa?.aberto ?? false;
  const glowColor = isOpen ? "#10b981" : "#ef4444";

  if (loading) {
    return <div style={{ color: "#64748b", textAlign: "center", padding: "4rem" }}>Carregando caixa...</div>;
  }

  return (
    <div>
      {isDemo && demoWarning}
      {sectionTitle("Gestão de Caixa")}

      {/* ── Status Header Card ─────────────────────────────────────────── */}
      <div style={{
        ...cardStyle,
        marginTop: 20,
        border: `1px solid ${glowColor}44`,
        boxShadow: `0 0 32px ${glowColor}22, 0 0 64px ${glowColor}0a`,
        transition: "all 0.4s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          {/* Status indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${glowColor}18`, border: `2px solid ${glowColor}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Package size={24} color={glowColor} />
              </div>
              <span style={{ position: "absolute", bottom: -3, right: -3, width: 14, height: 14, borderRadius: "50%", background: glowColor, border: "2px solid #0f172a", boxShadow: `0 0 8px ${glowColor}` }} />
            </div>
            <div>
              <p style={{ color: glowColor, fontWeight: 800, fontSize: 18, margin: 0 }}>
                {isOpen ? "Caixa Aberto" : "Caixa Fechado"}
              </p>
              <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>
                {isOpen
                  ? `Aberto às ${new Date(caixa!.aberto_em).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · Fundo: ${formatCurrency(caixa!.valor_abertura)}`
                  : "Clique em Abrir Caixa para iniciar o turno"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {isOpen ? (
              <>
                <button
                  style={{ ...btnGhost, gap: 6, borderColor: "#10b98133", color: "#34d399" }}
                  onClick={() => setModal("suprimento")}
                >
                  <Plus size={15} /> Suprimento
                </button>
                <button
                  style={{ ...btnGhost, gap: 6, borderColor: "#ef444433", color: "#f87171" }}
                  onClick={() => setModal("sangria")}
                >
                  <Minus size={15} /> Sangria
                </button>
                <button
                  style={{ ...btnDanger, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)" }}
                  onClick={() => setModal("fechar")}
                >
                  Fechar Caixa
                </button>
              </>
            ) : (
              <button style={btnPrimary} onClick={() => setModal("abrir")}>
                <Package size={15} /> Abrir Caixa
              </button>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <>
          {/* ── Payment Summary Cards ────────────────────────────────────── */}
          <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
            <PaymentCard label="DINHEIRO" icon={<DollarSign size={15} color="#34d399" />} value={totalDinheiro} color="#10b981" />
            <PaymentCard label="PIX" icon={<Smartphone size={15} color="#60a5fa" />} value={totalPix} color="#3b82f6" />
            <PaymentCard label="CARTÃO" icon={<CreditCard size={15} color="#c084fc" />} value={totalCartao} color="#a855f7" />
          </div>

          {/* ── Saldo Total ──────────────────────────────────────────────── */}
          <div style={{
            ...cardStyle, marginTop: 12, display: "flex", alignItems: "center",
            justifyContent: "space-between", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <TrendingUp size={18} color="#a5b4fc" />
              <span style={{ color: "#94a3b8", fontSize: 14, fontWeight: 600 }}>Saldo Esperado na Gaveta</span>
            </div>
            <span style={{ color: "#a5b4fc", fontSize: 22, fontWeight: 800 }}>{formatCurrency(saldoSistema)}</span>
          </div>

          {/* ── Movements Log ────────────────────────────────────────────── */}
          <div style={{ ...cardStyle, marginTop: 20 }}>
            <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>MOVIMENTAÇÕES DO TURNO</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {movimentos.length === 0
                ? <p style={{ color: "#334155", textAlign: "center", padding: "2rem" }}>Nenhuma movimentação ainda.</p>
                : movimentos.map(m => <MovimentoRow key={m.id} mov={m} />)
              }
            </div>
          </div>
        </>
      )}

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {modal === "suprimento" && (
        <MovModal title="Suprimento — Adicionar Dinheiro" onClose={() => setModal(null)} loading={acting}
          onConfirm={(v, d) => addMovimento("suprimento", v, d)} />
      )}
      {modal === "sangria" && (
        <MovModal title="Sangria — Retirar Dinheiro" onClose={() => setModal(null)} loading={acting}
          onConfirm={(v, d) => addMovimento("sangria", v, d)} />
      )}
      {modal === "fechar" && (
        <FecharModal saldo={saldoSistema} onClose={() => setModal(null)} loading={acting} onConfirm={fecharCaixa} />
      )}

      {/* Abrir caixa modal */}
      {modal === "abrir" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ width: "100%", maxWidth: 380, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: "28px 24px" }}>
            <h3 style={{ color: "#f1f5f9", fontSize: 17, fontWeight: 800, margin: "0 0 20px" }}>Abrir Caixa</h3>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: "#64748b", fontSize: 11, fontWeight: 600, display: "block", marginBottom: 6 }}>FUNDO DE CAIXA (R$)</label>
              <input type="number" min="0" step="0.01" style={inputStyle} value={valorAbertura} onChange={e => setValorAbertura(e.target.value)} autoFocus />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ ...btnPrimary, flex: 1, justifyContent: "center" }} disabled={acting} onClick={abrirCaixa}>
                <Check size={15} /> Abrir Turno
              </button>
              <button style={btnGhost} onClick={() => setModal(null)}><X size={15} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
