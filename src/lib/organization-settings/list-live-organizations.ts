import type { SupabaseClient } from "@supabase/supabase-js";
import { mergeBranding } from "./merge";
import type { OrganizationBranding } from "./types";

export type LiveOrganizationOption = {
  id: string;
  slug: string;
  name: string;
  branding: OrganizationBranding;
};

async function loadPublicBrandingByOrganizationId(
  supabase: SupabaseClient,
  organizationIds: string[],
): Promise<Map<string, Record<string, unknown> | null>> {
  const brandingByOrgId = new Map<string, Record<string, unknown> | null>();
  if (organizationIds.length === 0) return brandingByOrgId;

  const { data, error } = await supabase
    .from("organization_settings_public")
    .select("organization_id, branding")
    .in("organization_id", organizationIds);

  if (error) throw error;

  for (const row of data ?? []) {
    brandingByOrgId.set(
      String(row.organization_id),
      (row.branding as Record<string, unknown> | null | undefined) ?? null,
    );
  }

  return brandingByOrgId;
}

export async function listLiveOrganizations(
  supabase: SupabaseClient,
): Promise<LiveOrganizationOption[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select("id, slug, name")
    .eq("status", "live")
    .order("name", { ascending: true });

  if (error) throw error;

  const rows = data ?? [];
  const brandingByOrgId = await loadPublicBrandingByOrganizationId(
    supabase,
    rows.map((row) => String(row.id)),
  );

  return rows.map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    branding: mergeBranding(brandingByOrgId.get(String(row.id))),
  }));
}
