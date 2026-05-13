"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Lojista } from "@/lib/types";
import type { DiasSemana, GradeHorarios } from "@/lib/types";
import { Check, Save } from "lucide-react";
import { cardStyle, sectionTitle, btnPrimary, inputStyle, demoWarning } from "./styles";

interface Props {
  lojista: Lojista;
  setLojista: React.Dispatch<React.SetStateAction<Lojista | null>>;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  isDemo: boolean;
}

type StatusMode = "auto" | "aberto" | "fechado";

const DIAS: { key: DiasSemana; label: string }[] = [
  { key: "segunda", label: "Segunda-feira" },
  { key: "terca", label: "Terça-feira" },
  { key: "quarta", label: "Quarta-feira" },
  { key: "quinta", label: "Quinta-feira" },
  { key: "sexta", label: "Sexta-feira" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

export default function StoreSettingsPanel({ lojista, setLojista, saving, setSaving, isDemo }: Props) {
  const [status, setStatus] = useState<StatusMode>("auto");
  const [taxa, setTaxa] = useState(String(lojista.taxa_entrega ?? 0));
  const [grade, setGrade] = useState<GradeHorarios>({ ...lojista.grade_horarios });
  const [saved, setSaved] = useState(false);

  function updateDia(dia: DiasSemana, field: "aberto" | "abertura" | "fechamento", value: string | boolean) {
    setGrade((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], [field]: value },
    }));
  }

  async function saveSettings() {
    if (saving) return;
    setSaving(true);
    const taxaNum = parseFloat(taxa) || 0;
    const updates = { taxa_entrega: taxaNum, grade_horarios: grade };
    if (!isDemo) {
      await supabase.from("lojistas").update(updates).eq("id", lojista.id);
    }
    setLojista((prev) => prev ? { ...prev, ...updates } : prev);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const statusBtnBase = {
    flex: 1,
    padding: "18px 12px",
    borderRadius: 14,
    border: "2px solid",
    cursor: "pointer" as const,
    fontFamily: "inherit",
    fontWeight: 700 as const,
    fontSize: 14,
    transition: "all 0.2s",
    display: "flex" as const,
    flexDirection: "column" as const,
    alignItems: "center" as const,
    gap: 6,
  };

  const labelStyle = { color: "#64748b", fontSize: 11, fontWeight: 600 as const, letterSpacing: "0.06em", display: "block" as const, marginBottom: 6 };

  return (
    <div>
      {isDemo && demoWarning}
      {sectionTitle("Configurações da Loja")}

      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 20 }}>

        {/* Status Mode */}
        <div style={cardStyle}>
          <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>STATUS DA LOJA</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              style={{
                ...statusBtnBase,
                borderColor: status === "auto" ? "#6366f1" : "#1e293b",
                background: status === "auto" ? "rgba(99,102,241,0.12)" : "#0f172a",
                color: status === "auto" ? "#a5b4fc" : "#64748b",
              }}
              onClick={() => setStatus("auto")}
            >
              <span style={{ fontSize: 24 }}>🕐</span>
              <span>Automático</span>
              <span style={{ fontSize: 11, fontWeight: 400 }}>Segue os horários</span>
            </button>
            <button
              style={{
                ...statusBtnBase,
                borderColor: status === "aberto" ? "#10b981" : "#1e293b",
                background: status === "aberto" ? "rgba(16,185,129,0.1)" : "#0f172a",
                color: status === "aberto" ? "#34d399" : "#64748b",
              }}
              onClick={() => setStatus("aberto")}
            >
              <span style={{ fontSize: 24 }}>✅</span>
              <span>Forçar Aberto</span>
              <span style={{ fontSize: 11, fontWeight: 400 }}>Sempre visível</span>
            </button>
            <button
              style={{
                ...statusBtnBase,
                borderColor: status === "fechado" ? "#ef4444" : "#1e293b",
                background: status === "fechado" ? "rgba(239,68,68,0.08)" : "#0f172a",
                color: status === "fechado" ? "#f87171" : "#64748b",
              }}
              onClick={() => setStatus("fechado")}
            >
              <span style={{ fontSize: 24 }}>🔴</span>
              <span>Forçar Fechado</span>
              <span style={{ fontSize: 11, fontWeight: 400 }}>Exibe aviso fechado</span>
            </button>
          </div>
        </div>

        {/* Taxa de entrega */}
        <div style={cardStyle}>
          <label style={labelStyle}>TAXA DE ENTREGA (R$)</label>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              id="taxa-entrega"
              type="number"
              step="0.01"
              min="0"
              style={{ ...inputStyle, maxWidth: 200 }}
              value={taxa}
              onChange={(e) => setTaxa(e.target.value)}
            />
            <span style={{ color: "#64748b", fontSize: 13 }}>
              Atual: <strong style={{ color: "#e2e8f0" }}>R$ {(parseFloat(taxa) || 0).toFixed(2)}</strong>
            </span>
          </div>
        </div>

        {/* Grade de horários */}
        <div style={cardStyle}>
          <p style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>HORÁRIOS DE FUNCIONAMENTO</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DIAS.map(({ key, label }) => {
              const dia = grade[key];
              return (
                <div
                  key={key}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "160px 56px 1fr",
                    alignItems: "center",
                    gap: 16,
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: dia.aberto ? "rgba(99,102,241,0.05)" : "#0a1120",
                    border: `1px solid ${dia.aberto ? "#1e293b" : "#0f172a"}`,
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ color: dia.aberto ? "#e2e8f0" : "#334155", fontWeight: 600, fontSize: 14 }}>{label}</span>

                  {/* Toggle */}
                  <button
                    onClick={() => updateDia(key, "aberto", !dia.aberto)}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      border: "none",
                      background: dia.aberto ? "#6366f1" : "#1e293b",
                      position: "relative",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    <span style={{
                      position: "absolute",
                      top: 3,
                      left: dia.aberto ? 23 : 3,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#fff",
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    }} />
                  </button>

                  {/* Time inputs */}
                  {dia.aberto ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        type="time"
                        value={dia.abertura}
                        onChange={(e) => updateDia(key, "abertura", e.target.value)}
                        style={{ ...inputStyle, width: 120 }}
                      />
                      <span style={{ color: "#475569", fontSize: 13 }}>até</span>
                      <input
                        type="time"
                        value={dia.fechamento}
                        onChange={(e) => updateDia(key, "fechamento", e.target.value)}
                        style={{ ...inputStyle, width: 120 }}
                      />
                    </div>
                  ) : (
                    <span style={{ color: "#334155", fontSize: 13 }}>Fechado</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            id="save-settings"
            style={{
              ...btnPrimary,
              padding: "12px 28px",
              fontSize: 14,
              background: saved
                ? "linear-gradient(135deg, #059669, #10b981)"
                : "linear-gradient(135deg, #4f46e5, #7c3aed)",
              boxShadow: saved
                ? "0 4px 16px rgba(16,185,129,0.35)"
                : "0 4px 16px rgba(99,102,241,0.35)",
            }}
            onClick={saveSettings}
            disabled={saving}
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar Configurações"}
          </button>
        </div>
      </div>
    </div>
  );
}
