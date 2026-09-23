import { resolveSignatureStatus } from "@/lib/school-teacher/forms-documents/db-mapper";
import type { TeacherFormSignatureStatus } from "@/lib/school-teacher/forms-documents/types";

export type TuitionAgreementFamilyStatus = "none" | "pending" | "overdue" | "signed";

const STATUS_PRIORITY: Record<TuitionAgreementFamilyStatus, number> = {
  none: 0,
  signed: 1,
  pending: 2,
  overdue: 3,
};

export type TuitionAgreementResponseRow = {
  familyId: string;
  status: TeacherFormSignatureStatus;
  dueDate: string | null;
};

export function resolveTuitionAgreementResponseStatus(
  status: TeacherFormSignatureStatus,
  dueDate: string | null,
): TeacherFormSignatureStatus {
  return resolveSignatureStatus(status, dueDate);
}

export function aggregateTuitionAgreementStatus(
  statuses: TeacherFormSignatureStatus[],
): TuitionAgreementFamilyStatus {
  if (statuses.length === 0) return "none";

  let result: TuitionAgreementFamilyStatus = "none";
  for (const status of statuses) {
    const normalized: TuitionAgreementFamilyStatus =
      status === "signed" ? "signed" : status === "overdue" ? "overdue" : "pending";
    if (STATUS_PRIORITY[normalized] > STATUS_PRIORITY[result]) {
      result = normalized;
    }
  }
  return result;
}

export function buildTuitionAgreementStatusByFamilyId(
  rows: TuitionAgreementResponseRow[],
): Map<string, TuitionAgreementFamilyStatus> {
  const statusesByFamilyId = new Map<string, TeacherFormSignatureStatus[]>();

  for (const row of rows) {
    const familyId = row.familyId;
    const resolved = resolveTuitionAgreementResponseStatus(row.status, row.dueDate);
    const existing = statusesByFamilyId.get(familyId) ?? [];
    existing.push(resolved);
    statusesByFamilyId.set(familyId, existing);
  }

  const result = new Map<string, TuitionAgreementFamilyStatus>();
  for (const [familyId, statuses] of statusesByFamilyId) {
    result.set(familyId, aggregateTuitionAgreementStatus(statuses));
  }
  return result;
}
