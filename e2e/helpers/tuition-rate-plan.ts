import type { SupabaseClient } from "@supabase/supabase-js";
import { createRatePlanFromWizard } from "../../src/lib/tuition/setup-wizard";
import type { TuitionRatePlan } from "../../src/lib/tuition/types";

/**
 * Tuition E2E specs share the seeded program catalog. Each test archives existing
 * active rate plans for that program and publishes one wizard catalog so auto-assign
 * and sync-assignments are not blocked by ambiguous multi-catalog state.
 */
export async function ensureE2eRateCatalogForProgram(
  admin: SupabaseClient,
  organizationId: string,
  programId: string,
  namePrefix = "E2E",
): Promise<{ ratePlanId: string; ratePlan: TuitionRatePlan }> {
  const { error: archiveError } = await admin
    .from("tuition_rate_plans")
    .update({ status: "archived" })
    .eq("organization_id", organizationId)
    .eq("program_id", programId)
    .eq("status", "active");

  if (archiveError) throw archiveError;

  const ratePlan = await createRatePlanFromWizard(admin, {
    organizationId,
    programId,
    name: `${namePrefix} ${Date.now()}`,
    billingBasis: "annual",
    tiers: [{ label: "Standard", amount: "7200", isDefault: true }],
    effectiveStart: "2026-08-01",
    effectiveEnd: "2027-06-01",
    paymentCounts: [10],
    defaultPaymentCount: 10,
    fees: [],
  });

  return { ratePlanId: ratePlan.id, ratePlan };
}
