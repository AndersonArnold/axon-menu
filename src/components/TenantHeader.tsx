"use client";

import Image from "next/image";
import { MapPin, Phone } from "lucide-react";
import { Lojista } from "@/lib/types";
import StoreStatusBadge from "./StoreStatusBadge";

/** Foto hero padrão (hambúrgueres / ingredientes) quando o lojista não cadastrou banner */
const DEFAULT_BANNER_SRC =
  "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1920&q=90";

interface TenantHeaderProps {
  lojista: Lojista;
}

function resolveBannerUrl(lojista: Lojista): string {
  const u = lojista.banner_url?.trim();
  if (u) return u;
  return DEFAULT_BANNER_SRC;
}

export default function TenantHeader({ lojista }: TenantHeaderProps) {
  const bannerSrc = resolveBannerUrl(lojista);

  return (
    <header className="w-full">
      {/* ── Banner (sempre com foto HD: cadastrada ou padrão) ── */}
      <div className="relative w-full h-48 sm:h-60 bg-[#0f172a] overflow-hidden">
        <Image
          src={bannerSrc}
          alt={`Ambiente e cardápio — ${lojista.nome}`}
          fill
          className="object-cover object-center scale-105 sm:scale-100"
          priority
          sizes="100vw"
        />
        {/* Leitura do nome sobre a foto + transição suave para o bloco inferior */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-[#1e293b]/55 via-45% to-black/25 pointer-events-none"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 z-[1] flex justify-center px-4 pb-2 pointer-events-none">
          <h1 className="text-center text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] max-w-[90vw] leading-tight">
            {lojista.nome}
          </h1>
        </div>
      </div>

      {/* ── Info section (dark card) ── */}
      <div className="bg-[#1e293b] px-4 pb-5 pt-0 relative z-[2]">
        {/* Logo: overlaps banner */}
        <div className="flex justify-center -mt-12 sm:-mt-14 mb-2">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden relative z-10 flex-shrink-0 ring-4 ring-[#1e293b]"
            style={{
              border: `3px solid ${lojista.cor_primaria}`,
              boxShadow: `0 0 0 1px ${lojista.cor_primaria}40, 0 10px 28px ${lojista.cor_primaria}45`,
            }}
          >
            {lojista.logo_url ? (
              <Image
                src={lojista.logo_url}
                alt={`Logo de ${lojista.nome}`}
                width={96}
                height={96}
                className="object-cover w-full h-full"
                priority
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                style={{ background: lojista.cor_primaria }}
              >
                {lojista.nome.replace(/[^a-zA-ZÀ-ÿ0-9]/g, "").charAt(0).toUpperCase() ||
                  lojista.nome.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {lojista.descricao && (
          <p className="text-center text-sm text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
            {lojista.descricao}
          </p>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
          <StoreStatusBadge grade={lojista.grade_horarios} />

          {lojista.telefone && (
            <a
              href={`tel:${lojista.telefone}`}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              <Phone size={12} />
              <span>{lojista.telefone}</span>
            </a>
          )}

          {lojista.endereco && (
            lojista.google_maps_url ? (
              <a
                href={lojista.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors underline-offset-2 hover:underline"
              >
                <MapPin size={12} />
                <span className="max-w-[180px] truncate">{lojista.endereco}</span>
              </a>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                <MapPin size={12} />
                <span className="max-w-[180px] truncate">{lojista.endereco}</span>
              </span>
            )
          )}
        </div>

        <div className="mt-5 h-px w-full bg-[#334155]" />
      </div>
    </header>
  );
}
