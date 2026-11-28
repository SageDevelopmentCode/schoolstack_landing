import type { SupabaseClient } from "@supabase/supabase-js";
import { listBillingSplits } from "@/lib/tuition/billing-splits";
import {
  filterChargesForFamilyGuardian,
  listChargesForFamily,
} from "@/lib/tuition/charges";
import { listAdjustmentsForFamily } from "@/lib/tuition/adjustments";
import { listParentTuitionPaymentHistory } from "@/lib/tuition/payments";
import {
  fetchParentBillingFamilySummary,
  pickInitialChildKey,
  type ParentBillingFamilySummary,
} from "@/lib/tuition/parent-billing-summary";
import {
  getAutopayEnabledForGuardian,
  resolveGuardianIdForUser,
} from "@/lib/tuition/payment-settlement";
import {
  getDefaultPaymentMethodForGuardian,
  type SavedPaymentMethodSummary,
} from "@/lib/tuition/payment-methods";
import { getRecentAutopayFailureForFamily } from "@/lib/tuition/autopay-failure-queries";
import { loadFamilyBillingRows } from "@/lib/tuition/family-billing-rows";
import { rowToBillingAccount } from "@/lib/tuition/row-mappers";
import { fetchFamilyBillingReadiness } from "@/lib/tuition/tuition-readiness";
import { shouldShowTaxCreditPaymentBanner } from "@/lib/tuition/family-checklist-responses";
import { loadParentTuitionAgreements } from "@/lib/tuition/load-parent-tuition-agreements";
import type { ParentFormListItem } from "@/lib/school-parent/forms-documents/types";
import type { FamilyBillingReadiness } from "@/lib/tuition/tuition-readiness";
import type { TuitionCharge, TuitionAdjustment } from "@/lib/tuition/types";
import type { ParentTuitionPaymentRecord } from "@/lib/tuition/payments";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export type ParentBillingInitialData = {
  charges: TuitionCharge[];
  allFamilyCharges: TuitionCharge[];
  payments: ParentTuitionPaymentRecord[];
  adjustments: TuitionAdjustment[];
  readiness: FamilyBillingReadiness;
  familySummary: ParentBillingFamilySummary;
  autopayEnabled: boolean;
  savedPaymentMethod: SavedPaymentMethodSummary | null;
  recentAutopayFailure: { createdAt: string; summary: string } | null;
  guardianId: string | null;
  hasBillingSplit: boolean;
  initialChildKey: string | null;
  showTaxCreditPaymentBanner: boolean;
  tuitionAgreements: ParentFormListItem[];
  chargesDeferred?: boolean;
  paymentsDeferred?: boolean;
};

export async function loadParentBillingInitialDataWithClient(
  supabase: SupabaseClient,
  input: {
    organizationId: string;
    familyId: string;
    slug: string;
    userId: string;
  },
  options?: {
    /** Defaults to the service role. Tests pass a fake. */
    catalogClient?: SupabaseClient;
  },
): Promise<ParentBillingInitialData> {
  // Catalog tables are staff-only. Callers check family access before this runs.
  const catalogClient = options?.catalogClient ?? createAdminClient();
  const { organizationId, familyId } = input;

  // Everything below starts as soon as its own inputs are ready, so the page
  // costs a few round trips instead of one per sub-loader. The family's
  // students, enrollments and assignments are read once and shared.
  const familyRowsPromise = loadFamilyBillingRows(supabase, { organizationId, familyId });
  const guardianIdPromise = resolveGuardianIdForUser(supabase, {
    familyId,
    userId: input.userId,
  });
  const billingSplitsPromise = listBillingSplits(supabase, familyId);
  const allFamilyChargesPromise = listChargesForFamily(supabase, familyId);
  const paymentPlanRowsPromise = (async () => {
    const { data, error } = await catalogClient
      .from("tuition_payment_plans")
      .select("id, name, installment_count")
      .eq("organization_id", organizationId);
    if (error) throw error;
    return data ?? [];
  })();

  const hasBillingSplitPromise = billingSplitsPromise.then((splits) => splits.length > 0);
  const chargeRowsPromise = Promise.all([
    allFamilyChargesPromise,
    guardianIdPromise,
    hasBillingSplitPromise,
  ]).then(([allFamilyCharges, guardianId, hasBillingSplit]) =>
    filterChargesForFamilyGuardian(allFamilyCharges, guardianId, { hasBillingSplit }),
  );

  const billingAccountPromise = (async () => {
    const { data: account } = await supabase
      .from("tuition_billing_accounts")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("family_id", familyId)
      .maybeSingle();
    return account ? rowToBillingAccount(account) : null;
  })();

  const savedPaymentMethodPromise = Promise.all([
    billingAccountPromise,
    guardianIdPromise,
  ]).then(([billingAccount, guardianId]) =>
    billingAccount && guardianId !== undefined
      ? getDefaultPaymentMethodForGuardian(supabase, {
          billingAccountId: billingAccount.id,
          guardianId,
          defaultPaymentMethodId: billingAccount.defaultPaymentMethodId,
        })
      : null,
  );

  const familySummaryPromise = Promise.all([
    chargeRowsPromise,
    allFamilyChargesPromise,
  ]).then(([charges, allFamilyCharges]) =>
    fetchParentBillingFamilySummary(
      supabase,
      { organizationId, familyId, charges, allFamilyCharges },
      {
        catalogClient,
        preloaded: {
          familyRows: familyRowsPromise,
          paymentPlanRows: paymentPlanRowsPromise,
        },
      },
    ),
  );

  const showTaxCreditPaymentBannerPromise = chargeRowsPromise.then((charges) =>
    shouldShowTaxCreditPaymentBanner(
      supabase,
      { familyId, charges },
      { familyRows: familyRowsPromise },
    ),
  );

  const [
    guardianId,
    hasBillingSplit,
    allFamilyCharges,
    chargeRows,
    paymentRows,
    adjustmentRows,
    readinessState,
    tuitionAgreements,
    familySummary,
    billingAccount,
    savedPaymentMethod,
    recentAutopayFailure,
    showTaxCreditPaymentBanner,
  ] = await Promise.all([
    guardianIdPromise,
    hasBillingSplitPromise,
    allFamilyChargesPromise,
    chargeRowsPromise,
    listParentTuitionPaymentHistory(supabase, familyId),
    listAdjustmentsForFamily(supabase, familyId),
    fetchFamilyBillingReadiness(
      supabase,
      { organizationId, familyId, slug: input.slug },
      {
        catalogClient,
        preloaded: {
          familyRows: familyRowsPromise,
          charges: allFamilyChargesPromise,
          paymentPlanRows: paymentPlanRowsPromise,
        },
      },
    ),
    loadParentTuitionAgreements(supabase, organizationId, familyId),
    familySummaryPromise,
    billingAccountPromise,
    savedPaymentMethodPromise,
    getRecentAutopayFailureForFamily(supabase, { organizationId, familyId }),
    showTaxCreditPaymentBannerPromise,
    familyRowsPromise,
    paymentPlanRowsPromise,
  ]);

  const autopayEnabled = billingAccount
    ? getAutopayEnabledForGuardian(billingAccount, guardianId)
    : false;

  return {
    charges: chargeRows,
    allFamilyCharges,
    payments: paymentRows,
    adjustments: adjustmentRows,
    readiness: readinessState,
    familySummary,
    autopayEnabled,
    savedPaymentMethod,
    recentAutopayFailure,
    guardianId,
    hasBillingSplit,
    initialChildKey: pickInitialChildKey(familySummary.children),
    showTaxCreditPaymentBanner,
    tuitionAgreements,
  };
}

export async function loadParentBillingInitialData(input: {
  organizationId: string;
  familyId: string;
  slug: string;
  userId: string;
}): Promise<ParentBillingInitialData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  return loadParentBillingInitialDataWithClient(supabase, input);
}

export async function loadParentBillingStreamedData(input: {
  organizationId: string;
  familyId: string;
  slug: string;
  userId: string;
}): Promise<ParentBillingInitialData> {
  const data = await loadParentBillingInitialData(input);
  return {
    ...data,
    charges: [],
    allFamilyCharges: [],
    payments: [],
    chargesDeferred: true,
    paymentsDeferred: true,
  };
}
