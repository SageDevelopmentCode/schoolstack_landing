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
import { rowToBillingAccount } from "@/lib/tuition/row-mappers";
import { fetchFamilyBillingReadiness } from "@/lib/tuition/tuition-readiness";
import { shouldShowTaxCreditPaymentBanner } from "@/lib/tuition/family-checklist-responses";
import type { FamilyBillingReadiness } from "@/lib/tuition/tuition-readiness";
import type { TuitionCharge, TuitionAdjustment } from "@/lib/tuition/types";
import type { ParentTuitionPaymentRecord } from "@/lib/tuition/payments";
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
): Promise<ParentBillingInitialData> {
  const guardianId = await resolveGuardianIdForUser(supabase, {
    familyId: input.familyId,
    userId: input.userId,
  });
  const billingSplits = await listBillingSplits(supabase, input.familyId);
  const hasBillingSplit = billingSplits.length > 0;

  const [allFamilyCharges, paymentRows, adjustmentRows, readinessState] =
    await Promise.all([
      listChargesForFamily(supabase, input.familyId),
      listParentTuitionPaymentHistory(supabase, input.familyId),
      listAdjustmentsForFamily(supabase, input.familyId),
      fetchFamilyBillingReadiness(supabase, {
        organizationId: input.organizationId,
        familyId: input.familyId,
        slug: input.slug,
      }),
    ]);

  const chargeRows = filterChargesForFamilyGuardian(
    allFamilyCharges,
    guardianId,
    { hasBillingSplit },
  );

  const familySummary = await fetchParentBillingFamilySummary(supabase, {
    organizationId: input.organizationId,
    familyId: input.familyId,
    charges: chargeRows,
    allFamilyCharges,
  });

  const { data: account } = await supabase
    .from("tuition_billing_accounts")
    .select("*")
    .eq("organization_id", input.organizationId)
    .eq("family_id", input.familyId)
    .maybeSingle();

  const billingAccount = account ? rowToBillingAccount(account) : null;
  const autopayEnabled = billingAccount
    ? getAutopayEnabledForGuardian(billingAccount, guardianId)
    : false;

  const savedPaymentMethod =
    billingAccount && guardianId !== undefined
      ? await getDefaultPaymentMethodForGuardian(supabase, {
          billingAccountId: billingAccount.id,
          guardianId,
          defaultPaymentMethodId: billingAccount.defaultPaymentMethodId,
        })
      : null;

  const recentAutopayFailure = await getRecentAutopayFailureForFamily(supabase, {
    organizationId: input.organizationId,
    familyId: input.familyId,
  });

  const showTaxCreditPaymentBanner = await shouldShowTaxCreditPaymentBanner(
    supabase,
    {
      familyId: input.familyId,
      charges: chargeRows,
    },
  );

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
