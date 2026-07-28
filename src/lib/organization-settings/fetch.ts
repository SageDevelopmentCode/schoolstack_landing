import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import { mergeBranding, mergeFeatures } from "./merge";
import type { OrganizationBranding, OrganizationFeatures } from "./types";

export type OrganizationWithSettings = {
  id: string;
  slug: string;
  name: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
};

async function fetchOrganizationWithSettingsUncached(
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

const fetchOrganizationWithSettingsBySlug = cache(async (slug: string) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  return fetchOrganizationWithSettingsUncached(supabase, slug);
});

export async function fetchOrganizationWithSettings(
  supabase: SupabaseClient,
  slug: string,
): Promise<OrganizationWithSettings | null> {
  return fetchOrganizationWithSettingsBySlug(slug);
}
