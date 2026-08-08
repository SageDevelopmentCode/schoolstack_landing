import { formatCents } from "@/lib/tuition/pricing";

export function formatInstallmentRange(amountsCents: number[]): string {
  if (amountsCents.length === 0) return formatCents(0);
  const formatted = amountsCents.map((cents) => formatCents(cents));
  const unique = [...new Set(formatted)];
  if (unique.length === 1) return unique[0]!;
  const min = Math.min(...amountsCents);
  const max = Math.max(...amountsCents);
  return `${formatCents(min)}–${formatCents(max)}`;
}
