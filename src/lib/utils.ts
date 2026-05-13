import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combines Tailwind class names safely (clsx + tailwind-merge). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price number as Brazilian Real currency.
 * Example: 19.9 → "R$ 19,90"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
