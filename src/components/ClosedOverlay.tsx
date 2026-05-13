"use client";

import { AlertTriangle } from "lucide-react";

interface ClosedOverlayProps {
  storeName: string;
  scheduleLabel: string;
  primaryColor: string;
}

export default function ClosedOverlay({
  storeName,
  scheduleLabel,
  primaryColor,
}: ClosedOverlayProps) {
  return (
    <div
      id="closed-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm px-6"
      role="alertdialog"
      aria-modal="true"
      aria-label="Loja fechada"
    >
      <div className="animate-scale-in bg-[#1e293b] border border-[#334155] rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center">
        <div
          className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
          style={{ background: `${primaryColor}18`, border: `1px solid ${primaryColor}35` }}
        >
          <AlertTriangle size={30} style={{ color: primaryColor }} />
        </div>

        <h2 className="text-lg font-bold text-slate-100">
          {storeName} está fechada
        </h2>

        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Horário de hoje:{" "}
          <span className="font-semibold text-slate-200">{scheduleLabel}</span>
        </p>

        <p className="mt-2 text-xs text-slate-600">
          Mas você pode navegar pelo cardápio e se preparar! 🍽️
        </p>

        <button
          onClick={() => {
            const el = document.getElementById("closed-overlay");
            if (el) {
              el.style.opacity = "0";
              el.style.transition = "opacity 0.3s ease";
              setTimeout(() => el.remove(), 300);
            }
          }}
          id="closed-overlay-dismiss"
          className="mt-6 w-full py-3 rounded-2xl text-white font-bold text-sm shadow-lg active:scale-[0.98] transition-transform"
          style={{
            background: primaryColor,
            boxShadow: `0 4px 16px ${primaryColor}50`,
          }}
        >
          Ver Cardápio Mesmo Assim
        </button>
      </div>
    </div>
  );
}
