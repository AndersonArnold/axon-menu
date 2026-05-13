import { createSupabaseClient } from "@/lib/supabase";
import type { Categoria, Lojista, Produto } from "@/lib/types";

/** Supabase `numeric` pode vir como string no JSON — normaliza para número */
function normalizePreco(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string") {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function mapProduto(row: Produto): Produto {
  return { ...row, preco: normalizePreco(row.preco) };
}

function mapLojista(row: Lojista): Lojista {
  const r = row as Lojista & { taxa_entrega?: unknown };
  return {
    ...row,
    taxa_entrega: normalizePreco(r.taxa_entrega ?? 0),
  };
}

export type TenantMenuPayload = {
  lojista: Lojista;
  categorias: Categoria[];
  produtos: Produto[];
};

/**
 * Carrega lojista por slug + categorias e produtos (multi-tenant por `lojista_id`).
 */
export async function fetchTenantMenuFromSupabase(
  slug: string
): Promise<TenantMenuPayload | null> {
  const supabase = createSupabaseClient();

  const { data: lojista, error: lojistaErr } = await supabase
    .from("lojistas")
    .select("*")
    .eq("slug", slug)
    .eq("ativo", true)
    .single<Lojista>();

  if (lojistaErr || !lojista) return null;

  const [catsRes, prodsRes] = await Promise.all([
    supabase
      .from("categorias")
      .select("*")
      .eq("lojista_id", lojista.id)
      .order("ordem", { ascending: true })
      .returns<Categoria[]>(),
    supabase
      .from("produtos")
      .select("*")
      .eq("lojista_id", lojista.id)
      .order("ordem", { ascending: true })
      .returns<Produto[]>(),
  ]);

  return {
    lojista: mapLojista(lojista),
    categorias: catsRes.data ?? [],
    produtos: (prodsRes.data ?? []).map(mapProduto),
  };
}
