import type { SupabaseClient } from "@supabase/supabase-js";
import { chargeRemainingCents } from "./billing-splits";
import type { InstallmentChargeBalance } from "./payment-settlement";
import type { TuitionCharge } from "./types";

export const IDAHO_PARENT_CHOICE_TAX_CREDIT_ITEM_KEY =
  "idaho_parent_choice_tax_credit";

const OPEN_CHARGE_STATUSES = new Set(["scheduled", "sent", "overdue"]);

function extractChecklistResponseValue(
  responses: Record<string, unknown> | null | undefined,
): string | null {
  if (!responses || typeof responses !== "object" || Array.isArray(responses)) {
    return null;
  }

  for (const value of Object.values(responses)) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return null;
}

export async function familyHasChecklistResponse(
  supabase: SupabaseClient,
  input: {
    familyId: string;
    itemKey: string;
    responseValue: string;
  },
): Promise<boolean> {
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id")
    .eq("family_id", input.familyId);

  if (studentsError) throw studentsError;
  const studentIds = (students ?? []).map((row) => String(row.id));
  if (studentIds.length === 0) return false;

  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("id")
    .in("student_id", studentIds);

  if (enrollmentsError) throw enrollmentsError;
  const enrollmentIds = (enrollments ?? []).map((row) => String(row.id));
  if (enrollmentIds.length === 0) return false;

  const { data: checklists, error: checklistsError } = await supabase
    .from("enrollment_checklists")
    .select("id")
    .in("enrollment_id", enrollmentIds);

  if (checklistsError) throw checklistsError;
  const checklistIds = (checklists ?? []).map((row) => String(row.id));
  if (checklistIds.length === 0) return false;

  const { data: items, error: itemsError } = await supabase
    .from("enrollment_checklist_items")
    .select("item_key, responses, status")
    .in("checklist_id", checklistIds)
    .eq("item_key", input.itemKey);

  if (itemsError) throw itemsError;

  return (items ?? []).some((item) => {
    const responses =
      item.responses &&
      typeof item.responses === "object" &&
      !Array.isArray(item.responses)
        ? (item.responses as Record<string, unknown>)
        : null;
    const value = extractChecklistResponseValue(responses);
    return value === input.responseValue;
  });
}

export function familyHasOpenTuitionInstallments(charges: TuitionCharge[]): boolean {
  return charges.some(
    (charge) =>
      OPEN_CHARGE_STATUSES.has(charge.status) && chargeRemainingCents(charge) > 0,
  );
}

export function getAssignmentPaymentContext(
  charges: TuitionCharge[],
  assignmentId: string,
  currentChargeId: string,
): {
  payRemainingYearCents: number;
  futureOpenCharges: InstallmentChargeBalance[];
} {
  const assignmentCharges = charges.filter(
    (charge) =>
      charge.assignmentId === assignmentId &&
      OPEN_CHARGE_STATUSES.has(charge.status),
  );

  const payRemainingYearCents = assignmentCharges.reduce(
    (sum, charge) => sum + chargeRemainingCents(charge),
    0,
  );

  const futureOpenCharges = assignmentCharges
    .filter((charge) => charge.id !== currentChargeId)
    .map((charge) => ({
      amountCents: charge.amountCents,
      paidCents: charge.paidCents,
    }));

  return { payRemainingYearCents, futureOpenCharges };
}

export async function shouldShowTaxCreditPaymentBanner(
  supabase: SupabaseClient,
  input: {
    familyId: string;
    charges: TuitionCharge[];
  },
): Promise<boolean> {
  if (!familyHasOpenTuitionInstallments(input.charges)) {
    return false;
  }

  return familyHasChecklistResponse(supabase, {
    familyId: input.familyId,
    itemKey: IDAHO_PARENT_CHOICE_TAX_CREDIT_ITEM_KEY,
    responseValue: "yes",
  });
}
