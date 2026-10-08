import type { SupabaseClient } from '@supabase/supabase-js';

import { resolveAllPortalAccountPeerUserIds } from '@/lib/auth/portal-account-link-context';
import { getSupabaseClient } from '@/lib/supabase';

export type MobileSchoolAfterAuthResult =
  | { kind: 'none' }
  | { kind: 'single'; slug: string }
  | { kind: 'choose'; slugs: string[] };

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

async function listLiveOrganizationSlugs(
  supabase: SupabaseClient,
): Promise<string[]> {
  const { data, error } = await supabase
    .from('organizations')
    .select('slug')
    .eq('status', 'live')
    .order('name', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => String(row.slug));
}

function collectLiveSlugsFromOrgRows(
  rows: { organizations: unknown }[] | null | undefined,
): string[] {
  const slugs = new Set<string>();

  for (const row of rows ?? []) {
    const organization = row.organizations as
      | { slug?: string; status?: string }
      | { slug?: string; status?: string }[]
      | null;
    const org = Array.isArray(organization) ? organization[0] : organization;

    if (org?.status === 'live' && org.slug) {
      slugs.add(String(org.slug));
    }
  }

  return [...slugs].sort((left, right) => left.localeCompare(right));
}

async function listAdminAccessibleLiveSlugs(
  supabase: SupabaseClient,
  userId: string,
): Promise<string[]> {
  if (await isPlatformAdmin(supabase, userId)) {
    return listLiveOrganizationSlugs(supabase);
  }

  const peerUserIds = await resolveAllPortalAccountPeerUserIds(supabase, userId);

  const { data, error } = await supabase
    .from('organization_memberships')
    .select(
      `
      organizations!inner (
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

  return collectLiveSlugsFromOrgRows(data);
}

async function listParentAccessibleLiveSlugs(
  supabase: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const [guardianResult, membershipResult] = await Promise.all([
    supabase
      .from('guardians')
      .select(
        `
        organizations!inner (
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
          slug,
          status,
          name
        )
      `,
      )
      .eq('user_id', userId)
      .eq('status', 'active')
      .eq('role', 'parent'),
  ]);

  if (guardianResult.error) throw guardianResult.error;
  if (membershipResult.error) throw membershipResult.error;

  const slugs = new Set<string>();
  for (const slug of collectLiveSlugsFromOrgRows(guardianResult.data)) {
    slugs.add(slug);
  }
  for (const slug of collectLiveSlugsFromOrgRows(membershipResult.data)) {
    slugs.add(slug);
  }

  return [...slugs].sort((left, right) => left.localeCompare(right));
}

async function listTeacherAccessibleLiveSlugs(
  supabase: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const peerUserIds = await resolveAllPortalAccountPeerUserIds(supabase, userId);

  const { data, error } = await supabase
    .from('organization_memberships')
    .select(
      `
      organizations!inner (
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

  return collectLiveSlugsFromOrgRows(data);
}

export async function listAccessibleLiveOrganizationSlugs(
  supabase: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const [adminSlugs, teacherSlugs, parentSlugs] = await Promise.all([
    listAdminAccessibleLiveSlugs(supabase, userId),
    listTeacherAccessibleLiveSlugs(supabase, userId),
    listParentAccessibleLiveSlugs(supabase, userId),
  ]);

  return [...new Set([...adminSlugs, ...teacherSlugs, ...parentSlugs])].sort(
    (left, right) => left.localeCompare(right),
  );
}

export async function resolveMobileSchoolAfterAuth(
  supabase: SupabaseClient,
  userId: string,
): Promise<MobileSchoolAfterAuthResult> {
  const slugs = await listAccessibleLiveOrganizationSlugs(supabase, userId);

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
  const slugs = await listAccessibleLiveOrganizationSlugs(supabase, userId);
  return slugs.length > 1;
}
