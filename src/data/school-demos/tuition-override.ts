export type TuitionAdjustType =
  | "percent_discount"
  | "fixed_discount"
  | "custom_amount";

export type DemoTuitionOverride = {
  familyId: string;
  programLabel: string;
  standardAmount: number;
  type: TuitionAdjustType;
  value: number;
  reason: string;
};

export function computeAdjustedAmount(o: DemoTuitionOverride): number {
  switch (o.type) {
    case "percent_discount":
      return Math.round(o.standardAmount * (1 - o.value / 100));
    case "fixed_discount":
      return Math.max(0, o.standardAmount - o.value);
    case "custom_amount":
      return Math.max(0, o.value);
    default:
      return o.standardAmount;
  }
}

/** Map admin baseline to parent baseline proportionally. */
export function mapOverrideToParentAmount(
  override: DemoTuitionOverride,
  parentStandardAmount: number,
): number {
  const adjusted = computeAdjustedAmount(override);
  if (override.standardAmount <= 0) return parentStandardAmount;
  return Math.round((adjusted / override.standardAmount) * parentStandardAmount);
}

export function formatTuitionOverrideSummary(o: DemoTuitionOverride): string {
  switch (o.type) {
    case "percent_discount":
      return `${o.value}% ${o.reason.toLowerCase()}`;
    case "fixed_discount":
      return `$${o.value} off · ${o.reason}`;
    case "custom_amount":
      return `${o.reason}`;
    default:
      return o.reason;
  }
}
