import type { SupabaseClient } from '@supabase/supabase-js';

import { requireSupabaseAccessToken } from '@/lib/auth/auth-session';
import { resolveAllPortalAccountPeerUserIds } from '@/lib/auth/portal-account-link-context';
import {
  hydrateLiveOrganizationsBranding,
  parseOrganizationBranding,
  type LiveOrganization,
} from '@/lib/organizations';
import { getSupabaseClient } from '@/lib/supabase';

export type MobileSchoolAfterAuthResult =
  | { kind: 'none' }
  | { kind: 'single'; slug: string }
  | { kind: 'choose'; slugs: string[] };

type AccessibleOrgRow = {
  id: string;
  slug: string;
  name: string;
  status?: string;
};

async function isPlatformAdmin(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.role === 'admin';
}

async function listLiveOrganizationsForPlatformAdmin(
  supabase: SupabaseClient,
): Promise<AccessibleOrgRow[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('id, slug, name, status')
    .eq('status', 'live')
    .order('name', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    status: String(row.status),
  }));
}

function collectLiveOrganizationsFromOrgRows(
  rows: { organizations: unknown }[] | null | undefined,
): AccessibleOrgRow[] {
  const organizations = new Map<string, AccessibleOrgRow>();

  for (const row of rows ?? []) {
    const organization = row.organizations as
      | AccessibleOrgRow
      | AccessibleOrgRow[]
      | null;
    const org = Array.isArray(organization) ? organization[0] : organization;

    if (org?.status === 'live' && org.slug && org.id) {
      organizations.set(String(org.id), {
        id: String(org.id),
        slug: String(org.slug),
        name: String(org.name),
        status: 'live',
      });
    }
  }

  return [...organizations.values()];
}

function toLiveOrganization(row: AccessibleOrgRow): LiveOrganization {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    branding: parseOrganizationBranding(undefined),
  };
}

function sortOrganizationsByName(organizations: LiveOrganization[]): LiveOrganization[] {
  return [...organizations].sort((left, right) => left.name.localeCompare(right.name));
}

async function listAdminAccessibleLiveOrganizations(
  supabase: SupabaseClient,
  userId: string,
): Promise<AccessibleOrgRow[]> {
  if (await isPlatformAdmin(supabase, userId)) {
    return listLiveOrganizationsForPlatformAdmin(supabase);
  }

  const peerUserIds = await resolveAllPortalAccountPeerUserIds(supabase, userId);

  const { data, error } = await supabase
    .from('organization_memberships')
    .select(
      `
      organizations!inner (
        id,
        slug,
        status,
        name
      )
    `,
    )
    .in('user_id', peerUserIds)
    .eq('status', 'active')
    .in('role', ['owner', 'admin']);

  if (error) throw error;

  return collectLiveOrganizationsFromOrgRows(data);
}

async function listParentAccessibleLiveOrganizations(
  supabase: SupabaseClient,
  userId: string,
): Promise<AccessibleOrgRow[]> {
  const peerUserIds = await resolveAllPortalAccountPeerUserIds(supabase, userId);

  const [guardianResult, membershipResult] = await Promise.all([
    supabase
      .from('guardians')
      .select(
        `
        organizations!inner (
          id,
          slug,
          status,
          name
        )
      `,
      )
      .eq('user_id', userId),
    supabase
      .from('organization_memberships')
      .select(
        `
        organizations!inner (
          id,
          slug,
          status,
          name
        )
      `,
      )
      .in('user_id', peerUserIds)
      .eq('status', 'active')
      .eq('role', 'parent'),
  ]);

  if (guardianResult.error) throw guardianResult.error;
  if (membershipResult.error) throw membershipResult.error;

  const organizations = new Map<string, AccessibleOrgRow>();
  for (const org of collectLiveOrganizationsFromOrgRows(guardianResult.data)) {
    organizations.set(org.id, org);
  }
  for (const org of collectLiveOrganizationsFromOrgRows(membershipResult.data)) {
    organizations.set(org.id, org);
  }

  return [...organizations.values()];
}

async function listTeacherAccessibleLiveOrganizations(
  supabase: SupabaseClient,
  userId: string,
): Promise<AccessibleOrgRow[]> {
  const peerUserIds = await resolveAllPortalAccountPeerUserIds(supabase, userId);

  const { data, error } = await supabase
    .from('organization_memberships')
    .select(
      `
      organizations!inner (
        id,
        slug,
        status,
        name
      )
    `,
    )
    .in('user_id', peerUserIds)
    .eq('status', 'active')
    .in('role', ['teacher', 'staff']);

  if (error) throw error;

  return collectLiveOrganizationsFromOrgRows(data);
}

function mergeAccessibleOrgRows(rows: AccessibleOrgRow[]): LiveOrganization[] {
  const byId = new Map<string, LiveOrganization>();
  for (const row of rows) {
    if (row.status === 'live' || !row.status) {
      byId.set(row.id, toLiveOrganization(row));
    }
  }
  return sortOrganizationsByName([...byId.values()]);
}

export async function listAccessibleLiveOrganizations(
  supabase: SupabaseClient,
  userId: string,
): Promise<LiveOrganization[]> {
  await requireSupabaseAccessToken();

  const [adminOrgs, teacherOrgs, parentOrgs] = await Promise.all([
    listAdminAccessibleLiveOrganizations(supabase, userId),
    listTeacherAccessibleLiveOrganizations(supabase, userId),
    listParentAccessibleLiveOrganizations(supabase, userId),
  ]);

  const merged = mergeAccessibleOrgRows([...adminOrgs, ...teacherOrgs, ...parentOrgs]);
  return hydrateLiveOrganizationsBranding(merged);
}

export function filterAccessibleOrganizationsBySlugs(
  organizations: LiveOrganization[],
  slugs: string[],
): LiveOrganization[] {
  const bySlug = new Map(organizations.map((organization) => [organization.slug, organization]));
  return slugs
    .map((slug) => bySlug.get(slug))
    .filter((organization): organization is LiveOrganization => Boolean(organization));
}

export async function listAccessibleLiveOrganizationSlugs(
  supabase: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const organizations = await listAccessibleLiveOrganizations(supabase, userId);
  return organizations.map((organization) => organization.slug);
}

export async function resolveMobileSchoolAfterAuth(
  supabase: SupabaseClient,
  userId: string,
): Promise<MobileSchoolAfterAuthResult> {
  const organizations = await listAccessibleLiveOrganizations(supabase, userId);
  const slugs = organizations.map((organization) => organization.slug);

  if (slugs.length === 0) {
    return { kind: 'none' };
  }

  if (slugs.length === 1) {
    return { kind: 'single', slug: slugs[0] };
  }

  return { kind: 'choose', slugs };
}

export async function userCanSwitchSchool(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const organizations = await listAccessibleLiveOrganizations(supabase, userId);
  return organizations.length > 1;
}
