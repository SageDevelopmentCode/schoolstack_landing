import type { CSSProperties } from "react";
import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import { APPLICATION_STATUS_LABELS } from "./parent-portal-access";

export { APPLICATION_STATUS_LABELS };

export type ApplicationStatusChipTone = "success" | "warning" | "alert" | "info";

export const APPLICATION_STATUS_FILTER_ORDER = [
  "draft",
  "submitted",
  "fee_pending",
  "under_review",
  "observation",
  "accepted",
  "enrolling",
  "enrolled",
  "declined",
  "withdrawn",
] as const;

export const APPLICATION_STATUSES_EXCLUDED_FROM_DEFAULT_ALL = ["withdrawn"] as const;

export const APPLICATION_STATUSES_NEEDING_ADMIN_ACTION = [
  "submitted",
  "fee_pending",
  "under_review",
  "observation",
] as const;

export function applicationSubmissionNeedsAdminAction(status: string): boolean {
  return (APPLICATION_STATUSES_NEEDING_ADMIN_ACTION as readonly string[]).includes(
    status,
  );
}

export function applicationSubmissionRowStyle(
  status: string,
  C: AdminThemeTokens,
  { isSelected, isHovered }: { isSelected: boolean; isHovered: boolean },
): Pick<CSSProperties, "backgroundColor" | "borderLeft"> {
  const needsAction = applicationSubmissionNeedsAdminAction(status);

  if (isSelected) {
    return {
      backgroundColor: C.accentLight,
      borderLeft: `3px solid ${C.accent}`,
    };
  }

  if (isHovered) {
    return {
      backgroundColor: C.elevated,
      borderLeft: `3px solid ${needsAction ? C.warning : "transparent"}`,
    };
  }

  return {
    backgroundColor: needsAction ? C.warningBg : C.surface,
    borderLeft: `3px solid ${needsAction ? C.warning : "transparent"}`,
  };
}

export function applicationStatusLabel(status: string): string {
  return APPLICATION_STATUS_LABELS[status] ?? status;
}

export function adminApplicationStatusLabel(status: string): string {
  if (status === "draft") return "Applying";
  return applicationStatusLabel(status);
}

export function applicationStatusChipTone(status: string): ApplicationStatusChipTone {
  switch (status) {
    case "accepted":
    case "enrolled":
      return "success";
    case "declined":
    case "withdrawn":
      return "alert";
    case "submitted":
    case "fee_pending":
      return "warning";
    case "enrolling":
    case "under_review":
    case "observation":
    case "draft":
    default:
      return "info";
  }
}

export function applicationStatusBadgeStyle(
  status: string,
  C: AdminThemeTokens,
): { backgroundColor: string; color: string } {
  switch (status) {
    case "accepted":
    case "enrolled":
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
