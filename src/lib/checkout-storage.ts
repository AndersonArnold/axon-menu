const STORAGE_PREFIX = "axon-menu-customer";

export type SavedCheckoutCustomer = {
  nome: string;
  whatsapp: string;
  endereco: string;
};

const empty: SavedCheckoutCustomer = { nome: "", whatsapp: "", endereco: "" };

export function loadSavedCustomer(slug: string): SavedCheckoutCustomer {
  if (typeof window === "undefined") return { ...empty };
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}:${slug}`);
    if (!raw) return { ...empty };
    const o = JSON.parse(raw) as Record<string, unknown>;
    return {
      nome: String(o.nome ?? ""),
      whatsapp: String(o.whatsapp ?? ""),
      endereco: String(o.endereco ?? ""),
    };
  } catch {
    return { ...empty };
  }
}

export function saveSavedCustomer(
  slug: string,
  data: SavedCheckoutCustomer
): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    `${STORAGE_PREFIX}:${slug}`,
    JSON.stringify({
      nome: data.nome.trim(),
      whatsapp: data.whatsapp.trim(),
      endereco: data.endereco.trim(),
    })
  );
}
