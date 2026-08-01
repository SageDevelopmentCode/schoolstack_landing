import { chargeRemainingCents } from "./billing-splits";
import type { TuitionCharge } from "./types";

export type LateFeeNotice = {
  totalCents: number;
  labels: string[];
  latestSentAt: string;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function pickRecentLateFeeNotice(
  charges: TuitionCharge[],
  options?: { withinDays?: number; now?: Date },
): LateFeeNotice | null {
  const withinDays = options?.withinDays ?? 14;
  const now = options?.now ?? new Date();
  const cutoff = now.getTime() - withinDays * MS_PER_DAY;

  const recentLateFees = charges.filter((charge) => {
    if (charge.chargeType !== "late_fee") return false;
    if (chargeRemainingCents(charge) <= 0) return false;
    if (!charge.sentAt) return false;
    return new Date(charge.sentAt).getTime() >= cutoff;
  });

  if (recentLateFees.length === 0) return null;

  const totalCents = recentLateFees.reduce(
    (sum, charge) => sum + chargeRemainingCents(charge),
    0,
  );
  const labels = recentLateFees.map((charge) => charge.label);
  const latestSentAt = recentLateFees.reduce((latest, charge) => {
    const sentAt = charge.sentAt ?? "";
    return sentAt > latest ? sentAt : latest;
  }, "");

  return { totalCents, labels, latestSentAt };
}
