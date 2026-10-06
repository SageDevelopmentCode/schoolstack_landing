import { adminToast } from "@/lib/school-admin/admin-toast";

export function toastTuitionSyncResult(input: {
  assignedCount?: number;
  skippedAmbiguousCount?: number;
}) {
  const assigned = input.assignedCount ?? 0;
  const skipped = input.skippedAmbiguousCount ?? 0;

  if (assigned > 0) {
    adminToast.success(
      skipped > 0
        ? `Tuition assigned for ${assigned} student${assigned === 1 ? "" : "s"}. ${skipped} still need a rate catalog — assign them from Families.`
        : "Tuition assigned",
    );
    return;
  }

  if (skipped > 0) {
    adminToast.info(
      `${skipped} student${skipped === 1 ? "" : "s"} need a rate catalog. Open Families and assign tuition per student.`,
    );
    return;
  }

  adminToast.success("Tuition assigned");
}
