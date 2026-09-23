import { siteConfig } from "./site-config";

export function formatPrice(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: siteConfig.currency.code,
    minimumFractionDigits: siteConfig.currency.decimals,
    maximumFractionDigits: siteConfig.currency.decimals,
  }).format(n).replace(siteConfig.currency.code, siteConfig.currency.label);
}

/**
 * Returns the effective selling price of a product.
 * Accepts both `price` (legacy alias) and `priceMin` (DB field name).
 */
export function effectivePrice(product: {
  price?: number | null;
  priceMin?: number | null;
  promoPrice?: number | null;
}): number {
  const base = product.price ?? product.priceMin ?? 0;
  return product.promoPrice != null && product.promoPrice < base
    ? product.promoPrice
    : base;
}

export function discountPercent(product: {
  price?: number | null;
  priceMin?: number | null;
  promoPrice?: number | null;
}): number {
  const base = product.price ?? product.priceMin ?? 0;
  if (product.promoPrice != null && product.promoPrice < base && base > 0) {
    return Math.round(((base - product.promoPrice) / base) * 100);
  }
  return 0;
}

export function formatUnit(unit?: string | null): string {
  return unit ? ` / ${unit}` : "";
}
