export function parseFridayBranchPriceInput(value: string): number | null {
  const raw = value.trim();
  if (!raw) return null;

  const normalized = raw.replace(/^\$/, "").replace(/,/g, "").trim();
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return null;

  const [dollarsPart, centsPart = ""] = normalized.split(".");
  const dollars = Number.parseInt(dollarsPart, 10);
  if (!Number.isFinite(dollars) || dollars < 0) return null;

  const paddedCents = `${centsPart}00`.slice(0, 2);
  const cents = Number.parseInt(paddedCents, 10);
  if (!Number.isFinite(cents) || cents < 0 || cents > 99) return null;

  return dollars * 100 + cents;
}

export function formatFridayBranchPriceInput(priceCents: number | null | undefined): string {
  if (priceCents == null) return "";
  return (priceCents / 100).toFixed(2);
}

export function validateFridayBranchPriceCents(priceCents: number | null | undefined): string | null {
  if (priceCents == null) return null;
  if (!Number.isInteger(priceCents) || priceCents < 0) {
    return "Price must be zero or greater.";
  }
  return null;
}
