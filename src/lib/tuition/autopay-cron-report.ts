import { formatCents } from "@/lib/tuition/pricing";

export type AutopaySkipReason =
  | "no_payment_method"
  | "stale_payment_method"
  | "no_guardian"
  | "no_stripe_customer"
  | "zero_balance";

export type AutopayLineOutcome = "charged" | "failed" | "skipped";

export type AutopayLineItem = {
  organizationSlug: string;
  familyId: string;
  familyLabel: string;
  chargeId: string;
  chargeLabel: string;
  amountCents: number;
  outcome: AutopayLineOutcome;
  skipReason?: AutopaySkipReason;
  errorMessage?: string;
};

export type AutopayOrgResult = {
  processed: number;
  skipped: number;
  failed: number;
  attempted: number;
  dueCandidates: number;
  lines: AutopayLineItem[];
  truncated: boolean;
};

export const AUTOPAY_LINES_PER_ORG_CAP = 100;
export const AUTOPAY_LINES_GLOBAL_CAP = 150;

export function buildFamilyLabel(
  familyId: string,
  guardians: Array<{ last_name?: string | null }>,
): string {
  const lastName = guardians[0]?.last_name?.trim();
  if (lastName) return `${lastName} family`;
  return `Family ${familyId.slice(0, 8)}`;
}

const SKIP_REASON_LABELS: Record<AutopaySkipReason, string> = {
  no_payment_method: "no card",
  stale_payment_method: "stale card — re-save payment method",
  no_guardian: "no guardian",
  no_stripe_customer: "no Stripe customer",
  zero_balance: "already paid",
};

function formatAutopayLine(line: AutopayLineItem): string {
  const amount = formatCents(line.amountCents);
  const base = `${line.organizationSlug} · ${line.familyLabel} · ${amount} · ${line.chargeLabel}`;
  if (line.outcome === "failed" && line.errorMessage) {
    return `${base} — ${line.errorMessage}`;
  }
  if (line.outcome === "skipped" && line.skipReason) {
    return `${base} — ${SKIP_REASON_LABELS[line.skipReason]}`;
  }
  return base;
}

export function formatAutopayLineItems(
  lines: AutopayLineItem[],
  outcome: AutopayLineOutcome,
  maxLines = 20,
): string | null {
  const filtered = lines.filter((line) => line.outcome === outcome);
  if (filtered.length === 0) return null;

  const visible = filtered.slice(0, maxLines);
  const formatted = visible.map((line) => formatAutopayLine(line));
  const remaining = filtered.length - visible.length;
  if (remaining > 0) {
    formatted.push(`… and ${remaining} more`);
  }

  return `\`\`\`\n${formatted.join("\n")}\n\`\`\``;
}

export function mergeAutopayLines(
  existing: AutopayLineItem[],
  incoming: AutopayLineItem[],
  globalCap = AUTOPAY_LINES_GLOBAL_CAP,
): { lines: AutopayLineItem[]; truncated: boolean } {
  const lines = [...existing, ...incoming];
  if (lines.length <= globalCap) {
    return { lines, truncated: false };
  }
  return { lines: lines.slice(0, globalCap), truncated: true };
}
