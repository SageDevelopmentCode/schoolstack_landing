import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { normalizePublicSlug } from "@/lib/admissions/application-form-schema";
import { resolvePublishedApplyEntry } from "@/lib/admissions/resolve-published-apply-entry";
import { mergeBranding, mergeFeatures } from "@/lib/organization-settings/merge";
import type {
  OrganizationBranding,
  OrganizationFeatures,
} from "@/lib/organization-settings/types";

const PUBLIC_APPLY_CACHE_SECONDS = 60;

export type PublicApplyOrganization = {
  id: string;
  slug: string;
  name: string;
  branding: OrganizationBranding;
  features: OrganizationFeatures;
};

export function publishedApplyEntryTag(
  organizationId: string,
  formSlug: string,
): string {
  const slug = normalizePublicSlug(formSlug) || formSlug;
  return `published-apply-entry:${organizationId}:${slug}`;
}

export function createPublicReadClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function fetchPublicApplyOrganizationUncached(
  slug: string,
): Promise<PublicApplyOrganization | null> {
  const supabase = createPublicReadClient();
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .select("id, slug, name")
    .eq("slug", slug)
    .maybeSingle();

  if (orgError) throw orgError;
  if (!org) return null;

  const { data: settings, error: settingsError } = await supabase
    .from("organization_settings_public")
    .select("branding, features")
    .eq("organization_id", org.id)
    .maybeSingle();

  if (settingsError) throw settingsError;

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

export const fetchPublicApplyOrganization = cache(async (slug: string) => {
  return unstable_cache(
    () => fetchPublicApplyOrganizationUncached(slug),
    ["public-apply-org", slug],
    { revalidate: PUBLIC_APPLY_CACHE_SECONDS },
  )();
});

export const resolvePublishedApplyEntryCached = cache(
  async (organizationId: string, formSlug: string) => {
    const slug = normalizePublicSlug(formSlug) || formSlug;
    return unstable_cache(
      async () => {
        const supabase = createPublicReadClient();
        return resolvePublishedApplyEntry(supabase, organizationId, slug);
      },
      ["published-apply-entry", organizationId, slug],
      {
        revalidate: PUBLIC_APPLY_CACHE_SECONDS,
        tags: [publishedApplyEntryTag(organizationId, slug)],
      },
    )();
  },
);
