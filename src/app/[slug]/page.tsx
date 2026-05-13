import { notFound } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { isStoreOpen, getTodayScheduleLabel } from "@/lib/schedule";
import TenantHeader from "@/components/TenantHeader";
import MenuClient from "@/components/MenuClient";
import ClosedOverlay from "@/components/ClosedOverlay";
import {
  DEMO_LOJISTA,
  DEMO_CATEGORIAS,
  DEMO_PRODUTOS,
} from "@/lib/mock-data";
import { fetchTenantMenuFromSupabase } from "@/lib/fetch-tenant-menu";
import type { TenantMenuPayload } from "@/lib/fetch-tenant-menu";
import { isSupabaseConfigured } from "@/lib/supabase-config";

// ── Edge Runtime for maximum performance via CDN edge nodes ──────────────
export const runtime = "edge";

// ── Dynamic metadata based on lojista data ───────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fallback metadata for demo or unconfigured DB
  if (slug === "demo" || !isSupabaseConfigured()) {
    return {
      title: `${DEMO_LOJISTA.nome} | Cardápio Digital`,
      description: DEMO_LOJISTA.descricao,
    };
  }

  const supabase = createSupabaseClient();
  const { data } = await supabase
    .from("lojistas")
    .select("nome, descricao, logo_url")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Cardápio | Axon Menu" };

  return {
    title: `${data.nome} | Cardápio Digital`,
    description: data.descricao ?? `Veja o cardápio completo de ${data.nome}`,
    openGraph: {
      title: data.nome,
      description: data.descricao ?? "",
      images: data.logo_url ? [{ url: data.logo_url }] : [],
    },
  };
}

async function fetchTenantData(slug: string): Promise<TenantMenuPayload | null> {
  if (slug === "demo" || !isSupabaseConfigured()) {
    return {
      lojista: DEMO_LOJISTA,
      categorias: DEMO_CATEGORIAS,
      produtos: DEMO_PRODUTOS,
    };
  }

  return fetchTenantMenuFromSupabase(slug);
}

// ── Page Component ───────────────────────────────────────────────────────
export default async function TenantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const tenantData = await fetchTenantData(slug);
  if (!tenantData) notFound();

  const { lojista, categorias, produtos } = tenantData;

  const storeIsOpen = isStoreOpen(lojista.grade_horarios);
  const scheduleLabel = getTodayScheduleLabel(lojista.grade_horarios);

  // ── Anti-FOUC: inject primary color as CSS variable in <head> ──────────
  // This CSS block is server-rendered and present on the very first paint,
  // eliminating any flash of unstyled content (FOUC) for dynamic theming.
  const colorCSS = `:root { --primary-color: ${lojista.cor_primaria}; }`;

  return (
    <>
      {/* Zero-FOUC primary color injection — server-rendered */}
      <style dangerouslySetInnerHTML={{ __html: colorCSS }} />

      <div className="min-h-screen bg-[var(--surface-page)]">
        <TenantHeader lojista={lojista} />

        {/* Closed store overlay */}
        {!storeIsOpen && (
          <div>
            <ClosedOverlay
              storeName={lojista.nome}
              scheduleLabel={scheduleLabel}
              primaryColor={lojista.cor_primaria}
            />
          </div>
        )}

        {/* Stories nav + product grid */}
        <MenuClient
          categorias={categorias}
          produtos={produtos}
          primaryColor={lojista.cor_primaria}
          storeSlug={lojista.slug}
          storeName={lojista.nome}
          merchantWhatsApp={lojista.telefone ?? ""}
          gradeHorarios={lojista.grade_horarios}
          taxaEntregaInitial={lojista.taxa_entrega ?? 0}
        />
      </div>
    </>
  );
}
