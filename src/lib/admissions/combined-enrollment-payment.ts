import type { SupabaseClient } from "@supabase/supabase-js";
import { loadEnrollmentChecklistsForApplications } from "@/lib/admissions/enrollment-checklist-materialization";
import { listFamilyApplications } from "@/lib/admissions/parent-portal-access";
import {
  quoteProcessingFee,
  type CheckoutPaymentMethod,
  type ProcessingFeeQuote,
} from "@/lib/stripe/processing-fee";

export type CombinedEnrollmentPaymentCandidate = {
  instanceId: string;
  applicationId: string;
  studentName: string;
  feeLabel: string;
  amountCents: number;
};

export type CombinedEnrollmentPaymentQuote = {
  candidates: CombinedEnrollmentPaymentCandidate[];
  combinedQuote: ProcessingFeeQuote;
  separateGrossCents: number;
  savingsCents: number;
};

export type CombinedPaymentAllocation = {
  netAmountCents: number;
  chargedAmountCents: number;
  processingFeeCents: number;
};

export function allocateCombinedPaymentAmounts(
  netAmounts: number[],
  combinedQuote: ProcessingFeeQuote,
): CombinedPaymentAllocation[] {
  const totalNet = netAmounts.reduce((sum, amount) => sum + amount, 0);
  if (totalNet <= 0) {
    throw new Error("Combined net amount must be greater than zero.");
  }

  const grossAmounts = allocateGrossAcrossLineItems(
    netAmounts,
    combinedQuote.grossAmountCents,
  );

  return netAmounts.map((netAmountCents, index) => {
    const chargedAmountCents = grossAmounts[index] ?? netAmountCents;
    return {
      netAmountCents,
      chargedAmountCents,
      processingFeeCents: chargedAmountCents - netAmountCents,
    };
  });
}

export function allocateGrossAcrossLineItems(
  netAmounts: number[],
  totalGrossCents: number,
): number[] {
  const totalNet = netAmounts.reduce((sum, amount) => sum + amount, 0);
  if (totalNet <= 0) {
    throw new Error("Total net amount must be greater than zero.");
  }

  let allocatedGross = 0;

  return netAmounts.map((netAmountCents, index) => {
    const isLast = index === netAmounts.length - 1;
    if (isLast) {
      return totalGrossCents - allocatedGross;
    }

    const grossAmountCents = Math.round((totalGrossCents * netAmountCents) / totalNet);
    allocatedGross += grossAmountCents;
    return grossAmountCents;
  });
}

export function buildCombinedEnrollmentPaymentQuote(
  candidates: CombinedEnrollmentPaymentCandidate[],
  paymentMethod: CheckoutPaymentMethod,
): CombinedEnrollmentPaymentQuote {
  if (candidates.length < 2) {
    throw new Error("Combined checkout requires at least two payment items.");
  }

  const totalNetCents = candidates.reduce(
    (sum, candidate) => sum + candidate.amountCents,
    0,
  );
  const combinedQuote = quoteProcessingFee(totalNetCents, paymentMethod);
  const separateGrossCents = candidates.reduce(
    (sum, candidate) =>
      sum + quoteProcessingFee(candidate.amountCents, paymentMethod).grossAmountCents,
    0,
  );

  return {
    candidates,
    combinedQuote,
    separateGrossCents,
    savingsCents: Math.max(0, separateGrossCents - combinedQuote.grossAmountCents),
  };
}

function isUnpaidPaymentInstance(input: {
  itemType: string;
  instanceStatus: string;
  paymentStatus: string;
  amountCents: number;
}): boolean {
  return (
    input.itemType === "payment" &&
    input.amountCents > 0 &&
    input.instanceStatus !== "completed" &&
    input.paymentStatus !== "paid"
  );
}

export async function listCombinedEnrollmentPaymentCandidates(
  supabase: SupabaseClient,
  input: { organizationId: string; userId: string },
): Promise<CombinedEnrollmentPaymentCandidate[]> {
  const applications = await listFamilyApplications(
    supabase,
    input.organizationId,
    input.userId,
  );
  const enrollingApplications = applications.filter(
    (application) => application.status === "enrolling",
  );

  if (enrollingApplications.length < 2) {
    return [];
  }

  const applicationIds = enrollingApplications.map((application) => application.id);
  const studentNameByApplicationId = new Map(
    enrollingApplications.map((application) => [
      application.id,
      application.studentName?.trim() || "Student",
    ]),
  );
  const checklistsByApplicationId = await loadEnrollmentChecklistsForApplications(
    supabase,
    applicationIds,
  );

  const candidates: CombinedEnrollmentPaymentCandidate[] = [];

  for (const applicationId of applicationIds) {
    const checklist = checklistsByApplicationId[applicationId];
    if (!checklist) continue;

    const itemsByTemplateId = new Map(
      checklist.items.map((item) => [item.id, item]),
    );

    for (const instance of checklist.instances) {
      const templateItem = itemsByTemplateId.get(instance.templateItemId);
      if (!templateItem) continue;

      const amountCents = templateItem.payment?.amountCents ?? 0;
      if (
        !isUnpaidPaymentInstance({
          itemType: templateItem.type,
          instanceStatus: instance.status,
          paymentStatus: instance.paymentStatus ?? "pending",
          amountCents,
        })
      ) {
        continue;
      }

      candidates.push({
        instanceId: instance.id,
        applicationId,
        studentName: studentNameByApplicationId.get(applicationId) ?? "Student",
        feeLabel: templateItem.payment?.label || templateItem.label,
        amountCents,
      });
    }
  }

  return candidates.sort((left, right) => {
    const nameCompare = left.studentName.localeCompare(right.studentName);
    if (nameCompare !== 0) return nameCompare;
    return left.feeLabel.localeCompare(right.feeLabel);
  });
}

export async function loadValidatedCombinedCheckoutCandidates(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    userId: string;
    checklistItemIds: string[];
  },
): Promise<
  | { ok: true; candidates: CombinedEnrollmentPaymentCandidate[] }
  | { ok: false; error: string; code: string; status: number }
> {
  const uniqueIds = [...new Set(input.checklistItemIds.filter(Boolean))];
  if (uniqueIds.length < 2) {
    return {
      ok: false,
      error: "Select at least two enrollment payments to combine.",
      code: "insufficient_items",
      status: 400,
    };
  }

  const eligibleCandidates = await listCombinedEnrollmentPaymentCandidates(supabase, {
    organizationId: input.organizationId,
    userId: input.userId,
  });
  const candidateByInstanceId = new Map(
    eligibleCandidates.map((candidate) => [candidate.instanceId, candidate]),
  );

  const selectedCandidates: CombinedEnrollmentPaymentCandidate[] = [];
  for (const instanceId of uniqueIds) {
    const candidate = candidateByInstanceId.get(instanceId);
    if (!candidate) {
      return {
        ok: false,
        error: "One or more selected payments are no longer available for combined checkout.",
        code: "invalid_items",
        status: 400,
      };
    }
    selectedCandidates.push(candidate);
  }

  return { ok: true, candidates: selectedCandidates };
}
