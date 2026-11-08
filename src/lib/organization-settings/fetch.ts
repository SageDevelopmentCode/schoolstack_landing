import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { createPublicReadClient } from "@/lib/admissions/public-apply-cache";
import { createClient } from "@/utils/supabase/server";
import { organizationSettingsTag } from "./cache-tags";
import { mergeBranding, mergeFeatures } from "./merge";
import {
  parseOrganizationFridayBranchSettings,
  type OrganizationFridayBranchSettings,
} from "@/lib/school-admin/friday-branch/friday-branch-org-settings";
import type { OrganizationBranding, OrganizationFeatures } from "./types";

export type OrganizationWithSettings = {
  id: string;
  slug: string;
  name: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
  fridayBranchSettings: OrganizationFridayBranchSettings;
};

export async function fetchOrganizationWithSettingsUncached(
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
    .from("organization_settings_public")
    .select("branding, features, friday_branch")
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
    fridayBranchSettings: parseOrganizationFridayBranchSettings(
      settings?.friday_branch as Record<string, unknown> | null | undefined,
    ),
  };
}

/** Same data as the signed-in read for every non-churned school, so one entry serves all users. */
const ORGANIZATION_SETTINGS_CACHE_SECONDS = 60;

class OrganizationNotPubliclyReadable extends Error {}

/**
 * Cookie-free read of `organizations` + `organization_settings_public` (both readable by `anon`
 * for non-churned schools), cached across requests and users. Saves call
 * `revalidateOrganizationSettings(slug)` so edits show up immediately; the TTL is only a backstop.
 * Misses are never cached: a school that was just created must not 404 for a minute.
 */
const fetchOrganizationWithSettingsCached = (slug: string) =>
  unstable_cache(
    async () => {
      const org = await fetchOrganizationWithSettingsUncached(
        createPublicReadClient(),
        slug,
      );
      if (!org) throw new OrganizationNotPubliclyReadable();
      return org;
    },
    ["org-with-settings", slug],
    {
      revalidate: ORGANIZATION_SETTINGS_CACHE_SECONDS,
      tags: [organizationSettingsTag(slug)],
    },
  )();

const fetchOrganizationWithSettingsBySlug = cache(async (slug: string) => {
  try {
    return await fetchOrganizationWithSettingsCached(slug);
  } catch {
    // Not public (churned or unknown slug) or the public read failed: use the request's own
    // session, exactly as before the cache existed.
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    return fetchOrganizationWithSettingsUncached(supabase, slug);
  }
});

export async function fetchOrganizationWithSettings(
  slug: string,
): Promise<OrganizationWithSettings | null> {
  return fetchOrganizationWithSettingsBySlug(slug);
}
