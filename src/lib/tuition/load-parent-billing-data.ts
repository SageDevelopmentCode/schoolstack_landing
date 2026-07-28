import { listChargesForFamily } from "@/lib/tuition/charges";
import { listAdjustmentsForFamily } from "@/lib/tuition/adjustments";
import { listTuitionPaymentsForFamily } from "@/lib/tuition/payments";
import {
  fetchParentBillingFamilySummary,
  pickInitialChildKey,
  type ParentBillingFamilySummary,
} from "@/lib/tuition/parent-billing-summary";
import { fetchFamilyBillingReadiness } from "@/lib/tuition/tuition-readiness";
import type { FamilyBillingReadiness } from "@/lib/tuition/tuition-readiness";
import type { TuitionCharge, TuitionAdjustment } from "@/lib/tuition/types";
import type { PaymentRecord } from "@/lib/stripe/application-payments";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export type ParentBillingInitialData = {
  charges: TuitionCharge[];
  payments: PaymentRecord[];
  adjustments: TuitionAdjustment[];
  readiness: FamilyBillingReadiness;
  familySummary: ParentBillingFamilySummary;
  autopayEnabled: boolean;
  initialChildKey: string | null;
};

export async function loadParentBillingInitialData(input: {
  organizationId: string;
  familyId: string;
  slug: string;
}): Promise<ParentBillingInitialData> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [chargeRows, paymentRows, adjustmentRows, readinessState] =
    await Promise.all([
      listChargesForFamily(supabase, input.familyId),
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
  });

  const { data: account } = await supabase
    .from("tuition_billing_accounts")
    .select("autopay_enabled")
    .eq("organization_id", input.organizationId)
    .eq("family_id", input.familyId)
    .maybeSingle();

  return {
    charges: chargeRows,
    payments: paymentRows,
    adjustments: adjustmentRows,
    readiness: readinessState,
    familySummary,
    autopayEnabled: Boolean(account?.autopay_enabled),
    initialChildKey: pickInitialChildKey(familySummary.children),
  };
}
