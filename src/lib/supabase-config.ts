/** Indica se o projeto está com URL/Supabase reais (não placeholder). */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return url.startsWith("https://") && !url.includes("SEU_PROJETO");
}
