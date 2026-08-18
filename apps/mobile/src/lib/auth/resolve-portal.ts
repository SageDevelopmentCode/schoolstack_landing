import type { SupabaseClient } from '@supabase/supabase-js';

import type { LiveOrganization } from '@/lib/organizations';

export type PortalType = 'platform_admin' | 'school_admin' | 'teacher' | 'parent_apply';

export type ResolvedPortal = {
  portalType: PortalType;
  school: LiveOrganization | null;
};

export class PortalAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PortalAccessError';
  }
}

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

async function userIsOrgAdmin(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('organization_memberships')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .in('role', ['owner', 'admin'])
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

async function userHasTeacherPortalAccess(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('organization_memberships')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .eq('status', 'active')
    .in('role', ['teacher', 'staff'])
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

async function userHasParentAccess(
  supabase: SupabaseClient,
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const [guardianResult, membershipResult] = await Promise.all([
    supabase
      .from('guardians')
      .select('id')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .maybeSingle(),
    supabase
      .from('organization_memberships')
      .select('id')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .eq('role', 'parent')
      .maybeSingle(),
  ]);

  if (guardianResult.error) throw guardianResult.error;
  if (membershipResult.error) throw membershipResult.error;

  return Boolean(guardianResult.data || membershipResult.data);
}

export async function resolvePlatformAdmin(
  supabase: SupabaseClient,
  userId: string,
): Promise<ResolvedPortal> {
  const allowed = await isPlatformAdmin(supabase, userId);

  if (!allowed) {
    throw new PortalAccessError('You do not have platform admin access.');
  }

  return {
    portalType: 'platform_admin',
    school: null,
  };
}

export async function resolvePortalForSchool(
  supabase: SupabaseClient,
  userId: string,
  school: LiveOrganization,
): Promise<ResolvedPortal> {
  const organizationId = school.id;

  if (
    (await isPlatformAdmin(supabase, userId)) ||
    (await userIsOrgAdmin(supabase, userId, organizationId))
  ) {
    return { portalType: 'school_admin', school };
  }

  if (await userHasTeacherPortalAccess(supabase, userId, organizationId)) {
    return { portalType: 'teacher', school };
  }

  if (await userHasParentAccess(supabase, userId, organizationId)) {
    return { portalType: 'parent_apply', school };
  }

  throw new PortalAccessError('You do not have access to this school.');
}

export function getPortalLabel(portalType: PortalType, schoolName?: string | null): string {
  switch (portalType) {
    case 'platform_admin':
      return 'MudKitchen Admin (placeholder)';
    case 'school_admin':
      return `${schoolName ?? 'School'} Admin (placeholder)`;
    case 'teacher':
      return `${schoolName ?? 'School'} Staff Portal (placeholder)`;
    case 'parent_apply':
      return `${schoolName ?? 'School'} Family Portal (placeholder)`;
  }
}

export function getPortalHeading(portalType: PortalType): string {
  switch (portalType) {
    case 'platform_admin':
      return 'Platform Admin';
    case 'school_admin':
      return 'School Admin';
    case 'teacher':
      return 'Teacher Portal';
    case 'parent_apply':
      return 'Parent / Apply Portal';
  }
}
