"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadLojistaImage, MediaUploadError } from "@/lib/media-upload";
import type { Lojista } from "@/lib/types";
import {
  Check, Save, Image as ImageIcon, Phone, MapPin, Link as LinkIcon,
} from "lucide-react";
import {
  cardStyle, sectionTitle, btnPrimary, inputStyle, demoWarning,
} from "./styles";
import ImageUploader from "./ImageUploader";

interface Props {
  lojista: Lojista;
  setLojista: React.Dispatch<React.SetStateAction<Lojista | null>>;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  isDemo: boolean;
}

export default function StoreProfilePanel({
  lojista,
  setLojista,
  saving,
  setSaving,
  isDemo,
}: Props) {
  const [telefone, setTelefone] = useState(lojista.telefone ?? "");
  const [endereco, setEndereco] = useState(lojista.endereco ?? "");
  const [mapsUrl, setMapsUrl] = useState(lojista.google_maps_url ?? "");
  const [saved, setSaved] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  // ── Upload handlers ──────────────────────────────────────────────────────
  async function handleBannerUpload(file: File): Promise<string> {
    if (isDemo) {
      // In demo mode return local blob without hitting Supabase
      return URL.createObjectURL(file);
    }
    setUploadErr(null);
    try {
      const { url } = await uploadLojistaImage(file, lojista.id, "banner");
      // Persist immediately
      await supabase
        .from("lojistas")
        .update({ banner_url: url })
        .eq("id", lojista.id);
      setLojista((prev) => (prev ? { ...prev, banner_url: url } : prev));
      return url;
    } catch (err) {
      const msg = err instanceof MediaUploadError ? err.message : "Erro no upload do banner.";
      setUploadErr(msg);
      throw err;
    }
  }

  async function handleLogoUpload(file: File): Promise<string> {
    if (isDemo) {
      return URL.createObjectURL(file);
    }
    setUploadErr(null);
    try {
      const { url } = await uploadLojistaImage(file, lojista.id, "logo");
      await supabase
        .from("lojistas")
        .update({ logo_url: url })
        .eq("id", lojista.id);
      setLojista((prev) => (prev ? { ...prev, logo_url: url } : prev));
      return url;
    } catch (err) {
      const msg = err instanceof MediaUploadError ? err.message : "Erro no upload do logo.";
      setUploadErr(msg);
      throw err;
    }
  }

  // ── Save contact/location fields ─────────────────────────────────────────
  async function handleSave() {
    if (saving) return;
    setSaving(true);

    const updates: Partial<Lojista> = {
      telefone: telefone.trim() || undefined,
      endereco: endereco.trim() || undefined,
      google_maps_url: mapsUrl.trim() || undefined,
    };

    if (!isDemo) {
      await supabase.from("lojistas").update({
        telefone: telefone.trim() || null,
        endereco: endereco.trim() || null,
        google_maps_url: mapsUrl.trim() || null,
      }).eq("id", lojista.id);
    }

    setLojista((prev) => (prev ? { ...prev, ...updates } : prev));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }


  // ── Helpers ──────────────────────────────────────────────────────────────
  const labelStyle = {
    color: "#64748b",
    fontSize: 11,
    fontWeight: 600 as const,
    letterSpacing: "0.06em",
    display: "block" as const,
    marginBottom: 6,
  };

  const fieldWrap = { marginBottom: 20 };

  const sectionHeader = (icon: React.ReactNode, title: string, subtitle: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "rgba(99,102,241,0.12)",
          border: "1px solid rgba(99,102,241,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 15, margin: 0 }}>{title}</p>
        <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div>
      {isDemo && demoWarning}
      {sectionTitle("Perfil da Loja")}

      {uploadErr && (
        <div
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10,
            padding: "10px 16px",
            color: "#f87171",
            fontSize: 13,
            marginTop: 12,
          }}
        >
          ❌ {uploadErr}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 20 }}>
        {/* ── Identidade Visual ─────────────────────────────────────────── */}
        <div style={cardStyle}>
          {sectionHeader(
            <ImageIcon size={18} color="#a5b4fc" />,
            "Identidade Visual",
            "Clique ou arraste para enviar do dispositivo"
          )}

          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            {/* Banner uploader (rect) */}
            <div style={{ flex: 1 }}>
              <ImageUploader
                inputId="banner-upload"
                label="BANNER (CAPA DO TOPO)"
                shape="rect"
                currentUrl={lojista.banner_url ?? undefined}
                onUpload={handleBannerUpload}
                hint="Recomendado: 1920×480px — JPG ou WebP"
                disabled={saving}
              />
            </div>

            {/* Logo uploader (circle) */}
            <div style={{ flexShrink: 0 }}>
              <ImageUploader
                inputId="logo-upload"
                label="LOGO (CÍRCULO)"
                shape="circle"
                currentUrl={lojista.logo_url ?? undefined}
                onUpload={handleLogoUpload}
                hint="400×400px PNG"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* ── Contato e Localização ─────────────────────────────────────── */}
        <div style={cardStyle}>
          {sectionHeader(
            <MapPin size={18} color="#a5b4fc" />,
            "Contato e Localização",
            "Dados que aparecem no cardápio do cliente"
          )}

          <div style={fieldWrap}>
            <label htmlFor="whatsapp" style={labelStyle}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Phone size={12} />
                WHATSAPP DE VENDAS
              </span>
            </label>
            <input
              id="whatsapp"
              type="tel"
              style={inputStyle}
              placeholder="(11) 99999-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
            <p style={{ color: "#475569", fontSize: 11, marginTop: 4 }}>
              Número que recebe os pedidos via WhatsApp
            </p>
          </div>

          <div style={fieldWrap}>
            <label htmlFor="endereco" style={labelStyle}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={12} />
                ENDEREÇO FÍSICO
              </span>
            </label>
            <input
              id="endereco"
              type="text"
              style={inputStyle}
              placeholder="Rua Exemplo, 123 — Bairro, Cidade, UF"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
          </div>

          <div style={fieldWrap}>
            <label htmlFor="maps-url" style={labelStyle}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <LinkIcon size={12} />
                LINK DO GOOGLE MAPS
              </span>
            </label>
            <input
              id="maps-url"
              type="url"
              style={inputStyle}
              placeholder="https://maps.google.com/..."
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
            />
            <p style={{ color: "#475569", fontSize: 11, marginTop: 4 }}>
              Google Maps → Compartilhar → Copiar link
            </p>
          </div>

          {mapsUrl.trim() && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "#34d399",
                fontSize: 12,
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              <MapPin size={13} />
              Testar link do Maps ↗
            </a>
          )}
        </div>

        {/* Save button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            id="save-profile"
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
            onClick={handleSave}
            disabled={saving}
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? "Salvando..." : saved ? "Salvo com sucesso!" : "Salvar Contato"}
          </button>
        </div>
      </div>
    </div>
  );
}
