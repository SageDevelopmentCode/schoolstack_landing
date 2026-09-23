import type { SupabaseClient } from '@supabase/supabase-js';

import {
  parseOrganizationBranding,
  toOrganizationBranding,
  type LiveOrganization,
  type OrganizationBrandingView,
} from '@/lib/organizations';
import { getSupabaseClient } from '@/lib/supabase';
import type { OrganizationBranding } from '@/lib/organization-settings/types';
import {
  parseSchoolAdminFeatures,
  type SchoolAdminOrganizationFeatures,
} from '@/lib/school-admin/school-admin-features';

export type OrganizationWithSettings = LiveOrganization & {
  features?: SchoolAdminOrganizationFeatures;
};

export async function fetchOrganizationWithSettings(
  supabase: SupabaseClient,
  slug: string,
): Promise<OrganizationWithSettings | null> {
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, slug, name')
    .eq('slug', slug)
    .maybeSingle();

  if (orgError || !org) return null;

  const { data: settings } = await supabase
    .from('organization_settings')
    .select('branding, features')
    .eq('organization_id', org.id)
    .maybeSingle();

  const branding = parseOrganizationBranding(settings?.branding);
  const features = parseSchoolAdminFeatures(settings?.features);

  return {
    id: String(org.id),
    slug: String(org.slug),
    name: String(org.name),
    branding,
    features,
  };
}

export async function fetchOrganizationBySlug(slug: string): Promise<OrganizationWithSettings | null> {
  return fetchOrganizationWithSettings(getSupabaseClient(), slug);
}

export function organizationBrandingFromView(view: OrganizationBrandingView): OrganizationBranding {
  return toOrganizationBranding(view);
}
