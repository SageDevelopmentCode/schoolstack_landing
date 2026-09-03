import { formatCents } from "@/lib/tuition/pricing";
import { partitionUnassignedEnrollments } from "@/lib/tuition/tuition-readiness";
import type { FamilyBillingSummary } from "@/lib/tuition/types";

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
    return `${formatCents(family.balanceDueCents)} · ${family.status} · ${autopayLabel}`;
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
