import { listBillingSplits } from "@/lib/tuition/billing-splits";
import { listChargesForFamily, listChargesForFamilyGuardian } from "@/lib/tuition/charges";
import { listAdjustmentsForFamily } from "@/lib/tuition/adjustments";
import { listTuitionPaymentsForFamily } from "@/lib/tuition/payments";
import {
  fetchParentBillingFamilySummary,
  pickInitialChildKey,
  type ParentBillingFamilySummary,
} from "@/lib/tuition/parent-billing-summary";
import {
  getAutopayEnabledForGuardian,
  resolveGuardianIdForUser,
} from "@/lib/tuition/payment-settlement";
import { rowToBillingAccount } from "@/lib/tuition/row-mappers";
import { fetchFamilyBillingReadiness } from "@/lib/tuition/tuition-readiness";
import type { FamilyBillingReadiness } from "@/lib/tuition/tuition-readiness";
import type { TuitionCharge, TuitionAdjustment } from "@/lib/tuition/types";
import type { PaymentRecord } from "@/lib/stripe/application-payments";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export type ParentBillingInitialData = {
  charges: TuitionCharge[];
  allFamilyCharges: TuitionCharge[];
  payments: PaymentRecord[];
  adjustments: TuitionAdjustment[];
  readiness: FamilyBillingReadiness;
  familySummary: ParentBillingFamilySummary;
  autopayEnabled: boolean;
  guardianId: string | null;
  hasBillingSplit: boolean;
  initialChildKey: string | null;
};

export async function loadParentBillingInitialData(input: {
  organizationId: string;
  familyId: string;
  slug: string;
  userId: string;
}): Promise<ParentBillingInitialData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const guardianId = await resolveGuardianIdForUser(supabase, {
    familyId: input.familyId,
    userId: input.userId,
  });
  const billingSplits = await listBillingSplits(supabase, input.familyId);
  const hasBillingSplit = billingSplits.length > 0;

  const [allFamilyCharges, chargeRows, paymentRows, adjustmentRows, readinessState] =
    await Promise.all([
      listChargesForFamily(supabase, input.familyId),
      listChargesForFamilyGuardian(supabase, input.familyId, guardianId, {
        hasBillingSplit,
      }),
      listTuitionPaymentsForFamily(supabase, input.familyId),
      listAdjustmentsForFamily(supabase, input.familyId),
      fetchFamilyBillingReadiness(supabase, {
        organizationId: input.organizationId,
        familyId: input.familyId,
        slug: input.slug,
      }),
    ]);

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

  return {
    charges: chargeRows,
    allFamilyCharges,
    payments: paymentRows,
    adjustments: adjustmentRows,
    readiness: readinessState,
    familySummary,
    autopayEnabled,
    guardianId,
    hasBillingSplit,
    initialChildKey: pickInitialChildKey(familySummary.children),
  };
}
