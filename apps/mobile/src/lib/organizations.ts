import { getSupabaseClient } from '@/lib/supabase';
import { resolveOrganizationAssetUrl } from '@/lib/resolve-asset-url';

export type OrganizationBranding = {
  logoSrc: string;
  logoAlt: string;
};

export type LiveOrganization = {
  id: string;
  slug: string;
  name: string;
  branding: OrganizationBranding;
};

function parseBranding(raw: unknown): OrganizationBranding {
  if (!raw || typeof raw !== 'object') {
    return { logoSrc: '', logoAlt: '' };
  }

  const branding = raw as Record<string, unknown>;
  const logo =
    branding.logo && typeof branding.logo === 'object'
      ? (branding.logo as Record<string, unknown>)
      : null;

  return {
    logoSrc: resolveOrganizationAssetUrl(typeof logo?.src === 'string' ? logo.src : ''),
    logoAlt: typeof logo?.alt === 'string' ? logo.alt : '',
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

  return (data ?? []).map((row) => {
    const settings = row.organization_settings as
      | { branding?: unknown }
      | { branding?: unknown }[]
      | null;
    const settingsRow = Array.isArray(settings) ? settings[0] : settings;

    return {
      id: String(row.id),
      slug: String(row.slug),
      name: String(row.name),
      branding: parseBranding(settingsRow?.branding),
    };
  });
}
