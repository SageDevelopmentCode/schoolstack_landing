import type { AdminThemeTokens } from "@/lib/organization-settings/theme";
import type { AdminApplicationSubmission } from "./application-submissions";

export type SubmissionFeeBadgeStatus = "paid" | "pending" | "waived";

export type SubmissionFeeBadge = {
  key: "application" | "enrollment";
  label: string;
  status: SubmissionFeeBadgeStatus;
};

const FEE_STATUS_LABELS: Record<SubmissionFeeBadgeStatus, string> = {
  paid: "Paid",
  pending: "Unpaid",
  waived: "Waived",
};

export function submissionFeeBadgeStyle(
  status: SubmissionFeeBadgeStatus,
  C: AdminThemeTokens,
): { backgroundColor: string; color: string } {
  switch (status) {
    case "paid":
      return { backgroundColor: C.successBg, color: C.success };
    case "waived":
      return { backgroundColor: C.elevated, color: C.textSecondary };
    case "pending":
    default:
      return { backgroundColor: C.warningBg, color: C.warning };
  }
}

function applicationFeeBadgeStatus(
  feeStatus: string,
): SubmissionFeeBadgeStatus | null {
  switch (feeStatus) {
    case "paid":
      return "paid";
    case "waived":
      return "waived";
    case "pending":
    case "fee_pending":
      return "pending";
    default:
      return null;
  }
}

function enrollmentFeeBadgeStatus(
  submission: AdminApplicationSubmission,
): SubmissionFeeBadgeStatus | null {
  const paymentSummary = submission.enrollmentSummary?.paymentSummary;
  if (!paymentSummary?.hasPaymentItems) return null;
  if (paymentSummary.allWaived) return "waived";
  if (paymentSummary.allPaid) return "paid";
  return "pending";
}

export function buildSubmissionFeeBadges(
  submission: AdminApplicationSubmission,
): SubmissionFeeBadge[] {
  const badges: SubmissionFeeBadge[] = [];

  if (submission.feeEnabled && submission.feeStatus !== "not_required") {
    const status = applicationFeeBadgeStatus(submission.feeStatus);
    if (status) {
      badges.push({
        key: "application",
        label: "Application",
        status,
      });
    }
  }

  const enrollmentStatus = enrollmentFeeBadgeStatus(submission);
  if (enrollmentStatus) {
    badges.push({
      key: "enrollment",
      label: "Enrollment",
      status: enrollmentStatus,
    });
  }

  return badges;
}

export function formatSubmissionFeeBadgeLabel(badge: SubmissionFeeBadge): string {
  return `${badge.label} · ${FEE_STATUS_LABELS[badge.status]}`;
}

export function submissionHasFeeBadges(submission: AdminApplicationSubmission): boolean {
  return buildSubmissionFeeBadges(submission).length > 0;
}
