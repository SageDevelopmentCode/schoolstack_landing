import type { SupabaseClient } from "@supabase/supabase-js";
import { mergeBranding, mergeFeatures } from "./merge";
import type { OrganizationBranding, OrganizationFeatures } from "./types";

export type OrganizationWithSettings = {
  id: string;
  slug: string;
  name: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
};

export async function fetchOrganizationWithSettings(
  supabase: SupabaseClient,
  slug: string,
): Promise<OrganizationWithSettings | null> {
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, slug, name")
    .eq("slug", slug)
    .maybeSingle();

  if (orgError || !org) return null;

  const { data: settings } = await supabase
    .from("organization_settings")
    .select("branding, features")
    .eq("organization_id", org.id)
    .maybeSingle();

  return {
    id: org.id,
    slug: org.slug,
    name: org.name,
    branding: mergeBranding(
      settings?.branding as Record<string, unknown> | null | undefined,
    ),
    features: mergeFeatures(
      settings?.features as Record<string, unknown> | null | undefined,
    ),
  };
}
