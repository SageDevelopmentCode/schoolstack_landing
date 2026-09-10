import { formatCents } from "@/lib/tuition/pricing";
import { partitionUnassignedEnrollments } from "@/lib/tuition/tuition-readiness";
import type { FamilyBillingSummary } from "@/lib/tuition/types";

function formatBillingStatusLabel(
  status: FamilyBillingSummary["status"],
): string {
  switch (status) {
    case "overdue":
      return "Overdue";
    case "invoice_sent":
      return "Invoice sent";
    case "current":
      return "Current";
    default:
      return status;
  }
}

export function familyStatusLabel(family: FamilyBillingSummary): string {
  const autopayLabel =
    family.autopayStatus === "on"
      ? "Autopay on"
      : family.autopayStatus === "partial"
        ? "Autopay partial"
        : "Autopay off";
  const { enrolling, enrolledUnassigned } = partitionUnassignedEnrollments(
    family.unassignedEnrollments,
  );
  const catalogAmountLabel = family.catalogTuition
    ? formatCents(family.catalogTuition.adjustedCents)
    : null;

  if (family.readiness === "ready" && enrolling.length === 0) {
    const lateFeeSuffix =
      family.hasOpenLateFee && family.openLateFeeCents > 0
        ? ` · ${formatCents(family.openLateFeeCents)} late fee`
        : "";
    return `${formatCents(family.balanceDueCents)} · ${formatBillingStatusLabel(family.status)}${lateFeeSuffix} · ${autopayLabel}`;
  }
  if (enrolledUnassigned.length > 0) {
    return catalogAmountLabel ? `${catalogAmountLabel} · Setup needed` : "Setup needed";
  }
  if (enrolling.length > 0) {
    return catalogAmountLabel ? `${catalogAmountLabel} · Enrolling` : "Enrolling";
  }
  if (catalogAmountLabel && family.readiness !== "ready") {
    return `${catalogAmountLabel} · Setup needed`;
  }
  return "Setup needed";
}
