import { cookies } from "next/headers";
import { getFamilyPreviewGuardianId } from "@/lib/admissions/family-preview-access";
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
} from "@/lib/tuition/parent-billing-summary";
import { getAutopayEnabledForGuardian } from "@/lib/tuition/payment-settlement";
import { getDefaultPaymentMethodForGuardian } from "@/lib/tuition/payment-methods";
import { getRecentAutopayFailureForFamily } from "@/lib/tuition/autopay-failure-queries";
import { rowToBillingAccount } from "@/lib/tuition/row-mappers";
import { fetchFamilyBillingReadiness } from "@/lib/tuition/tuition-readiness";
import { shouldShowTaxCreditPaymentBanner } from "@/lib/tuition/family-checklist-responses";
import type { ParentBillingInitialData } from "@/lib/tuition/load-parent-billing-data";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function loadParentBillingPreviewData(input: {
  organizationId: string;
  familyId: string;
  slug: string;
}): Promise<ParentBillingInitialData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const admin = createAdminClient();

  const guardianId = await getFamilyPreviewGuardianId(
    supabase,
    input.organizationId,
    input.familyId,
  );
  const billingSplits = await listBillingSplits(admin, input.familyId);
  const hasBillingSplit = billingSplits.length > 0;

  const [allFamilyCharges, paymentRows, adjustmentRows, readinessState] =
    await Promise.all([
      listChargesForFamily(admin, input.familyId),
      listParentTuitionPaymentHistory(admin, input.familyId),
      listAdjustmentsForFamily(admin, input.familyId),
      fetchFamilyBillingReadiness(admin, {
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

  const familySummary = await fetchParentBillingFamilySummary(admin, {
    organizationId: input.organizationId,
    familyId: input.familyId,
    charges: chargeRows,
    allFamilyCharges,
  });

  const { data: account } = await admin
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
      ? await getDefaultPaymentMethodForGuardian(admin, {
          billingAccountId: billingAccount.id,
          guardianId,
          defaultPaymentMethodId: billingAccount.defaultPaymentMethodId,
        })
      : null;

  const recentAutopayFailure = await getRecentAutopayFailureForFamily(admin, {
    organizationId: input.organizationId,
    familyId: input.familyId,
  });

  const showTaxCreditPaymentBanner = await shouldShowTaxCreditPaymentBanner(
    admin,
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
