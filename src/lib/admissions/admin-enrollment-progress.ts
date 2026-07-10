import type { EnrollmentProgressSummaryTone } from "./enrollment-checklist-materialization";

export function enrollmentProgressBadgeStyle(
  tone: EnrollmentProgressSummaryTone,
  C: {
    successBg: string;
    success: string;
    infoBg: string;
    info: string;
    warningBg: string;
    warning: string;
    elevated: string;
    textSecondary: string;
  },
): { backgroundColor: string; color: string } {
  switch (tone) {
    case "complete":
      return { backgroundColor: C.successBg, color: C.success };
    case "in_progress":
      return { backgroundColor: C.infoBg, color: C.info };
    case "not_started":
      return { backgroundColor: C.warningBg, color: C.warning };
    default:
      return { backgroundColor: C.elevated, color: C.textSecondary };
  }
}
