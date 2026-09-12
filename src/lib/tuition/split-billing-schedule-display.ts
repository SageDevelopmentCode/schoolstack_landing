import type { TuitionCharge } from "./types";

export type BillingSplitConfig = {
  guardianId: string;
  shareBps: number;
  guardianName: string;
};

export type SplitBillingChargeGroup = {
  key: string;
  baseLabel: string;
  totalCents: number;
  charges: TuitionCharge[];
  isSplitGroup: boolean;
};

const PALETTE_LENGTH = 5;

export function splitChargeGroupKey(
  charge: Pick<TuitionCharge, "assignmentId" | "chargeType" | "installmentNumber" | "dueDate">,
): string {
  return `${charge.assignmentId}:${charge.chargeType}:${charge.installmentNumber ?? "none"}:${charge.dueDate}`;
}

export function stripPayerLabelSuffix(label: string): string {
  const match = label.match(/^(.+?)\s+\([^)]+\)$/);
  return match?.[1]?.trim() ?? label;
}

export function formatSharePercent(shareBps: number): string {
  const pct = (shareBps / 100).toFixed(shareBps % 100 === 0 ? 0 : 1);
  return `${pct}%`;
}

export function buildGuardianColorIndexMap(guardianIds: string[]): Map<string, number> {
  const uniqueSorted = [...new Set(guardianIds)].sort();
  const map = new Map<string, number>();
  uniqueSorted.forEach((guardianId, index) => {
    map.set(guardianId, index % PALETTE_LENGTH);
  });
  return map;
}

export function guardianFirstName(guardianName: string): string {
  return guardianName.split(/\s+/)[0]?.trim() || guardianName;
}

export function resolveGuardianName(
  charge: TuitionCharge,
  billingSplits: BillingSplitConfig[],
): string {
  if (charge.guardianId) {
    const configured = billingSplits.find((split) => split.guardianId === charge.guardianId);
    if (configured) return guardianFirstName(configured.guardianName);
  }

  const suffixMatch = charge.label.match(/\(([^)]+)\)$/);
  if (suffixMatch?.[1]) {
    return guardianFirstName(suffixMatch[1]);
  }

  return "Guardian";
}

export function resolveShareBps(
  charge: TuitionCharge,
  groupTotalCents: number,
  billingSplits: BillingSplitConfig[],
): number {
  if (charge.guardianId) {
    const configured = billingSplits.find((split) => split.guardianId === charge.guardianId);
    if (configured) return configured.shareBps;
  }

  if (groupTotalCents <= 0) return 0;
  return Math.round((charge.amountCents / groupTotalCents) * 10_000);
}

export function groupChargesForSplitBilling(charges: TuitionCharge[]): SplitBillingChargeGroup[] {
  const groupsByKey = new Map<string, TuitionCharge[]>();
  const keyOrder: string[] = [];

  for (const charge of charges) {
    const key = splitChargeGroupKey(charge);
    if (!groupsByKey.has(key)) {
      groupsByKey.set(key, []);
      keyOrder.push(key);
    }
    groupsByKey.get(key)!.push(charge);
  }

  return keyOrder.map((key) => {
    const groupCharges = groupsByKey.get(key)!;
    const distinctGuardians = new Set(
      groupCharges
        .map((charge) => charge.guardianId)
        .filter((guardianId): guardianId is string => Boolean(guardianId)),
    );
    const isSplitGroup = distinctGuardians.size >= 2;
    const firstCharge = groupCharges[0]!;
    const baseLabel = isSplitGroup
      ? stripPayerLabelSuffix(firstCharge.label)
      : firstCharge.label;
    const totalCents = groupCharges.reduce((sum, charge) => sum + charge.amountCents, 0);
    const sortedCharges = isSplitGroup
      ? [...groupCharges].sort((left, right) => left.label.localeCompare(right.label))
      : groupCharges;

    return {
      key,
      baseLabel,
      totalCents,
      charges: sortedCharges,
      isSplitGroup,
    };
  });
}
