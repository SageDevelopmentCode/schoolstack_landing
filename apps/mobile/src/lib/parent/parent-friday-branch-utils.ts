import type { MobileParentTheme } from '@/lib/organization-settings/parent-theme';
import type {
  FridayBranchBlock,
  ParentFridayBranchClassDetailBundle,
  ParentFridayBranchClassSummary,
  ParentFridayBranchPageBundle,
  ParentFridayBranchStudentEnrollmentState,
} from '@/lib/parent/parent-friday-branch-types';

export type FridayBranchChildChipIcon = 'check' | 'clock';

export type FridayBranchChildChipPresentation = {
  icon: FridayBranchChildChipIcon | null;
  ariaLabel: string;
  backgroundColor: string;
  color: string;
  borderColor: string;
};

export type FridayBranchSpotsBadge = {
  label: string;
  tone: 'success' | 'warning' | 'info';
};

export type FridayBranchRowCta = {
  label: string;
  variant: 'primary' | 'soft';
};

function parseIsoDate(value: string): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatShortDate(date: Date, includeYear: boolean): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
  });
}

export function getBlockDisplayLabel(block: FridayBranchBlock, index: number): string {
  const trimmed = block.label.trim();
  return trimmed || `Block ${index + 1}`;
}

export function formatBlockTabDateRange(startDate: string, endDate: string): string {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end) return 'Dates TBD';

  const sameYear = start.getFullYear() === end.getFullYear();
  const startLabel = formatShortDate(start, false);
  const endLabel = formatShortDate(end, !sameYear);
  return `${startLabel} – ${endLabel}`;
}

export function computeSpotsRemaining(
  capacity: number | null | undefined,
  confirmedCount: number,
): number | null {
  if (capacity == null) return null;
  return Math.max(0, capacity - confirmedCount);
}

export function getFridayBranchChildChipAriaLabel(
  student: ParentFridayBranchStudentEnrollmentState,
): string {
  if (student.status === 'confirmed') {
    return `${student.studentName}, signed up`;
  }
  if (student.status === 'waitlisted') {
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
  theme: MobileParentTheme,
): FridayBranchChildChipPresentation {
  const ariaLabel = getFridayBranchChildChipAriaLabel(student);

  if (student.status === 'confirmed') {
    return {
      icon: 'check',
      ariaLabel,
      backgroundColor: theme.successBg,
      color: theme.success,
      borderColor: theme.success,
    };
  }

  if (student.status === 'waitlisted') {
    return {
      icon: 'clock',
      ariaLabel,
      backgroundColor: theme.warningBg,
      color: theme.warning,
      borderColor: theme.warning,
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
    backgroundColor: 'transparent',
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
    } else if (student.status === 'confirmed' || student.status === 'waitlisted') {
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
      (student.status === 'confirmed' || student.status === 'waitlisted')
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

export function formatFridayBranchSpotsLabel(classSummary: ParentFridayBranchClassSummary): string {
  return getFridayBranchSpotsBadge(classSummary).label;
}

export function getFridayBranchSpotsBadge(
  classSummary: ParentFridayBranchClassSummary,
): FridayBranchSpotsBadge {
  if (classSummary.capacity == null) {
    return { label: 'Open', tone: 'success' };
  }
  if (classSummary.spotsRemaining === 0) {
    return { label: 'Full', tone: 'warning' };
  }
  if (classSummary.spotsRemaining != null) {
    return {
      label: `${classSummary.spotsRemaining} spot${classSummary.spotsRemaining === 1 ? '' : 's'} left`,
      tone: 'info',
    };
  }
  return {
    label: `${classSummary.confirmedCount}/${classSummary.capacity}`,
    tone: 'info',
  };
}

export function hasActiveFamilyEnrollment(classSummary: ParentFridayBranchClassSummary): boolean {
  return classSummary.familyEnrollments.length > 0;
}

export function getFridayBranchRowCta(
  classSummary: ParentFridayBranchClassSummary,
): FridayBranchRowCta {
  if (hasActiveFamilyEnrollment(classSummary)) {
    return { label: 'Manage', variant: 'soft' };
  }
  if (classSummary.spotsRemaining === 0) {
    return { label: 'Join waitlist', variant: 'primary' };
  }
  return { label: 'Sign up', variant: 'primary' };
}

export function studentNameById(
  studentOptions: Array<{ id: string; name: string }>,
  studentId: string,
): string {
  return studentOptions.find((student) => student.id === studentId)?.name ?? 'Child';
}

export function applyFridayBranchClassDetailToBundle(
  bundle: ParentFridayBranchPageBundle,
  classId: string,
  detail: ParentFridayBranchClassDetailBundle,
): ParentFridayBranchPageBundle {
  return {
    ...bundle,
    blocks: bundle.blocks.map((entry) => ({
      ...entry,
      classes: entry.classes.map((classSummary) => {
        if (classSummary.classId !== classId) return classSummary;

        const familyEnrollments = detail.studentStates
          .filter((student) => student.status && student.enrollmentId)
          .map((student) => ({
            enrollmentId: student.enrollmentId!,
            studentId: student.studentId,
            status: student.status!,
          }));

        return {
          ...classSummary,
          confirmedCount: detail.confirmedCount,
          spotsRemaining: computeSpotsRemaining(detail.capacity, detail.confirmedCount),
          familyEnrollments,
        };
      }),
    })),
  };
}

export function selectDisplayBlock(
  bundle: ParentFridayBranchPageBundle,
): ParentFridayBranchPageBundle['blocks'][number] | null {
  if (bundle.blocks.length === 0) return null;

  const current = bundle.blocks.find((entry) => entry.block.status === 'current');
  if (current) return current;

  const upcoming = bundle.blocks.find((entry) => entry.block.status === 'upcoming');
  if (upcoming) return upcoming;

  return bundle.blocks[0] ?? null;
}

export function groupClassesBySlot(
  classes: ParentFridayBranchClassSummary[],
): Array<{ slotId: string; slotTime: string; classes: ParentFridayBranchClassSummary[] }> {
  const groups = new Map<
    string,
    { slotId: string; slotTime: string; classes: ParentFridayBranchClassSummary[] }
  >();

  for (const classSummary of classes) {
    const existing = groups.get(classSummary.slotId);
    if (existing) {
      existing.classes.push(classSummary);
      continue;
    }
    groups.set(classSummary.slotId, {
      slotId: classSummary.slotId,
      slotTime: classSummary.slotTime,
      classes: [classSummary],
    });
  }

  return Array.from(groups.values());
}
