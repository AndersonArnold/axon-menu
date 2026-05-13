"use client";

import { CSSProperties } from "react";

export const cardStyle: CSSProperties = {
  background: "rgba(15,23,42,0.8)",
  border: "1px solid #1e293b",
  borderRadius: 14,
  padding: "14px 18px",
  backdropFilter: "blur(10px)",
};

export const inputStyle: CSSProperties = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: 10,
  padding: "10px 14px",
  color: "#f1f5f9",
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};

export const btnPrimary: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 16px",
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
  fontFamily: "inherit",
  boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
};

export const btnGhost: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 12px",
  borderRadius: 10,
  border: "1px solid #1e293b",
  background: "transparent",
  color: "#64748b",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
};

export const btnDanger: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "9px 16px",
  borderRadius: 10,
  border: "1px solid #ef444433",
  background: "rgba(239,68,68,0.08)",
  color: "#f87171",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
};

export const btnSuccess: CSSProperties = {
  ...btnPrimary,
  background: "linear-gradient(135deg, #059669, #10b981)",
  boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
};

export function sectionTitle(text: string) {
  return (
    <h2 style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 800, margin: 0 }}>
      {text}
    </h2>
  );
}

export const demoWarning = (
  <div style={{
    background: "rgba(234,179,8,0.08)",
    border: "1px solid rgba(234,179,8,0.3)",
    borderRadius: 12,
    padding: "10px 16px",
    marginBottom: 20,
    color: "#fbbf24",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 8,
  }}>
    ⚠️ Modo Demo — alterações ficam apenas em memória e não são persistidas.
  </div>
);
