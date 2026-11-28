import type { SupabaseClient } from "@supabase/supabase-js";
import { chargeRemainingCents } from "./billing-splits";
import { rowToAssignment } from "./row-mappers";
import {
  getFamilyTuitionSelectionContexts,
  loadAssignmentStudentLookup,
  type FamilyTuitionSelectionItem,
} from "./enrollment-selection";
import type { FamilyBillingRows, MaybePromise } from "./family-billing-rows";
import { paymentScheduleLabel } from "./setup-wizard";
import type { TuitionCharge, TuitionEnrollmentAssignment } from "./types";

export type PaymentPlanSummary = {
  name: string;
  installmentCount: number;
};

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
  nextChargeId: string | null;
  status: ParentBillingChildStatus;
  selectionItem: FamilyTuitionSelectionItem | null;
  paymentPlanLabel: string | null;
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

export function resolvePaymentPlanLabel(input: {
  assignment: Pick<TuitionEnrollmentAssignment, "paymentPlanId">;
  selectionItem: FamilyTuitionSelectionItem | null;
  paymentPlansById: Map<string, PaymentPlanSummary>;
}): string | null {
  if (input.selectionItem) {
    const plan = input.selectionItem.context.ratePlan.paymentPlans.find(
      (item) => item.id === input.assignment.paymentPlanId,
    );
    if (plan) {
      return plan.name || paymentScheduleLabel(plan.installmentCount);
    }
  }

  const plan = input.paymentPlansById.get(input.assignment.paymentPlanId);
  if (plan) {
    return plan.name || paymentScheduleLabel(plan.installmentCount);
  }

  return null;
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

export function resolveNextChargeIdForAssignment(
  charges: TuitionCharge[],
  dueDate: string | null | undefined,
): string | null {
  if (!dueDate) return null;

  const openOnDate = charges
    .filter(
      (charge) =>
        charge.dueDate === dueDate && OPEN_CHARGE_STATUSES.has(charge.status),
    )
    .sort((a, b) => (a.installmentNumber ?? 0) - (b.installmentNumber ?? 0));

  return openOnDate[0]?.id ?? null;
}

export function countOpenChargesOnEarliestDueDate(charges: TuitionCharge[]): number {
  const openCharges = charges.filter((charge) =>
    OPEN_CHARGE_STATUSES.has(charge.status),
  );
  if (openCharges.length === 0) return 0;

  const earliestDueDate = [...openCharges].sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate),
  )[0]!.dueDate;

  return openCharges.filter((charge) => charge.dueDate === earliestDueDate).length;
}

export function childFirstNameFromFullName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function listOpenChargesOnEarliestDueDate(
  charges: TuitionCharge[],
): TuitionCharge[] {
  const openCharges = charges.filter((charge) =>
    OPEN_CHARGE_STATUSES.has(charge.status),
  );
  if (openCharges.length === 0) return [];

  const earliestDueDate = [...openCharges].sort((a, b) =>
    a.dueDate.localeCompare(b.dueDate),
  )[0]!.dueDate;

  return openCharges
    .filter((charge) => charge.dueDate === earliestDueDate)
    .sort((a, b) => (a.installmentNumber ?? 0) - (b.installmentNumber ?? 0));
}

export function resolveFamilyPayNowLabel(input: {
  chargesOnEarliestDueDate: number;
}): string {
  if (input.chargesOnEarliestDueDate > 1) {
    return "Pay combined";
  }

  return "Pay now";
}

export function buildParentBillingFamilySummary(input: {
  assignments: AssignmentRow[];
  charges: TuitionCharge[];
  selectionItems: FamilyTuitionSelectionItem[];
  allFamilyCharges?: TuitionCharge[];
  paymentPlansById?: Map<string, PaymentPlanSummary>;
}): ParentBillingFamilySummary {
  const paymentPlansById = input.paymentPlansById ?? new Map();
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
      nextChargeId: resolveNextChargeIdForAssignment(
        assignmentCharges,
        upcomingDue.nextCharge?.dueDate,
      ),
      status,
      selectionItem,
      paymentPlanLabel: resolvePaymentPlanLabel({
        assignment: row.assignment,
        selectionItem,
        paymentPlansById,
      }),
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
  options?: {
    /** Service-role client for payment-plan labels. Catalog tables are staff-only. */
    catalogClient?: SupabaseClient;
    /** Rows the parent billing page has already loaded; each one skips queries here. */
    preloaded?: {
      familyRows?: MaybePromise<FamilyBillingRows>;
      /** The org's `tuition_payment_plans` rows (id, name, installment_count). */
      paymentPlanRows?: MaybePromise<
        Array<{ id: unknown; name: unknown; installment_count: unknown }>
      >;
    };
  },
): Promise<ParentBillingFamilySummary> {
  const catalog = options?.catalogClient ?? supabase;
  const preloaded = options?.preloaded;
  const familyRows = preloaded?.familyRows ? await preloaded.familyRows : undefined;

  const assignmentRowsPromise: Promise<Array<Record<string, unknown>>> = familyRows
    ? Promise.resolve(familyRows.activeAssignmentRows)
    : (async () => {
        const { data, error } = await supabase
          .from("tuition_enrollment_assignments")
          .select("*")
          .eq("organization_id", input.organizationId)
          .eq("family_id", input.familyId)
          .eq("status", "active");
        if (error) throw error;
        return data ?? [];
      })();

  const paymentPlanRowsPromise = preloaded?.paymentPlanRows
    ? Promise.resolve(preloaded.paymentPlanRows)
    : (async () => {
        const { data, error } = await catalog
          .from("tuition_payment_plans")
          .select("id, name, installment_count")
          .eq("organization_id", input.organizationId);
        if (error) throw error;
        return data ?? [];
      })();

  // The name lookups only need the assignment rows, so they start as soon as
  // those arrive instead of after the selection contexts.
  const studentLookupPromise = assignmentRowsPromise.then((rows) =>
    rows.length > 0 ? loadAssignmentStudentLookup(supabase, rows, familyRows) : null,
  );

  const [selectionItems, rows, paymentPlanRows, studentLookup] = await Promise.all([
    getFamilyTuitionSelectionContexts(
      supabase,
      {
        organizationId: input.organizationId,
        familyId: input.familyId,
      },
      { catalogClient: catalog, familyRows },
    ),
    assignmentRowsPromise,
    paymentPlanRowsPromise,
    studentLookupPromise,
  ]);

  const paymentPlansById = new Map(
    paymentPlanRows.map((plan) => [
      String(plan.id),
      {
        name: String(plan.name),
        installmentCount: Number(plan.installment_count),
      },
    ]),
  );

  if (rows.length === 0 || !studentLookup) {
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
        nextChargeId: null,
        status: "needs_schedule" as const,
        selectionItem: item,
        paymentPlanLabel: resolvePaymentPlanLabel({
          assignment: item.context.assignment,
          selectionItem: item,
          paymentPlansById,
        }),
      })),
    };
  }

  const { enrollmentStudentId, studentNameById } = studentLookup;

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
    paymentPlansById,
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
