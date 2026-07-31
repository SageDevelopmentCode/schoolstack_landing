import type { SupabaseClient } from "@supabase/supabase-js";
import { chargeRemainingCents } from "./billing-splits";
import { rowToAssignment } from "./row-mappers";
import {
  getFamilyTuitionSelectionContexts,
  type FamilyTuitionSelectionItem,
} from "./enrollment-selection";
import type { TuitionCharge, TuitionEnrollmentAssignment } from "./types";

export type ParentBillingChildStatus = "needs_schedule" | "ready" | "no_assignment";

export type ParentBillingNextCharge = {
  label: string;
  dueDate: string;
  amountCents: number;
};

export type ParentBillingChildView = {
  childKey: string;
  studentName: string;
  assignmentId: string | null;
  annualTuitionCents: number;
  balanceDueCents: number;
  totalRemainingCents: number;
  nextCharge: ParentBillingNextCharge | null;
  status: ParentBillingChildStatus;
  selectionItem: FamilyTuitionSelectionItem | null;
};

export type ParentBillingFamilySummary = {
  balanceDueCents: number;
  totalRemainingCents: number;
  familyTotalRemainingCents: number | null;
  annualTuitionCents: number;
  hasPendingSchedule: boolean;
  nextCharge: ParentBillingNextCharge | null;
  children: ParentBillingChildView[];
};

export type UpcomingDueSummary = {
  upcomingDueCents: number;
  totalRemainingCents: number;
  nextCharge: ParentBillingNextCharge | null;
};

const OPEN_CHARGE_STATUSES = new Set(["scheduled", "sent", "overdue"]);

type AssignmentRow = {
  assignment: TuitionEnrollmentAssignment;
  enrollmentId: string;
  studentName: string;
};

export function resolveAnnualTuitionCents(input: {
  selectionItem: FamilyTuitionSelectionItem | null;
  tuitionCharges: TuitionCharge[];
  fallbackCents?: number;
}): number {
  if (input.selectionItem) {
    const { assignment, ratePlan } = input.selectionItem.context;
    const tier =
      ratePlan.tiers.find((item) => item.id === assignment.rateTierId) ??
      ratePlan.tiers.find((item) => item.isDefault) ??
      ratePlan.tiers[0];
    return tier?.amountCents ?? ratePlan.amountCents;
  }

  const tuitionTotal = input.tuitionCharges
    .filter((charge) => charge.chargeType === "tuition")
    .reduce((sum, charge) => sum + charge.baseAmountCents, 0);

  if (tuitionTotal > 0) return tuitionTotal;
  return input.fallbackCents ?? 0;
}

export function resolveUpcomingDue(charges: TuitionCharge[]): UpcomingDueSummary {
  const openCharges = charges.filter((charge) =>
    OPEN_CHARGE_STATUSES.has(charge.status),
  );
  const totalRemainingCents = openCharges.reduce(
    (sum, charge) => sum + chargeRemainingCents(charge),
    0,
  );

  if (openCharges.length === 0) {
    return { upcomingDueCents: 0, totalRemainingCents: 0, nextCharge: null };
  }

  const earliestDueDate = [...openCharges].sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate),
  )[0]!.dueDate;
  const chargesOnDate = openCharges.filter(
    (charge) => charge.dueDate === earliestDueDate,
  );
  const upcomingDueCents = chargesOnDate.reduce(
    (sum, charge) => sum + chargeRemainingCents(charge),
    0,
  );

  return {
    upcomingDueCents,
    totalRemainingCents,
    nextCharge: {
      label: chargesOnDate[0]!.label,
      dueDate: earliestDueDate,
      amountCents: upcomingDueCents,
    },
  };
}

export function buildParentBillingFamilySummary(input: {
  assignments: AssignmentRow[];
  charges: TuitionCharge[];
  selectionItems: FamilyTuitionSelectionItem[];
  allFamilyCharges?: TuitionCharge[];
}): ParentBillingFamilySummary {
  const selectionByEnrollmentId = new Map(
    input.selectionItems.map((item) => [
      item.context.assignment.enrollmentId,
      item,
    ]),
  );
  const selectionByAssignmentId = new Map(
    input.selectionItems.map((item) => [item.context.assignment.id, item]),
  );
  const chargesByAssignmentId = new Map<string, TuitionCharge[]>();

  for (const charge of input.charges) {
    const existing = chargesByAssignmentId.get(charge.assignmentId) ?? [];
    existing.push(charge);
    chargesByAssignmentId.set(charge.assignmentId, existing);
  }

  const children: ParentBillingChildView[] = input.assignments.map((row) => {
    const assignmentCharges = chargesByAssignmentId.get(row.assignment.id) ?? [];
    const upcomingDue = resolveUpcomingDue(assignmentCharges);
    const selectionItem =
      selectionByEnrollmentId.get(row.enrollmentId) ??
      selectionByAssignmentId.get(row.assignment.id) ??
      null;

    const status: ParentBillingChildStatus = selectionItem
      ? "needs_schedule"
      : row.assignment.id
        ? "ready"
        : "no_assignment";

    return {
      childKey: row.enrollmentId,
      studentName: row.studentName,
      assignmentId: row.assignment.id,
      annualTuitionCents: resolveAnnualTuitionCents({
        selectionItem,
        tuitionCharges: assignmentCharges,
      }),
      balanceDueCents: upcomingDue.upcomingDueCents,
      totalRemainingCents: upcomingDue.totalRemainingCents,
      nextCharge: upcomingDue.nextCharge,
      status,
      selectionItem,
    };
  });

  const familyUpcomingDue = resolveUpcomingDue(input.charges);
  const familyWideUpcomingDue = input.allFamilyCharges
    ? resolveUpcomingDue(input.allFamilyCharges)
    : null;

  return {
    balanceDueCents: familyUpcomingDue.upcomingDueCents,
    totalRemainingCents: familyUpcomingDue.totalRemainingCents,
    familyTotalRemainingCents:
      familyWideUpcomingDue &&
      familyWideUpcomingDue.totalRemainingCents !==
        familyUpcomingDue.totalRemainingCents
        ? familyWideUpcomingDue.totalRemainingCents
        : null,
    annualTuitionCents: children.reduce(
      (sum, child) => sum + child.annualTuitionCents,
      0,
    ),
    hasPendingSchedule: children.some((child) => child.status === "needs_schedule"),
    nextCharge: familyUpcomingDue.nextCharge,
    children,
  };
}

export async function fetchParentBillingFamilySummary(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    charges: TuitionCharge[];
    allFamilyCharges?: TuitionCharge[];
  },
): Promise<ParentBillingFamilySummary> {
  const [selectionItems, assignmentRows] = await Promise.all([
    getFamilyTuitionSelectionContexts(supabase, {
      organizationId: input.organizationId,
      familyId: input.familyId,
    }),
    supabase
      .from("tuition_enrollment_assignments")
      .select("*")
      .eq("organization_id", input.organizationId)
      .eq("family_id", input.familyId)
      .eq("status", "active"),
  ]);

  if (assignmentRows.error) throw assignmentRows.error;

  const rows = assignmentRows.data ?? [];
  if (rows.length === 0) {
    const upcomingDue = resolveUpcomingDue(input.charges);
    return {
      balanceDueCents: upcomingDue.upcomingDueCents,
      totalRemainingCents: upcomingDue.totalRemainingCents,
      familyTotalRemainingCents: null,
      annualTuitionCents: 0,
      hasPendingSchedule: selectionItems.length > 0,
      nextCharge: upcomingDue.nextCharge,
      children: selectionItems.map((item) => ({
        childKey: item.context.assignment.enrollmentId,
        studentName: item.studentName,
        assignmentId: item.context.assignment.id,
        annualTuitionCents: resolveAnnualTuitionCents({
          selectionItem: item,
          tuitionCharges: [],
        }),
        balanceDueCents: 0,
        totalRemainingCents: 0,
        nextCharge: null,
        status: "needs_schedule" as const,
        selectionItem: item,
      })),
    };
  }

  const enrollmentIds = rows.map((row) => String(row.enrollment_id));
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("id, student_id")
    .in("id", enrollmentIds);

  if (enrollmentsError) throw enrollmentsError;

  const studentIds = [
    ...new Set(
      (enrollments ?? [])
        .map((enrollment) =>
          enrollment.student_id ? String(enrollment.student_id) : null,
        )
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, first_name, last_name")
    .in("id", studentIds);

  if (studentsError) throw studentsError;

  const enrollmentStudentId = new Map(
    (enrollments ?? []).map((enrollment) => [
      String(enrollment.id),
      enrollment.student_id ? String(enrollment.student_id) : null,
    ]),
  );
  const studentNameById = new Map(
    (students ?? []).map((student) => [
      String(student.id),
      [student.first_name, student.last_name].filter(Boolean).join(" ").trim() ||
        "Student",
    ]),
  );

  const assignments: AssignmentRow[] = rows.map((row) => {
    const assignment = rowToAssignment(row);
    const studentId = enrollmentStudentId.get(String(row.enrollment_id));
    const studentName = studentId
      ? (studentNameById.get(studentId) ?? "Student")
      : "Student";
    return {
      assignment,
      enrollmentId: String(row.enrollment_id),
      studentName,
    };
  });

  return buildParentBillingFamilySummary({
    assignments,
    charges: input.charges,
    selectionItems,
    allFamilyCharges: input.allFamilyCharges,
  });
}

export function pickInitialChildKey(children: ParentBillingChildView[]): string | null {
  if (children.length === 0) return null;
  return (
    children.find((child) => child.status === "needs_schedule")?.childKey ??
    children[0]?.childKey ??
    null
  );
}

export function pickNextPendingChildKey(
  children: ParentBillingChildView[],
  currentChildKey: string,
): string | null {
  const pending = children.filter((child) => child.status === "needs_schedule");
  if (pending.length === 0) return currentChildKey;

  const currentIndex = pending.findIndex((child) => child.childKey === currentChildKey);
  if (currentIndex === -1) return pending[0]?.childKey ?? null;
  return pending[currentIndex + 1]?.childKey ?? pending[0]?.childKey ?? null;
}
