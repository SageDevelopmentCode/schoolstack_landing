import type { SupabaseClient } from "@supabase/supabase-js";
import { isParentFeatureEnabled } from "@/lib/organization-settings/parent-routes";
import type { OrganizationFeatures } from "@/lib/organization-settings/types";

export type OrganizationFridayBranchSettings = {
  parent_portal_paused: boolean;
};

export function getDefaultFridayBranchSettings(): OrganizationFridayBranchSettings {
  return {
    parent_portal_paused: false,
  };
}

export function parseOrganizationFridayBranchSettings(
  raw: Record<string, unknown> | null | undefined,
): OrganizationFridayBranchSettings {
  const defaults = getDefaultFridayBranchSettings();
  if (!raw || typeof raw !== "object") {
    return defaults;
  }

  return {
    parent_portal_paused:
      raw.parent_portal_paused === true ? true : defaults.parent_portal_paused,
  };
}

export function isFridayBranchParentPortalPaused(
  settings: OrganizationFridayBranchSettings | null | undefined,
): boolean {
  return Boolean(settings?.parent_portal_paused);
}

export function isFridayBranchParentPortalAvailable(
  features: OrganizationFeatures,
  settings: OrganizationFridayBranchSettings | null | undefined,
): boolean {
  if (!isParentFeatureEnabled(features, "friday_branch")) {
    return false;
  }
  return !isFridayBranchParentPortalPaused(settings);
}

export async function loadOrganizationFridayBranchSettings(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<OrganizationFridayBranchSettings> {
  const { data, error } = await supabase
    .from("organization_settings")
    .select("friday_branch")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) throw error;

  return parseOrganizationFridayBranchSettings(
    data?.friday_branch as Record<string, unknown> | null | undefined,
  );
}

export class FridayBranchParentPortalPausedError extends Error {
  status = 403;
  code = "friday_branch_paused";

  constructor(message = "Friday Branch signup is paused.") {
    super(message);
    this.name = "FridayBranchParentPortalPausedError";
  }
}

export async function assertFridayBranchParentPortalOpen(
  supabase: SupabaseClient,
  organizationId: string,
  features?: OrganizationFeatures | null,
): Promise<OrganizationFridayBranchSettings> {
  const settings = await loadOrganizationFridayBranchSettings(supabase, organizationId);

  if (features && !isParentFeatureEnabled(features, "friday_branch")) {
    throw new FridayBranchParentPortalPausedError(
      "Friday Branch is not available on the parent portal.",
    );
  }

  if (isFridayBranchParentPortalPaused(settings)) {
    throw new FridayBranchParentPortalPausedError();
  }

  return settings;
}
