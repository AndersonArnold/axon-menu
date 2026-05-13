"use client";

import { useState } from "react";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";

const MANAGER_PASSWORD = "admin123";

export default function AuthGate({ onSuccess }: { onSuccess: () => void }) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value === MANAGER_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setTimeout(() => setError(false), 2500);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #070b12 0%, #0f172a 50%, #1a1f35 100%)",
        padding: "1.5rem",
      }}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auth-card { animation: fadeInUp 0.4s ease forwards; }
        .auth-shake { animation: shake 0.5s ease; }
      `}</style>

      <div
        className={`auth-card ${shake ? "auth-shake" : ""}`}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(15,23,42,0.95)",
          border: "1px solid #1e293b",
          borderRadius: 20,
          padding: "2.5rem 2rem",
          boxShadow: "0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Icon */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 32px rgba(99,102,241,0.35)",
              marginBottom: 16,
            }}
          >
            <ShieldCheck size={36} color="#fff" />
          </div>
          <h1 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>
            Acesso Restrito
          </h1>
          <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
            Digite a senha de gerente para continuar
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: 8, color: "#94a3b8", fontSize: 12, fontWeight: 600, letterSpacing: "0.06em" }}>
            SENHA DE GERENTE
          </label>
          <div style={{ position: "relative", marginBottom: 20 }}>
            <input
              id="manager-password"
              type={show ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="••••••••"
              autoFocus
              style={{
                width: "100%",
                padding: "13px 44px 13px 16px",
                borderRadius: 12,
                border: `1px solid ${error ? "#ef4444" : "#1e293b"}`,
                background: "#0f172a",
                color: "#f1f5f9",
                fontSize: 16,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
                fontFamily: "inherit",
              }}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#475569",
                cursor: "pointer",
                padding: 4,
                display: "flex",
              }}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p style={{ color: "#f87171", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
              ❌ Senha incorreta. Tente novamente.
            </p>
          )}

          <button
            id="auth-submit"
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 12,
              border: "none",
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}
          >
            Entrar no Painel
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 16, color: "#334155", fontSize: 11 }}>
          Axon Menu Admin • Acesso gerencial
        </p>
      </div>
    </div>
  );
}
