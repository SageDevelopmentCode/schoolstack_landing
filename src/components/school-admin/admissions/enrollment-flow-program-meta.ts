import type { EnrollmentFlowProgramSummary } from "@/lib/school-admin/load-enrollment-flows-list-data";
import {
  PROGRAM_STATUS_OPTIONS,
  PROGRAM_TYPE_OPTIONS,
} from "@/lib/admissions/programs";

function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export function formatProgramTypeLabel(program: EnrollmentFlowProgramSummary): string {
  return (
    PROGRAM_TYPE_OPTIONS.find((option) => option.value === program.type)?.label ??
    program.type
  );
}

export function formatProgramOpenLabel(program: EnrollmentFlowProgramSummary): string {
  const statusLabel =
    PROGRAM_STATUS_OPTIONS.find((option) => option.value === program.status)?.label ??
    program.status;
  if (program.status === "open") return "Open";
  if (program.status === "closed") return "Closed";
  return statusLabel;
}

export function formatProgramMetaLine(program: EnrollmentFlowProgramSummary): string {
  const typeLabel = formatProgramTypeLabel(program);
  const dateParts: string[] = [];
  if (program.start_date) {
    dateParts.push(formatShortDate(program.start_date));
  }
  if (program.end_date) {
    dateParts.push(formatShortDate(program.end_date));
  }
  const dateRange =
    dateParts.length === 2
      ? `${dateParts[0]} – ${dateParts[1]}`
      : dateParts[0] ?? null;

  return [typeLabel, dateRange].filter(Boolean).join(" · ");
}

/** @deprecated Use formatProgramMetaLine + formatProgramOpenLabel in overview table */
export function formatEnrollmentFlowProgramMeta(
  program: EnrollmentFlowProgramSummary,
): string {
  const statusLabel =
    PROGRAM_STATUS_OPTIONS.find((option) => option.value === program.status)?.label ??
    program.status;

  const meta = formatProgramMetaLine(program);
  return meta ? `${meta} · ${statusLabel}` : statusLabel;
}
