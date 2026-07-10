import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { APPLICATION_STATUS_LABELS } from "./parent-portal-access";

export { APPLICATION_STATUS_LABELS };

export const APPLICATION_STATUS_FILTER_ORDER = [
  "draft",
  "submitted",
  "fee_pending",
  "under_review",
  "observation",
  "accepted",
  "enrolling",
  "declined",
  "withdrawn",
] as const;

export function applicationStatusLabel(status: string): string {
  return APPLICATION_STATUS_LABELS[status] ?? status;
}

export function applicationStatusBadgeStyle(
  status: string,
  C: AdminThemeTokens,
): { backgroundColor: string; color: string } {
  switch (status) {
    case "accepted":
      return { backgroundColor: C.successBg, color: C.success };
    case "enrolling":
      return { backgroundColor: C.infoBg, color: C.info };
    case "declined":
    case "withdrawn":
      return { backgroundColor: C.errorBg, color: C.error };
    case "under_review":
    case "observation":
      return { backgroundColor: C.infoBg, color: C.info };
    case "submitted":
    case "fee_pending":
      return { backgroundColor: C.warningBg, color: C.warning };
    default:
      return { backgroundColor: C.elevated, color: C.textSecondary };
  }
}

export const FEE_STATUS_LABELS: Record<string, string> = {
  not_required: "—",
  pending: "Pending",
  paid: "Paid",
  waived: "Waived",
};
