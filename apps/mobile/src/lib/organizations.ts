import { mergeBrandingFromRaw } from '@/lib/organization-settings/merge-branding';
import type { OrganizationBranding } from '@/lib/organization-settings/types';
import { getSupabaseClient } from '@/lib/supabase';

export type OrganizationStatus = 'onboarding' | 'live' | 'paused' | 'churned';

export type OrganizationBrandingView = {
  colors: OrganizationBranding['colors'];
  logoSrc: string;
  logoAlt: string;
};

export type LiveOrganization = {
  id: string;
  slug: string;
  name: string;
  branding: OrganizationBrandingView;
};

export type AdminOrganization = LiveOrganization & {
  status: OrganizationStatus;
  createdAt: string;
};

export function brandingToView(branding: OrganizationBranding): OrganizationBrandingView {
  return {
    colors: branding.colors,
    logoSrc: branding.logo.src,
    logoAlt: branding.logo.alt,
  };
}

export function parseOrganizationBranding(raw: unknown): OrganizationBrandingView {
  const merged = mergeBrandingFromRaw(raw);
  return brandingToView(merged);
}

export function normalizeStoredOrganization(org: LiveOrganization): LiveOrganization {
  const defaultBranding = brandingToView(mergeBrandingFromRaw(null));
  const stored = org.branding as Partial<OrganizationBrandingView>;

  return {
    ...org,
    branding: {
      colors: stored.colors ?? defaultBranding.colors,
      logoSrc: stored.logoSrc ?? defaultBranding.logoSrc,
      logoAlt: stored.logoAlt ?? defaultBranding.logoAlt,
    },
  };
}

export function toOrganizationBranding(view: OrganizationBrandingView): OrganizationBranding {
  return {
    colors: view.colors,
    logo: {
      src: view.logoSrc,
      alt: view.logoAlt,
      width: 0,
      height: 0,
    },
    typography: { headingFont: '', bodyFont: '' },
  };
}

function mapOrganizationRow(row: {
  id: string;
  slug: string;
  name: string;
  organization_settings?: { branding?: unknown } | { branding?: unknown }[] | null;
}): LiveOrganization {
  const settings = row.organization_settings;
  const settingsRow = Array.isArray(settings) ? settings[0] : settings;

  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    branding: parseOrganizationBranding(settingsRow?.branding),
  };
}

export async function listLiveOrganizations(): Promise<LiveOrganization[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('organizations')
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
    .eq('status', 'live')
    .order('name', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => mapOrganizationRow(row));
}

export async function listAllOrganizations(): Promise<AdminOrganization[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('organizations')
    .select(
      `
      id,
      slug,
      name,
      status,
      created_at,
      organization_settings (
        branding
      )
    `,
    )
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...mapOrganizationRow(row),
    status: row.status as OrganizationStatus,
    createdAt: String(row.created_at),
  }));
}
