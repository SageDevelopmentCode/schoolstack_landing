import { MAX_PROGRAM_GROUPS } from "@/lib/marketing/tuition-scenario-state";

export const ENROLLMENT_DEFAULT_SINGLE_GROUP_LABEL = "All students";

export type EnrollmentTuitionGroup = {
  id: string;
  label: string;
  tuitionCents: number;
  enrollment: number;
};

export function createEnrollmentGroupId(): string {
  return crypto.randomUUID();
}

export function starterEnrollmentGroups(
  tuitionCents: number,
  enrollment: number,
): EnrollmentTuitionGroup[] {
  return [
    {
      id: "enrollment-group-1",
      label: ENROLLMENT_DEFAULT_SINGLE_GROUP_LABEL,
      tuitionCents,
      enrollment,
    },
  ];
}

export function addEnrollmentTuitionGroup(groups: EnrollmentTuitionGroup[]): EnrollmentTuitionGroup[] {
  if (groups.length >= MAX_PROGRAM_GROUPS) return groups;
  const primary = groups[0];
  const next = [...groups];
  const sole = next[0];
  if (next.length === 1 && sole?.label === ENROLLMENT_DEFAULT_SINGLE_GROUP_LABEL) {
    next[0] = { ...sole, label: "" };
  }
  const newGroup: EnrollmentTuitionGroup = {
    id: createEnrollmentGroupId(),
    label: "",
    tuitionCents: primary?.tuitionCents ?? 0,
    enrollment: 0,
  };
  return [...next, newGroup];
}

export function removeEnrollmentTuitionGroup(
  groups: EnrollmentTuitionGroup[],
  groupId: string,
): EnrollmentTuitionGroup[] {
  if (groups.length <= 1) return groups;
  const remaining = groups.filter((group) => group.id !== groupId);
  if (remaining.length === groups.length) return groups;
  if (remaining.length === 1 && remaining[0]) {
    return [{ ...remaining[0], label: ENROLLMENT_DEFAULT_SINGLE_GROUP_LABEL }];
  }
  return remaining;
}

export function enrollmentGroupsToCalculatorInput(groups: EnrollmentTuitionGroup[]) {
  return groups.map((group) => ({
    tuitionCents: group.tuitionCents,
    enrollment: group.enrollment,
  }));
}

export function totalEnrollmentFromGroups(groups: EnrollmentTuitionGroup[]): number {
  return groups.reduce((sum, group) => sum + group.enrollment, 0);
}
