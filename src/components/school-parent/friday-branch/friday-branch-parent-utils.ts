import type { ParentThemeTokens } from "@/lib/organization-settings/parent-theme";
import type {
  ParentFridayBranchClassSummary,
  ParentFridayBranchPageBundle,
  ParentFridayBranchStudentEnrollmentState,
} from "@/lib/parent-portal/friday-branch/types";

export type FridayBranchChildChipIcon = "check" | "clock";

export type FridayBranchChildChipPresentation = {
  icon: FridayBranchChildChipIcon | null;
  ariaLabel: string;
  backgroundColor: string;
  color: string;
  borderColor: string;
  boxShadow?: string;
};

export function getFridayBranchChildChipAriaLabel(
  student: ParentFridayBranchStudentEnrollmentState,
): string {
  if (student.status === "confirmed") {
    return `${student.studentName}, signed up`;
  }
  if (student.status === "waitlisted") {
    return `${student.studentName}, waitlisted`;
  }
  if (isFridayBranchChildChipDisabled(student)) {
    return `${student.studentName}, unavailable`;
  }
  return `${student.studentName}, not signed up`;
}

export function getFridayBranchChildChipPresentation(
  student: ParentFridayBranchStudentEnrollmentState,
  active: boolean,
  theme: ParentThemeTokens,
): FridayBranchChildChipPresentation {
  const ariaLabel = getFridayBranchChildChipAriaLabel(student);

  if (student.status === "confirmed") {
    return {
      icon: "check",
      ariaLabel,
      backgroundColor: theme.successBg,
      color: theme.success,
      borderColor: theme.success,
      boxShadow: active ? `0 0 0 2px ${theme.white}, 0 0 0 4px ${theme.success}` : undefined,
    };
  }

  if (student.status === "waitlisted") {
    return {
      icon: "clock",
      ariaLabel,
      backgroundColor: theme.warningBg,
      color: theme.warning,
      borderColor: theme.warning,
      boxShadow: active ? `0 0 0 2px ${theme.white}, 0 0 0 4px ${theme.warning}` : undefined,
    };
  }

  if (isFridayBranchChildChipDisabled(student)) {
    return {
      icon: null,
      ariaLabel,
      backgroundColor: theme.white,
      color: theme.muted,
      borderColor: theme.line,
    };
  }

  if (active) {
    return {
      icon: null,
      ariaLabel,
      backgroundColor: theme.primarySoft,
      color: theme.primary,
      borderColor: theme.primary,
    };
  }

  return {
    icon: null,
    ariaLabel,
    backgroundColor: "transparent",
    color: theme.muted,
    borderColor: theme.line,
  };
}

export function getInitialFridayBranchChildSelection(
  studentStates: ParentFridayBranchStudentEnrollmentState[],
): string[] {
  return studentStates
    .filter((student) => student.canEnroll && !student.status)
    .map((student) => student.studentId);
}

export function partitionFridayBranchChildSelection(
  studentStates: ParentFridayBranchStudentEnrollmentState[],
  selectedIds: Iterable<string>,
): { enrollableIds: string[]; withdrawableIds: string[] } {
  const selected = new Set(selectedIds);
  const enrollableIds: string[] = [];
  const withdrawableIds: string[] = [];

  for (const student of studentStates) {
    if (!selected.has(student.studentId)) continue;
    if (student.canEnroll && !student.status) {
      enrollableIds.push(student.studentId);
    } else if (student.status === "confirmed" || student.status === "waitlisted") {
      withdrawableIds.push(student.studentId);
    }
  }

  return { enrollableIds, withdrawableIds };
}

export function isFridayBranchChildChipDisabled(
  student: ParentFridayBranchStudentEnrollmentState,
): boolean {
  return !student.canEnroll && !student.status;
}

export function syncFridayBranchChildSelection(
  studentStates: ParentFridayBranchStudentEnrollmentState[],
  currentSelection: Iterable<string>,
): string[] {
  const selected = new Set(currentSelection);
  const next = new Set<string>();

  for (const student of studentStates) {
    if (
      selected.has(student.studentId) &&
      (student.status === "confirmed" || student.status === "waitlisted")
    ) {
      next.add(student.studentId);
    }
    if (student.canEnroll && !student.status) {
      next.add(student.studentId);
    }
  }

  return [...next];
}

export function resolveValidClassId(
  classId: string | null | undefined,
  bundle: ParentFridayBranchPageBundle,
): string | null {
  if (!classId) return null;
  const exists = bundle.blocks.some((entry) =>
    entry.classes.some((classSummary) => classSummary.classId === classId),
  );
  return exists ? classId : null;
}

export function syncFridayBranchClassUrl(pathname: string, classId: string | null): void {
  const params = new URLSearchParams(window.location.search);
  if (classId) params.set("class", classId);
  else params.delete("class");
  const qs = params.toString();
  window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
}

export function findBlockIdForClass(
  bundle: ParentFridayBranchPageBundle,
  classId: string | null,
): string | null {
  if (!classId) return null;
  const block = bundle.blocks.find((entry) =>
    entry.classes.some((classSummary) => classSummary.classId === classId),
  );
  return block?.block.id ?? null;
}

export type FridayBranchSpotsBadge = {
  label: string;
  tone: "success" | "warning" | "info";
};

export type FridayBranchRowCta = {
  label: string;
  variant: "primary" | "soft";
};

export function formatFridayBranchSpotsLabel(classSummary: ParentFridayBranchClassSummary): string {
  return getFridayBranchSpotsBadge(classSummary).label;
}

export function getFridayBranchSpotsBadge(
  classSummary: ParentFridayBranchClassSummary,
): FridayBranchSpotsBadge {
  if (classSummary.capacity == null) {
    return { label: "Open", tone: "success" };
  }
  if (classSummary.spotsRemaining === 0) {
    return { label: "Full", tone: "warning" };
  }
  if (classSummary.spotsRemaining != null) {
    return {
      label: `${classSummary.spotsRemaining} spot${classSummary.spotsRemaining === 1 ? "" : "s"} left`,
      tone: "info",
    };
  }
  return {
    label: `${classSummary.confirmedCount}/${classSummary.capacity}`,
    tone: "info",
  };
}

export function hasActiveFamilyEnrollment(classSummary: ParentFridayBranchClassSummary): boolean {
  return classSummary.familyEnrollments.length > 0;
}

export function getFridayBranchRowCta(
  classSummary: ParentFridayBranchClassSummary,
): FridayBranchRowCta {
  if (hasActiveFamilyEnrollment(classSummary)) {
    return { label: "Manage", variant: "soft" };
  }
  if (classSummary.spotsRemaining === 0) {
    return { label: "Join waitlist", variant: "primary" };
  }
  return { label: "Sign up", variant: "primary" };
}

export function studentNameById(
  studentOptions: Array<{ id: string; name: string }>,
  studentId: string,
): string {
  return studentOptions.find((student) => student.id === studentId)?.name ?? "Child";
}
