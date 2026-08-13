import type { SupabaseClient } from "@supabase/supabase-js";
import type { ChargeStatus } from "./types";
import {
  chargeMatchesOutstandingPeriod,
  type OutstandingPeriod,
  resolveOutstandingDateRange,
  type SchoolYearBounds,
} from "./outstanding-period";

export type TuitionKpiBreakdownKind = "collected_ytd" | "outstanding" | "at_risk";

export type TuitionKpiBreakdownLine = {
  chargeId: string;
  label: string;
  studentName: string | null;
  amountCents: number;
  date: string;
  status: ChargeStatus;
};

export type TuitionKpiBreakdownFamily = {
  familyId: string;
  familyName: string;
  children: string[];
  totalCents: number;
  lines: TuitionKpiBreakdownLine[];
};

export type TuitionKpiBreakdown = {
  kind: TuitionKpiBreakdownKind;
  totalCents: number;
  familyCount: number;
  families: TuitionKpiBreakdownFamily[];
};

export type RawKpiChargeRow = {
  id: string;
  family_id: string;
  assignment_id: string;
  label: string;
  amount_cents: number;
  paid_cents: number | null;
  status: string;
  due_date: string;
  paid_at: string | null;
};

export function getTuitionYearStartUtc(referenceDate = new Date()): Date {
  const yearStart = new Date(referenceDate);
  yearStart.setUTCMonth(0, 1);
  yearStart.setUTCHours(0, 0, 0, 0);
  return yearStart;
}

export function remainingChargeBalanceCents(charge: RawKpiChargeRow): number {
  const amountCents = Number(charge.amount_cents);
  const paidCents = Number(charge.paid_cents ?? 0);
  return Math.max(0, amountCents - paidCents);
}

export function filterChargeLineForKind(
  charge: RawKpiChargeRow,
  kind: TuitionKpiBreakdownKind,
  yearStart: Date,
  options?: {
    outstandingPeriod?: OutstandingPeriod;
    schoolYearBounds?: SchoolYearBounds;
    referenceDate?: Date;
  },
): { amountCents: number; date: string } | null {
  if (kind === "collected_ytd") {
    if (charge.status !== "paid" || !charge.paid_at) return null;
    if (new Date(String(charge.paid_at)) < yearStart) return null;
    return {
      amountCents: Number(charge.amount_cents),
      date: String(charge.paid_at),
    };
  }

  if (kind === "outstanding") {
    const period = options?.outstandingPeriod ?? "current_month";
    const schoolYearBounds = options?.schoolYearBounds ?? {
      effectiveStart: null,
      effectiveEnd: null,
    };
    const referenceDate = options?.referenceDate ?? new Date();
    const range = resolveOutstandingDateRange(period, referenceDate, schoolYearBounds);
    if (period === "school_year_remainder" && !range) return null;
    if (!chargeMatchesOutstandingPeriod(charge, period, range)) return null;
    const amountCents = remainingChargeBalanceCents(charge);
    if (amountCents <= 0) return null;
    return {
      amountCents,
      date: String(charge.due_date),
    };
  }

  if (charge.status !== "overdue") return null;
  const amountCents = remainingChargeBalanceCents(charge);
  if (amountCents <= 0) return null;
  return {
    amountCents,
    date: String(charge.due_date),
  };
}

export function buildTuitionKpiBreakdown(args: {
  kind: TuitionKpiBreakdownKind;
  charges: RawKpiChargeRow[];
  familyNamesById: Map<string, string>;
  studentNameByAssignmentId: Map<string, string | null>;
  childrenByFamilyId: Map<string, string[]>;
  yearStart?: Date;
  outstandingPeriod?: OutstandingPeriod;
  schoolYearBounds?: SchoolYearBounds;
  referenceDate?: Date;
}): TuitionKpiBreakdown {
  const yearStart = args.yearStart ?? getTuitionYearStartUtc();
  const familiesById = new Map<string, TuitionKpiBreakdownFamily>();

  for (const charge of args.charges) {
    const filtered = filterChargeLineForKind(charge, args.kind, yearStart, {
      outstandingPeriod: args.outstandingPeriod,
      schoolYearBounds: args.schoolYearBounds,
      referenceDate: args.referenceDate,
    });
    if (!filtered) continue;

    const familyId = String(charge.family_id);
    const assignmentId = String(charge.assignment_id);
    const existing = familiesById.get(familyId) ?? {
      familyId,
      familyName: args.familyNamesById.get(familyId) ?? "Family",
      children: args.childrenByFamilyId.get(familyId) ?? [],
      totalCents: 0,
      lines: [],
    };

    existing.lines.push({
      chargeId: String(charge.id),
      label: String(charge.label),
      studentName: args.studentNameByAssignmentId.get(assignmentId) ?? null,
      amountCents: filtered.amountCents,
      date: filtered.date,
      status: charge.status as ChargeStatus,
    });
    existing.totalCents += filtered.amountCents;
    familiesById.set(familyId, existing);
  }

  const families = Array.from(familiesById.values())
    .map((family) => ({
      ...family,
      lines: [...family.lines].sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .sort((a, b) => {
      if (b.totalCents !== a.totalCents) return b.totalCents - a.totalCents;
      return a.familyName.localeCompare(b.familyName);
    });

  const totalCents = families.reduce((sum, family) => sum + family.totalCents, 0);

  return {
    kind: args.kind,
    totalCents,
    familyCount: families.length,
    families,
  };
}

export async function getTuitionKpiBreakdown(
  supabase: SupabaseClient,
  organizationId: string,
  kind: TuitionKpiBreakdownKind,
  options?: {
    outstandingPeriod?: OutstandingPeriod;
    schoolYearBounds?: SchoolYearBounds;
    referenceDate?: Date;
  },
): Promise<TuitionKpiBreakdown> {
  const [{ data: charges, error: chargesError }, { data: assignments, error: assignmentsError }] =
    await Promise.all([
      supabase
        .from("tuition_charges")
        .select(
          "id, family_id, assignment_id, label, amount_cents, paid_cents, status, due_date, paid_at",
        )
        .eq("organization_id", organizationId)
        .not("status", "eq", "void"),
      supabase
        .from("tuition_enrollment_assignments")
        .select("id, family_id, enrollment_id")
        .eq("organization_id", organizationId)
        .eq("status", "active"),
    ]);

  if (chargesError) throw chargesError;
  if (assignmentsError) throw assignmentsError;

  const chargeRows = (charges ?? []) as RawKpiChargeRow[];
  const familyIds = new Set<string>();
  for (const charge of chargeRows) {
    familyIds.add(String(charge.family_id));
  }

  const enrollmentIds = Array.from(
    new Set((assignments ?? []).map((assignment) => String(assignment.enrollment_id))),
  );

  const [
    { data: families, error: familiesError },
    { data: enrollments, error: enrollmentsError },
    { data: students, error: studentsError },
  ] = await Promise.all([
    familyIds.size > 0
      ? supabase
          .from("families")
          .select("id, name")
          .eq("organization_id", organizationId)
          .in("id", Array.from(familyIds))
      : Promise.resolve({ data: [], error: null }),
    enrollmentIds.length > 0
      ? supabase
          .from("enrollments")
          .select("id, student_id")
          .eq("organization_id", organizationId)
          .in("id", enrollmentIds)
      : Promise.resolve({ data: [], error: null }),
    familyIds.size > 0
      ? supabase
          .from("students")
          .select("id, family_id, first_name, last_name")
          .eq("organization_id", organizationId)
          .in("family_id", Array.from(familyIds))
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (familiesError) throw familiesError;
  if (enrollmentsError) throw enrollmentsError;
  if (studentsError) throw studentsError;

  const studentMap = new Map(
    (students ?? []).map((student) => [
      String(student.id),
      `${student.first_name} ${student.last_name}`.trim(),
    ]),
  );
  const enrollmentToStudent = new Map(
    (enrollments ?? []).map((enrollment) => [
      String(enrollment.id),
      String(enrollment.student_id),
    ]),
  );
  const studentNameByAssignmentId = new Map<string, string | null>();
  for (const assignment of assignments ?? []) {
    const enrollmentId = String(assignment.enrollment_id);
    const studentId = enrollmentToStudent.get(enrollmentId);
    studentNameByAssignmentId.set(
      String(assignment.id),
      studentId ? (studentMap.get(studentId) ?? null) : null,
    );
  }

  const childrenByFamilyId = new Map<string, string[]>();
  for (const student of students ?? []) {
    const familyId = String(student.family_id);
    const name = `${student.first_name} ${student.last_name}`.trim();
    const existing = childrenByFamilyId.get(familyId) ?? [];
    existing.push(name);
    childrenByFamilyId.set(familyId, existing);
  }

  const familyNamesById = new Map(
    (families ?? []).map((family) => [String(family.id), String(family.name)]),
  );

  return buildTuitionKpiBreakdown({
    kind,
    charges: chargeRows,
    familyNamesById,
    studentNameByAssignmentId,
    childrenByFamilyId,
    outstandingPeriod: options?.outstandingPeriod,
    schoolYearBounds: options?.schoolYearBounds,
    referenceDate: options?.referenceDate,
  });
}

export function tuitionKpiBreakdownTitle(kind: TuitionKpiBreakdownKind): string {
  switch (kind) {
    case "collected_ytd":
      return "Collected YTD";
    case "outstanding":
      return "Outstanding";
    case "at_risk":
      return "Families at risk";
  }
}
