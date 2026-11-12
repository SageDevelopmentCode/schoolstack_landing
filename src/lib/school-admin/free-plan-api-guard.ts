import { isAdminFeatureEnabled } from "@/lib/organization-settings/admin-routes";
import { mergeFeatures } from "@/lib/organization-settings/merge";
import {
  applyPlanToFeatures,
  parseOrganizationPlan,
} from "@/lib/organization-settings/plans";
import { createAdminClient } from "@/utils/supabase/admin";

const OPEN_PREFIXES = [
  "/api/school-admin/dashboard-summary",
  "/api/school-admin/activity-notifications",
  "/api/school-admin/portal-options",
  "/api/school-admin/profile-photo",
  "/api/school-admin/support-requests",
  "/api/school-admin/operational-errors",
  "/api/school-admin/revalidate-settings",
] as const;

const FEATURE_PREFIXES: { prefix: string; feature: string }[] = [
  { prefix: "/api/school-admin/application-forms", feature: "admissions" },
  { prefix: "/api/school-admin/admissions", feature: "admissions" },
  { prefix: "/api/school-admin/messages", feature: "messages" },
  { prefix: "/api/school-admin/friday-branch", feature: "my_school" },
  { prefix: "/api/school-admin/attendance", feature: "my_school" },
  { prefix: "/api/school-admin/students", feature: "my_school" },
  { prefix: "/api/school-admin/tuition", feature: "my_school" },
  { prefix: "/api/school-admin/staff-hours", feature: "my_school" },
  { prefix: "/api/school-admin/school-profile-photos", feature: "my_school" },
  { prefix: "/api/school-admin/school-profile", feature: "my_school" },
  { prefix: "/api/school-admin/forms-documents", feature: "my_school" },
  { prefix: "/api/school-admin/committees", feature: "committees" },
  { prefix: "/api/school-admin/schedule", feature: "schedule" },
  { prefix: "/api/school-admin/finances", feature: "finances" },
  { prefix: "/api/school-admin/photo-media-consents", feature: "photos" },
  { prefix: "/api/school-admin/notifications", feature: "notifications" },
];

export const FREE_PLAN_FEATURE_DENIED_MESSAGE =
  "This isn't included on the free plan.";

export type SchoolAdminApiPlanGate = "open" | { feature: string };

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * `null` means the path is not a school-admin API route, or it is one this
 * map does not classify. `"open"` is intentionally available on the free plan.
 */
export function classifySchoolAdminApiPath(
  pathname: string,
): SchoolAdminApiPlanGate | null {
  if (!pathname.startsWith("/api/school-admin/")) return null;

  for (const prefix of OPEN_PREFIXES) {
    if (matchesPrefix(pathname, prefix)) return "open";
  }

  for (const row of FEATURE_PREFIXES) {
    if (matchesPrefix(pathname, row.prefix)) return { feature: row.feature };
  }

  return null;
}

/**
 * Paid schools are unchanged. A free school may only call a classified route
 * when that admin feature is still on after the plan cap.
 * Returns the denial message, or null when the call may continue.
 */
export async function freePlanSchoolAdminApiDenial(opts: {
  organizationId: string;
  pathname: string;
}): Promise<string | null> {
  const gate = classifySchoolAdminApiPath(opts.pathname);
  if (!gate || gate === "open") return null;

  const admin = createAdminClient();
  const { data: organization, error } = await admin
    .from("organizations")
    .select("plan")
    .eq("id", opts.organizationId)
    .maybeSingle();

  if (error || !organization) return null;

  const plan = parseOrganizationPlan(organization.plan);
  if (plan !== "free") return null;

  // Newsletters does not use these routes. Keep students, tuition, and the
  // rest of My School closed even though that flag is on for the newsletter page.
  if (gate.feature === "my_school") return FREE_PLAN_FEATURE_DENIED_MESSAGE;

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

  if (isAdminFeatureEnabled(features, gate.feature)) return null;

  return FREE_PLAN_FEATURE_DENIED_MESSAGE;
}
