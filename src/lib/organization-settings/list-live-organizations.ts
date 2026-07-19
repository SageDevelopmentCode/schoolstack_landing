import type { SupabaseClient } from "@supabase/supabase-js";
import { mergeBranding } from "./merge";
import type { OrganizationBranding } from "./types";

export type LiveOrganizationOption = {
  id: string;
  slug: string;
  name: string;
  branding: OrganizationBranding;
};

export async function listLiveOrganizations(
  supabase: SupabaseClient,
): Promise<LiveOrganizationOption[]> {
  const { data, error } = await supabase
    .from("organizations")
    .select(
      `
      id,
      slug,
      name,
      organization_settings (
        branding
      )
    `,
    )
    .eq("status", "live")
    .order("name", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => {
    const settings = row.organization_settings as
      | { branding?: Record<string, unknown> }
      | { branding?: Record<string, unknown> }[]
      | null;
    const settingsRow = Array.isArray(settings) ? settings[0] : settings;

    return {
      id: String(row.id),
      slug: String(row.slug),
      name: String(row.name),
      branding: mergeBranding(settingsRow?.branding),
    };
  });
}
