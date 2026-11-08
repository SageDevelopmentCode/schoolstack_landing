import { NextResponse } from "next/server";
import { isAdminFeatureEnabled } from "@/lib/organization-settings/admin-routes";
import { mergeFeatures } from "@/lib/organization-settings/merge";
import {
  applyPlanToFeatures,
  parseOrganizationPlan,
} from "@/lib/organization-settings/plans";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Paid schools are unchanged. A free school may only call a route when that
 * admin feature is still on after the plan cap.
 */
export async function freePlanFeatureDeniedResponse(opts: {
  organizationId: string;
  featureKey: string;
}): Promise<NextResponse | null> {
  const admin = createAdminClient();
  const { data: organization, error } = await admin
    .from("organizations")
    .select("plan")
    .eq("id", opts.organizationId)
    .maybeSingle();

  if (error || !organization) return null;

  const plan = parseOrganizationPlan(organization.plan);
  if (plan !== "free") return null;

  const { data: settings } = await admin
    .from("organization_settings")
    .select("features")
    .eq("organization_id", opts.organizationId)
    .maybeSingle();

  const storedFeatures =
    settings?.features && typeof settings.features === "object"
      ? (settings.features as Record<string, unknown>)
      : null;
  const features = applyPlanToFeatures(mergeFeatures(storedFeatures), plan);

  if (isAdminFeatureEnabled(features, opts.featureKey)) return null;

  return NextResponse.json(
    {
      error: "This isn't included on the free plan.",
      code: "plan_feature_disabled",
    },
    { status: 403 },
  );
}
