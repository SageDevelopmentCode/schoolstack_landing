import { formatTierAmountRange } from "./pricing";
import type { BillingBasis, TuitionRateTier } from "./types";

export function formatRateCatalogPeriodLabel(
  effectiveStart: string | null,
  effectiveEnd: string | null,
): string | null {
  if (!effectiveStart && !effectiveEnd) return null;
  const format = (iso: string) => {
    const [year, month, day] = iso.split("-").map(Number);
    if (!year || !month || !day) return iso;
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  if (effectiveStart && effectiveEnd) {
    return `${format(effectiveStart)} – ${format(effectiveEnd)}`;
  }
  if (effectiveStart) return `From ${format(effectiveStart)}`;
  return `Through ${format(effectiveEnd!)}`;
}

export function buildRateCatalogDetailLabel(
  tiers: Pick<TuitionRateTier, "amountCents">[],
  billingBasis: BillingBasis,
): string | null {
  const mode = billingBasis === "monthly" ? "monthly" : "annual";
  return formatTierAmountRange(tiers, mode);
}
